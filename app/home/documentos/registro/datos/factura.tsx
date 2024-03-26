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
  Option,
  Tabs,
  TabsHeader,
  Tab,
  TabsBody,
  TabPanel
} from "@/shared/material-tailwind-component"

interface DatosFactura {
  condicionPago: string;
  moneda: string;
  fechaEmision: string;
  fechaVencimiento: string;
  vendedor: string;
  guiaRemision: string;
  nroPedido: string;
  ordenCompra: string;
  observacion: string;
}

interface FacturaProps {
  onSendDataFactura: (dataFactura: DatosFactura) => void;
}

export default function Factura({ onSendDataFactura: onSendDataFactura }: FacturaProps) {

  const [condicionPago, setCondicionPago] = useState("Contado")
  const [moneda, setMoneda] = useState("USD")
  const [fechaEmision, setfechaEmision] = useState("")
  const [fechaVencimiento, setfechaVencimiento] = useState("");
  const [vendedor, setvendedor] = useState("");
  const [guiaRemision, setguiaRemision] = useState("");
  const [nroPedido, setnroPedido] = useState("");
  const [ordenCompra, setordenCompra] = useState("");
  const [observacion, setobservacion] = useState("");

  const ListadoCondicionPago = [
    { name: 'CONTADO', code: 'Contado' },
    { name: 'CREDITO', code: 'Credito' },
  ];

  const ListadoMonedas = [
    { name: 'USD', code: 'USD' },
    { name: 'PEN', code: 'PEN' }
  ];

  useEffect(() => {
    const fechaActual = new Date().toISOString().split('T')[0];
    setfechaEmision(fechaActual);
    setfechaVencimiento(fechaActual)
  }, []);

  useEffect(() => {
    const datosFactura: DatosFactura = {
      condicionPago: condicionPago,
      moneda: moneda,
      fechaEmision: fechaEmision,
      fechaVencimiento: fechaVencimiento,
      vendedor: vendedor,
      guiaRemision: guiaRemision,
      nroPedido: nroPedido,
      ordenCompra: ordenCompra,
      observacion: observacion,
    };
    onSendDataFactura(datosFactura);
  }, [condicionPago, moneda, fechaEmision, fechaVencimiento, vendedor, guiaRemision, nroPedido, ordenCompra, observacion]);

  const handleChange = (name: string, value: any) => {
    switch (name) {
      case 'condicionPago':
        setCondicionPago(value)
        if (value === 'Contado') {
          setfechaVencimiento(fechaEmision)
        }
        else {
          setfechaVencimiento(fechaEmision)
        }
        break;
      case "fechaEmision":
        setfechaEmision(value);
        if (value.length == 0) {
          setfechaVencimiento("")
        }
        else if (value > fechaVencimiento) {
          setfechaVencimiento("")
        }
        if (condicionPago == 'Contado') {
          setfechaVencimiento(value)
        }
        break;
      default:
        break;
    }
  }

  return (
    <>
      <div className='my-3 flex flex-col'>
        <div className="grid grid-cols-6 gap-2">
          <Select
            color='teal'
            label="Condición de Pago"
            name="condicionPago"
            size="md"
            value={condicionPago}
            key={condicionPago}
            onChange={(e) => {
              handleChange('condicionPago', e)
            }}
          >
            {ListadoCondicionPago.map((tipo) => (
              <Option key={tipo.code} value={tipo.code}>
                {tipo.name}
              </Option>
            ))}
          </Select>
          <Select
            color='teal'
            label="Moneda"
            name="moneda"
            size="md"
            value={moneda}
            key={moneda}
            onChange={(e) => {
              setMoneda(e!)
            }}
          >
            {ListadoMonedas.map((tipo) => (
              <Option key={tipo.code} value={tipo.code}>
                {tipo.name}
              </Option>
            ))}
          </Select>
          <Input
            type='date'
            color='teal'
            crossOrigin={undefined}
            name="fechaEmision"
            value={fechaEmision}
            size="md"
            label="Fecha Emisión"
            onChange={(e) => {
              handleChange('fechaEmision', e.target.value)
            }}
          />
          {condicionPago == 'Contado' && (
            <div>
              <Input
                type='date'
                color='teal'
                crossOrigin={undefined}
                name="fechaVencimiento"
                value={fechaVencimiento}
                size="md"
                label="Fecha Vencimiento"
                onChange={(e) => {
                  setfechaVencimiento(e.target.value)
                }}
                disabled={condicionPago == "Contado" ? true : false}
                min={fechaEmision}
              />
            </div>
          )}

          <div>
            <Input
              color='teal'
              crossOrigin={undefined}
              name="vendedor"
              value={vendedor}
              size="md"
              label="Vendedor"
              onChange={(e) => {
                setvendedor(e.target.value)
              }}
              maxLength={200}
            />
          </div>
          <Input
            color='teal'
            crossOrigin={undefined}
            name="guiaRemision"
            value={guiaRemision}
            size="md"
            label="Guía de Remisión"
            onChange={(e) => {
              setguiaRemision(e.target.value)
            }}
            maxLength={15}
          />
          <Input
            color='teal'
            crossOrigin={undefined}
            name="nroPedido"
            value={nroPedido}
            size="md"
            label="N° Pedido"
            onChange={(e) => {
              setnroPedido(e.target.value)
            }}
            maxLength={8}
          />
          <Input
            color='teal'
            crossOrigin={undefined}
            name="ordenCompra"
            value={ordenCompra}
            size="md"
            label="Orden de Compra"
            onChange={(e) => {
              setordenCompra(e.target.value)
            }}
            maxLength={10}
          />
          <div className='col-span-2'>
            <Input
              color='teal'
              crossOrigin={undefined}
              name="observacion"
              value={observacion}
              size="md"
              label="Observación"
              onChange={(e) => {
                setobservacion(e.target.value)
              }}
              maxLength={200}
            />
          </div>
        </div>
      </div>
    </>
  )
}
