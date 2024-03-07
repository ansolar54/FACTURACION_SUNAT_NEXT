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
    PencilIcon,
    PlusIcon
} from '@/shared/heroicons'

import toast, { Toaster } from 'react-hot-toast';
import { EliminarEmpresa, ObtenerEmpresaAll } from '@/services/empresa';

import Swal from 'sweetalert2';
import AddEmpresa from './modal/add_empresa';
import EditEmpresa from './modal/edit_empresa';

export default function Empresa() {
    const TABLE_HEAD = [
        "RUC",
        "Razón Social",
        "Serie Fact.",
        "Serie Bol.",
        "Serie N.C. Fact.",
        "Serie N.C. Bol.",
        "IGV",
        "ICBPER",
        "Telefono",
        "Correo",
        "Web",
        "Dirección",
        "Logo",
        "Acción"
    ];

    const [ListadoEmpresa, setListadoEmpresa] = useState<any[]>([]);

    // CONST PARA TOOLTIP_ID
    const [ToolTipEditId, setToolTipEditId] = useState<number | null>(null);
    const [ToolTipDeleteId, setToolTipDeleteId] = useState<number | null>(null);

    // CONST SELECCIONADO PARA MODAL EDIT CLIENTE
    const [seleccionado, setSeleccionado] = React.useState<any | undefined>(undefined);

    const [openAddEmpresa, setOpenAddEmpresa] = React.useState(false);
    const [openEditEmpresa, setOpenEditEmpresa] = React.useState(false);

    useEffect(() => {
        FunctionListarEmpresa();
    }, []);

    function FunctionListarEmpresa() {
        ObtenerEmpresaAll().then((result: any) => {
            if (result.indicator == 1) {
                setListadoEmpresa(result.data);
                console.log(result);
            } else {
                setListadoEmpresa([]);
            }
        });
    }

    const functionOpenEditEmpresa = (id: number) => {
        const ObjectSeleccionado = ListadoEmpresa.find(item => item.Id === id);
        if (ObjectSeleccionado) {
            setSeleccionado(ObjectSeleccionado);
            setOpenEditEmpresa(!openEditEmpresa);
        } else {
            console.log(`No se encontró ningún objeto con id ${id}`);
        }
    };

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
                EliminarEmpresa(id).then((result_delete: any) => {
                    if (result_delete.indicator === 1) {
                        toast.success(
                            `${result_delete.message}`, {
                            duration: 2000,
                            position: 'top-center',
                        });
                        FunctionListarEmpresa();
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

    return (
        <>
            <AddEmpresa
                open={openAddEmpresa}
                setOpen={setOpenAddEmpresa}
                onListEmpresa={FunctionListarEmpresa}
            />
            <EditEmpresa
                open={openEditEmpresa}
                setOpen={setOpenEditEmpresa}
                seleccionado={seleccionado}
                onListEmpresa={FunctionListarEmpresa}
            />
            <Breadcrumbs className="bg-transparent mt-1">
                <a href="#" className="opacity-60">
                    Inicio
                </a>
                <a href="#" className="opacity-60">
                    Administración
                </a>
                <a href="#">Empresa</a>
            </Breadcrumbs>
            <Toaster />
            <Card className='w-full rounded-none' color="white" shadow={true}>
                <CardBody className="rounded-md pt-2 px-4">
                    <div className="flex justify-end gap-4">
                        <Button size="md" className="flex items-center gap-3 color-button"
                            onClick={() => setOpenAddEmpresa(!openAddEmpresa)}
                        >
                            <PlusIcon strokeWidth={2} className='h-5 w-5' />
                            Agregar Empresa
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
                                {ListadoEmpresa.map((item, key) => (
                                    <tr key={key} className=" border-b border-gray-600">
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Nro_Ruc}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Razon_Social}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Serie_F}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Serie_B}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Serie_Fn}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Serie_Bn}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Igv + ' %'}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {(item.Icbper).toFixed(2)}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Telefono}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Correo}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Web}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <Typography variant="small" color="blue-gray" className="font-normal">
                                                {item.Direccion + " " + item.Departamento + " - " + item.Provincia + " - " + item.Distrito}
                                            </Typography>
                                        </td>
                                        <td className="p-2">
                                            <img id="imgBase64" width="65px" style={{
                                                borderRadius: "10px",
                                                padding: "3px",
                                                border: "1px solid #555",
                                            }}
                                                src={"data:image/png;base64," + item.Logo} />
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
                                                            functionOpenEditEmpresa(item.Id),
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
            </Card>
        </>
    )
}
