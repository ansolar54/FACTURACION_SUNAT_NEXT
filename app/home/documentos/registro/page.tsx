"use client"
import React, { useEffect, useState } from 'react'
import {
    Card,
    Input,
    Button,
    Typography,
    CardBody,
    CardFooter,
    IconButton,
    Tooltip,
    Breadcrumbs,
    Chip,
    Select,
    Option,
} from "@/shared/material-tailwind-component"

import toast, { Toaster } from 'react-hot-toast';
import { ObtenerClienteByNroDoc } from '@/services/cliente';

import {
    UserPlusIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    DocumentArrowUpIcon
} from "@/shared/heroicons";
import { DescargarPDFBase64, DescargarXMLBase64, EnviarFactura, GenerarPDF, GenerarSerieCorrelativo_Factura, GenerarXMLFactura, GuardarFactura, ObtenerFacturaCliente, ObtenerRutaFactura } from '@/services/factura';
import { EnviarBoleta, GenerarPDFBoleta, GenerarSerieCorrelativo_Boleta, GenerarXMLBoleta, GuardarBoleta, ObtenerBoletaCliente, ObtenerRutaBoleta } from '@/services/boleta';
import { ObtenerEmpresaAll } from '@/services/empresa';

import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Factura from './datos/factura';
import Boleta from './datos/boleta';
import AddProducto from './modal/add_producto';
import EditProducto from './modal/edit_producto';
import AddCliente, { Cliente_Add } from '../../administracion/cliente/modal/add_cliente';
import { EnviarCorreo } from '@/services/correo';
import NotaCredito from './datos/nota_credito';

interface Cliente {
    Id: number,
    Nombre: string,
    Direccion: string,
    Correo: string,
}
interface DatosBoleta {
    fechaEmision: string;
    moneda: string;
}
interface DatosFactura {
    condicionPago: string;
    moneda: string;
    fechaEmision: string;
    fechaVencimiento: string;
    vendedor: string;
    guiaRemision: string;
    nroPedido: string;
    ordenCompra: string;
    observacion: string;
}
interface Producto {
    Tipo_Tributo: string,
    Bien_Servicio: string,
    Codigo_Producto: string,
    Descripcion: string,
    Cantidad: string,
    Unidad_Medida: string,
    Valor_Unitario: string,
    Importe: number,
}

