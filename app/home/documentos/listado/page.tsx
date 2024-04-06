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
    Select,
    Option,
    Chip
} from "@/shared/material-tailwind-component"
import toast, { Toaster } from 'react-hot-toast';

import {
    ArrowLeftIcon,
    ArrowRightIcon,
    EyeIcon,
    DocumentIcon,
    DocumentArrowDownIcon,
    ArrowDownCircleIcon
} from '@/shared/heroicons'
import { ObtenerEmpresaAll } from '@/services/empresa';

import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { ObtenerListadoDocumentos } from '@/services/listado_documento';
import { DescargarCDRBase64, DescargarPDFBase64, DescargarZIPBase64 } from '@/services/factura';

import {
    FontAwesomeIcon,
    faFilePdf
} from '@/shared/font-awesome'

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

export default function page() {

    //ROUTER
    const router = useRouter()

    const TABLE_HEAD = ["N° Documento", "Cliente", "Fecha Emisión", "Importe Total", "Rpta. SUNAT (CDR)", "Estado","Acción"];

    const [ListadoDocumento, setListadoDocumento] = useState<Documento[]>([]);

    // CAMPOS EN PANTALLA
    const [campo1, setCampo1] = useState("");
    const [estado, setEstado] = useState(2);
    const [fchDesde, setFchDesde] = useState("");
    const [fchHasta, setFchHasta] = useState("");
    const [idTipoDoc, setidTipoDoc] = useState(1);


    // CAMPOS PARA PAGINADO
    const [CurrentPage, setCurrentPage] = useState(1);
    const Limit = 10;
    const [TotalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(TotalItems / Limit);

    const tipoDocu = [
        { name: 'FACTURA', code: '1' },
        { name: 'BOLETA', code: '2' },
    ];

    const tipoEstado = [
        { name: 'TODOS', code: '2' },
        { name: 'ACTIVO', code: '1' },
        { name: 'ANULADO', code: '0' },
    ];

    // CONST PARA TOOLTIP_ID
    const [ToolTipEditId, setToolTipEditId] = useState<number | null>(null);
    const [ToolTipDeleteId, setToolTipDeleteId] = useState<number | null>(null);
    const [ToolTipXML, setToolTipXML] = useState<number | null>(null);
    const [ToolTipCDR, setToolTipCDR] = useState<number | null>(null);

    useEffect(() => {
        functionObtenerEmpresa();
    }, [])

    function functionListarDocumentos(page: number, campo1: string, fch_desde: string, fch_hasta: string, idTipoDoc: number, estado: number) {
        ObtenerListadoDocumentos(campo1, fch_desde, fch_hasta, idTipoDoc, Limit, page, estado).then((result: any) => {
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

    async function functionObtenerEmpresa() {
        const fechaActual = new Date().toISOString().split('T')[0];
        setFchDesde(fechaActual);

        ObtenerEmpresaAll().then((result_empresa: any) => {
            if (result_empresa.indicator == 1) {
                functionListarDocumentos(CurrentPage, '', fechaActual, '', idTipoDoc, estado)
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
                    onClick={() => functionListarDocumentos(1, campo1, fchDesde, fchHasta, idTipoDoc,estado)}
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
                    onClick={() => functionListarDocumentos(i, campo1, fchDesde, fchHasta, idTipoDoc, estado)}
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
                    onClick={() => functionListarDocumentos(totalPages, campo1, fchDesde, fchHasta, idTipoDoc, estado)}
                >
                    {totalPages}
                </IconButton>
            );
        }

        return pageNumbers;
    }

    // FUNCIONES PARA DESCARGAR PDF

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

    function functionDescargarPDF(item: any) {
        const prefijo = idTipoDoc == 1 ? "-01-" : "-03-";
        let nombre_archivo = ""
        nombre_archivo = item.Ruc_Empresa +
            prefijo
            + item.Nro_Documento
        DescargarPDFBase64(nombre_archivo).then((result_4: any) => {
            const blob = base64ToBlob(result_4.data, 'application/pdf');
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = nombre_archivo + '.pdf';
            a.click();

            URL.revokeObjectURL(url);
        })
    }

    // FUNCIONES PARA VER PDF

    const openInNewTab = (base64PDF: string, nombre_archivo: string) => {
        const width = window.innerWidth * 0.6; // El 80% del ancho de la ventana actual
        const height = window.innerHeight * 1.2; // El 80% del alto de la ventana actual
        const left = (window.innerWidth - width) / 2; // Centrar horizontalmente
        const top = (window.innerHeight - height) / 2; // Centrar verticalmente

        const pdfWindow = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top}`);
        if (pdfWindow) {
            pdfWindow.document.write(
                `<html>
                <head>
                    <title>${nombre_archivo}</title>
                </head>
                    <body style="margin: 0;">
                        <embed width="100%" height="100%" src="data:application/pdf;base64,${base64PDF}" type="application/pdf" title="${nombre_archivo}"/>
                    </body>
                </html>`
            );
            pdfWindow.document.close();
        }
    };

    function functionVerPDF(item: any) {
        const prefijo = idTipoDoc == 1 ? "-01-" : "-03-";
        let nombre_archivo = ""
        nombre_archivo = item.Ruc_Empresa +
            prefijo
            + item.Nro_Documento
        DescargarPDFBase64(nombre_archivo).then((result_4: any) => {
            openInNewTab(result_4.data, nombre_archivo)
        })
    }

    // FUNCIONES PARA DESCARGAR XML
    async function descargarXML(nombre_archivo: any) {
        try {
            // Realiza una llamada a la función que obtiene los datos base64, reemplaza esta línea con la llamada real.
            const result_4 = await DescargarZIPBase64(nombre_archivo);

            const archivo_xml = ((result_4 as { data: string }).data);

            // Decodificar la cadena de base64 a datos binarios
            const binaryString = atob(archivo_xml);
            const arrayBuffer = new ArrayBuffer(binaryString.length);
            const uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
            }

            // Crear un objeto Blob a partir de los datos binarios
            const blob = new Blob([uint8Array], { type: 'application/zip' });

            // Crear una URL del objeto Blob
            const fileURL = URL.createObjectURL(blob);

            // Crear un enlace <a> para descargar el archivo
            const downloadLink = document.createElement('a');
            downloadLink.href = fileURL;
            downloadLink.setAttribute('download', nombre_archivo + '.zip');

            // Simular un clic en el enlace para descargar el archivo
            document.body.appendChild(downloadLink);
            downloadLink.click();

            // Limpiar el enlace y la URL creada
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(fileURL);
        } catch (error) {
            console.error('Error al descargar archivo XML:', error);
            throw error;
        }
    }

    function functionDescargarXML(item: any) {
        const prefijo = idTipoDoc == 1 ? "-01-" : "-03-";
        let nombre_archivo = ""
        nombre_archivo = item.Ruc_Empresa +
            prefijo
            + item.Nro_Documento
        descargarXML(nombre_archivo).catch((error) => {
            console.error('Error en la descarga del archivo XML:', error);
        });
    }

    // FUNCIONES PARA DESCARGAR CDR

    async function descargarCDR(nombre_archivo: any) {
        try {
            // Realiza una llamada a la función que obtiene los datos base64, reemplaza esta línea con la llamada real.
            const result_5 = await DescargarCDRBase64(nombre_archivo);

            if ((result_5 as { indicator: number }).indicator === 1) {
                const archivo_cdr = ((result_5 as { data: string }).data);

                // Decodificar la cadena de base64 a datos binarios
                const binaryString = atob(archivo_cdr);
                const arrayBuffer = new ArrayBuffer(binaryString.length);
                const uint8Array = new Uint8Array(arrayBuffer);
                for (let i = 0; i < binaryString.length; i++) {
                    uint8Array[i] = binaryString.charCodeAt(i);
                }

                // Crear un objeto Blob a partir de los datos binarios
                const blob = new Blob([uint8Array], { type: 'application/zip' });

                // Crear una URL del objeto Blob
                const fileURL = URL.createObjectURL(blob);

                // Crear un enlace <a> para descargar el archivo
                const downloadLink = document.createElement('a');
                downloadLink.href = fileURL;
                downloadLink.setAttribute('download', 'R-' + nombre_archivo + '.zip');

                // Simular un clic en el enlace para descargar el archivo
                document.body.appendChild(downloadLink);
                downloadLink.click();

                // Limpiar el enlace y la URL creada
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(fileURL);
            }
        } catch (error) {
            console.error('Error al descargar archivo XML:', error);
            throw error;
        }
    }

    function functionDescargarCDR(item: any) {
        const prefijo = idTipoDoc == 1 ? "-01-" : "-03-";
        let nombre_archivo = ""
        nombre_archivo = item.Ruc_Empresa + prefijo + item.Nro_Documento

        descargarCDR(nombre_archivo).catch((error) => {
            console.error('Error en la descarga del archivo XML:', error);
        });

    }

    return (
        <>
            <Breadcrumbs className="bg-transparent mt-1">
                <a href="#" className="opacity-60">
                    Inicio
                </a>
                <a href="#" className="opacity-60">
                    Documentos
                </a>
                <a href="#">Listado</a>
            </Breadcrumbs>
            <Toaster />
            <Card className='w-full rounded-none' color="white" shadow={true}>
                <CardBody className="rounded-md pt-2 px-4">
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-5 gap-4">
                            <Select
                                color='teal'
                                label="Tipo Documento"
                                name="moneda"
                                size="md"
                                value={idTipoDoc.toString()}
                                onChange={(e) => {
                                    setidTipoDoc(Number(e))
                                    functionListarDocumentos(1, campo1, fchDesde, fchHasta, Number(e), estado)
                                }}
                            >
                                {tipoDocu.map((tipo) => (
                                    <Option key={tipo.code} value={tipo.code}>
                                        {tipo.name}
                                    </Option>
                                ))}
                            </Select>
                            <Select
                                color='teal'
                                label="Estado"
                                name="moneda"
                                size="md"
                                value={estado.toString()}
                                onChange={(e) => {
                                    setEstado(Number(e))
                                    functionListarDocumentos(1, campo1, fchDesde, fchHasta, idTipoDoc, Number(e))
                                }}
                            >
                                {tipoEstado.map((tipo) => (
                                    <Option key={tipo.code} value={tipo.code}>
                                        {tipo.name}
                                    </Option>
                                ))}
                            </Select>
                            <div>
                                <Input crossOrigin={undefined}
                                    variant="outlined"
                                    color='teal'
                                    name="Campo1"
                                    size="md"
                                    label="RUC / Cliente / N° Documento"
                                    value={campo1}
                                    onChange={(e) => {
                                        setCampo1(e.target.value);
                                        functionListarDocumentos(1, e.target.value, fchDesde, fchHasta, idTipoDoc, estado)
                                    }}
                                />
                            </div>
                            <div>
                                <Input
                                    type='date'
                                    color='teal'
                                    crossOrigin={undefined}
                                    name="fchDesde"
                                    value={fchDesde}
                                    size="md"
                                    label="Fch. Emi. Desde"
                                    onChange={(e) => {
                                        setFchDesde(e.target.value);
                                        if (e.target.value.length == 0) {
                                            setFchHasta("")
                                        }
                                        else if (e.target.value > fchHasta) {
                                            setFchHasta("")
                                        }
                                        functionListarDocumentos(1, campo1, e.target.value, fchHasta, idTipoDoc, estado)
                                    }}
                                />
                            </div>
                            <div>
                                <Input
                                    type='date'
                                    color='teal'
                                    crossOrigin={undefined}
                                    name="fchHasta"
                                    value={fchHasta}
                                    size="md"
                                    label="Fch. Emi. Hasta"
                                    onChange={(e) => {
                                        setFchHasta(e.target.value)
                                        functionListarDocumentos(1, campo1, fchDesde, e.target.value, idTipoDoc, estado)
                                    }}
                                    min={fchDesde}
                                    max='9999-12-31'
                                />
                            </div>

                        </div>
                    </div>
                    <div className="py-3 overflow-x-auto">
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
                                                <Chip color="green" variant="outlined" value="ACEPTADA" className='justify-center' />
                                            </div>
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
                                            <div className='flex'>
                                                <Tooltip
                                                    content="Ver PDF" placement="top"
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                    open={ToolTipEditId === item.Id}
                                                >
                                                    <IconButton
                                                        variant="text"
                                                        onClick={() => {
                                                            functionVerPDF(item);
                                                            setToolTipEditId(null);
                                                        }}
                                                        onMouseOver={() => setToolTipEditId(item.Id)}
                                                        onMouseLeave={() => setToolTipEditId(null)}
                                                    >
                                                        <EyeIcon
                                                            className={`h-6 w-6 ${ToolTipEditId === item.Id ? 'color-text' : 'text-gray-800'}`}
                                                        /> 
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip
                                                    content="Descargar PDF" placement="top"
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                    open={ToolTipDeleteId === item.Id}
                                                >
                                                    <IconButton variant="text"
                                                        onClick={() => {
                                                            functionDescargarPDF(item)
                                                            setToolTipDeleteId(null);
                                                        }}
                                                        onMouseOver={() => setToolTipDeleteId(item.Id)}
                                                        onMouseLeave={() => setToolTipDeleteId(null)}
                                                    >
                                                        <FontAwesomeIcon className={`h-6 w-6 ${ToolTipDeleteId === item.Id ? 'color-text' : 'text-gray-800'}`} icon={faFilePdf}  />
                                                        {/* <DocumentIcon className={`h-6 w-6 ${ToolTipDeleteId === item.Id ? 'color-text' : 'text-gray-800'}`} /> */}
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip
                                                    content="Descargar XML" placement="top"
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                    open={ToolTipXML === item.Id}
                                                >
                                                    <IconButton variant="text"
                                                        onClick={() => {
                                                            functionDescargarXML(item)
                                                            setToolTipXML(null);
                                                        }}
                                                        onMouseOver={() => setToolTipXML(item.Id)}
                                                        onMouseLeave={() => setToolTipXML(null)}
                                                    >
                                                        <DocumentArrowDownIcon className={`h-6 w-6 ${ToolTipXML === item.Id ? 'color-text' : 'text-gray-800'}`} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip
                                                    content="Descargar CDR" placement="top"
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                    open={ToolTipCDR === item.Id}
                                                >
                                                    <IconButton variant="text"
                                                        onClick={() => {
                                                            functionDescargarCDR(item)
                                                            setToolTipCDR(null);
                                                        }}
                                                        onMouseOver={() => setToolTipCDR(item.Id)}
                                                        onMouseLeave={() => setToolTipCDR(null)}
                                                    >
                                                        <ArrowDownCircleIcon className={`h-6 w-6 ${ToolTipCDR === item.Id ? 'color-text' : 'text-gray-800'}`} />
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
                {ListadoDocumento.length != 0 && (
                    <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                        <Button
                            variant="text"
                            className={`flex items-center gap-2 rounded-full ${CurrentPage === 1 ? 'cursor-not-allowed text-gray-500' : ''}`}
                            onClick={() => {
                                if (CurrentPage !== 1) {
                                    functionListarDocumentos(CurrentPage - 1, campo1, fchDesde, fchHasta, idTipoDoc,estado);
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
                                    functionListarDocumentos(CurrentPage + 1, campo1, fchDesde, fchHasta, idTipoDoc, estado);
                                }
                            }
                            }
                        > Siguiente <ArrowRightIcon strokeWidth={2} className="h-4 w-4" />
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </>
    )
}
