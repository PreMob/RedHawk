import React from 'react';
import type {Metadata} from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'

export const metadata: Metadata = {
    title: 'RedHawk',
    description: 'Stay vigilant with RedHawk',
}

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
        <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        </body>
        </html>
    )
}
