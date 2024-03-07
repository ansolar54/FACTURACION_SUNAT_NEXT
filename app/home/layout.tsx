import Navegador from '@/shared/navbar/navegador';
import React from 'react'
import "@/app/globals.css";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div><Navegador />{children}</div>
        </>
    )
}
