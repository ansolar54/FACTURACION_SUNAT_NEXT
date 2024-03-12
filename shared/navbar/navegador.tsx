"use client";
import React, { useState, useEffect } from "react";

import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Button,
  Card,
  Chip,
  Drawer,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  Navbar,
  Typography,
} from "../material-tailwind-component";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  DocumentIcon,
  DocumentArrowDownIcon,
  ArrowDownCircleIcon,
  AdjustmentsHorizontalIcon,
  ChevronRightIcon, ChevronDownIcon,
  DocumentMagnifyingGlassIcon 
} from '@/shared/heroicons'

import { PresentationChartBarIcon, ShoppingBagIcon, InboxIcon, UserCircleIcon, Cog6ToothIcon, PowerIcon  } from "@heroicons/react/24/outline";
import Link from "next/link";



export default function Navegador() {
  const [openMenu, setOpenMenu] = useState(false);
  const [open1, setOpen1] = React.useState(false);

  const [open, setOpen] = React.useState(0);

  const handleOpen = (value: any) => {
    setOpen(open === value ? 0 : value);
  };

  const openDrawer = () => setOpen1(true);
  const closeDrawer = () => setOpen1(false);
  return (
    <>
      <div className="-m-6 max-h-[768px] w-[calc(100%+48px)] overflow-scroll">
        <Navbar className="sticky top-0 z-10 h-max max-w-full rounded-none py-2 px-3 lg:px-8 lg:py-2">
          <div className="flex items-center justify-between text-blue-gray-900">
            <div className="flex items-center gap-4">
              <IconButton
                variant="text"
                className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
                ripple={false}
                onClick={openDrawer}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </IconButton>
            </div>
            <div>
            </div>
            <div className="flex gap-1">
              <div className="flex items-center gap-4">
                <Menu placement="bottom-end" open={openMenu} handler={setOpenMenu} allowHover>
                  <MenuHandler>
                    <Button variant="text"
                      ripple={false}
                      // className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
                      className="flex items-center text-start gap-2 p-0 h-11 hover:bg-transparent active:bg-transparent"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-11 h-11"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <div>
                        <Typography variant="h6" color="blue-gray">
                          BIENVENIDO
                        </Typography>
                      </div>
                      {" "}

                      <ChevronDownIcon
                        strokeWidth={2.5}
                        className={`mx-auto h-4 w-4 transition-transform ${openMenu ? "rotate-180" : ""
                          }`}
                      />
                    </Button>
                  </MenuHandler>
                  <MenuList>
                    <MenuItem className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <Typography variant="small" className="font-normal">
                        hola
                      </Typography>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </div>
            </div>

          </div>
        </Navbar>
        <Drawer open={open1} onClose={closeDrawer} className="p-2">
          <Card
            color="transparent"
            shadow={false}
            className="h-[calc(100vh-2rem)] w-full max-w-[20rem] shadow-xl shadow-blue-gray-900/5 flex-grow overflow-auto"
          >
            <List>
              <Accordion
                open={open === 1}
                icon={
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${open === 1 ? "rotate-180" : ""
                      }`}
                  />
                }
              >
                <ListItem className="p-0" selected={open === 1}>
                  <AccordionHeader
                    onClick={() => handleOpen(1)}
                    className="border-b-0 p-3"
                  >
                    <ListItemPrefix>
                      <AdjustmentsHorizontalIcon className="h-5 w-5" />
                    </ListItemPrefix>
                    <Typography color="blue-gray" className="mr-auto font-normal">
                      Administración
                    </Typography>
                  </AccordionHeader>
                </ListItem>
                <AccordionBody className="py-1">
                  <List className="p-0">
                    <Link href="/home/administracion/cliente">
                      <ListItem onClick={closeDrawer}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Cliente
                      </ListItem>
                    </Link>
                    <Link href="/home/administracion/empresa">
                      <ListItem onClick={closeDrawer}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Empresa
                      </ListItem>
                    </Link>
                  </List>
                </AccordionBody>
              </Accordion>
              <Accordion
                open={open === 2}
                icon={
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180" : ""
                      }`}
                  />
                }
              >
                <ListItem className="p-0" selected={open === 2}>
                  <AccordionHeader
                    onClick={() => handleOpen(2)}
                    className="border-b-0 p-3"
                  >
                    <ListItemPrefix>
                      <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                    </ListItemPrefix>
                    <Typography color="blue-gray" className="mr-auto font-normal">
                      Documentos
                    </Typography>
                  </AccordionHeader>
                </ListItem>
                <AccordionBody className="py-1">
                  <List className="p-0">
                    <Link href="/home/documentos/registro">
                      <ListItem onClick={closeDrawer}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Registro
                      </ListItem>
                    </Link>
                    <Link href="/home/documentos/listado">
                      <ListItem  onClick={closeDrawer}>
                        <ListItemPrefix>
                          <ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
                        </ListItemPrefix>
                        Listado
                      </ListItem>
                    </Link>
                  </List>
                </AccordionBody>
              </Accordion>
            </List>
          </Card>
        </Drawer>
      </div>
    </>
  )
}
