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
    XMarkIcon,
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

const Registro = () => {
    //ROUTER
    const router = useRouter()

    const TABLE_HEAD = [
        // "Bien / Servicio",
        "Descripción",
        "Código",
        "Impuesto",
        "Unidad de Medida",
        "Cantidad",
        "Valor Unitario",
        "IGV",
        "ICBPER",
        "Total",
        "Acción"
    ];

    const TABLE_HEAD_CUOTAS = [
        "Cuotas",
        "Fecha de Pago",
        "Monto",
        ""
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
    const [dataEmpresa, setDataEmpresa] = useState<Empresa | null>(null)

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
    const [ToolTipDeleteCuotas, setToolTipDeleteCuotas] = useState<string | null>(null);

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

    //DATA BOLETAS
    const [dataNCredito, setDataNCredito] = useState<DatosNCredito>({
        nroNotaCredito: '',
    });

    //CAMPOS DETALLE PRODUCTO 
    const [opGravadas, setopGravadas] = useState(0);
    const [opInafectas, setopInafectas] = useState(0);
    const [opExonerada, setopExonerada] = useState(0);
    const [descuentos, setdescuentos] = useState(0);
    const [anticipos, setanticipos] = useState(0);
    const [igv, setIgv] = useState(0);
    const [icbper, setIcbper] = useState(0);
    const [importeTotal, setImporteTotal] = useState(0);
    const [valorVentaTotal, setValorVentaTotal] = useState(0);

    // FUNCIÓN OBTENER EMPRESA
    useEffect(() => {
        functionObtenerEmpresa();
    }, [])

    function functionObtenerEmpresa() {
        ObtenerEmpresaAll().then((result_empresa: any) => {
            if (result_empresa.indicator == 1) {
                setDataEmpresa(result_empresa.data[0])
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

    // FUNCIONES PARA CALCULAR TOTALES DETALLE PRODUCTO
    useEffect(() => {
        calcularTotales();
    }, [dataProducto])

    function calcularTotales() {
        let opGravadas = 0;
        let opInafectas = 0;
        let opExonerada = 0;
        let igv = 0;
        let valorVentaTotal = 0;
        let icbper = 0;
        let importeTotal = 0;

        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            if (element.Tipo_Tributo == 'IGV') {
                opGravadas += parseFloat(element.Valor_Unitario) * parseFloat(element.Cantidad);
                igv += (parseFloat(element.Valor_Unitario) * parseFloat(element.Cantidad)) * (igvPercent / 100);
            } else if (element.Tipo_Tributo == 'INA') {
                opInafectas += parseFloat(element.Valor_Unitario) * parseFloat(element.Cantidad);
            } else if (element.Tipo_Tributo == 'EXO') {
                opExonerada += parseFloat(element.Valor_Unitario) * parseFloat(element.Cantidad);
            }

            valorVentaTotal += parseFloat(element.Valor_Unitario) * parseFloat(element.Cantidad);
            icbper += element.ICBPER;
            importeTotal += element.Importe;
        }

        setopGravadas(opGravadas);
        setopInafectas(opInafectas);
        setopExonerada(opExonerada);
        setIgv(igv);
        setValorVentaTotal(valorVentaTotal);
        setIcbper(icbper);
        setImporteTotal(importeTotal);
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

    const formatNumber = (value: any) => {
        const formattedNumber = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return formattedNumber;
    };

    const handleDataBoleta = (nuevosDatosBoleta: DatosBoleta) => {
        setDataBoleta(nuevosDatosBoleta);
    }

    const handleDataFactura = (nuevosDatosFactura: DatosFactura) => {
        setDataFactura(nuevosDatosFactura);
    }

    const handleDataNotaCredito = (nuevosDatosNC: DatosNCredito) => {
        setDataNCredito(nuevosDatosNC);
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

        let Op_Inafectas = opInafectas ? opInafectas : icbper;
        if (opInafectas && icbper) {
            Op_Inafectas = opInafectas + icbper;
        }

        let model_boleta_xml = {
            Ruc_Emisor: rucEmisor,
            Nro_Documento: nroBoleta,
            Cliente: cliente.Nombre,
            Nro_Doc_Cliente: NroDocumento_Cliente,
            Fecha_Emision: dataBoleta.fechaEmision,
            Moneda: dataBoleta.moneda,
            Op_Gravadas: opGravadas,
            Op_Inafectas: Op_Inafectas,
            Op_Exonerada: opExonerada,
            Descuentos: descuentos,
            Anticipos: anticipos,
            Igv: igv,
            Igv_Percent: igvPercent,
            Importe_Total: importeTotal,
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
                Precio_Unitario: element.Tipo_Tributo == 'IGV' ? parseFloat(element.Valor_Unitario) + (parseFloat(element.Valor_Unitario) * (igvPercent / 100)) + element.ICBPER : parseFloat(element.Valor_Unitario),
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

        let Op_Inafectas = opInafectas ? opInafectas : icbper;
        if (opInafectas && icbper) {
            Op_Inafectas = opInafectas + icbper;
        }

        let modal_boleta = {
            Id_Emisor: idEmisor,
            Id_Cliente: cliente.Id,
            Nro_Documento: nroBoleta,
            Fecha_Emision: dataBoleta.fechaEmision,
            Moneda: dataBoleta.moneda,
            Op_Gravadas: opGravadas,
            Op_Inafectas: Op_Inafectas,
            Op_Exonerada: opExonerada,
            Descuentos: descuentos,
            Anticipos: anticipos,
            Igv: igv,
            Igv_Percent: igvPercent,
            Importe_Total: importeTotal,
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
            } else {
                toast.error(
                    `${result.message}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        })
    }

    // FUNCIONES PARA GENERAR, ENVIAR Y REGISTRAR FACTURA
    function FunctionGenerarXMLFactura() {
        let data_detail_xml = [];
        let data_cuotas_xml = [];

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

        for (let index = 0; index < cuotas.length; index++) {
            const element = cuotas[index];
            let model_cuotas_xml = {
                Descripcion: element.descripcion,
                Importe: parseFloat(element.monto),
                Fecha_Pago: element.fechaPago,

            }
            data_cuotas_xml.push(model_cuotas_xml)
        }

        let Op_Inafectas = opInafectas ? opInafectas : icbper;
        if (opInafectas && icbper) {
            Op_Inafectas = opInafectas + icbper;
        }

        let model_factura_xml = {
            Ruc_Emisor: rucEmisor,
            Nro_Documento: nroFactura,
            Cliente: cliente.Nombre,
            Nro_Doc_Cliente: NroDocumento_Cliente,
            // direccion_Cliente: cliente.Direccion, // No se está enviando
            Fecha_Emision: dataFactura.fechaEmision,
            Fecha_Vencimiento: dataFactura.fechaVencimiento,
            Condicion_Pago: dataFactura.condicionPago,
            Cuotas: dataFactura.condicionPago == 'Contado' ? [] : data_cuotas_xml,
            Moneda: dataFactura.moneda,
            Op_Gravadas: opGravadas,
            Op_Inafectas: Op_Inafectas,
            Op_Exonerada: opExonerada,
            Descuentos: descuentos,
            Anticipos: anticipos,
            Igv: igv,
            Igv_Percent: igvPercent,
            Importe_Total: importeTotal,
            detalleDocumento: data_detail_xml
        }

        console.log(model_factura_xml)

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
                Precio_Unitario: element.Tipo_Tributo == 'IGV' ? parseFloat(element.Valor_Unitario) + (parseFloat(element.Valor_Unitario) * (igvPercent / 100)) + element.ICBPER : parseFloat(element.Valor_Unitario),
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

        let Op_Inafectas = opInafectas ? opInafectas : icbper;
        if (opInafectas && icbper) {
            Op_Inafectas = opInafectas + icbper;
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
            Op_Gravadas: opGravadas,
            Op_Inafectas: Op_Inafectas,
            Op_Exonerada: opExonerada,
            Descuentos: descuentos,
            Anticipos: anticipos,
            Igv: igv,
            Igv_Percent: igvPercent,
            Importe_Total: importeTotal,
            observacion: dataFactura.observacion,
            Observacion: dataFactura.observacion,
            Serie: serie,
            Correlativo: correlativo,
            DetalleDocumento: data_detail
        }

        console.log(model_factura)

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
                            Ruc_Emisor: dataBoletaCliente.Ruc_Empresa,
                            Nro_Documento: dataBoletaCliente.Nro_Documento,
                            Cliente: dataBoletaCliente.Cliente,
                            Nro_Doc_Cliente: dataBoletaCliente.Nro_Doc_Cliente,
                            Direccion_Cliente: dataBoletaCliente.Direccion_Cliente,
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

    // FUNCIONES PARA ENVIAR PDF Y XML POR CORREO

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


    // PRUEBAS PARA CUOTAS AL CRÉDITO
    const [montoTotal, setMontoTotal] = useState<string>('');
    const [numeroCuotas, setNumeroCuotas] = useState<number>(1);
    const [plazoPago, setPlazoPago] = useState<string>('');

    const [cuotas, setCuotas] = useState<{ descripcion: string, monto: string, fechaPago: string }[]>([]);

    const ListadoPlazoPago = [
        { name: 'QUINCENAL', code: 'QUINCENAL' },
        { name: 'MENSUAL', code: 'MENSUAL' },
        { name: 'BIMESTRAL', code: 'BIMESTRAL' },
        { name: 'TRIMESTRAL', code: 'TRIMESTRAL' },
        { name: 'SEMESTRAL', code: 'SEMESTRAL' },
        { name: 'MANUAL', code: 'MANUAL' },
    ];

    const calcularCuotas = (montoTotal: number, numeroCuotas: number): number[] => {
        const cuotaExacta = montoTotal / numeroCuotas;
        const cuotaRedondeada = Math.floor(cuotaExacta * 100) / 100;
        let diferencia = (montoTotal - (cuotaRedondeada * numeroCuotas)).toFixed(2);

        let cuotas = Array(numeroCuotas).fill(cuotaRedondeada);
        let index = 0;

        while (parseFloat(diferencia) !== 0) {
            cuotas[index] += 0.01;
            diferencia = (parseFloat(diferencia) - 0.01).toFixed(2);
            index = (index + 1) % numeroCuotas;
        }

        return cuotas;
    };

    const generarNuevaCuota = (index: number, cuota: number, plazoPago: string): { descripcion: string, monto: string, fechaPago: string } => {
        let fechaPago = new Date();
        if (plazoPago === 'QUINCENAL') {
            fechaPago.setDate(fechaPago.getDate() + (index * 15) + 1); // Sumar 15 días por cada cuota
        } else if (plazoPago === 'MENSUAL') {
            fechaPago.setMonth(fechaPago.getMonth() + index + 1); // Sumar 1 mes por cada cuota
        } else if (plazoPago === 'BIMESTRAL') {
            fechaPago.setMonth(fechaPago.getMonth() + (index * 2) + 1); // Sumar 2 meses por cada cuota
        } else if (plazoPago === 'TRIMESTRAL') {
            fechaPago.setMonth(fechaPago.getMonth() + (index * 3) + 1); // Sumar 3 meses por cada cuota
        } else if (plazoPago === 'SEMESTRAL') {
            fechaPago.setMonth(fechaPago.getMonth() + (index * 6) + 1); // Sumar 6 meses por cada cuota
        }

        const cuotaNumero = index + 1;
        const numero = 'Cuota0' + cuotaNumero.toString().padStart(2, '0'); // Formatear el número de la cuota
        return {
            descripcion: numero,
            monto: cuota.toFixed(2).toString(), // Limitar a 2 decimales
            fechaPago: fechaPago.toISOString().split('T')[0], // Convertir fecha a formato ISO
        };
    };

    const actualizarCuotas = () => {
        const cuotasCalculadas = calcularCuotas(parseFloat(montoTotal), numeroCuotas);
        const newCuotas = cuotasCalculadas.map((cuota, index) => generarNuevaCuota(index, cuota, plazoPago));
        setCuotas(newCuotas);
    };

    useEffect(() => {
        if (montoTotal.trim() !== '' && !isNaN(parseFloat(montoTotal)) && plazoPago.trim() !== '') {
            actualizarCuotas();
        }
    }, [numeroCuotas, plazoPago]);

    const handleChangeMontoCuota = (index: number, newMonto: string) => {
        const newCuotas = [...cuotas];
        newCuotas[index - 1] = { ...newCuotas[index - 1], monto: newMonto };
        setCuotas(newCuotas);

        const total = newCuotas.reduce((acc, cuota) => {

            const montoNumerico = parseFloat(cuota.monto);

            if (!isNaN(montoNumerico)) {
                return acc + montoNumerico;
            } else {
                return acc;
            }
        }, 0);
        setMontoTotal(total.toFixed(2));
    };

    const handleChangePlazoPago = (i: number, newFechaPago: string) => {
        const newCuotas = [...cuotas];
        newCuotas[i - 1] = { ...newCuotas[i - 1], fechaPago: newFechaPago };
        setCuotas(newCuotas);
    }

    const handleEliminarCuota = (index: number) => {
        // Eliminar la cuota en el índice especificado
        const nuevasCuotas = [...cuotas];
        nuevasCuotas.splice(index - 1, 1);

        // Actualizar el número de cuotas y los montos de las cuotas
        setNumeroCuotas(nuevasCuotas.length);
        setCuotas(nuevasCuotas);
    };

    const generarFilasCuotas = (numeroCuotas: number): JSX.Element[] => {
        const filas: JSX.Element[] = [];
        for (let i = 1; i <= numeroCuotas; i++) {
            filas.push(
                <tr key={i} className=" border-b border-gray-300">
                    <td className='p-2'>
                        <div className=''>
                            {i.toString().padStart(2, '0')}
                        </div>
                    </td>
                    <td className='p-2'>
                        <div className='w-72'>
                            <Input
                                color='teal'
                                size="md"
                                crossOrigin={undefined}
                                type="date"
                                value={cuotas[i - 1]?.fechaPago || ''}

                                onChange={(e) => {
                                    handleChangePlazoPago(i, e.target.value)
                                }}
                            />
                        </div>

                    </td>
                    <td className='p-2'>
                        <div className='w-72'>
                            <Input
                                color='teal'
                                size="md"
                                crossOrigin={undefined}
                                value={cuotas[i - 1]?.monto || ''}
                                onChange={(e) => {
                                    const newValue = e.target.value.trim();
                                    if (/^\d{0,6}(\.\d{0,2})?$/.test(newValue)) {
                                        handleChangeMontoCuota(i, newValue);
                                    }
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <Tooltip
                            content="Borrar cuota" placement="top"
                            animate={{
                                mount: { scale: 1, y: 0 },
                                unmount: { scale: 0, y: 25 },
                            }}
                            open={ToolTipDeleteCuotas === (i.toString())}
                        >
                            <IconButton
                                variant="text"
                                onClick={() => {
                                    handleEliminarCuota(i)
                                    setToolTipDeleteCuotas(null);
                                }}
                                onMouseOver={() => setToolTipDeleteCuotas((i.toString()))}
                                onMouseLeave={() => setToolTipDeleteCuotas(null)}
                            >
                                <XMarkIcon
                                    className={`h-6 w-6 ${ToolTipDeleteCuotas === (i.toString()) ? 'color-text' : 'text-gray-800'}`}
                                />
                            </IconButton>
                        </Tooltip>
                    </td>
                </tr>
            );
        }
        return filas;
    };

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
                dataEmpresa={dataEmpresa}
            />
            <EditProducto
                open={openEditProducto}
                setOpen={setOpenEditProducto}
                seleccionado={seleccionado}
                onEditarProducto={editarProducto}
                dataEmpresa={dataEmpresa}
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
                                        setIdTipoDocumento(e!)
                                        if (e! == '1') {
                                            functionGenerarCorrelativo_F(rucEmisor)
                                        }
                                        else if (e! == '2') {
                                            functionGenerarCorrelativo_B(rucEmisor)
                                        }
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
                        {IdTipoDocumento == '3' && (
                            <Chip color="teal" variant="ghost"
                                value={`N° Nota Crédito : ${dataNCredito.nroNotaCredito}`}
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
                        <NotaCredito onSendDataNCredito={handleDataNotaCredito} rucEmisor={rucEmisor} dataEmpresa={dataEmpresa} />
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
                        <div className="my-4 flex flex-col">
                            <div className="grid grid-cols-5 gap-2">
                                <div className='flex gap-2 items-center'>
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
                                        error={IdTipoDocumento == '1' ? NroDocumento_Cliente.length < 11 : IdTipoDocumento == '2' ? NroDocumento_Cliente.length < 8 : true}
                                        icon={<i className="fas fa-heart" />}
                                    />
                                    {((IdTipoDocumento == '1' && NroDocumento_Cliente.length < 11) || ((IdTipoDocumento == '2' && NroDocumento_Cliente.length < 8))) && (
                                        <Tooltip
                                            className="border border-red-500 bg-red-500 shadow-xl shadow-black/10"
                                            content={
                                                <div className="w-auto bg-red-500">
                                                    <Typography
                                                        variant="small"
                                                        color="white"
                                                        className="font-normal"
                                                    >
                                                        {IdTipoDocumento == "1" ? 'Debe ser RUC.' : 'Debe ser DNI o RUC.'}
                                                    </Typography>
                                                </div>
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                className="h-5 w-5 cursor-pointer text-red-500"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                                                />
                                            </svg>
                                        </Tooltip>
                                    )}

                                </div>
                                <div>
                                    <Input
                                        className='pointer-events-none bg-gray-200'
                                        readOnly
                                        color='teal'
                                        crossOrigin={undefined}
                                        name="Nombre"
                                        value={cliente.Nombre}
                                        size="md"
                                        label="Cliente"
                                        maxLength={150}
                                    />
                                </div>
                                <div>
                                    <Input
                                        className='pointer-events-none bg-gray-200'
                                        readOnly
                                        color='teal'
                                        crossOrigin={undefined}
                                        name="Correo"
                                        value={cliente.Correo}
                                        size="md"
                                        label="Correo"
                                        maxLength={100}
                                    />
                                </div>
                                <div className='col-span-2'>
                                    <Input
                                        className='pointer-events-none bg-gray-200'
                                        readOnly
                                        color='teal'
                                        crossOrigin={undefined}
                                        name="Direccion"
                                        value={cliente.Direccion}
                                        size="md"
                                        label="Dirección"
                                        maxLength={150}
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

                    {/* TABLA DE PRODUCTO */}
                    {IdTipoDocumento != '3' && (
                        <div className="my-4 overflow-x-auto">
                            <table className="w-full min-w-max table-auto text-left rounded-lg overflow-hidden">
                                <thead>
                                    <tr>
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
                                    {dataProducto.length === 0 ? (
                                        <tr className=" border-b border-gray-300">
                                            <td colSpan={TABLE_HEAD.length} className="p-4 text-center">
                                                No hay productos registrados
                                            </td>
                                        </tr>
                                    ) : (
                                        dataProducto.map((item, key) => (
                                            <tr key={key} className=" border-b border-gray-300">
                                                {/* <td className="p-2">
                                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                                {item.Bien_Servicio == "B" ? 'BIEN' : 'SERVICIO'}
                                                            </Typography>
                                                        </td> */}
                                                <td className="p-2">
                                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                                        {item.Descripcion}
                                                    </Typography>
                                                </td>
                                                <td className="p-2">
                                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                                        {item.Codigo_Producto}
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
                                                        {formatNumber(parseFloat(item.Cantidad))}
                                                    </Typography>
                                                </td>
                                                <td className="p-2">
                                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                                        {formatNumber(parseFloat(item.Valor_Unitario))}
                                                    </Typography>
                                                </td>
                                                <td className="p-2">
                                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                                        {item.Tipo_Tributo == 'IGV' ? formatNumber(((parseFloat(item.Valor_Unitario) * parseFloat(item.Cantidad)) * (igvPercent / 100))) : '0.00'}
                                                    </Typography>
                                                </td>
                                                <td className="p-2">
                                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                                        {formatNumber(item.ICBPER)}
                                                    </Typography>
                                                </td>
                                                <td className="p-2">
                                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                                        {formatNumber(item.Importe)}
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* CAMPOS DE OPERACIONES PRODUCTO */}
                    {IdTipoDocumento != '3' && (
                        <>
                            {/* REDISEÑO CON COLUMNAS */}
                            <div className="grid grid-cols-8 gap-2 justify-items-end mx-2">
                                {opGravadas != 0 && (
                                    <>
                                        <div className="col-start-7 flex items-center">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">Op. Gravada :</Typography>
                                        </div>
                                        <div className="col-end-9 flex items-center">
                                            <Typography variant="paragraph" color="blue-gray" className="font-normal">{(IdTipoDocumento === '1' ? (dataFactura.moneda === 'PEN' ? 'S/ ' : '$ ') : IdTipoDocumento === '2' ? (dataBoleta.moneda === 'PEN' ? 'S/ ' : '$ ') : '') + formatNumber(opGravadas)}</Typography>
                                        </div>
                                    </>
                                )}
                                {opInafectas != 0 && (
                                    <>
                                        <div className="col-start-7 flex items-center">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">Op. Inafecta :</Typography>
                                        </div>
                                        <div className="col-end-9 flex items-center">
                                            <Typography variant="paragraph" color="blue-gray" className="font-normal">{(IdTipoDocumento === '1' ? (dataFactura.moneda === 'PEN' ? 'S/ ' : '$ ') : IdTipoDocumento === '2' ? (dataBoleta.moneda === 'PEN' ? 'S/ ' : '$ ') : '') + formatNumber(opInafectas)}</Typography>
                                        </div>
                                    </>
                                )}
                                {opExonerada != 0 && (
                                    <>
                                        <div className="col-start-7 flex items-center">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">Op. Exonerada :</Typography>
                                        </div>
                                        <div className="col-end-9 flex items-center">
                                            <Typography variant="paragraph" color="blue-gray" className="font-normal">{(IdTipoDocumento === '1' ? (dataFactura.moneda === 'PEN' ? 'S/ ' : '$ ') : IdTipoDocumento === '2' ? (dataBoleta.moneda === 'PEN' ? 'S/ ' : '$ ') : '') + formatNumber(opExonerada)}</Typography>
                                        </div>
                                    </>
                                )}
                                {icbper != 0 && (
                                    <>
                                        <div className="col-start-7 flex items-center">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">ICBPER :</Typography>
                                        </div>
                                        <div className="col-end-9 flex items-center">
                                            <Typography variant="paragraph" color="blue-gray" className="font-normal">{(IdTipoDocumento === '1' ? (dataFactura.moneda === 'PEN' ? 'S/ ' : '$ ') : IdTipoDocumento === '2' ? (dataBoleta.moneda === 'PEN' ? 'S/ ' : '$ ') : '') + formatNumber(icbper)}</Typography>
                                        </div>
                                    </>
                                )}
                                {descuentos != 0 && (
                                    <>
                                        <div className="col-start-7 flex items-center">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">Descuentos :</Typography>
                                        </div>
                                        <div className="col-end-9 flex items-center">
                                            <Typography variant="paragraph" color="blue-gray" className="font-normal">{(IdTipoDocumento === '1' ? (dataFactura.moneda === 'PEN' ? 'S/ ' : '$ ') : IdTipoDocumento === '2' ? (dataBoleta.moneda === 'PEN' ? 'S/ ' : '$ ') : '') + formatNumber(descuentos)}</Typography>
                                        </div>
                                    </>
                                )}
                                {anticipos != 0 && (
                                    <>
                                        <div className="col-start-7 flex items-center">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">Anticipos :</Typography>
                                        </div>
                                        <div className="col-end-9 flex items-center">
                                            <Typography variant="paragraph" color="blue-gray" className="font-normal">{(IdTipoDocumento === '1' ? (dataFactura.moneda === 'PEN' ? 'S/ ' : '$ ') : IdTipoDocumento === '2' ? (dataBoleta.moneda === 'PEN' ? 'S/ ' : '$ ') : '') + formatNumber(anticipos)}</Typography>
                                        </div>
                                    </>
                                )}
                                {igv != 0 && (
                                    <>
                                        <div className="col-start-7 flex items-center">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">IGV (18%) :</Typography>
                                        </div>
                                        <div className="col-end-9 flex items-center">
                                            <Typography variant="paragraph" color="blue-gray" className="font-normal">{(IdTipoDocumento === '1' ? (dataFactura.moneda === 'PEN' ? 'S/ ' : '$ ') : IdTipoDocumento === '2' ? (dataBoleta.moneda === 'PEN' ? 'S/ ' : '$ ') : '') + formatNumber(igv)}</Typography>
                                        </div>
                                    </>
                                )}
                                {valorVentaTotal != 0 && (
                                    <>
                                        <div className="col-start-7 flex items-center">
                                            <Typography variant="small" color="blue-gray" className="font-semibold">Valor de Venta :</Typography>
                                        </div>
                                        <div className="col-end-9 flex items-center">
                                            <Typography variant="paragraph" color="blue-gray" className="font-normal">{(IdTipoDocumento === '1' ? (dataFactura.moneda === 'PEN' ? 'S/ ' : '$ ') : IdTipoDocumento === '2' ? (dataBoleta.moneda === 'PEN' ? 'S/ ' : '$ ') : '') + formatNumber(valorVentaTotal)}</Typography>
                                        </div>
                                    </>
                                )}
                                {importeTotal != 0 && (
                                    <>
                                        <div className="col-start-7 flex items-center">
                                            <Typography variant="h5" color="blue-gray" className="font-semibold">Importe Total :</Typography>
                                        </div>
                                        <div className="col-end-9 flex items-center">
                                            <Typography variant="h5" color="blue-gray" className="font-normal">{(IdTipoDocumento === '1' ? (dataFactura.moneda === 'PEN' ? 'S/ ' : '$ ') : IdTipoDocumento === '2' ? (dataBoleta.moneda === 'PEN' ? 'S/ ' : '$ ') : '') + formatNumber(importeTotal)}</Typography>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}



                    {dataFactura.condicionPago !== 'Contado' && (
                        <>
                            {/* DATOS DE LAS CUOTAS */}
                            {IdTipoDocumento != '3' && (
                                <div className="justify-start flex gap-4">
                                    <Chip variant="outlined" value="DETALLE DE CUOTAS" className="rounded-lg" color='teal' size="md" />
                                </div>
                            )}

                            {/* campos cabecera cuota */}
                            {IdTipoDocumento != '3' && (
                                <div className="my-4 flex flex-col">
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <Input
                                                color='teal'
                                                crossOrigin={undefined}
                                                value={montoTotal.toString()}
                                                size="md"
                                                label="Monto neto pendiente de pago"
                                                onChange={(e) => {
                                                    const newValue = e.target.value.trim();
                                                    if (/^\d{0,6}(\.\d{0,2})?$/.test(newValue)) {
                                                        setMontoTotal(newValue);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type='number'
                                                color='teal'
                                                crossOrigin={undefined}
                                                value={numeroCuotas.toString()}
                                                size="md"
                                                label="Número de cuotas"
                                                max={12}
                                                min={1}
                                                onChange={(e) => setNumeroCuotas(parseInt(e.target.value))}
                                            />
                                        </div>
                                        <Select
                                            color='teal'
                                            label="Plazo de pago"
                                            size="md"
                                            value={plazoPago}
                                            onChange={(e) => {
                                                setPlazoPago(e as string);
                                            }}
                                        >
                                            {ListadoPlazoPago.map((tipo) => (
                                                <Option key={tipo.code} value={tipo.code}>
                                                    {tipo.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* TABLA CUOTAS */}
                            {IdTipoDocumento != '3' && (
                                <div className="my-4 overflow-x-auto">
                                    <table className="w-full min-w-max table-auto text-left rounded-lg overflow-hidden">
                                        <thead>
                                            <tr>
                                                {TABLE_HEAD_CUOTAS.map((head) => (
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
                                            {generarFilasCuotas(numeroCuotas)}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}

                    {/* BOTÓN PARA ENVIAR DOCUMENTO */}
                    {IdTipoDocumento != '3' && (
                        <>
                            <hr className='my-4 border-blue-gray-300' />
                            <div className="justify-end flex gap-4">
                                <Button size="md" className="flex items-center gap-3 color-button"
                                    disabled={
                                        !importeTotal ||
                                        !cliente.Nombre
                                        // (IdTipoDocumento == '1' && (NroDocumento_Cliente.length < 11 || !dataFactura.fechaEmision)) ||
                                        // (IdTipoDocumento == '2' && NroDocumento_Cliente.length < 8 || !dataBoleta.fechaEmision)
                                    }
                                    onClick={() =>
                                        functionConfirmarDocumento()
                                    }
                                >
                                    <DocumentArrowUpIcon strokeWidth={2} className='h-5 w-5'
                                    />
                                    ENVIAR {IdTipoDocumento == '1' ? 'FACTURA' : 'BOLETA'}
                                </Button>
                            </div>
                        </>
                    )}

                </CardBody>
            </Card >
        </>
    )
}

export default Registro;

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
interface DatosNCredito {
    nroNotaCredito: string
}
interface Producto {
    Tipo_Tributo: string,
    Bien_Servicio: string,
    Codigo_Producto: string,
    Descripcion: string,
    Impuesto_Bolsa: string,
    ICBPER: number,
    Cantidad: string,
    Unidad_Medida: string,
    Valor_Unitario: string,
    Importe: number,
}
interface Empresa {
    Nro_Ruc: string;
    Razon_Social: string;
    Serie_F: string;
    Serie_B: string;
    Serie_Fn: string;
    Serie_Bn: string;
    Igv: number;
    Icbper: string;
    Logo: string;
    Direccion: string;
    Telefono: string;
    Correo: string;
    Web: string;
    Departamento: string;
    Provincia: string;
    Distrito: string;
}
