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
    Option
} from "@/shared/material-tailwind-component"

import toast, { Toaster } from 'react-hot-toast';
import { ObtenerClienteByNroDoc } from '@/services/cliente';

interface Cliente {
    Id: number,
    Nombre: string,
    Direccion: string,
    Correo: string,
}

export default function Registro() {

    const ListadoIdTipoDocu = [
        { Code: 1, Name: 'FACTURA' },
        { Code: 2, Name: 'BOLETA' },
        { Code: 3, Name: 'NOTA CRÉDITO' },
    ];

    const [NroDocumento, setNroDocumento] = useState("")

    const [cliente, setCliente] = useState<Cliente>({
        Id: 0,
        Nombre: "",
        Direccion: "",
        Correo: "",
    });

    // const handleChange = (name: string, value: any) => {
    //     setCliente(prevState => ({
    //         ...prevState,
    //         [name]: value,
    //     }));
    // };

    function FunctionObtenerClienteByNroDoc(nrodoc: string) {
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

    const [IdTipoDocumento, setIdTipoDocumento] = useState(0)

    return (
        <>
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
                    <div className="justify-start flex gap-4">
                        <Chip variant="outlined" value="Datos del Cliente" className="rounded-lg" />
                        {/* <div>
                            <Select
                                color='teal'
                                label="Tipo Documento"
                                name="Igv"
                                size="md"
                                value={IdTipoDocumento.toString()}
                                key={IdTipoDocumento}
                                onChange={(e) => {
                                    setIdTipoDocumento(Number(e))
                                }}
                            >
                                {ListadoIdTipoDocu.map((tipo) => (
                                    <Option key={tipo.Code} value={tipo.Code.toString()}>
                                        {tipo.Name}
                                    </Option>
                                ))}
                            </Select>
                        </div> */}
                    </div>
                    <div className="my-4 flex flex-col gap-6">
                        <div className="grid grid-cols-5 gap-4">
                            <div>
                                <Input
                                    color='teal'
                                    crossOrigin={undefined}
                                    name="Nro_Doc"
                                    value={NroDocumento}
                                    size="md"
                                    label="N° Documento"
                                    onChange={(e) => {
                                        setNroDocumento(e.target.value)
                                        FunctionObtenerClienteByNroDoc(e.target.value)
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
                                />
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </>
    )
}
