"use client"
import React, { useEffect, useState } from 'react'
import {
    Input,
    Select,
    Option,
    Button,
    Radio,
    Typography,
    Chip,
    Tooltip,
    IconButton,
    CardFooter,
} from "@/shared/material-tailwind-component"
import { ObtenerTipo_NotaCredito } from '@/services/tipo_nota_credito';
import { ModificarEstadoDocumento, ObtenerListadoDocumentos } from '@/services/listado_documento';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { ObtenerFacturaCliente } from '@/services/factura';
import { EnviarNCredito, GenerarSerieCorrelativo_NotaCredito, GenerarXML_NotaCredito, ObtenerRutaNCredito, RegistrarNCredito } from '@/services/nota_credito';

import toast, { Toaster } from 'react-hot-toast';
import {
    DocumentArrowUpIcon
} from "@/shared/heroicons";
import { useRouter } from 'next/navigation';
import { ObtenerBoletaCliente } from '@/services/boleta';

type Body = {
    Id: number;
    Nombre: string;
};

interface Documento {
    Id: number,
    Id_Cliente: number,
    Nro_Documento: string,
    Nro_Doc_Cliente: string,
    Cliente: string,
    Fecha_Emision: string,
    Moneda: string,
    Importe_Total: number,
    Ruc_Empresa: string,
    Estado: string,
}

interface Result<T> {
    data: T;
    indicator: number
}

interface NCreditoProps {
    onSendDataNCredito: (dataNCredito: DatosNCredito) => void;
    rucEmisor: string;
}

interface DatosNCredito {
    nroNotaCredito: string
}

