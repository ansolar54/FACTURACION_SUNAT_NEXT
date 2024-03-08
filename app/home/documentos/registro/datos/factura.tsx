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
export default function Factura() {

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

  return (
    <>
      <div className="grid grid-cols-5 gap-4">
        <Select
          color='teal'
          label="Condición de Pago"
          name="condicionPago"
          size="md"
          value={condicionPago}
          key={condicionPago}
          onChange={(e) => {
            setCondicionPago(e!)
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
            setfechaEmision(e.target.value)
          }}
          maxLength={20}
        />
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
          maxLength={20}
        />
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
            maxLength={20}
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
          maxLength={20}
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
          maxLength={20}
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
          maxLength={20}
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
            maxLength={20}
          />
        </div>
      </div>
    </>
  )
}
