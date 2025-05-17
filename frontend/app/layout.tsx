import React from 'react';
import type {Metadata} from 'next'
import './globals.css'
import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'

export const metadata: Metadata = {
    title: 'RedHawk',
    description: 'Stay vigilant with RedHawk',

}

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode }>) {
    return (
        <ClerkProvider>
        <html lang="en">
        <body suppressHydrationWarning>{children}</body>
        </html>
        </ClerkProvider>
    )
}
