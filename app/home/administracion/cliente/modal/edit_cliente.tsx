"use client"
import React, { useRef, useState, useEffect } from 'react'
import { Button, Card, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Option, Select } from '@/shared/material-tailwind-component'
import toast, { Toaster } from 'react-hot-toast';
import { ListadoTipoDocCliente } from '@/services/tipo_doc_cliente';
import { EditarCliente } from '@/services/cliente';

type Cliente = {
    Id: number,
    Nombres: string,
    Apellidos: string,
    Razon_Social: string,
    Nro_Doc: string,
    Direccion: string,
    Correo: string,
    Id_Tipo_Doc: number,
}

type Body = {
    Id: number;
    Nombre: string;
};

interface EditClienteProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    seleccionado?: Cliente;
    onListCliente: () => void;
}

const EditCliente: React.FC<EditClienteProps> = ({
    open,
    setOpen,
    seleccionado,
    onListCliente
}) => {

    const [ListaDocCliente, setListaDocCliente] = useState<Body[]>([]);

    const [cliente, setCliente] = useState<Cliente>({
        Id: 0,
        Nombres: "",
        Apellidos: "",
        Razon_Social: "",
        Nro_Doc: "",
        Direccion: "",
        Correo: "",
        Id_Tipo_Doc: 0,
    });

    const [showErrors, setShowErrors] = useState<{ [key: string]: boolean }>({
        Id_Tipo_Doc: false,
        Nombres: false,
        Apellidos: false,
        Razon_Social: false,
        Nro_Doc: false,
        Direccion: false,
        Correo: false,
    });

    const initialClienteRef = useRef<Cliente | null>(null);

    useEffect(() => {
        functionListarDocCliente()
    }, [])

    useEffect(() => {
        if (seleccionado) {
            setCliente({
                Id: seleccionado.Id,
                Nombres: seleccionado?.Nombres,
                Apellidos: seleccionado?.Apellidos,
                Razon_Social: seleccionado.Razon_Social,
                Nro_Doc: seleccionado.Nro_Doc,
                Direccion: seleccionado.Direccion,
                Correo: seleccionado.Correo,
                Id_Tipo_Doc: seleccionado.Id_Tipo_Doc,
            });
            initialClienteRef.current = { ...seleccionado };
        }
    }, [seleccionado])

    const camposModificados = () => {
        return Object.keys(cliente).some(key => cliente[key as keyof Cliente] !== initialClienteRef.current?.[key as keyof Cliente]);
    };

    function functionListarDocCliente() {
        ListadoTipoDocCliente().then((result: any) => {
            setListaDocCliente(result.data)
        })
    }

    const handleChange = (name: string, value: any) => {
        setCliente(prevState => ({
            ...prevState,
            [name]: value,
        }));
        if (name == 'Id_Tipo_Doc') {
            if (value == 4) {
                setCliente(prevState => ({
                    ...prevState,
                    Nombres: '',
                    Apellidos: ''
                }));
            } else {
                setCliente(prevState => ({
                    ...prevState,
                    Razon_Social: ''
                }));
            }
        }
    };

    function functionCancelar() {
        setOpen(false)
        functionLimpiarCampos();
    }

    const functionLimpiarCampos = () => {
        setCliente({
            Id: seleccionado!.Id,
            Nombres: seleccionado!.Nombres,
            Apellidos: seleccionado!.Apellidos,
            Razon_Social: seleccionado!.Razon_Social,
            Nro_Doc: seleccionado!.Nro_Doc,
            Direccion: seleccionado!.Direccion,
            Correo: seleccionado!.Correo,
            Id_Tipo_Doc: seleccionado!.Id_Tipo_Doc,
        });
        setShowErrors({});
    };

    function functionValidarCliente() {
        const validations = {
            Id: 'Id',
            Id_Tipo_Doc: 'Tipo Documento',
            Nombres: 'Nombres',
            Apellidos: 'Apellidos',
            Razon_Social: 'Razón Social',
            Nro_Doc: 'N° Documento',
            Direccion: 'Dirección',
            Correo: 'Correo',
        };

        let errorField = '';

        for (const field in validations) {
            if (cliente[field as keyof Cliente] == 0 || cliente[field as keyof Cliente] == '') {
                if ((field == 'Nombres' && cliente.Id_Tipo_Doc != 4) || (field == 'Apellidos' && cliente.Id_Tipo_Doc != 4) || (field === 'Razon_Social' && cliente.Id_Tipo_Doc == 4) || (field != 'Nombres' && field != 'Apellidos' && field != 'Razon_Social')) {
                    toast.error(
                        `"${validations[field as keyof Cliente]}" está vacío.`, {
                        duration: 2000,
                        position: 'top-center',
                        id: `"${validations[field as keyof Cliente]}" está vacío.`
                    });
                    errorField = field;
                    break;
                }
            }
        }

        const errors = {
            Id_Tipo_Doc: errorField === 'Id_Tipo_Doc',
            Nombres: errorField === 'Nombres',
            Apellidos: errorField === 'Apellidos',
            Razon_Social: errorField === 'Razon_Social',
            Nro_Doc: errorField === 'Nro_Doc',
            Direccion: errorField === 'Direccion',
            Correo: errorField === 'Correo',
        };

        setShowErrors(errors);

        if (!errorField) {
            if (camposModificados()) {
                guardar();
            } else {
                toast('Los campos no han sido modificados.', {
                    duration: 2000,
                    position: 'top-center',
                    icon: '⚠️',
                    id: 'Los campos no han sido modificados.'
                });
            }
        }
    }

    const guardar = () => {
        let modal_edit_cliente = {
            Id: cliente.Id,
            Nombres: cliente.Nombres,
            Apellidos: cliente.Apellidos,
            Razon_Social: cliente.Razon_Social,
            Nro_Doc: cliente.Nro_Doc,
            Direccion: cliente.Direccion,
            Correo: cliente.Correo,
            Id_Tipo_Doc: Number(cliente.Id_Tipo_Doc)
        }
        EditarCliente(modal_edit_cliente).then((result_cliente: any) => {
            if (result_cliente.indicator == 1) {
                toast.success(
                    `${result_cliente.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
                functionCancelar();
                onListCliente();
            }
            else {
                toast.error(
                    `${result_cliente.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
            }
        })
    }

    return (
        <>
            <Dialog open={open} handler={() => setOpen(!open)} size='lg'
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}>
                <Toaster />
                <DialogHeader>Editar Cliente</DialogHeader>
                <DialogBody divider>
                    <Card color="transparent" shadow={false}>
                        <form>
                            <div className="mb-4 flex flex-col gap-6">
                                <div className="grid grid-cols-2 gap-2">
                                    <Select
                                        color='teal'
                                        error={showErrors.Id_Tipo_Doc && (cliente.Id_Tipo_Doc == 0)}
                                        label="Tipo de Documento"
                                        name="Id_Tipo_Doc"
                                        size="md"
                                        value={cliente.Id_Tipo_Doc.toString()}
                                        key={cliente.Id_Tipo_Doc}
                                        onChange={(e) => {
                                            handleChange('Id_Tipo_Doc', e)
                                        }}
                                    >
                                        {ListaDocCliente.map((tipo) => (
                                            <Option key={tipo.Id} value={tipo.Id.toString()}>
                                                {tipo.Nombre}
                                            </Option>
                                        ))}
                                    </Select>
                                    {cliente.Id_Tipo_Doc != 4 && (
                                        <div>
                                            <Input
                                                color='teal'
                                                error={showErrors.Nombres && (cliente.Nombres == '')}
                                                crossOrigin={undefined}
                                                name="Nombres"
                                                id="Nombres"
                                                value={cliente.Nombres}
                                                size="md"
                                                label="Nombres"
                                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                                maxLength={45}
                                            />
                                        </div>
                                    )}
                                    {cliente.Id_Tipo_Doc != 4 && (
                                        <div>
                                            <Input
                                                color='teal'
                                                error={showErrors.Apellidos && (cliente.Apellidos == '')}
                                                crossOrigin={undefined}
                                                name="Apellidos"
                                                id="Apellidos"
                                                value={cliente.Apellidos}
                                                size="md"
                                                label="Apellidos"
                                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                                maxLength={45}
                                            />
                                        </div>
                                    )}
                                    {cliente.Id_Tipo_Doc == 4 && (
                                        <div>
                                            <Input
                                                color='teal'
                                                error={showErrors.Razon_Social && (cliente.Razon_Social == '')}
                                                crossOrigin={undefined}
                                                name="Razon_Social"
                                                id="Razon_Social"
                                                value={cliente.Razon_Social}
                                                size="md"
                                                label="Razón Social"
                                                onChange={(e) => handleChange(e.target.name, e.target.value)}
                                                maxLength={150}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Nro_Doc && (cliente.Nro_Doc == '')}
                                            crossOrigin={undefined}
                                            name="Nro_Doc"
                                            id="Nro_Doc"
                                            value={cliente.Nro_Doc}
                                            size="md"
                                            label="N° Documento"
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                if (/^\d{0,20}$/.test(inputValue)) {
                                                    handleChange(e.target.name, inputValue)
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Direccion && (cliente.Direccion == '')}
                                            crossOrigin={undefined}
                                            name="Direccion"
                                            id="Direccion"
                                            value={cliente.Direccion}
                                            size="md"
                                            label="Dirección"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={150}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Correo && (cliente.Correo === '')}
                                            crossOrigin={undefined}
                                            name="Correo"
                                            id="Correo"
                                            value={cliente.Correo}
                                            size="md"
                                            label="Correo"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={100}
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Card>
                </DialogBody>
                <DialogFooter>
                    <Button
                        size="md"
                        variant="filled"
                        onClick={() => functionCancelar()}
                        className="mr-1 bg-blue-gray-300 hover:bg-blue-gray-500"
                    >
                        <span>Cancelar</span>
                    </Button>
                    <Button
                        size="md"
                        className='color-button'
                        onClick={() => functionValidarCliente()}>
                        <span>Guardar</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    )
}

export default EditCliente;

