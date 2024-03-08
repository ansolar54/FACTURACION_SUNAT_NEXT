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
    Breadcrumbs
} from "@/shared/material-tailwind-component"
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    UserPlusIcon,
    TrashIcon,
    PencilIcon
} from '@/shared/heroicons'
import { EliminarCliente, ObtenerClienteByCampo1 } from '@/services/cliente';
import AddCliente from './modal/add_cliente';
import Swal from 'sweetalert2';
import EditCliente from './modal/edit_cliente';

import toast, { Toaster } from 'react-hot-toast';

type Cliente = {
    Id: number,
    Nombres: string,
    Apellidos: string,
    Razon_Social: string,
    Nro_Doc: string,
    Direccion: string,
    Correo: string,
    Id_Tipo_Doc: number,
    Tipo_Doc: string
}

export default function Cliente() {
    const TABLE_HEAD = ["Cliente", "Tipo Docu", "N° Docu.", "Dirección", "Correo", "Acción"];

    const [ListadoCliente, setListadoCliente] = useState<Cliente[]>([]);

    // CAMPOS DE PANTALLA
    const [Campo1, setCampo1] = useState("");

    // VARIABLES PARA PAGINADO
    const [CurrentPage, setCurrentPage] = useState(1);
    const Limit = 1;
    const [TotalItems, setTotalItems] = useState(0);
    const totalPages = Math.ceil(TotalItems / Limit);

    // MODAL CLIENTE
    const [openAddCliente, setOpenAddCliente] = useState(false);
    const [openEditCliente, setOpenEditCliente] = useState(false);

    // CONST SELECCIONADO PARA MODAL EDIT CLIENTE
    const [seleccionado, setSeleccionado] = React.useState<Cliente | undefined>(undefined);

    // CONST PARA TOOLTIP_ID
    const [ToolTipEditId, setToolTipEditId] = useState<number | null>(null);
    const [ToolTipDeleteId, setToolTipDeleteId] = useState<number | null>(null);

    useEffect(() => {
        FunctionListarClientes(1, "")
    }, [])

    function FunctionListarClientes(page: number, campo1: string) {
        ObtenerClienteByCampo1(campo1, Limit, page).then((result: any) => {
            if (result.indicator == 1) {
                setListadoCliente(result.data);
                setCurrentPage(page);
                setTotalItems(result.totalItems);
                console.log(result);
            } else {
                setListadoCliente([]);
            }
        });
    }

    function OnListClient() {
        FunctionListarClientes(1, "")
    }

    function renderPageNumbers() {
        const pageNumbers = [];
        if (totalPages <= 10) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(
                    <IconButton
                        className={`rounded-full ${i === CurrentPage ? 'color-bg-teal-500' : ''}`}
                        key={i}
                        variant={i === CurrentPage ? "filled" : "text"}
                        size="sm"
                        onClick={() => FunctionListarClientes(i, Campo1)}
                    >
                        {i}
                    </IconButton>
                );
            }
        } else {
            if (CurrentPage <= 5) {
                for (let i = 1; i <= 7; i++) {
                    pageNumbers.push(
                        <IconButton
                            className='rounded-full'
                            key={i}
                            variant={i === CurrentPage ? "filled" : "text"}
                            size="sm"
                            onClick={() => FunctionListarClientes(i, Campo1)}
                        >
                            {i}
                        </IconButton>
                    );
                }
                pageNumbers.push(
                    <IconButton className='rounded-full' key="dots" variant="text" size="sm" disabled>
                        ...
                    </IconButton>
                );
                pageNumbers.push(
                    <IconButton
                        className='rounded-full '
                        key={totalPages}
                        variant={totalPages === CurrentPage ? "filled" : "text"}
                        size="sm"
                        onClick={() => FunctionListarClientes(totalPages, Campo1)}
                    >
                        {totalPages}
                    </IconButton>
                );
            } else {
                pageNumbers.push(
                    <IconButton
                        className='rounded-full'
                        key={1}
                        variant={1 === CurrentPage ? "filled" : "text"}
                        size="sm"
                        onClick={() => FunctionListarClientes(1, Campo1)}
                    >
                        {1}
                    </IconButton>
                );
                pageNumbers.push(
                    <IconButton className='rounded-full' key="dots" variant="text" size="sm" disabled>
                        ...
                    </IconButton>
                );
                for (let i = totalPages - 6; i <= totalPages; i++) {
                    pageNumbers.push(
                        <IconButton
                            className='rounded-full'
                            key={i}
                            variant={i === CurrentPage ? "filled" : "text"}
                            size="sm"
                            onClick={() => FunctionListarClientes(i, Campo1)}
                        >
                            {i}
                        </IconButton>
                    );
                }
            }
        }
        return pageNumbers;
    }

    async function functionDelete(id: number) {
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
                EliminarCliente(id).then((result_delete: any) => {
                    if (result_delete.indicator === 1) {
                        toast.success(
                            `${result_delete.message}`, {
                            duration: 2000,
                            position: 'top-center',
                        });
                        FunctionListarClientes(CurrentPage, Campo1);
                    }
                    else {
                        toast.error(
                            `${result_delete.message}`, {
                            duration: 4000,
                            position: 'top-center',

                        });
                    }
                })
            }
        });
    }

    const openEditUsuario = (id: number) => {
        const ObjectSeleccionado = ListadoCliente.find(item => item.Id === id);
        if (ObjectSeleccionado) {
            setSeleccionado(ObjectSeleccionado);
            setOpenEditCliente(!openEditCliente);
        } else {
            console.log(`No se encontró ningún objeto con id ${id}`);
        }
    };

    return (
        <>
            <AddCliente
                open={openAddCliente}
                setOpen={setOpenAddCliente}
                onListCliente={OnListClient}
            />
            <EditCliente
                open={openEditCliente}
                setOpen={setOpenEditCliente}
                seleccionado={seleccionado}
                onListCliente={OnListClient}
            />
            <Breadcrumbs className="bg-transparent mt-1">
                <a href="#" className="opacity-60">
                    Inicio
                </a>
                <a href="#" className="opacity-60">
                    Administración
                </a>
                <a href="#">Cliente</a>
            </Breadcrumbs>
            <Toaster />
            <Card className='w-full rounded-none' color="white" shadow={true}>
                <CardBody className="rounded-md pt-2 px-4">
                    <div className="flex justify-between gap-4">
                        <div className="w-72">
                            <Input crossOrigin={undefined}
                                variant="outlined"
                                color='teal'
                                name="Campo1"
                                size="lg"
                                label="N° Docu. / Cliente"
                                value={Campo1}
                                onChange={(e) => {
                                    setCampo1(e.target.value);
                                    FunctionListarClientes(1, e.target.value)
                                }}
                            />
                        </div>
                        <Button size="md" className="flex items-center gap-3 color-button"
                            onClick={() => setOpenAddCliente(!openAddCliente)}>
                            <UserPlusIcon strokeWidth={2} className='h-5 w-5' />
                            Agregar Cliente
                        </Button>
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
                                {ListadoCliente.map((item, key) => (
                                    <tr key={key} className=" border-b border-gray-600">
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Razon_Social == "" ? item.Nombres + " " + item.Apellidos : item.Razon_Social}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Tipo_Doc}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Nro_Doc}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Direccion}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Correo}
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
                                                    open={ToolTipEditId === item.Id}
                                                >
                                                    <IconButton
                                                        variant="text"
                                                        onClick={() => {
                                                            openEditUsuario(item.Id),
                                                                setToolTipEditId(null);
                                                        }}
                                                        onMouseOver={() => setToolTipEditId(item.Id)}
                                                        onMouseLeave={() => setToolTipEditId(null)}
                                                    >
                                                        <PencilIcon
                                                            className={`h-6 w-6 ${ToolTipEditId === item.Id ? 'color-text' : 'text-gray-800'}`}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip
                                                    content="Borrar" placement="top"
                                                    animate={{
                                                        mount: { scale: 1, y: 0 },
                                                        unmount: { scale: 0, y: 25 },
                                                    }}
                                                    open={ToolTipDeleteId === item.Id}
                                                >
                                                    <IconButton variant="text"
                                                        onClick={() => {
                                                            functionDelete(item.Id);
                                                            setToolTipDeleteId(null);
                                                        }}
                                                        onMouseOver={() => setToolTipDeleteId(item.Id)}
                                                        onMouseLeave={() => setToolTipDeleteId(null)}
                                                    >
                                                        <TrashIcon className={`h-6 w-6 ${ToolTipDeleteId === item.Id ? 'color-text' : 'text-gray-800'}`} />
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
                {ListadoCliente.length != 0 && (
                    <CardFooter className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                        <Button
                            variant="text"
                            className={`flex items-center gap-2 rounded-full ${CurrentPage === 1 ? 'cursor-not-allowed text-gray-500' : ''}`}
                            onClick={() => {
                                if (CurrentPage !== 1) {
                                    FunctionListarClientes(CurrentPage - 1, Campo1);
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
                                    FunctionListarClientes(CurrentPage + 1, Campo1)
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