export default function NotaCredito({ onSendDataNCredito, rucEmisor }: NCreditoProps) {
    //ROUTER
    const router = useRouter()

    const TABLE_HEAD = ["N° Documento", "Cliente", "Fecha Emisión", "Importe Total", "Estado", "Acción"];

    // TABLE - LISTADO DOCUMENTO
    const [ListadoDocumento, setListadoDocumento] = useState<Documento[]>([]);

    // CAMPOS PARA PAGINADO
    const [CurrentPage, setCurrentPage] = useState(1);
    const Limit = 5;
    const [TotalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(TotalItems / Limit);

    // SELECT - LISTADO TIPO NOTA CREDITO
    const [listadoTipoNotaCredito, setlistadoTipoNotaCredito] = useState<Body[]>([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState<Body>({ Id: 0, Nombre: '' });

    const [Id_Tipo_Nota_Credito, setId_Tipo_Nota_Credito] = useState("")

    // RADIO BUTTON 1 = FACTURA // 2 = BOLETA
    const [Id_Tipo_Documento, setIdTipoDocumento] = useState(1);

    // CAMPOS DE REGISTRO NOTA CREDITO
    const [fechaEmision, setfechaEmision] = useState("");
    const [numeroFE, setNumeroFE] = useState("");
    const [Id_Documento, setId_Documento] = useState(0);
    const [motivo, setMotivo] = useState("");

    // CAMPOS NOTA CREDITO
    const [nroNotaCredito, setnroNotaCredito] = useState("");
    const [serieNC, setserieNC] = useState("");
    const [correlativoNC, setcorrelativoNC] = useState("");
    const [Id_Cliente, setId_Cliente] = useState(0);

    // CAMPO PARA FILTRAR DOCUMENTOS
    const [numeroDocumento, setNumeroDocumento] = useState("");

    useEffect(() => {
        functionGenerarCorrelativo_NC(rucEmisor, 1)
        const fechaActual = new Date().toISOString().split('T')[0];
        setfechaEmision(fechaActual);
        ObtenerTipo_NotaCredito(1).then((result: any) => {
            setlistadoTipoNotaCredito(result.data)
        })
    }, [])

    useEffect(() => {
        functionListarDocumentos(1, numeroDocumento, Id_Tipo_Documento);
    }, [])

    useEffect(() => {
        const dataNCredito: DatosNCredito = {
            nroNotaCredito: nroNotaCredito
        };
        onSendDataNCredito(dataNCredito);
    }, [nroNotaCredito]);

    const formatNumber = (value: any) => {
        const formattedNumber = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return formattedNumber;
    };

    function formatFecha(fecha: any) {
        const dateObject = new Date(fecha);
        const dia = dateObject.getDate().toString().padStart(2, '0');
        const mes = (dateObject.getMonth() + 1).toString().padStart(2, '0');
        const anio = dateObject.getFullYear();
        const fechaFormateada = `${dia}-${mes}-${anio}`;
        return fechaFormateada;
    }

    const numeroConCeros = (num: number): string => {
        const numString = num.toString();
        return numString.length < 2 ? `0${numString}` : numString;
    };

    function functionListarDocumentos(page: number, campo1: string, idTipoDoc: number) {
        ObtenerListadoDocumentos(campo1, '', '', idTipoDoc, Limit, page, 2).then((result: any) => {
            if (result.indicator == 1) {
                setListadoDocumento(result.data);
                setCurrentPage(page);
                setTotalItems(result.totalItems);
                console.log(result);
            } else {
                setListadoDocumento([]);
            }
        })
    }

    function functionGenerarCorrelativo_NC(rucEmisor: string, tipo_doc_sunat: number) {
        GenerarSerieCorrelativo_NotaCredito(rucEmisor, tipo_doc_sunat).then((result: any) => {
            if (result.indicator == 1) {
                const { correlativo, serie } = result.data;
                setcorrelativoNC(correlativo);
                setserieNC(serie);
                setnroNotaCredito(serie + "-" + correlativo);
            }
        })
    }

    function functionClicRadio(value: number) {
        setIdTipoDocumento(value)
        setNumeroDocumento('');
        setNumeroFE('')

        functionGenerarCorrelativo_NC(rucEmisor, value)
        functionListarDocumentos(1, '', value);
        ObtenerTipo_NotaCredito(value).then((result: any) => {
            setlistadoTipoNotaCredito(result.data)
        })
    }

    function renderPageNumbers() {
        const pageNumbers = [];
        const maxVisiblePages = 10; // Número máximo de páginas visibles
        let startPage, endPage;

        if (totalPages <= maxVisiblePages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const maxPagesBeforeCurrentPage = Math.floor(maxVisiblePages / 2);
            const maxPagesAfterCurrentPage = Math.ceil(maxVisiblePages / 2) - 1;

            if (CurrentPage <= maxPagesBeforeCurrentPage) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (CurrentPage + maxPagesAfterCurrentPage >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = CurrentPage - maxPagesBeforeCurrentPage;
                endPage = CurrentPage + maxPagesAfterCurrentPage;
            }
        }

        if (startPage > 1) {
            pageNumbers.push(
                <IconButton
                    className='rounded-full'
                    key={1}
                    variant={1 === CurrentPage ? "filled" : "text"}
                    size="sm"
                    onClick={() => functionListarDocumentos(1, numeroDocumento, Id_Tipo_Documento)}
                >
                    {1}
                </IconButton>
            );
            if (startPage > 2) {
                pageNumbers.push(
                    <IconButton className='rounded-full' key="dots-start" variant="text" size="sm" disabled>
                        ...
                    </IconButton>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <IconButton
                    className={`rounded-full ${i === CurrentPage ? 'color-bg-teal-500' : ''}`}
                    key={i}
                    variant={i === CurrentPage ? "filled" : "text"}
                    size="sm"
                    onClick={() => functionListarDocumentos(i, numeroDocumento, Id_Tipo_Documento)}
                >
                    {i}
                </IconButton>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pageNumbers.push(
                    <IconButton className='rounded-full' key="dots-end" variant="text" size="sm" disabled>
                        ...
                    </IconButton>
                );
            }
            pageNumbers.push(
                <IconButton
                    className='rounded-full'
                    key={totalPages}
                    variant={totalPages === CurrentPage ? "filled" : "text"}
                    size="sm"
                    onClick={() => functionListarDocumentos(totalPages, numeroDocumento, Id_Tipo_Documento)}
                >
                    {totalPages}
                </IconButton>
            );
        }
        return pageNumbers;
    }

    function functionSeleccionarDocumento(item: any) {
        setNumeroFE(item.Nro_Documento)
        setId_Cliente(item.Id_Cliente)
        setId_Documento(item.Id)
    }

    async function functionArmarXML(Nro_Documento: string, Id_Cliente: number) {

        let NC_factura_xml = {}

        if (Id_Tipo_Documento == 1) {
            const result_1 = await ObtenerFacturaCliente(Nro_Documento, Id_Cliente) as Result<any>;
            const dataFacturaCliente = result_1.data;
            // console.log(dataFacturaCliente)
            if (result_1.indicator == 1) {

                let data_detail_xml = [];

                for (let i = 0; i < dataFacturaCliente.DetalleDocumento.length; i++) {
                    const element = dataFacturaCliente.DetalleDocumento[i];
                    let model_detail = {
                        Id: element.Id,
                        Tipo_Tributo: element.Tipo_Tributo,
                        Codigo_Producto: element.Codigo_Producto,
                        Descripcion: element.Descripcion,
                        Cantidad: element.Cantidad,
                        Unidad_Medida: element.Unidad_Medida,
                        Precio_Unitario: element.Precio_Unitario,
                        Valor_Unitario: element.Valor_Unitario,
                        Valor_Item: element.Valor_Item
                    };
                    data_detail_xml.push(model_detail);
                }

                NC_factura_xml = {
                    Ruc_Emisor: dataFacturaCliente.Ruc_Empresa,
                    Nro_Documento: nroNotaCredito,
                    Nro_Documento_Modifica: numeroFE,
                    Cliente: dataFacturaCliente.Cliente,
                    Id_Nro_Doc_Cliente: dataFacturaCliente.codigo_tipo_doc_cliente,
                    Nro_Doc_Cliente: dataFacturaCliente.Nro_Doc_Cliente,
                    Tipo_Nota_Credito: numeroConCeros(tipoSeleccionado.Id),
                    Descripcion_Tipo_Nota_Credito: tipoSeleccionado.Nombre,
                    Tipo_Documento: '01',
                    Tipo_Docu_Ref: '',
                    Tipo_Addi_Docu_Ref: '',
                    Fecha_Emision: fechaEmision,
                    Moneda: dataFacturaCliente.Moneda,
                    Op_Gravadas: dataFacturaCliente.Op_Gravadas,
                    Op_Inafectas: dataFacturaCliente.Op_Inafectas,
                    Op_Exonerada: dataFacturaCliente.Op_Exonerada,
                    Descuentos: dataFacturaCliente.Descuentos,
                    Anticipos: dataFacturaCliente.Anticipos,
                    Igv: dataFacturaCliente.Igv,
                    Igv_Percent: parseFloat(dataFacturaCliente.Igv_Percent),
                    Importe_Total: dataFacturaCliente.Importe_Total,
                    DetalleDocumento: data_detail_xml
                }
            }
        }

        else if (Id_Tipo_Documento == 2) {
            const result_1 = await ObtenerBoletaCliente(Nro_Documento, Id_Cliente) as Result<any>;
            const dataBoletaCliente = result_1.data;
            // console.log(dataBoletaCliente)

            if (result_1.indicator == 1) {
                let data_detail_xml = [];

                for (let i = 0; i < dataBoletaCliente.DetalleDocumento.length; i++) {
                    const element = dataBoletaCliente.DetalleDocumento[i];
                    let model_detail = {
                        Id: element.Id,
                        Tipo_Tributo: element.Tipo_Tributo,
                        Codigo_Producto: element.Codigo_Producto,
                        Descripcion: element.Descripcion,
                        Cantidad: element.Cantidad,
                        Unidad_Medida: element.Unidad_Medida,
                        Precio_Unitario: element.Precio_Unitario,
                        Valor_Unitario: element.Valor_Unitario,
                        Valor_Item: element.Valor_Item
                    };
                    data_detail_xml.push(model_detail);
                }

                NC_factura_xml = {
                    Ruc_Emisor: dataBoletaCliente.Ruc_Empresa,
                    Nro_Documento: nroNotaCredito,
                    Nro_Documento_Modifica: numeroFE,
                    Cliente: dataBoletaCliente.Cliente,
                    Id_Nro_Doc_Cliente: dataBoletaCliente.codigo_tipo_doc_cliente,
                    Nro_Doc_Cliente: dataBoletaCliente.Nro_Doc_Cliente,
                    Tipo_Nota_Credito: numeroConCeros(tipoSeleccionado.Id),
                    Descripcion_Tipo_Nota_Credito: tipoSeleccionado.Nombre,
                    Tipo_Documento: '03',
                    Tipo_Docu_Ref: '',
                    Tipo_Addi_Docu_Ref: '',
                    Fecha_Emision: fechaEmision,
                    Moneda: dataBoletaCliente.Moneda,
                    Op_Gravadas: dataBoletaCliente.Op_Gravadas,
                    Op_Inafectas: dataBoletaCliente.Op_Inafectas,
                    Op_Exonerada: dataBoletaCliente.Op_Exonerada,
                    Descuentos: dataBoletaCliente.Descuentos,
                    Anticipos: dataBoletaCliente.Anticipos,
                    Igv: dataBoletaCliente.Igv,
                    Igv_Percent: parseFloat(dataBoletaCliente.Igv_Percent),
                    Importe_Total: dataBoletaCliente.Importe_Total,
                    DetalleDocumento: data_detail_xml
                }

            }

        }

        console.log(NC_factura_xml)

        GenerarXML_NotaCredito(NC_factura_xml).then((result: any) => {
            if (result.indicator == 1) {
                toast.success(
                    `${result.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
                setTimeout(functionEnviarNCredito, 2000)
            }
            else {
                toast.error(
                    `${result.message}`, {
                    duration: 3000,
                    position: 'top-center',
                });
            }
            console.log(result)
        })
    }

    async function functionEnviarNCredito() {
        let ruta_zip = "";
        ObtenerRutaNCredito(nroNotaCredito, rucEmisor).then((result_2: any) => {
            if (result_2.indicator == 1) {
                ruta_zip = result_2.data.ruta
                ruta_zip.replace("\\\\", "\\");
                // console.log("ruta_zip", ruta_zip)
                EnviarNCredito(ruta_zip).then((result_3: any) => {
                    if (result_3.indicator == 1) {
                        toast.success(
                            `${result_3.message}`, {
                            duration: 2000,
                            position: 'top-center',
                        });
                        setTimeout(FunctionRegistrarNCredito, 2000)
                    }
                    else {
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

    function FunctionRegistrarNCredito() {
        let modal_ncredito = {
            Fecha_Emision: fechaEmision,
            Id_Tipo: tipoSeleccionado.Id,
            Id_Documento: Id_Documento,
            Nro_Documento: nroNotaCredito,
            Motivo: motivo,
            Serie: serieNC,
            Correlativo: correlativoNC,
            Tipo_Doc_Suant: Id_Tipo_Documento
        }

        RegistrarNCredito(modal_ncredito).then((result: any) => {
            if (result.indicator == 1) {
                toast.success(
                    `${result.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
                functionGenerarCorrelativo_NC(rucEmisor, Id_Tipo_Documento)
                setTimeout(FunctionModificarEstadoDocumento, 2000)

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

    function FunctionModificarEstadoDocumento() {
        ModificarEstadoDocumento(rucEmisor, numeroFE, 0).then((result: any) => {
            if (result.indicator == 1) {
                toast.success(
                    `${result.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
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

    return (
        <>
            <Toaster />
            <div className="justify-start flex gap-4 pt-1">
                <Radio crossOrigin={undefined} name="type" label="Factura" color="teal" value={1} onChange={(e) => functionClicRadio(Number(e.target.value))} defaultChecked />
                <Radio crossOrigin={undefined} name="type" label="Boleta" color="teal" value={2} onChange={(e) => functionClicRadio(Number(e.target.value))} />
            </div>
            <div className='my-4 flex flex-col gap-6'>
                <div className="grid grid-cols-5 gap-4">
                    <div>
                        <Input
                            type='date'
                            color='teal'
                            crossOrigin={undefined}
                            name="fechaEmision"
                            value={fechaEmision}
                            size="md"
                            label="Fecha Emisión"
                            onChange={(e) => {
                                setfechaEmision(e.target.value)
                            }}
                            max='9999-12-31'
                        />
                    </div>
                    <div>
                        <Select
                            color='teal'
                            label="Tipo Nota Crédito"
                            // name="Id_Tipo_Nota_Credito"
                            size="md"
                            value={tipoSeleccionado.Id.toString()}
                            key={tipoSeleccionado.Id}
                            onChange={(e) => {
                                const tipo = listadoTipoNotaCredito.find(t => t.Id == Number(e));
                                if (tipo) {
                                    setTipoSeleccionado(tipo);
                                }
                            }}
                        >
                            {listadoTipoNotaCredito.map((tipo) => (
                                <Option key={tipo.Id} value={tipo.Id.toString()}>
                                    {tipo.Nombre}
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Input
                            className='cursor-not-allowed'
                            disabled
                            color='teal'
                            crossOrigin={undefined}
                            name="numeroFE"
                            value={numeroFE}
                            size="md"
                            label="N° FE"
                        />
                    </div>
                    <div className='col-span-2'>
                        <Input
                            color='teal'
                            crossOrigin={undefined}
                            name="motivo"
                            value={motivo}
                            size="md"
                            label="Motivo o Sustento"
                            onChange={(e) => {
                                setMotivo(e.target.value)
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="justify-center flex gap-4">
                <Button
                    className="flex items-center gap-3 color-button"
                    size="md"
                    // color={numeroFE && tipoSeleccionado.Id && fechaEmision && motivo}
                    disabled={!numeroFE || !tipoSeleccionado.Id || !fechaEmision || !motivo}
                    onClick={() => functionArmarXML(numeroFE, Id_Cliente)}
                >
                    <DocumentArrowUpIcon strokeWidth={2} className='h-5 w-5'
                    />
                    ENVIAR NOTA CRÉDITO
                </Button>
            </div>
            <div className='flex flex-col gap-6'>
                <div className="grid grid-cols-5 gap-4">
                    <div className="relative flex w-full max-w-[24rem]">
                        <Input
                            color='teal'
                            crossOrigin={undefined}
                            label="N° Documento"
                            value={numeroDocumento}
                            onChange={(e) => setNumeroDocumento(e.target.value)}
                            className="pr-20"
                            containerProps={{
                                className: "min-w-0",
                            }}
                        />
                        <Button
                            size="sm"
                            color={numeroDocumento ? "teal" : "blue-gray"}
                            disabled={!numeroDocumento}
                            className="!absolute right-1 top-1 rounded"
                            onClick={() => functionListarDocumentos(1, numeroDocumento, Id_Tipo_Documento)}
                        >
                            Buscar
                        </Button>
                    </div>

                </div>
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
                        {ListadoDocumento.map((item, key) => (
                            <tr key={key} className=" border-b border-gray-600">
                                <td className="p-2">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        {item.Nro_Documento}
                                    </Typography>

                                </td>
                                <td className="p-2">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        {item.Nro_Doc_Cliente + " - " + item.Cliente}
                                    </Typography>
                                </td>
                                <td className="p-2">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        {formatFecha(item.Fecha_Emision)}
                                    </Typography>
                                </td>
                                <td className="p-2">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        {item.Moneda == 'PEN' ? 'S/' : '$'}
                                        {" " + formatNumber(item.Importe_Total)}
                                    </Typography>
                                </td>
                                <td className="p-2">
                                    <div
                                        // className='flex justify-center'
                                        className='w-20'
                                    >
                                        <Chip
                                            color={item.Estado == '1' ? 'green' : 'red'}
                                            variant="outlined" value={item.Estado == '0' ? 'ANULADA' : 'ACTIVA'} className='justify-center' />
                                    </div>
                                </td>
                                <td className="p-2">
                                    <div
                                        // className='flex justify-center'
                                        className='w-20'
                                    >
                                        <Button variant="text" className='rounded-lg' size="sm" color='teal' disabled={item.Estado == '0' ? true : false} onClick={() => functionSeleccionarDocumento(item)}>Seleccionar</Button>
                                        {/* <Chip color="green" variant="outlined" value="ACEPTADA" className='justify-center' /> */}
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {ListadoDocumento.length != 0 && (
                <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                    <Button
                        variant="text"
                        className={`flex items-center gap-2 rounded-full ${CurrentPage === 1 ? 'cursor-not-allowed text-gray-500' : ''}`}
                        onClick={() => {
                            if (CurrentPage !== 1) {
                                functionListarDocumentos(CurrentPage - 1, numeroDocumento, Id_Tipo_Documento);
                            }
                        }}
                    >
                        <ArrowLeftIcon strokeWidth={2} className="h-4 w-4" /> Anterior
                    </Button>
                    <div className="flex items-center gap-2">
                        {renderPageNumbers()}
                    </div>
                    <Button
                        variant="text"
                        className={`flex items-center gap-2 rounded-full ${CurrentPage === totalPages ? 'cursor-not-allowed text-gray-500' : ''}`}
                        onClick={() => {
                            if (CurrentPage !== totalPages) {
                                functionListarDocumentos(CurrentPage + 1, numeroDocumento, Id_Tipo_Documento);
                            }
                        }
                        }
                    > Siguiente <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
                    </Button>
                </CardFooter>
            )}
        </>
    )
}