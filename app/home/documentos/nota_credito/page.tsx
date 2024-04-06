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
    Chip,
    Collapse
} from "@/shared/material-tailwind-component"
import toast, { Toaster } from 'react-hot-toast';
import { ObtenerTipo_NotaCredito } from '@/services/tipo_nota_credito';
import { ObtenerListadoNotaCredito } from '@/services/nota_credito';

import {
    ArrowLeftIcon,
    ArrowRightIcon,
    DocumentArrowUpIcon,
    EyeIcon,
    FunnelIcon
} from '@/shared/heroicons'

import {
    FontAwesomeIcon,
    faFilePdf
} from '@/shared/font-awesome'

import { DescargarPDFBase64 } from '@/services/factura';

import { useRouter } from 'next/navigation';

type Body = {
    Id: number;
    Nombre: string;
};

interface Documento {
    Id: number,
    Fecha_Emision: string,
    Nro_Documento: string,
    Motivo: string,
    Tipo_Nota_Credito: string,
}


export default function ListadoNotaCredito() {

    //ROUTER
    const router = useRouter()

    // CAMPOS PARA FILTRAR
    const [listadoTipoNotaCredito, setlistadoTipoNotaCredito] = useState<Body[]>([]);
    const [id_Tipo_Nota_Credito, setId_Tipo_Nota_Credito] = useState("0")
    const [numeroDoc, setNumeroDOC] = useState("");
    const [fechaEmision, setfechaEmision] = useState("");

    // CAMPOS PARA PAGINADO
    const Limit = 10;
    const [CurrentPage, setCurrentPage] = useState(1);
    const [TotalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(TotalItems / Limit);

    const TABLE_HEAD = ["N° Documento", "Fecha Emisión", "Tipo", "Motivo", "Acción"];

    // TABLE - LISTADO DOCUMENTO
    const [ListadoDocumento, setListadoDocumento] = useState<Documento[]>([]);

    // TOOLTIP_ID
    const [ToolTipVerPDF, setToolTipVerPDF] = useState<number | null>(null);
    const [ToolTipDeleteId, setToolTipDeleteId] = useState<number | null>(null);

    useEffect(() => {
        const fechaActual = new Date().toISOString().split('T')[0];
        setfechaEmision(fechaActual);
        ObtenerTipo_NotaCredito(1).then((result: any) => {
            setlistadoTipoNotaCredito(result.data)
        })
        functionListarNotaCreditos(1, fechaActual, id_Tipo_Nota_Credito, numeroDoc);
    }, []);

    function functionListarNotaCreditos(page: number, fchEmision: string, id_tipo: string, nro_documento: string) {
        ObtenerListadoNotaCredito(fchEmision, id_tipo, nro_documento, Limit, page).then((result: any) => {
            if (result.indicator == 1) {
                setListadoDocumento(result.data);
                setCurrentPage(page);
                setTotalItems(result.totalItems);
            } else {
                setListadoDocumento([]);
            }
        })
    }

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
                    onClick={() => functionListarNotaCreditos(1, fechaEmision, id_Tipo_Nota_Credito, numeroDoc)}
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
                    onClick={() => functionListarNotaCreditos(i, fechaEmision, id_Tipo_Nota_Credito, numeroDoc)}
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
                    onClick={() => functionListarNotaCreditos(totalPages, fechaEmision, id_Tipo_Nota_Credito, numeroDoc)}
                >
                    {totalPages}
                </IconButton>
            );
        }

        return pageNumbers;
    }

    // FUNCIONES PARA VER PDF
    function functionVerPDF(item: any) {
        const prefijo = "-07-";
        let nombre_archivo = ""
        nombre_archivo = item.Ruc_Empresa +
            prefijo
            + item.Nro_Documento
        DescargarPDFBase64(nombre_archivo).then((result_4: any) => {
            openInNewTab(result_4.data, nombre_archivo)
        })
    }

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
        const prefijo = "-07-";
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

    function functionLinkNuevaNotaCredito() {
        router.push('/home/documentos/nota_credito/add_nota_credito')
    }

    const [open, setOpen] = React.useState(false);

    const toggleOpen = () => setOpen((cur) => !cur);

    return (
        <>
            <Breadcrumbs className="bg-transparent mt-1">
                <a href="#" className="opacity-60">
                    Inicio
                </a>
                <a href="#" className="opacity-60">
                    Documentos
                </a>
                <a href="#">Nota de crédito</a>
            </Breadcrumbs>
            <Toaster />

            <Card className='w-full rounded-none' color="white" shadow={true}>
                <CardBody className="rounded-md pt-2 px-4">
                    <div className='justify-between flex'>
                        <Button variant="outlined" className='flex items-center gap-2' onClick={toggleOpen}>
                            <FunnelIcon strokeWidth={2} className='h-5 w-5'
                            />
                            Filtro</Button>
                        <Button
                            className="flex items-center gap-3 color-button"
                            size="md"
                            // color={numeroFE && tipoSeleccionado.Id && fechaEmision && motivo}
                            // disabled={!numeroFE || !tipoSeleccionado.Id || !fechaEmision || !motivo}
                            // onClick={() => functionArmarXML(numeroFE, Id_Cliente)}
                            onClick={() => functionLinkNuevaNotaCredito()}
                        >
                            <DocumentArrowUpIcon strokeWidth={2} className='h-5 w-5'
                            />
                            NUEVA NOTA CRÉDITO
                        </Button>
                    </div>
                    {open && (
                        <div className={`transition-opacity duration-300`}>
                            <div className="grid grid-cols-5 gap-4 pt-3">
                                <div>
                                    <Input
                                        color='teal'
                                        crossOrigin={undefined}
                                        name="numeroFE"
                                        value={numeroDoc}
                                        size="md"
                                        label="N° Doc."
                                        onChange={(e) => {
                                            setNumeroDOC(e.target.value)
                                            functionListarNotaCreditos(1, fechaEmision, id_Tipo_Nota_Credito, e.target.value)
                                        }}
                                    />
                                </div>
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
                                            functionListarNotaCreditos(1, e.target.value, id_Tipo_Nota_Credito, numeroDoc)
                                        }}
                                        max='9999-12-31'
                                    />
                                </div>
                                <Select
                                    color='teal'
                                    label="Tipo"
                                    name="moneda"
                                    size="md"
                                    value={id_Tipo_Nota_Credito}
                                    key={Number(id_Tipo_Nota_Credito)}
                                    onChange={(e) => {
                                        setId_Tipo_Nota_Credito(e as string)
                                        functionListarNotaCreditos(1, fechaEmision, e as string, numeroDoc)
                                    }}
                                >
                                    {listadoTipoNotaCredito.map((tipo) => (
                                        <Option key={tipo.Id} value={tipo.Id.toString()}>
                                            {tipo.Nombre}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                    )}
                    {/* <Collapse open={open}>
                        <Card className="w-full rounded-none" color="white" shadow={false}>
                            <CardBody className="rounded-md pt-2 px-0 pb-0">
                                <div className="grid grid-cols-5 gap-4">
                                    <div>
                                        <Input
                                            color='teal'
                                            crossOrigin={undefined}
                                            name="numeroFE"
                                            value={numeroDoc}
                                            size="md"
                                            label="N° Doc."
                                            onChange={(e) => {
                                                setNumeroDOC(e.target.value)
                                                functionListarNotaCreditos(1, fechaEmision, id_Tipo_Nota_Credito, e.target.value)
                                            }}
                                        />
                                    </div>
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
                                                functionListarNotaCreditos(1, e.target.value, id_Tipo_Nota_Credito, numeroDoc)
                                            }}
                                            max='9999-12-31'
                                        />
                                    </div>
                                    <Select
                                        color='teal'
                                        label="Tipo"
                                        name="moneda"
                                        size="md"
                                        value={id_Tipo_Nota_Credito}
                                        key={Number(id_Tipo_Nota_Credito)}
                                        onChange={(e) => {
                                            setId_Tipo_Nota_Credito(e as string)
                                            functionListarNotaCreditos(1, fechaEmision, e as string, numeroDoc)
                                        }}
                                        className='relative z-10'
                                    >
                                        {listadoTipoNotaCredito.map((tipo) => (
                                            <Option key={tipo.Id} value={tipo.Id.toString()}>
                                                {tipo.Nombre}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </CardBody>
                        </Card>
                    </Collapse> */}

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
                                    <tr key={key} className=" border-b border-gray-300">
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Nro_Documento}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {formatFecha(item.Fecha_Emision)}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Tipo_Nota_Credito}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Motivo}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <div className='flex'>
                                                <Tooltip
                                                    content="Ver PDF" placement="top"
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                    open={ToolTipVerPDF === item.Id}
                                                >
                                                    <IconButton
                                                        variant="text"
                                                        onClick={() => {
                                                            functionVerPDF(item);
                                                            setToolTipVerPDF(null);
                                                        }}
                                                        onMouseOver={() => setToolTipVerPDF(item.Id)}
                                                        onMouseLeave={() => setToolTipVerPDF(null)}
                                                    >
                                                        <EyeIcon
                                                            className={`h-6 w-6 ${ToolTipVerPDF === item.Id ? 'color-text' : 'text-gray-800'}`}
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
                                                        <FontAwesomeIcon className={`h-6 w-6 ${ToolTipDeleteId === item.Id ? 'color-text' : 'text-gray-800'}`} icon={faFilePdf} />
                                                        {/* <DocumentIcon className={`h-6 w-6 ${ToolTipDeleteId === item.Id ? 'color-text' : 'text-gray-800'}`} /> */}
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
                                    functionListarNotaCreditos(CurrentPage - 1, fechaEmision, id_Tipo_Nota_Credito, numeroDoc);
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
                                    functionListarNotaCreditos(CurrentPage + 1, fechaEmision, id_Tipo_Nota_Credito, numeroDoc);
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
