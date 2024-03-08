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
    Tabs,
    TabsHeader,
    Tab,
    TabsBody,
    TabPanel
} from "@/shared/material-tailwind-component"

import toast, { Toaster } from 'react-hot-toast';
import { ObtenerClienteByNroDoc } from '@/services/cliente';

import {
    Square3Stack3DIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    UserPlusIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
} from "@/shared/heroicons";
import { GenerarSerieCorrelativo_Factura } from '@/services/factura';
import { EnviarBoleta, GenerarSerieCorrelativo_Boleta, GenerarXMLBoleta, GuardarBoleta, ObtenerRutaBoleta } from '@/services/boleta';
import { ObtenerEmpresaAll } from '@/services/empresa';

import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Factura from './datos/factura';
import Boleta from './datos/boleta';
import AddProducto from './modal/add_producto';

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
    const [denomEmisor, setdenomEmisor] = useState("");
    const [rucEmisor, setrucEmisor] = useState("");
    const [igvPercent, setigvPercent] = useState(0);

    // MODAL ADD PRODUCTO
    const [openAddProducto, setOpenAddProducto] = useState(false);

    // CONST PARA TOOLTIP_ID
    const [ToolTipEditId, setToolTipEditId] = useState<number | null>(null);
    const [ToolTipDeleteId, setToolTipDeleteId] = useState<number | null>(null);

    //DATA PRODUCTOS
    const [dataProducto, setDataProducto] = useState<Producto[]>([]); // Estado para almacenar la lista de productos

    //DATA BOLETAS
    const [datosBoleta, setDatosBoleta] = useState<DatosBoleta>({
        fechaEmision: '',
        moneda: ''
    });

    //CAMPOS DETALLE PRODUCTO 
    const [opGravadas, setopGravadas] = useState("");
    const [opInafectas, setopInafectas] = useState("");
    const [opExonerada, setopExonerada] = useState("");
    const [descuentos, setdescuentos] = useState("0.00");
    const [anticipos, setanticipos] = useState("0.00");
    const [igv, setIgv] = useState("");
    const [importeTotal, setImporteTotal] = useState("");

    // console.log(dataProducto);

    useEffect(() => {
        functionObtenerEmpresa();
    }, [])

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

    async function functionObtenerEmpresa() {
        ObtenerEmpresaAll().then((result_empresa: any) => {
            if (result_empresa.indicator == 1) {
                const { Nro_Ruc, Igv, Razon_Social, Id } = result_empresa.data[0]
                setrucEmisor(Nro_Ruc);
                setdenomEmisor(Razon_Social);
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
        setDatosBoleta(nuevosDatosBoleta);
    }

    function agregarProducto(producto: Producto) {
        setDataProducto([...dataProducto, producto]); // Agrega el nuevo producto a la lista de productos
    }

    const functionOpenEditEmpresa = (id: number) => {
      
    };

    useEffect(() => {
        SUM_IMPORTE_TOTAL_GRAVADOS();
        SUM_IMPORTE_TOTAL_EXO();
        SUM_IMPORTE_TOTAL_INAFECTOS();
        SUM_IGV_TOTAL_GRAVADOS();
        SUM_IMPORTE_TOTAL();
    }, [dataProducto])

    function SUM_IMPORTE_TOTAL_GRAVADOS() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            if (element.Tipo_Tributo == 'IGV')
                reporte_sum = reporte_sum + (element.Importe) / (1 + (igvPercent / 100))
        }
        setopGravadas(reporte_sum.toFixed(2))
        // return (reporte_sum);
    }

    function SUM_IMPORTE_TOTAL_INAFECTOS() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            if (element.Tipo_Tributo == 'INA')
                reporte_sum = reporte_sum + (element.Importe)
        }
        setopInafectas(reporte_sum.toFixed(2));
        // return (reporte_sum);
    }

    function SUM_IMPORTE_TOTAL_EXO() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            if (element.Tipo_Tributo == 'EXO')
                reporte_sum = reporte_sum + Number(element.Importe)
        }
        setopExonerada(reporte_sum.toFixed(2))
        // return (reporte_sum);
    }

    function SUM_IGV_TOTAL_GRAVADOS() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            if (element.Tipo_Tributo == 'IGV')
                reporte_sum = ((reporte_sum + element.Importe) / (1 + (igvPercent / 100))) * (igvPercent / 100)
        }
        setIgv((reporte_sum).toFixed(2))
    }

    function SUM_VALOR_VENTA_TOTAL() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            reporte_sum = reporte_sum + (parseFloat(element.Valor_Unitario) * parseFloat(element.Cantidad))
        }
        return (reporte_sum);

    }

    function SUM_IMPORTE_TOTAL() {
        let reporte_sum = 0;
        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            reporte_sum = reporte_sum + Number(element.Importe)
        }
        setImporteTotal((reporte_sum).toFixed(2))
    }

    function FunctionGenerarXMLBoleta() {
        let data_detail_xml = [];
        let contadorID = 1

        for (let i = 0; i < dataProducto.length; i++) {
            const element = dataProducto[i];
            let model_detail_xml = {
                Id: contadorID++,
                // IGV, EXO O INA
                Tipo_Tributo: element.Tipo_Tributo,
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
            Fecha_Emision: datosBoleta.fechaEmision,
            Moneda: datosBoleta.moneda,
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

        console.log(model_boleta_xml)

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

                console.log("ruta_zip", ruta_zip)

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

        let model_factura = {
            Id_Emisor: idEmisor,
            Id_Cliente: cliente.Id,
            Nro_Documento: nroBoleta,
            Fecha_Emision: datosBoleta.fechaEmision,
            Moneda: datosBoleta.moneda,
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

        GuardarBoleta(model_factura).then((result: any) => {
            if (result.indicator == 1) {
                toast.success(
                    `${result.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
                functionGenerarCorrelativo_B(rucEmisor);
                //   functionVerPDF();
            } else if (result.indicator == 0) {
                toast.error(
                    `${result.message}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
        })
    }

    return (
        <>
            <AddProducto
                open={openAddProducto}
                setOpen={setOpenAddProducto}
                onAgregarProducto={agregarProducto}
                dataProducto={dataProducto}
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
                    <div className="justify-between flex gap-4">
                        <Chip variant="outlined" value="Datos del Cliente" className="rounded-lg py-3" color='teal' />
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
                    <div className="justify-start flex gap-4">
                        <Chip variant="outlined" value="Datos del Documento" className="rounded-lg" color='teal' />
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
                    <div className='my-4 flex flex-col gap-6'>
                        {IdTipoDocumento == '1' && (
                            <Factura />
                        )}
                        {IdTipoDocumento == '2' && (
                            <Boleta onSendDataBoleta={handleDataBoleta} />
                        )}
                    </div>
                    <div className="justify-start flex gap-4">
                        <Chip variant="outlined" value="Datos del Producto" className="rounded-lg py-3" color='teal' />
                        <Button size="md" className="flex items-center gap-3 color-button"
                            onClick={() =>
                                setOpenAddProducto(!openAddProducto)
                            }
                        >
                            <PlusIcon strokeWidth={2} className='h-5 w-5' />
                            AGREGAR PRODUCTO
                        </Button>
                    </div>
                    <div className='my-4 flex flex-col gap-6'>
                        <div className="grid grid-cols-5 gap-4">
                            <div>
                                <Input
                                    className='cursor-not-allowed'
                                    readOnly
                                    color='teal'
                                    crossOrigin={undefined}
                                    name="Nro_Doc"
                                    value={opGravadas}
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
                                    value={opInafectas}
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
                                    value={opExonerada}
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
                                    value={descuentos}
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
                                    value={anticipos}
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
                                    value={igv}
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
                                    value={SUM_VALOR_VENTA_TOTAL().toFixed(2)}
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
                                    value={importeTotal}
                                    size="md"
                                    label="Importe Total"
                                    maxLength={20}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="justify-start flex gap-4">
                        <Button size="md" className="flex items-center gap-3 color-button"
                            onClick={() =>
                                FunctionGenerarXMLBoleta()
                            }
                        >
                            <PlusIcon strokeWidth={2} className='h-5 w-5' />
                            ENVIAR DOCUMENTO
                        </Button>
                    </div>
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
                                                {Number(item.Cantidad).toFixed(2)}
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
                                                {Number(item.Valor_Unitario).toFixed(2)}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Tipo_Tributo == 'IGV' ? (item.Importe * (igvPercent / (100 + igvPercent))).toFixed(2) : '0.00'}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {(item.Importe).toFixed(2)}
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
                                                    open={ToolTipEditId === Number(item.Codigo_Producto)}
                                                >
                                                    <IconButton
                                                        variant="text"
                                                        onClick={() => {
                                                            // functionOpenEditEmpresa(item.Id),
                                                            setToolTipEditId(null);
                                                        }}
                                                        onMouseOver={() => setToolTipEditId(Number(item.Codigo_Producto))}
                                                        onMouseLeave={() => setToolTipEditId(null)}
                                                    >
                                                        <PencilIcon
                                                            className={`h-6 w-6 ${ToolTipEditId === Number(item.Codigo_Producto) ? 'color-text' : 'text-gray-800'}`}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip
                                                    content="Borrar" placement="top"
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                    open={ToolTipDeleteId === Number(item.Codigo_Producto)}
                                                >
                                                    <IconButton variant="text"
                                                        onClick={() => {
                                                            // functionDelete(item.Id);
                                                            setToolTipDeleteId(null);
                                                        }}
                                                        onMouseOver={() => setToolTipDeleteId(Number(item.Codigo_Producto))}
                                                        onMouseLeave={() => setToolTipDeleteId(null)}
                                                    >
                                                        <TrashIcon className={`h-6 w-6 ${ToolTipDeleteId === Number(item.Codigo_Producto) ? 'color-text' : 'text-gray-800'}`} />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}
