"use client"
import React, { useRef, useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast';
import { Button, Card, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Option, Select } from '@/shared/material-tailwind-component'
import { ObtenerEmpresaAll } from '@/services/empresa';

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    onAgregarProducto: (producto: Producto) => void;
    dataProducto: Producto[];
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

const AddProducto: React.FC<Props> = ({
    open,
    setOpen,
    onAgregarProducto,
    dataProducto
}) => {

    const [producto, setProducto] = useState<Producto>({
        Tipo_Tributo: "IGV",
        Codigo_Producto: "",
        Descripcion: "",
        Cantidad: "", // Number
        Unidad_Medida: "NIU",
        Bien_Servicio: "B",
        Valor_Unitario: "",
        Importe: 0,
    });

    const [igvPercent, setigvPercent] = useState(0);

    const [showErrors, setShowErrors] = useState<{ [key: string]: boolean }>({
        Bien_Servicio: false,
        Cantidad: false,
        Unidad_Medida: false,
        Codigo_Producto: false,
        Descripcion: false,
        Valor_Unitario: false,
        Tipo_Tributo: false,
        Importe: false,
    });

    const tipoProductooption = [
        { code: 'B', name: 'BIEN' },
        { code: 'S', name: 'SERVICIO' },
    ];

    const unidadMedidaoption = [
        { code: 'NIU', name: 'UNIDAD (BIENES)' },
        { code: 'ZZ', name: 'UNIDAD (SERVICIOS)' },
        { code: '4A', name: 'BOBINAS' },
        { code: 'BJ', name: 'BALDE' },
        { code: 'BLL', name: 'BARRILES' },
        { code: 'BG', name: 'BOLSA' },
        { code: 'BO', name: 'BOTELLAS' },
        { code: 'BX', name: 'CAJA' },
        { code: 'CT', name: 'CARTONES' },
        { code: 'CMK', name: 'CENTIMETRO CUADRADO' },
        { code: 'CMQ', name: 'CENTIMETRO CUBICO' },
        { code: 'CMT', name: 'CENTIMETRO LINEAL' },
        { code: 'CEN', name: 'CIENTO DE UNIDADES' },
        { code: 'CY', name: 'CILINDRO' },
        { code: 'CJ', name: 'CONOS' },
        { code: 'DZN', name: 'DOCENA' },
        { code: 'DZP', name: 'DOCENA POR 10**6' },
        { code: 'BE', name: 'FARDO' },
        { code: 'GLI', name: 'GALON INGLES (4,545956L)' },
        { code: 'GRM', name: 'GRAMO' },
        { code: 'GRO', name: 'GRUESA' },
        { code: 'HLT', name: 'HECTOLITRO' },
        { code: 'LEF', name: 'HOJA' },
        { code: 'SET', name: 'JUEGO' },
        { code: 'KGM', name: 'KILOGRAMO' },
        { code: 'KTM', name: 'KILOMETRO' },
        { code: 'KWH', name: 'KILOVATIO HORA' },
        { code: 'KT', name: 'KIT' },
        { code: 'CA', name: 'LATAS' },
        { code: 'LBR', name: 'LIBRAS' },
        { code: 'LTR', name: 'LITRO' },
        { code: 'MWH', name: 'MEGAWATT HORA' },
        { code: 'MTR', name: 'METRO' },
        { code: 'MTK', name: 'METRO CUADRADO' },
        { code: 'MTQ', name: 'METRO CUBICO' },
        { code: 'MGM', name: 'MILIGRAMOS' },
        { code: 'MLT', name: 'MILILITRO' },
        { code: 'MMT', name: 'MILIMETRO' },
        { code: 'MMK', name: 'MILIMETRO CUADRADO' },
        { code: 'MMQ', name: 'MILIMETRO CUBICO' },
        { code: 'MIL', name: 'MILLARES' },
        { code: 'UM', name: 'MILLON DE UNIDADES' },
        { code: 'ONZ', name: 'ONZAS' },
        { code: 'PF', name: 'PALETAS' },
        { code: 'PK', name: 'PAQUETE' },
        { code: 'PR', name: 'PAR' },
        { code: 'FOT', name: 'PIES' },
        { code: 'FTK', name: 'PIES CUADRADOS' },
        { code: 'FTQ', name: 'PIES CUBICOS' },
        { code: 'C62', name: 'PIEZAS' },
        { code: 'PG', name: 'PLACAS' },
        { code: 'ST', name: 'PLIEGO' },
        { code: 'INH', name: 'PULGADAS' },
        { code: 'RM', name: 'RESMA' },
        { code: 'DR', name: 'TAMBOR' },
        { code: 'STN', name: 'TONELADA CORTA' },
        { code: 'LTN', name: 'TONELADA LARGA' },
        { code: 'TNE', name: 'TONELADAS' },
        { code: 'TU', name: 'TUBOS' },
        { code: 'GLL', name: 'US GALON (3,7843 L)' },
        { code: 'YRD', name: 'YARDA' },
        { code: 'YDK', name: 'YARDA CUADRADA' },
    ];

    const tipoTributooption = [
        { code: 'IGV', name: 'GRAVADO' },
        { code: 'INA', name: 'INAFECTO' },
        { code: 'EXO', name: 'EXONERADO' },
    ];

    useEffect(() => {
        ObtenerEmpresaAll().then((result_1: any) => {
            if (result_1.indicator == 1) {
                const Igv = result_1.data[0].Igv;
                setigvPercent(Igv);
            }
        })
    }, [])

    function functionCancelar() {
        setOpen(false)
        functionLimpiarCampos();
    }

    const functionLimpiarCampos = () => {
        setProducto({
            Tipo_Tributo: "IGV",
            Codigo_Producto: "",
            Descripcion: "",
            Cantidad: "", // Number
            Unidad_Medida: "NIU",
            Bien_Servicio: "B",
            Valor_Unitario: "",
            Importe: 0,
        });
        setShowErrors({});
    };

    function functionValidarCliente() {
        const validations = {
            Bien_Servicio: 'Bien / Servicio',
            Cantidad: 'Cantidad',
            Unidad_Medida: 'Unidad de Medida',
            Codigo_Producto: 'Código',
            Descripcion: 'Descripción',
            Valor_Unitario: 'Valor Unitario',
            Tipo_Tributo: 'Tipo de Tributo',
            Importe: 'Importe',
        };

        let errorField = '';

        for (const field in validations) {
            if (producto[field as keyof Producto] == 0 || producto[field as keyof Producto] == '') {
                toast.error(
                    `"${validations[field as keyof Producto]}" está vacío.`, {
                    duration: 2000,
                    position: 'top-center',
                    id: `"${validations[field as keyof Producto]}" está vacío.`
                });
                errorField = field;
                break;
            }
        }

        const errors = {
            Bien_Servicio: errorField === 'Bien_Servicio',
            Cantidad: errorField === 'Cantidad',
            Unidad_Medida: errorField === 'Unidad_Medida',
            Codigo_Producto: errorField === 'Codigo_Producto',
            Descripcion: errorField === 'Descripcion',
            Valor_Unitario: errorField === 'Valor_Unitario',
            Tipo_Tributo: errorField === 'Tipo_Tributo',
            Importe: errorField === 'Importe',
        };

        setShowErrors(errors);
        if (!errorField) {
            guardar();
        }
    }

    function guardar() {
        const existe = dataProducto.some(p => p.Codigo_Producto == producto.Codigo_Producto);
        if (existe) {
            toast.error("El Código de Producto ya existe.", {
                duration: 2000,
                position: 'top-center',
            });
        } else {
            onAgregarProducto(producto);
            functionCancelar();
        }
    }

    const handleChange = (name: string, value: any) => {
        if (name == 'Cantidad' || name == 'Valor_Unitario') {
            const cantidad = parseFloat(name == 'Cantidad' ? value : producto.Cantidad);
            const valorUnitario = parseFloat(name == 'Valor_Unitario' ? value : producto.Valor_Unitario);
            let importe = isNaN(cantidad) || isNaN(valorUnitario) ? 0 : cantidad * valorUnitario;
            if (producto.Tipo_Tributo === 'IGV') {
                importe += importe * (igvPercent / 100);
            }
            else {
                importe = importe;
            }
            setProducto(prevState => ({
                ...prevState,
                [name]: value,
                Importe: Number(importe.toFixed(2)),
            }));
        }
        if (name == 'Tipo_Tributo') {
            const cantidad = parseFloat(producto.Cantidad);
            const valorUnitario = parseFloat(producto.Valor_Unitario);
            let importe = isNaN(cantidad) || isNaN(valorUnitario) ? 0 : cantidad * valorUnitario;

            if (value == 'IGV') {
                importe += importe * (igvPercent / 100);
            }
            else {
                importe = importe;
            }

            setProducto(prevState => ({
                ...prevState,
                [name]: value,
                Importe: Number(importe.toFixed(2)),
            }));

        } else {
            setProducto(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    }

    return (
        <>
            <Dialog open={open} handler={() => setOpen(!open)} size='md'
                animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                }}
            >
                <Toaster />
                <DialogHeader>Agregar Producto</DialogHeader>
                <DialogBody divider>
                    <Card color="transparent" shadow={false}>
                        <form>
                            <div className="mb-4 flex flex-col gap-6">
                                <div className="grid grid-cols-2 gap-2">
                                    <Select
                                        color='teal'
                                        error={showErrors.Bien_Servicio && (producto.Bien_Servicio == "")}
                                        label="Bien / Servicio"
                                        name="Bien_Servicio"
                                        size="md"
                                        value={producto.Bien_Servicio.toString()}
                                        key={producto.Bien_Servicio}
                                        onChange={(e) => {
                                            handleChange('Bien_Servicio', e)
                                        }}
                                    >
                                        {tipoProductooption.map((tipo) => (
                                            <Option key={tipo.code} value={tipo.code.toString()}>
                                                {tipo.name}
                                            </Option>
                                        ))}
                                    </Select>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Cantidad && (producto.Cantidad == '')}
                                            crossOrigin={undefined}
                                            name="Cantidad"
                                            value={producto.Cantidad}
                                            size="md"
                                            label="Cantidad"
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                if (/^\d+(\.\d{0,2})?$/.test(inputValue)) {
                                                    handleChange(e.target.name, inputValue)
                                                }
                                            }}
                                            maxLength={10}
                                        />
                                    </div>
                                    <Select
                                        color='teal'
                                        error={showErrors.Unidad_Medida && (producto.Unidad_Medida == '')}
                                        label="Unidad de Medida"
                                        name="Unidad_Medida"
                                        size="md"
                                        value={producto.Unidad_Medida}
                                        key={producto.Unidad_Medida}
                                        onChange={(e) => {
                                            handleChange('Unidad_Medida', e)
                                        }}
                                    >
                                        {unidadMedidaoption.map((tipo) => (
                                            <Option key={tipo.code} value={tipo.code}>
                                                {tipo.name}
                                            </Option>
                                        ))}
                                    </Select>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Codigo_Producto && (producto.Codigo_Producto == '')}
                                            crossOrigin={undefined}
                                            name="Codigo_Producto"
                                            value={producto.Codigo_Producto}
                                            size="md"
                                            label="Código"
                                            onChange={(e) => {
                                                const inputValue = e.target.value.toUpperCase();
                                                handleChange(e.target.name, inputValue);
                                            }}
                                            maxLength={10}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Descripcion && (producto.Descripcion == '')}
                                            crossOrigin={undefined}
                                            name="Descripcion"
                                            value={producto.Descripcion}
                                            size="md"
                                            label="Descripción"
                                            onChange={(e) => {
                                                const inputValue = e.target.value.toUpperCase();
                                                handleChange(e.target.name, inputValue);
                                            }}
                                            maxLength={200}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            color='teal'
                                            error={showErrors.Valor_Unitario && (producto.Valor_Unitario == '')}
                                            crossOrigin={undefined}
                                            name="Valor_Unitario"
                                            value={producto.Valor_Unitario}
                                            size="md"
                                            label="Valor Unitario"
                                            onChange={(e) => {
                                                const inputValue = e.target.value;
                                                if (/^\d+(\.\d{0,2})?$/.test(inputValue)) {
                                                    handleChange(e.target.name, inputValue)
                                                }
                                            }}
                                            maxLength={10}
                                        />
                                    </div>
                                    <Select
                                        color='teal'
                                        error={showErrors.Tipo_Tributo && (producto.Tipo_Tributo == '')}
                                        label="Tipo de Tributo"
                                        name="Tipo_Tributo"
                                        size="md"
                                        value={producto.Tipo_Tributo}
                                        key={producto.Tipo_Tributo}
                                        onChange={(e) => {
                                            handleChange('Tipo_Tributo', e)
                                        }}
                                    >
                                        {tipoTributooption.map((tipo) => (
                                            <Option key={tipo.code} value={tipo.code}>
                                                {tipo.name}
                                            </Option>
                                        ))}
                                    </Select>
                                    <div>
                                        <Input
                                            className='cursor-not-allowed'
                                            color='teal'
                                            error={showErrors.Importe && (producto.Importe == 0)}
                                            crossOrigin={undefined}
                                            name="Importe"
                                            value={(producto.Importe).toFixed(2)}
                                            size="md"
                                            label="Importe"
                                            maxLength={10}
                                            readOnly
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

export default AddProducto