export default function Registro() {
    //ROUTER
    const router = useRouter()

    const TABLE_HEAD = [
        "Bien / Servicio",
        "Tipo Tributo",
        "Unidad de Medida",
        "Cantidad",
        "Código",
        "Descripción",
        "Valor Unitario",
        "IGV",
        "Importe",
        "Acción"
    ];

    // CAMPOS CLIENTE
    const [NroDocumento_Cliente, setNroDocumento_Cliente] = useState("")
    const [cliente, setCliente] = useState<Cliente>({
        Id: 0,
        Nombre: "",
        Direccion: "",
        Correo: "",
    });

    // CAMPOS DOCUMENTO
    const [IdTipoDocumento, setIdTipoDocumento] = useState("1")
    const ListadoIdTipoDocu = [
        { Code: '1', Name: 'FACTURA' },
        { Code: '2', Name: 'BOLETA' },
        { Code: '3', Name: 'NOTA CRÉDITO' },
    ];

    // CAMPOS FACTURA
    const [nroFactura, setnroFactura] = useState("");
    const [serie, setserie] = useState("");
    const [correlativo, setcorrelativo] = useState("");

    // CAMPOS BOLETA
    const [nroBoleta, setnroBoleta] = useState("");
    const [serieB, setserieB] = useState("");
    const [correlativoB, setcorrelativoB] = useState("");

    // CAMPOS EMPRESA
    const [idEmisor, setidEmisor] = useState(0)
    const [rucEmisor, setrucEmisor] = useState("");
    const [igvPercent, setigvPercent] = useState(0);

    // MODAL CLIENTE
    const [openAddCliente, setOpenAddCliente] = useState(false);

    // MODAL PRODUCTO
    const [openAddProducto, setOpenAddProducto] = useState(false);
    const [openEditProducto, setOpenEditProducto] = useState(false);

    // CONST SELECCIONADO PARA MODAL EDIT CLIENTE
    const [seleccionado, setSeleccionado] = React.useState<Producto | undefined>(undefined);

    // CONST PARA TOOLTIP_ID
    const [ToolTipEditId, setToolTipEditId] = useState<string | null>(null);
    const [ToolTipDeleteId, setToolTipDeleteId] = useState<string | null>(null);

    //DATA PRODUCTOS
    const [dataProducto, setDataProducto] = useState<Producto[]>([]);

    //DATA BOLETAS
    const [dataBoleta, setDataBoleta] = useState<DatosBoleta>({
        fechaEmision: '',
        moneda: ''
    });

    //DATA FACTURA
    const [dataFactura, setDataFactura] = useState<DatosFactura>({
        condicionPago: '',
        moneda: '',
        fechaEmision: '',
        fechaVencimiento: '',
        vendedor: '',
        guiaRemision: '',
        nroPedido: '',
        ordenCompra: '',
        observacion: '',
    });

    //CAMPOS DETALLE PRODUCTO 
    const [opGravadas, setopGravadas] = useState("");
    const [opInafectas, setopInafectas] = useState("");
    const [opExonerada, setopExonerada] = useState("");
    const [descuentos, setdescuentos] = useState("0.00");
    const [anticipos, setanticipos] = useState("0.00");
    const [igv, setIgv] = useState("");
    const [importeTotal, setImporteTotal] = useState("");
    const [valorVentaTotal, setValorVentaTotal] = useState("");

    useEffect(() => {
        functionObtenerEmpresa();
    }, [])

    useEffect(() => {
        SUM_IMPORTE_TOTAL_GRAVADOS();
        SUM_IMPORTE_TOTAL_EXO();
        SUM_IMPORTE_TOTAL_INAFECTOS();
        SUM_IGV_TOTAL_GRAVADOS();
        SUM_VALOR_VENTA_TOTAL();
        SUM_IMPORTE_TOTAL();
    }, [dataProducto])

    async function functionObtenerEmpresa() {
        ObtenerEmpresaAll().then((result_empresa: any) => {
            if (result_empresa.indicator == 1) {
                const { Nro_Ruc, Igv, Id } = result_empresa.data[0]
                setrucEmisor(Nro_Ruc);
                setigvPercent(Igv);
                setidEmisor(Id);
                functionGenerarCorrelativo_F(Nro_Ruc)
            }
            else {
                Swal.fire({
                    title: 'Alerta',
                    text: "No existe una empresa emisora.",
                    icon: 'error',
                    showConfirmButton: true,
                    confirmButtonText: 'Registrar Empresa',
                    allowOutsideClick: false,
                    confirmButtonColor: "#009688",
                }).then((result) => {
                    if (result.isConfirmed) {
                        router.push('/home/administracion/empresa')
                    }
                })
            }
        })
    }

    function functionObtenerClienteByNroDoc(nrodoc: string) {
        ObtenerClienteByNroDoc(nrodoc).then((result: any) => {
            if (result.data != null) {
                let razon_s = result.data[0].Razon_Social;
                let nombre_ap = result.data[0].Nombres + " " + result.data[0].Apellidos;
                setCliente({
                    Id: result.data[0].Id,
                    Nombre: razon_s == "" ? nombre_ap : razon_s,
                    Direccion: result.data[0].Direccion,
                    Correo: result.data[0].Correo
                })
            }
            else {
                setCliente({
                    Id: 0,
                    Nombre: "",
                    Direccion: "",
                    Correo: "",
                })
            }
        })
    }

    function functionGenerarCorrelativo_F(nro_ruc: string) {
        GenerarSerieCorrelativo_Factura(nro_ruc).then((result: any) => {
            if (result.indicator == 1) {
                const { correlativo, serie } = result.data;
                setcorrelativo(correlativo);
                setserie(serie);
                setnroFactura(serie + "-" + correlativo);
            }
        })
    }

    function functionGenerarCorrelativo_B(nro_ruc: string) {
        GenerarSerieCorrelativo_Boleta(nro_ruc).then((result: any) => {
            if (result.indicator == 1) {
                const { correlativo, serie } = result.data;
                setcorrelativoB(correlativo);
                setserieB(serie);
                setnroBoleta(serie + "-" + correlativo);
            }
        })
    }

    const handleChange = (name: string, value: any) => {
        switch (name) {
            case 'Id_Tipo_Doc':
                setIdTipoDocumento(value)
                if (value == '1') {
                    functionGenerarCorrelativo_F(rucEmisor)
                }
                else if (value == '2') {
                    functionGenerarCorrelativo_B(rucEmisor)
                }
                break;
            default:
                break;
        }
    }

    const handleDataBoleta = (nuevosDatosBoleta: DatosBoleta) => {
        setDataBoleta(nuevosDatosBoleta);
    }

    const handleDataFactura = (nuevosDatosBoleta: DatosFactura) => {
        setDataFactura(nuevosDatosBoleta);
    }

    const handleGuardarCliente = (cliente: Cliente_Add) => {
        setNroDocumento_Cliente(cliente.Nro_Doc);
        functionObtenerClienteByNroDoc(cliente.Nro_Doc);
    };

    function agregarProducto(producto: Producto) {
        setDataProducto([...dataProducto, producto]); // Agrega el nuevo producto a la lista de productos
    }

    function editarProducto(producto: Producto) {
        const indiceProducto = dataProducto.findIndex(prod => prod.Codigo_Producto === producto.Codigo_Producto);
        if (indiceProducto !== -1) {
            dataProducto.splice(indiceProducto, 1, producto);
            setDataProducto([...dataProducto]); // Actualiza la lista de productos
        }
    }

    const functionOpenEditProducto = (id: string) => {
        const ObjectSeleccionado = dataProducto.find(item => item.Codigo_Producto === id);
        if (ObjectSeleccionado) {
            setSeleccionado(ObjectSeleccionado);
            console.log(ObjectSeleccionado)
            setOpenEditProducto(!openEditProducto);
        } else {
            console.log(`No se encontró ningún objeto con id ${id}`);
        }
    };

    const functionDelete = (id: string) => {
        Swal.fire({
            title: "¿Estás seguro de ELIMINAR?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#009688",
            cancelButtonColor: "#90a4ae",
            confirmButtonText: "SÍ, ELIMINAR",
            cancelButtonText: 'CANCELAR',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                const indiceProducto = dataProducto.findIndex(prod => prod.Codigo_Producto === id);
                if (indiceProducto !== -1) {
                    dataProducto.splice(indiceProducto, 1);
                    setDataProducto([...dataProducto]); // Actualiza la lista de productos
                }
            }
        });
    }

    // FUNCIONES PARA CALCULAR IMPORTE DETALLE PRODUCTO

    function SUM_IMPORTE_TOTAL_GRAVADOS() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            if (element.Tipo_Tributo == 'IGV')
                reporte_sum = reporte_sum + (element.Importe) / (1 + (igvPercent / 100))
        }
        setopGravadas(reporte_sum.toFixed(2))
    }

    function SUM_IMPORTE_TOTAL_INAFECTOS() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            if (element.Tipo_Tributo == 'INA')
                reporte_sum = reporte_sum + (element.Importe)
        }
        setopInafectas(reporte_sum.toFixed(2));
    }

    function SUM_IMPORTE_TOTAL_EXO() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            if (element.Tipo_Tributo == 'EXO')
                reporte_sum = reporte_sum + Number(element.Importe)
        }
        setopExonerada(reporte_sum.toFixed(2))
    }

    function SUM_IGV_TOTAL_GRAVADOS() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            if (element.Tipo_Tributo == 'IGV')
                reporte_sum += (element.Importe) * (igvPercent / (100 + igvPercent))
        }
        setIgv(reporte_sum.toFixed(2))
    }

    function SUM_VALOR_VENTA_TOTAL() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            reporte_sum = reporte_sum + (parseFloat(element.Valor_Unitario) * parseFloat(element.Cantidad))
        }
        setValorVentaTotal((reporte_sum).toFixed(2))
    }

    function SUM_IMPORTE_TOTAL() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            reporte_sum = reporte_sum + Number(element.Importe)
        }
        setImporteTotal((reporte_sum).toFixed(2))
    }

    function functionConfirmarDocumento() {
        Swal.fire({
            title: `¿Seguro de registrar la ${IdTipoDocumento == '1' ? 'Factura' : 'Boleta'}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#009688",
            cancelButtonColor: "#90a4ae",
            confirmButtonText: "SÍ, REGISTRAR",
            cancelButtonText: 'CANCELAR',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                if (IdTipoDocumento == '1') {
                    FunctionGenerarXMLFactura();
                }
                else if (IdTipoDocumento == '2') {
                    FunctionGenerarXMLBoleta();
                }
            }
        });
    }

    // FUNCIONES PARA GENERAR, ENVIAR Y REGISTRAR BOLETA
    function FunctionGenerarXMLBoleta() {
        let data_detail_xml = [];
        let contadorID = 1

        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            let model_detail_xml = {
                Id: contadorID++,
                Tipo_Tributo: element.Tipo_Tributo, // IGV, EXO O INA
                Codigo_Producto: element.Codigo_Producto,
                Descripcion: element.Descripcion,
                Cantidad: parseFloat(element.Cantidad),
                Unidad_Medida: element.Unidad_Medida,
                Precio_Unitario: element.Tipo_Tributo == 'IGV' ? parseFloat(element.Valor_Unitario) + (parseFloat(element.Valor_Unitario) * (igvPercent / 100)) : parseFloat(element.Valor_Unitario),
                Valor_Unitario: parseFloat(element.Valor_Unitario),
                Valor_Item: parseFloat(element.Cantidad) * parseFloat(element.Valor_Unitario),
            }
            data_detail_xml.push(model_detail_xml);
        }

        let model_boleta_xml = {
            Ruc_Emisor: rucEmisor,
            Nro_Documento: nroBoleta,
            Cliente: cliente.Nombre,
            Nro_Doc_Cliente: NroDocumento_Cliente,
            Fecha_Emision: dataBoleta.fechaEmision,
            Moneda: dataBoleta.moneda,
            Op_Gravadas: parseFloat(opGravadas),
            Op_Inafectas: parseFloat(opInafectas),
            Op_Exonerada: parseFloat(opExonerada),
            Descuentos: parseFloat(descuentos),
            Anticipos: parseFloat(anticipos),
            Igv: parseFloat(igv),
            Igv_Percent: igvPercent,
            Importe_Total: parseFloat(importeTotal),
            DetalleDocumento: data_detail_xml
        }

        GenerarXMLBoleta(model_boleta_xml).then((result: any) => {
            if (result.indicator == 1) {
                toast.success(
                    `${result.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
                setTimeout(FunctionEnviarBoleta, 2000)
            }
            else {
                toast.error(
                    `${result.message}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        })

    }

    function FunctionEnviarBoleta() {
        let ruta_zip = "";
        ObtenerRutaBoleta(nroBoleta, rucEmisor).then((result_2: any) => {
            if (result_2.indicator == 1) {
                ruta_zip = result_2.data.ruta
                ruta_zip.replace("\\\\", "\\");
                // console.log("ruta_zip", ruta_zip)
                EnviarBoleta(ruta_zip).then((result_3: any) => {
                    if (result_3.indicator == 1) {
                        toast.success(
                            `${result_3.message}`, {
                            duration: 2000,
                            position: 'top-center',
                        });
                        setTimeout(FunctionRegistrarBoleta, 2000)
                    } else {
                        toast.error(
                            `${result_3.message}`, {
                            duration: 3000,
                            position: 'top-center',
                        });
                    }
                })

            }
            else {
                toast.error(
                    `${result_2.message}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        })
    }

    function FunctionRegistrarBoleta() {
        let data_detail = [];
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            let model_detail = {
                Codigo_Producto: element.Codigo_Producto,
                Descripcion: element.Descripcion,
                Cantidad: parseFloat(element.Cantidad),
                Unidad_Medida: element.Unidad_Medida,
                Precio_Unitario: element.Tipo_Tributo == 'IGV' ? parseFloat(element.Valor_Unitario) + (parseFloat(element.Valor_Unitario) * (igvPercent / 100)) : parseFloat(element.Valor_Unitario),
                Importe: element.Importe,
                Bien_Servicio: element.Bien_Servicio,
                Tipo_Tributo: element.Tipo_Tributo,
                Descuento: 0,
                Igv: element.Tipo_Tributo === 'IGV' ? element.Importe - (element.Importe / (1 + igvPercent / 100)) : 0,
                Isc: 0,
                Icbper: 0,
            }
            data_detail.push(model_detail);
        }

        let modal_boleta = {
            Id_Emisor: idEmisor,
            Id_Cliente: cliente.Id,
            Nro_Documento: nroBoleta,
            Fecha_Emision: dataBoleta.fechaEmision,
            Moneda: dataBoleta.moneda,
            Op_Gravadas: parseFloat(opGravadas),
            Op_Inafectas: parseFloat(opInafectas),
            Op_Exonerada: parseFloat(opExonerada),
            Descuentos: parseFloat(descuentos),
            Anticipos: parseFloat(anticipos),
            Igv: parseFloat(igv),
            Igv_Percent: igvPercent,
            Importe_Total: parseFloat(importeTotal),
            Serie: serieB,
            Correlativo: correlativoB,
            DetalleDocumento: data_detail
        }

        GuardarBoleta(modal_boleta).then((result: any) => {
            if (result.indicator == 1) {
                toast.success(
                    `${result.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
                functionGenerarCorrelativo_B(rucEmisor);
                functionVerPDF();
            } else if (result.indicator == 0) {
                toast.error(
                    `${result.message}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        })
    }

    // FUNCIONES PARA GENERAR, ENVIAR Y REGISTRAR BOLETA
    function FunctionGenerarXMLFactura() {
        let data_detail_xml = [];
        let contadorID = 1

        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            let model_detail_xml = {
                Id: contadorID++,
                Tipo_Tributo: element.Tipo_Tributo, // IGV, EXO O INA
                Codigo_Producto: element.Codigo_Producto,
                Descripcion: element.Descripcion,
                Cantidad: Number(element.Cantidad),
                Unidad_Medida: element.Unidad_Medida,
                Precio_Unitario: element.Tipo_Tributo == 'IGV' ? parseFloat(element.Valor_Unitario) + (parseFloat(element.Valor_Unitario) * (igvPercent / 100)) : parseFloat(element.Valor_Unitario),
                Valor_Unitario: parseFloat(element.Valor_Unitario),
                Valor_Item: parseFloat(element.Cantidad) * parseFloat(element.Valor_Unitario),
            }
            data_detail_xml.push(model_detail_xml);
        }

        let model_factura_xml = {
            ruc_Emisor: rucEmisor,
            nro_Documento: nroFactura,
            cliente: cliente.Nombre,
            nro_Doc_Cliente: NroDocumento_Cliente,
            direccion_Cliente: cliente.Direccion,
            fecha_Emision: dataFactura.fechaEmision,
            fecha_Vencimiento: dataFactura.fechaVencimiento,
            condicion_Pago: dataFactura.condicionPago,
            moneda: dataFactura.moneda,
            Op_Gravadas: parseFloat(opGravadas),
            Op_Inafectas: parseFloat(opInafectas),
            Op_Exonerada: parseFloat(opExonerada),
            Descuentos: parseFloat(descuentos),
            Anticipos: parseFloat(anticipos),
            Igv: parseFloat(igv),
            Igv_Percent: igvPercent,
            Importe_Total: parseFloat(importeTotal),
            detalleDocumento: data_detail_xml
        }

        GenerarXMLFactura(model_factura_xml).then((result: any) => {
            if (result.indicator == 1) {
                toast.success(
                    `${result.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
                setTimeout(FunctionEnviarFactura, 2000)
            }
            else {
                toast.error(
                    `${result.message}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        })
    }

    function FunctionEnviarFactura() {
        let ruta_zip = "";
        ObtenerRutaFactura(nroFactura, rucEmisor).then((result_2: any) => {
            if (result_2.indicator == 1) {

                ruta_zip = result_2.data.ruta
                ruta_zip.replace("\\\\", "\\");

                console.log("ruta_zip", ruta_zip)

                EnviarFactura(ruta_zip).then((result_3: any) => {
                    if (result_3.indicator == 1) {
                        toast.success(
                            `${result_3.message}`, {
                            duration: 2000,
                            position: 'top-center',
                        });
                        setTimeout(FuctionRegistrarFactura, 2000)
                    } else {
                        toast.error(
                            `${result_3.message}`, {
                            duration: 3000,
                            position: 'top-center',
                        });
                    }
                })

            }
            else {
                toast.error(
                    `${result_2.message}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        })
    }

    function FuctionRegistrarFactura() {
        let data_detail = [];

        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            let model_detail = {
                Codigo_Producto: element.Codigo_Producto,
                Descripcion: element.Descripcion,
                Cantidad: Number(element.Cantidad),
                Unidad_Medida: element.Unidad_Medida,
                Precio_Unitario: element.Tipo_Tributo == 'IGV' ? parseFloat(element.Valor_Unitario) + (parseFloat(element.Valor_Unitario) * (igvPercent / 100)) : parseFloat(element.Valor_Unitario),
                Importe: element.Importe,
                Bien_Servicio: element.Bien_Servicio,
                Tipo_Tributo: element.Tipo_Tributo,
                Descuento: 0,
                Igv: element.Tipo_Tributo === 'IGV' ? element.Importe - (element.Importe / (1 + igvPercent / 100)) : 0,
                Isc: 0,
                Icbper: 0,
            }
            data_detail.push(model_detail);
        }

        let model_factura = {
            Id_Emisor: idEmisor,
            Id_Cliente: cliente.Id,
            Nro_Documento: nroFactura,
            Fecha_Emision: dataFactura.fechaEmision,
            Fecha_Vencimiento: dataFactura.fechaVencimiento,
            Condicion_Pago: dataFactura.condicionPago,
            Moneda: dataFactura.moneda,
            Nro_Pedido: dataFactura.nroPedido,
            Orden_Compra: dataFactura.ordenCompra,
            Vendedor: dataFactura.vendedor,
            Guia_Remision: dataFactura.guiaRemision,
            Op_Gravadas: parseFloat(opGravadas),
            Op_Inafectas: parseFloat(opInafectas),
            Op_Exonerada: parseFloat(opExonerada),
            Descuentos: parseFloat(descuentos),
            Anticipos: parseFloat(anticipos),
            Igv: parseFloat(igv),
            Igv_Percent: igvPercent,
            Importe_Total: parseFloat(importeTotal), observacion: dataFactura.observacion,
            Observacion: dataFactura.observacion,
            Serie: serie,
            Correlativo: correlativo,
            DetalleDocumento: data_detail
        }

        GuardarFactura(model_factura).then((result: any) => {
            if (result.indicator == 1) {
                toast.success(
                    `${result.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
                functionGenerarCorrelativo_F(rucEmisor);
                functionVerPDF();
            } else if (result.indicator == 0) {
                toast.error(
                    `${result.message}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        })
    }

    // FUNCIONES PARA ARMAR Y DESCARGAR PDF

    async function functionVerPDF() {
        return new Promise<void>((resolve, reject) => {
            const prefijo = IdTipoDocumento == '1' ? "-01-" : "-03-";
            const nro_documento = IdTipoDocumento == '1' ? nroFactura : nroBoleta
            let nombre_archivo = ""
            nombre_archivo = rucEmisor +
                prefijo
                + nro_documento
            console.log("nombre_archivo", nombre_archivo)
            const item_armar = {
                Nro_Documento: nro_documento,
                Id_Cliente: cliente.Id,
            };
            let base64PDF = "";
            let base64XML = "";
            functionArmarPDF_D(item_armar)
                .then((result) => {
                    if (result == 1) {
                        Promise.all([
                            DescargarPDFBase64(nombre_archivo),
                            DescargarXMLBase64(nombre_archivo)
                        ]).then(([pdfResult, xmlResult]) => {
                            base64PDF = (pdfResult as { data: string }).data;
                            base64XML = (xmlResult as { data: string }).data;
                            FuctionEnviarCorreo(base64PDF, base64XML);
                            resolve();
                        }).catch((error) => {
                            console.error("Error al descargar PDF o XML:", error);
                            reject(error);
                        });
                    }
                    console.log("Resultado del indicador:", result);
                })
                .catch((error) => {
                    console.error("Error al ejecutar la función:", error);
                    reject(error);
                });
        })
    }

    async function functionArmarPDF_D(item: any) {
        try {
            if (IdTipoDocumento == '1') {
                const result_1 = await ObtenerFacturaCliente(item.Nro_Documento, item.Id_Cliente) as { indicator: number, data: any };
                const dataFacturaCliente = result_1.data;
                if (result_1.indicator == 1) {
                    const result_2 = await ObtenerEmpresaAll() as { indicator: number, data: any };
                    const dataEmpresa = result_2.data[0];

                    if (result_2.indicator == 1) {

                        let data_detail = [];

                        for (let i = 0; i < dataFacturaCliente.DetalleDocumento.length; i++) {
                            const element = dataFacturaCliente.DetalleDocumento[i];
                            let model_detail = {
                                Codigo_Producto: element.Codigo_Producto,
                                Descripcion: element.Descripcion,
                                Cantidad: element.Cantidad,
                                Unidad_Medida: element.Unidad_Medida,
                                Precio_Unitario: element.Precio_Unitario,
                                Importe: element.Importe,
                            };
                            data_detail.push(model_detail);
                        }

                        let Empresa = {
                            Razon_Social: dataEmpresa.Razon_Social,
                            Direccion: dataEmpresa.Direccion,
                            Telefono: dataEmpresa.Telefono,
                            Web: dataEmpresa.Web,
                            Distrito: dataEmpresa.Distrito,
                            Provincia: dataEmpresa.Provincia,
                            Departamento: dataEmpresa.Departamento,
                            Correo: dataEmpresa.Correo,
                            Igv_Percent: dataEmpresa.Igv
                        }

                        let modal_pdf = {
                            Id: dataFacturaCliente.Id,
                            Empresa: Empresa,
                            Logo: dataEmpresa.Logo,
                            Ruc_Emisor: dataFacturaCliente.Ruc_Empresa,
                            Nro_Documento: dataFacturaCliente.Nro_Documento,
                            Cliente: dataFacturaCliente.Cliente,
                            Nro_Doc_Cliente: dataFacturaCliente.Nro_Doc_Cliente,
                            Direccion_Cliente: dataFacturaCliente.Direccion_Cliente,
                            Fecha_Emision: dataFacturaCliente.Fecha_Emision,
                            Fecha_Vencimiento: dataFacturaCliente.Fecha_Vencimiento,
                            Condicion_Pago: dataFacturaCliente.Condicion_Pago,
                            Moneda: dataFacturaCliente.Moneda,
                            Nro_Pedido: dataFacturaCliente.Nro_Pedido,
                            Orden_Compra: dataFacturaCliente.Orden_Compra,
                            Vendedor: dataFacturaCliente.Vendedor,
                            Guia_Remision: dataFacturaCliente.Guia_Remision,
                            Op_Gravadas: dataFacturaCliente.Op_Gravadas,
                            Op_Inafectas: dataFacturaCliente.Op_Inafectas,
                            Op_Exonerada: dataFacturaCliente.Op_Exonerada,
                            Descuentos: dataFacturaCliente.Descuentos,
                            Anticipos: dataFacturaCliente.Anticipos,
                            Igv: dataFacturaCliente.Igv,
                            Importe_Total: dataFacturaCliente.Importe_Total,
                            Observacion: dataFacturaCliente.Observacion,
                            Serie: dataFacturaCliente.Serie,
                            Correlativo: dataFacturaCliente.Correlativo,
                            DetalleDocumento: data_detail,

                        };
                        const result_3 = await GenerarPDF(modal_pdf) as { indicator: number };
                        return result_3.indicator;
                    }
                }
            }
            else if (IdTipoDocumento == '2') {
                const result_1 = await ObtenerBoletaCliente(item.Nro_Documento, item.Id_Cliente) as { indicator: number, data: any };
                const dataBoletaCliente = result_1.data;
                console.log(dataBoletaCliente)
                if (result_1.indicator == 1) {
                    const result_2 = await ObtenerEmpresaAll() as { indicator: number, data: any };
                    const dataEmpresa = result_2.data[0];
                    if (result_2.indicator == 1) {
                        let data_detail = [];

                        for (let i = 0; i < dataBoletaCliente.DetalleDocumento.length; i++) {
                            const element = dataBoletaCliente.DetalleDocumento[i];
                            let model_detail = {
                                Codigo_Producto: element.Codigo_Producto,
                                Descripcion: element.Descripcion,
                                Cantidad: element.Cantidad,
                                Unidad_Medida: element.Unidad_Medida,
                                Precio_Unitario: element.Precio_Unitario,
                                Importe: element.Importe,
                            };
                            data_detail.push(model_detail);
                        }

                        let Empresa = {
                            Razon_Social: dataEmpresa.Razon_Social,
                            Direccion: dataEmpresa.Direccion,
                            Telefono: dataEmpresa.Telefono,
                            Web: dataEmpresa.Web,
                            Distrito: dataEmpresa.Distrito,
                            Provincia: dataEmpresa.Provincia,
                            Departamento: dataEmpresa.Departamento,
                            Correo: dataEmpresa.Correo,
                            Igv_Percent: dataEmpresa.Igv
                        }

                        let modal_pdf = {
                            Id: dataBoletaCliente.Id,
                            Empresa: Empresa,
                            Logo: dataEmpresa.Logo,
                            // CAMBIAR
                            Ruc_Emisor: dataBoletaCliente.Ruc_Empresa,
                            Nro_Documento: dataBoletaCliente.Nro_Documento,
                            Cliente: dataBoletaCliente.Cliente,
                            Nro_Doc_Cliente: dataBoletaCliente.Nro_Doc_Cliente,
                            Direccion_Cliente: dataBoletaCliente.Direccion_Cliente,
                            //
                            Fecha_Emision: dataBoletaCliente.Fecha_Emision,
                            Fecha_Vencimiento: '',
                            Condicion_Pago: '',
                            Moneda: dataBoletaCliente.Moneda,
                            Nro_Pedido: '',
                            Orden_Compra: '',
                            Vendedor: '',
                            Guia_Remision: '',
                            Op_Gravadas: dataBoletaCliente.Op_Gravadas,
                            Op_Inafectas: dataBoletaCliente.Op_Inafectas,
                            Op_Exonerada: dataBoletaCliente.Op_Exonerada,
                            Descuentos: dataBoletaCliente.Descuentos,
                            Anticipos: dataBoletaCliente.Anticipos,
                            Igv: dataBoletaCliente.Igv,
                            Importe_Total: dataBoletaCliente.Importe_Total,
                            Observacion: '',
                            Serie: dataBoletaCliente.Serie,
                            Correlativo: dataBoletaCliente.Correlativo,
                            DetalleDocumento: data_detail,
                        };
                        const result_3 = await GenerarPDFBoleta(modal_pdf) as { indicator: number };
                        return result_3.indicator;
                    }
                }
            }
        }
        catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    const base64ToBlob = (base64Data: string, contentType: string) => {
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    };

    function functionDescargarPDF() {
        const prefijo = IdTipoDocumento == '1' ? "-01-" : "-03-";
        const nro_documento = IdTipoDocumento == '1' ? nroFactura : nroBoleta
        let nombre_archivo = ""
        nombre_archivo = rucEmisor +
            prefijo
            + nro_documento
        DescargarPDFBase64(nombre_archivo).then((result_4) => {
            // setruta(result_4.data);
            const blob = base64ToBlob((result_4 as { data: string }).data, 'application/pdf');
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = nombre_archivo + '.pdf';
            a.click();

            URL.revokeObjectURL(url); // Liberar el objeto URL
        })
    }

    function formatDateCorreo(dateString: string) {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }

    function FuctionEnviarCorreo(pdf: string, xml: string) {
        try {
            Swal.fire({
                title: "¿Desea enviar COMPROBANTE por correo eléctronico?",
                text: "Se enviará documento pdf + xml",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#009688",
                cancelButtonColor: "#90a4ae",
                showDenyButton: true,
                confirmButtonText: 'ENVIAR',
                denyButtonText: 'GUARDAR PDF',
                cancelButtonText: 'CANCELAR',
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    let modal_correo = {
                        RucEmisor: rucEmisor,
                        Cliente: cliente.Nombre,
                        Correo: cliente.Correo,
                        TipoDocumento: IdTipoDocumento === '1' ? '01' : '03',
                        NroDocumento: IdTipoDocumento === '1' ? nroFactura : nroBoleta,
                        FechaEmision: IdTipoDocumento === '1' ? formatDateCorreo(dataFactura.fechaEmision) : formatDateCorreo(dataBoleta.fechaEmision),
                        ImporteTotal: IdTipoDocumento === '1' ? dataFactura.moneda === 'USD' ? '$ ' + importeTotal : 'S/ ' + importeTotal : dataBoleta.moneda === 'USD' ? '$ ' + importeTotal : 'S/ ' + importeTotal,
                        Pdf: pdf,
                        Xml: xml
                    }

                    console.log(modal_correo)
                    EnviarCorreo(modal_correo).then((result_correo: any) => {
                        if (result_correo.indicator === 1) {
                            toast.success(
                                `${result_correo.message}`, {
                                duration: 2000,
                                position: 'top-center',
                            });
                        }
                    })
                }
                else if (result.isDenied) {
                    functionDescargarPDF()
                    toast.success(
                        `PDF descargado correctamente.`, {
                        duration: 2000,
                        position: 'top-center',
                    });
                }
            });

        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    function functionComasMiles(number: string) {
        // Convertir el número a string y separar la parte entera de la decimal
        let parts = number.toString().split(".");
        let integerPart = parts[0];
        let decimalPart = parts.length > 1 ? parts[1] : "00";

        // Agregar comas para separar los miles
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        // Combinar la parte entera con la parte decimal
        return `${integerPart}.${decimalPart.slice(0, 2)}`;
    }

    return (
        <>
            <AddCliente
                open={openAddCliente}
                setOpen={setOpenAddCliente}
                onListCliente={() => ({})}
                onGuardarCliente={handleGuardarCliente}
            />
            <AddProducto
                open={openAddProducto}
                setOpen={setOpenAddProducto}
                onAgregarProducto={agregarProducto}
                dataProducto={dataProducto}
            />
            <EditProducto
                open={openEditProducto}
                setOpen={setOpenEditProducto}
                seleccionado={seleccionado}
                onEditarProducto={editarProducto}
            />
            <Breadcrumbs className="bg-transparent mt-1">
                <a href="#" className="opacity-60">
                    Inicio
                </a>
                <a href="#" className="opacity-60">
                    Documentos
                </a>
                <a href="#">Registro</a>
            </Breadcrumbs>
            <Toaster />
            <Card className='w-full rounded-none' color="white" shadow={true}>
                <CardBody className="rounded-md pt-2 px-4">

                    {/* DATOS DEL DOCUMENTO */}
                    <div className="justify-between flex gap-4">
                        <div className='flex gap-4'>
                            <Chip variant="outlined" value="Datos del Documento" className="rounded-lg" color='teal' size="md" />
                            <div>
                                <Select
                                    color='teal'
                                    label="Tipo Documento"
                                    name="Igv"
                                    size="md"
                                    value={IdTipoDocumento}
                                    key={IdTipoDocumento}
                                    onChange={(e) => {
                                        handleChange('Id_Tipo_Doc', e)
                                    }}
                                >
                                    {ListadoIdTipoDocu.map((tipo) => (
                                        <Option key={tipo.Code} value={tipo.Code}>
                                            {tipo.Name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        {IdTipoDocumento == '1' && (
                            <Chip color="teal" variant="ghost"
                                value={`N° Factura : ${nroFactura}`}
                                className="rounded-lg py-3" />
                        )}
                        {IdTipoDocumento == '2' && (
                            <Chip color="teal" variant="ghost"
                                value={`N° Boleta : ${nroBoleta}`}
                                className="rounded-lg py-3" />
                        )}
                    </div>

                    {/* CAMPOS DATOS DEL DOCUMENTO */}
                        {IdTipoDocumento == '1' && (
                            <Factura onSendDataFactura={handleDataFactura} />
                        )}
                        {IdTipoDocumento == '2' && (
                            <Boleta onSendDataBoleta={handleDataBoleta} />
                        )}
                        {IdTipoDocumento == '3' && (
                            <NotaCredito />
                        )}
                    {/* DATOS DEL CLIENTE */}
                    {IdTipoDocumento != '3' && (
                        <div className="justify-between flex gap-4">
                            <div className='flex gap-4'>
                                <Chip variant="outlined" value="Datos del Cliente" className="rounded-lg py-3" color='teal' />
                                <Button size="md" className="flex items-center gap-3 color-button"
                                    onClick={() =>
                                        setOpenAddCliente(!openAddCliente)
                                    }
                                >
                                    <UserPlusIcon strokeWidth={2} className='h-5 w-5' />
                                    AGREGAR CLIENTE
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* CAMPOS DATOS DEL CLIENTE */}
                    {IdTipoDocumento != '3' && (
                        <div className="my-4 flex flex-col gap-6">
                            <div className="grid grid-cols-5 gap-4">
                                <div>
                                    <Input
                                        color='teal'
                                        crossOrigin={undefined}
                                        name="Nro_Doc"
                                        value={NroDocumento_Cliente}
                                        size="md"
                                        label="N° Documento"
                                        onChange={(e) => {
                                            setNroDocumento_Cliente(e.target.value)
                                            functionObtenerClienteByNroDoc(e.target.value)
                                        }}
                                        maxLength={20}
                                    />
                                </div>
                                <div>
                                    <Input
                                        color='teal'
                                        crossOrigin={undefined}
                                        name="Nombre"
                                        value={cliente.Nombre}
                                        size="md"
                                        label="Cliente"
                                        maxLength={150}
                                        className='cursor-not-allowed'
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <Input
                                        color='teal'
                                        crossOrigin={undefined}
                                        name="Correo"
                                        value={cliente.Correo}
                                        size="md"
                                        label="Correo"
                                        maxLength={100}
                                        className='cursor-not-allowed'
                                        readOnly
                                    />
                                </div>
                                <div className='col-span-2'>
                                    <Input
                                        color='teal'
                                        crossOrigin={undefined}
                                        name="Direccion"
                                        value={cliente.Direccion}
                                        size="md"
                                        label="Dirección"
                                        maxLength={150}
                                        className='cursor-not-allowed'
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DATOS DEL PRODUCTO */}
                    {IdTipoDocumento != '3' && (
                    <div className="justify-start flex gap-4">
                        <Chip variant="outlined" value="Datos del PRODUCTO" className="rounded-lg" color='teal' size="md" />
                        <div>
                            <Button size="md" className="flex items-center gap-3 color-button"
                                onClick={() =>
                                    setOpenAddProducto(!openAddProducto)
                                }
                            >
                                <PlusIcon strokeWidth={2} className='h-5 w-5' />
                                AGREGAR PRODUCTO
                            </Button>
                        </div>
                    </div>
                    )}

                    {/* CAMPOS DE OPERACIONES PRODUCTO */}
                    {IdTipoDocumento != '3' && (
                    <div className='my-4 flex flex-col gap-6'>
                        <div className="grid grid-cols-5 gap-4">
                            <div>
                                <Input
                                    className='cursor-not-allowed'
                                    readOnly
                                    color='teal'
                                    crossOrigin={undefined}
                                    name="Nro_Doc"
                                    value={functionComasMiles(opGravadas)}
                                    size="md"
                                    label="Op. Gravadas"

                                />
                            </div>
                            <div>
                                <Input
                                    className='cursor-not-allowed'
                                    readOnly
                                    color='teal'
                                    crossOrigin={undefined}
                                    name="Nro_Doc"
                                    value={functionComasMiles(opInafectas)}
                                    size="md"
                                    label="Op. Inafectas"
                                />
                            </div>
                            <div>
                                <Input
                                    className='cursor-not-allowed'
                                    readOnly
                                    color='teal'
                                    crossOrigin={undefined}
                                    value={functionComasMiles(opExonerada)}
                                    size="md"
                                    label="Op. Exoneradas"
                                />
                            </div>
                            <div>
                                <Input
                                    className='cursor-not-allowed'
                                    readOnly
                                    color='teal'
                                    crossOrigin={undefined}
                                    value={functionComasMiles(descuentos)}
                                    size="md"
                                    label="Descuentos"
                                />
                            </div>
                            <div>
                                <Input
                                    className='cursor-not-allowed'
                                    readOnly
                                    color='teal'
                                    crossOrigin={undefined}
                                    value={functionComasMiles(anticipos)}
                                    size="md"
                                    label="Anticipos"
                                />
                            </div>
                            <div>
                                <Input
                                    className='cursor-not-allowed'
                                    readOnly
                                    color='teal'
                                    crossOrigin={undefined}
                                    value={functionComasMiles(igv)}
                                    size="md"
                                    label="I.G.V."
                                />
                            </div>
                            <div>
                                <Input
                                    className='cursor-not-allowed'
                                    readOnly
                                    color='teal'
                                    crossOrigin={undefined}
                                    value={functionComasMiles(valorVentaTotal)}
                                    size="md"
                                    label="Valor de Venta"
                                />
                            </div>
                            <div>
                                <Input
                                    className='cursor-not-allowed'
                                    readOnly
                                    color='teal'
                                    crossOrigin={undefined}
                                    value={functionComasMiles(importeTotal)}
                                    size="md"
                                    label="Importe Total"
                                    maxLength={20}
                                />
                            </div>
                        </div>
                    </div>
                    )}

                    {/* BOTON ENVIO DE DOCUMENTO */}
                    {IdTipoDocumento != '3' && (
                    <div className="justify-center flex gap-4">
                        <Button size="md" className="flex items-center gap-3 color-button"
                            onClick={() =>
                                functionConfirmarDocumento()
                            }
                        >
                            <DocumentArrowUpIcon strokeWidth={2} className='h-5 w-5' />
                            ENVIAR {IdTipoDocumento == '1' ? 'FACTURA' : 'BOLETA'}
                        </Button>
                    </div>
                    )}

                    {/* TABLA DE PRODUCTO */}
                    {IdTipoDocumento != '3' && (
                    <div className="my-4 overflow-x-auto">
                        <table className="w-full min-w-max table-auto text-left rounded-lg overflow-hidden">
                            <thead>
                                <tr >
                                    {TABLE_HEAD.map((head) => (
                                        <th key={head} className="color-bg-teal-500 border-y border-blue-gray-100 p-4">
                                            <Typography
                                                variant="h6"
                                                color="white"
                                                className="font-semibold leading-none"
                                            >
                                                {head}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {dataProducto.map((item, key) => (
                                    <tr key={key} className=" border-b border-gray-600">

                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Bien_Servicio == "B" ? 'BIEN' : 'SERVICIO'}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Tipo_Tributo}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Unidad_Medida}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {functionComasMiles(Number(item.Cantidad).toFixed(2))}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Codigo_Producto}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Descripcion}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {functionComasMiles(Number(item.Valor_Unitario).toFixed(2))}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Tipo_Tributo == 'IGV' ? functionComasMiles((item.Importe * (igvPercent / (100 + igvPercent))).toFixed(2)) : '0.00'}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {functionComasMiles((item.Importe).toFixed(2))}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <div className='flex'>
                                                <Tooltip
                                                    content="Editar" placement="top"
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                    open={ToolTipEditId === (item.Codigo_Producto)}
                                                >
                                                    <IconButton
                                                        variant="text"
                                                        onClick={() => {
                                                            functionOpenEditProducto(item.Codigo_Producto),
                                                                setToolTipEditId(null);
                                                        }}
                                                        onMouseOver={() => setToolTipEditId((item.Codigo_Producto))}
                                                        onMouseLeave={() => setToolTipEditId(null)}
                                                    >
                                                        <PencilIcon
                                                            className={`h-6 w-6 ${ToolTipEditId === (item.Codigo_Producto) ? 'color-text' : 'text-gray-800'}`}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip
                                                    content="Borrar" placement="top"
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                    open={ToolTipDeleteId === (item.Codigo_Producto)}
                                                >
                                                    <IconButton variant="text"
                                                        onClick={() => {
                                                            functionDelete(item.Codigo_Producto);
                                                            setToolTipDeleteId(null);
                                                        }}
                                                        onMouseOver={() => setToolTipDeleteId((item.Codigo_Producto))}
                                                        onMouseLeave={() => setToolTipDeleteId(null)}
                                                    >
                                                        <TrashIcon className={`h-6 w-6 ${ToolTipDeleteId === (item.Codigo_Producto) ? 'color-text' : 'text-gray-800'}`} />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </CardBody>
            </Card >
        </>
    )
}
