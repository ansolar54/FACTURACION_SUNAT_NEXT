"use client"
import React, { useEffect, useState } from 'react'
import {
    Input,
    Select,
    Option,
    Button,
} from "@/shared/material-tailwind-component"

interface BoletaProps {
    onSendDataBoleta: (dataBoleta: DatosBoleta) => void;
}

interface DatosBoleta {
    fechaEmision: string;
    moneda: string;
}

export default function Boleta({ onSendDataBoleta: onSendDataBoleta }: BoletaProps) {

    const [fechaEmision_B, setfechaEmision_B] = useState("")
    const [moneda_B, setMoneda_B] = useState("USD")

    const ListadoMonedas = [
        { name: 'USD', code: 'USD' },
        { name: 'PEN', code: 'PEN' }
    ];

    useEffect(() => {
        const fechaActual = new Date().toISOString().split('T')[0];
        setfechaEmision_B(fechaActual);
        console.log(fechaActual)
    }, []);

    useEffect(() => {
        const datosBoleta: DatosBoleta = {
            fechaEmision: fechaEmision_B,
            moneda: moneda_B
        };
        onSendDataBoleta(datosBoleta);
    }, [fechaEmision_B, moneda_B]);

    return (
        <>
            <div className='my-4 flex flex-col gap-6'>
                <div className="grid grid-cols-5 gap-4">
                    <Select
                        color='teal'
                        label="Moneda"
                        name="moneda"
                        size="md"
                        value={moneda_B}
                        key={moneda_B}
                        onChange={(e) => {
                            setMoneda_B(e!)
                        }}
                    >
                        {ListadoMonedas.map((tipo) => (
                            <Option key={tipo.code} value={tipo.code}>
                                {tipo.name}
                            </Option>
                        ))}
                    </Select>
                    <div>
                        <Input
                            type='date'
                            color='teal'
                            crossOrigin={undefined}
                            name="fechaEmision"
                            value={fechaEmision_B}
                            size="md"
                            label="Fecha Emisión"
                            onChange={(e) => {
                                setfechaEmision_B(e.target.value)
                            }}
                            max='9999-12-31'
                        />
                    </div>
                </div>
            </div>

        </>
    )
}
