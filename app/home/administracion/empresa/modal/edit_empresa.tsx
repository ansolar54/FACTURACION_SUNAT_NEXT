"use client"
import React, { useRef, useState, useEffect } from 'react'
import { Button, Card, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Option, Select } from '@/shared/material-tailwind-component'
import toast, { Toaster } from 'react-hot-toast';
import { EditarEmpresa } from '@/services/empresa';

interface Empresa {
    Id: number,
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


interface EditClienteProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    seleccionado?: Empresa;
    onListEmpresa: () => void;
}

const EditEmpresa: React.FC<EditClienteProps> = ({
    open,
    setOpen,
    seleccionado,
    onListEmpresa
}) => {
    const [empresa, setEmpresa] = useState<Empresa>({
        Id: 0,
        Nro_Ruc: "",
        Razon_Social: "",
        Serie_F: "",
        Serie_B: "",
        Serie_Fn: "",
        Serie_Bn: "",
        Igv: 0,
        Icbper: "",
        Logo: "",
        Direccion: "",
        Telefono: "",
        Correo: "",
        Web: "",
        Departamento: "",
        Provincia: "",
        Distrito: ""
    });

    const [showErrors, setShowErrors] = useState<{ [key: string]: boolean }>({
        Nro_Ruc: false,
        Razon_Social: false,
        Serie_F: false,
        Serie_B: false,
        Igv: false,
        Telefono: false,
        Correo: false,
        Web: false,
        Departamento: false,
        Provincia: false,
        Distrito: false,
        Direccion: false,
        Icbper: false,
        Serie_Fn: false,
        Serie_Bn: false,
    });

    const initialClienteRef = useRef<Empresa | null>(null);

    useEffect(() => {
        if (seleccionado) {
            setEmpresa({
                Id: seleccionado.Id,
                Nro_Ruc: seleccionado.Nro_Ruc,
                Razon_Social: seleccionado.Razon_Social,
                Serie_F: seleccionado.Serie_F,
                Serie_B: seleccionado.Serie_B,
                Serie_Fn: seleccionado.Serie_Fn,
                Serie_Bn: seleccionado.Serie_Bn,
                Igv: seleccionado.Igv,
                Icbper: seleccionado.Icbper,
                Logo: seleccionado.Logo,
                Direccion: seleccionado.Direccion,
                Telefono: seleccionado.Telefono,
                Correo: seleccionado.Correo,
                Web: seleccionado.Web,
                Departamento: seleccionado.Departamento,
                Provincia: seleccionado.Provincia,
                Distrito: seleccionado.Distrito
            });
            initialClienteRef.current = { ...seleccionado };
        }
    }, [seleccionado]);

    const camposModificados = () => {
        return Object.keys(empresa).some(key => empresa[key as keyof Empresa] !== initialClienteRef.current?.[key as keyof Empresa]);
    };

    const handleChange = (name: string, value: any) => {
        setEmpresa(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const ListadoIGV = [
        { Code: 10, Name: '10%' },
        { Code: 18, Name: '18%' },
    ];

    function functionCancelar() {
        setOpen(false)
        functionLimpiarCampos();
    }

    const functionLimpiarCampos = () => {
        setEmpresa({
            Id: seleccionado!.Id,
            Nro_Ruc: seleccionado!.Nro_Ruc,
            Razon_Social: seleccionado!.Razon_Social,
            Serie_F: seleccionado!.Serie_F,
            Serie_B: seleccionado!.Serie_B,
            Serie_Fn: seleccionado!.Serie_Fn,
            Serie_Bn: seleccionado!.Serie_Bn,
            Igv: seleccionado!.Igv,
            Icbper: seleccionado!.Icbper,
            Logo: seleccionado!.Logo,
            Direccion: seleccionado!.Direccion,
            Telefono: seleccionado!.Telefono,
            Correo: seleccionado!.Correo,
            Web: seleccionado!.Web,
            Departamento: seleccionado!.Departamento,
            Provincia: seleccionado!.Provincia,
            Distrito: seleccionado!.Distrito
        });
        setShowErrors({});
    };

    function functionValidarEmpresa() {
        const validations = {
            Id: 'Id',
            Nro_Ruc: 'R.U.C.',
            Razon_Social: 'Razón Social',
            Serie_F: 'Serie Factura',
            Serie_B: 'Serie Boleta',
            Igv: 'I.G.V.',
            Telefono: 'Teléfono',
            Correo: 'Correo',
            Web: 'Web',
            Departamento: 'Departamento',
            Provincia: 'Provincia',
            Distrito: 'Distrito',
            Direccion: 'Dirección',
            Icbper: 'ICBPER',
            Serie_Fn: 'Serie Nota C. Factura',
            Serie_Bn: 'Serie Nota C. Boleta',
            Logo: 'Logo'
        };

        let errorField = '';

        for (const field in validations) {
            if (empresa[field as keyof Empresa] == 0 || empresa[field as keyof Empresa] == '') {

                toast.error(
                    `"${validations[field as keyof Empresa]}" está vacío.`, {
                    duration: 2000,
                    position: 'top-center',
                    id: `"${validations[field as keyof Empresa]}" está vacío.`
                });
                errorField = field;
                break;
            }
        }

        const errors = {
            Nro_Ruc: errorField === 'Nro_Ruc',
            Razon_Social: errorField === 'Razon_Social',
            Serie_F: errorField === 'Serie_F',
            Serie_B: errorField === 'Serie_B',
            Igv: errorField === 'Igv',
            Telefono: errorField === 'Telefono',
            Correo: errorField === 'Correo',
            Web: errorField === 'Web',
            Departamento: errorField === 'Departamento',
            Provincia: errorField === 'Provincia',
            Distrito: errorField === 'Distrito',
            Direccion: errorField === 'Direccion',
            Icbper: errorField === 'Icbper',
            Serie_Fn: errorField === 'Serie_Fn',
            Serie_Bn: errorField === 'Serie_Bn',
            Logo: errorField === 'Logo'
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

    function guardar() {
        let modal_empresa = {
            Id: empresa.Id,
            Nro_Ruc: empresa.Nro_Ruc,
            Razon_Social: empresa.Razon_Social,
            Igv: Number(empresa.Igv),
            Icbper: Number(empresa.Icbper),
            Serie_F: empresa.Serie_F,
            Serie_B: empresa.Serie_B,
            Serie_Fn: empresa.Serie_Fn,
            Serie_Bn: empresa.Serie_Bn,
            Logo: empresa.Logo,
            Direccion: empresa.Direccion,
            Telefono: empresa.Telefono,
            Correo: empresa.Correo,
            Web: empresa.Web,
            Departamento: empresa.Departamento,
            Provincia: empresa.Provincia,
            Distrito: empresa.Distrito
        }
        EditarEmpresa(modal_empresa).then((result_empresa: any) => {
            if (result_empresa.indicator == 1) {
                toast.success(
                    `${result_empresa.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
                functionCancelar();
                onListEmpresa();
            }
            else {
                toast.error(
                    `${result_empresa.message}`, {
                    duration: 2000,
                    position: 'top-center',
                });
            }
        })
    }

    const convertirBase64 = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach(archivo => {
            var reader = new FileReader();
            reader.readAsDataURL(archivo);
            reader.onload = function () {
                var arrayAuxiliar: string[] = [];
                var base64 = reader.result as string;
                arrayAuxiliar = base64.split(',');
                // console.log(arrayAuxiliar[1]);
                setEmpresa((prevState) => ({
                    ...prevState,
                    Logo: arrayAuxiliar[1],
                }));
            }
        });
    };

    return (
        <>
            <Dialog open={open} handler={() => setOpen(!open)} size='xl'
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <Toaster />
                <DialogHeader>Editar Empresa</DialogHeader>
                <DialogBody divider>
                    <Card color="transparent" shadow={false}>
                        <form>
                            <div className="mb-4 flex flex-col gap-6">
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Nro_Ruc && (empresa.Nro_Ruc == '')}
                                            crossOrigin={undefined}
                                            name="Nro_Ruc"
                                            id="Nro_Ruc"
                                            value={empresa.Nro_Ruc}
                                            size="md"
                                            label="R.U.C."
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                if (/^\d{0,11}$/.test(inputValue)) {
                                                    handleChange(e.target.name, inputValue)
                                                }
                                            }}
                                            maxLength={11}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Razon_Social && (empresa.Razon_Social == '')}
                                            crossOrigin={undefined}
                                            name="Razon_Social"
                                            id="Razon_Social"
                                            value={empresa.Razon_Social}
                                            size="md"
                                            label="Razón Social"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={300}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Serie_F && (empresa.Serie_F == '')}
                                            crossOrigin={undefined}
                                            name="Serie_F"
                                            id="Serie_F"
                                            value={empresa.Serie_F}
                                            size="md"
                                            label="Serie Factura"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={4}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Serie_B && (empresa.Serie_B == '')}
                                            crossOrigin={undefined}
                                            name="Serie_B"
                                            id="Serie_B"
                                            value={empresa.Serie_B}
                                            size="md"
                                            label="Serie Boleta"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={4}
                                        />
                                    </div>
                                    <Select
                                        color='teal'
                                        error={showErrors.Igv && (empresa.Igv == 0)}
                                        label="I.G.V."
                                        name="Igv"
                                        size="md"
                                        value={empresa.Igv.toString()}
                                        key={empresa.Igv}
                                        onChange={(e) => {
                                            handleChange('Igv', e)
                                        }}
                                    >
                                        {ListadoIGV.map((tipo) => (
                                            <Option key={tipo.Code} value={tipo.Code.toString()}>
                                                {tipo.Name}
                                            </Option>
                                        ))}
                                    </Select>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Telefono && (empresa.Telefono == '')}
                                            crossOrigin={undefined}
                                            name="Telefono"
                                            id="Telefono"
                                            value={empresa.Telefono}
                                            size="md"
                                            label="Teléfono"
                                            onChange={(e) => {
                                                handleChange(e.target.name, e.target.value)
                                            }}
                                            maxLength={15}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Correo && (empresa.Correo == '')}
                                            crossOrigin={undefined}
                                            name="Correo"
                                            id="Correo"
                                            value={empresa.Correo}
                                            size="md"
                                            label="Correo"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={150}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Web && (empresa.Web == '')}
                                            crossOrigin={undefined}
                                            name="Web"
                                            id="Web"
                                            value={empresa.Web}
                                            size="md"
                                            label="Web"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={150}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Departamento && (empresa.Departamento == '')}
                                            crossOrigin={undefined}
                                            name="Departamento"
                                            id="Departamento"
                                            value={empresa.Departamento}
                                            size="md"
                                            label="Departamento"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={45}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Provincia && (empresa.Provincia == '')}
                                            crossOrigin={undefined}
                                            name="Provincia"
                                            id="Provincia"
                                            value={empresa.Provincia}
                                            size="md"
                                            label="Provincia"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={45}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Distrito && (empresa.Distrito == '')}
                                            crossOrigin={undefined}
                                            name="Distrito"
                                            id="Distrito"
                                            value={empresa.Distrito}
                                            size="md"
                                            label="Distrito"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={45}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Direccion && (empresa.Direccion == '')}
                                            crossOrigin={undefined}
                                            name="Direccion"
                                            id="Direccion"
                                            value={empresa.Direccion}
                                            size="md"
                                            label="Dirección"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={150}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Icbper && (empresa.Icbper == "")}
                                            crossOrigin={undefined}
                                            name="Icbper"
                                            id="Icbper"
                                            value={empresa.Icbper}
                                            size="md"
                                            label="ICBPER"
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                if (/^\d{0,6}(\.\d{0,2})?$/.test(inputValue)) {
                                                    handleChange(e.target.name, inputValue)
                                                }
                                            }}
                                            maxLength={9}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Serie_Fn && (empresa.Serie_Fn == '')}
                                            crossOrigin={undefined}
                                            name="Serie_Fn"
                                            id="Serie_Fn"
                                            value={empresa.Serie_Fn}
                                            size="md"
                                            label="Serie Nota C. Factura"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={4}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Serie_Bn && (empresa.Serie_Bn == '')}
                                            crossOrigin={undefined}
                                            name="Serie_Bn"
                                            id="Serie_Bn"
                                            value={empresa.Serie_Bn}
                                            size="md"
                                            label="Serie Nota C. Boleta"
                                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                                            maxLength={4}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            type='file'
                                            error={showErrors.Logo && (empresa.Logo == '')}
                                            crossOrigin={undefined}
                                            name="Logo"
                                            size="md"
                                            label="Logo"
                                            onChange={(e) => convertirBase64(e.target.files)}
                                            maxLength={45}
                                        />

                                    </div>
                                    {empresa.Logo && (
                                        <div className='items-center flex'>
                                            <img id="imgBase64" width="85px"
                                                style={{
                                                    borderRadius: "10px",
                                                    padding: "3px",
                                                    border: "1px solid #555",
                                                }}
                                                src={"data:image/png;base64," + empresa.Logo} />
                                        </div>
                                    )}

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
                        onClick={() => functionValidarEmpresa()}>
                        <span>Guardar</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    )
}

export default EditEmpresa