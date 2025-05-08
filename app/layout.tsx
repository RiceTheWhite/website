"use client"

import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider"
import * as React from "react"
import { useState } from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";

import Cursor from "@/components/cursor/cursor";

import { Slider } from "@/components/ui/slider";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cursorScale, setCursorScale] = useState(1)
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="header">
            <div className="container sticky mx-auto py-4 flex text-2xl border-b-2">
              <div className="flex-auto w-12">
                <a className="px-8" href="./about">About</a>
                <a className="px-8" href="./about">My works</a>
                <a className="px-8" href="./about">Contact</a>
              </div>
              <div className="px-8 flex flex-auto w-20 flex-row">
                <h1>silliness:</h1>
                <Slider onValueChange={(value: number[]) => setCursorScale(value[0])} className="mx-4 cursor-grab active:cursor-grabbing" defaultValue={[1]} min={0.1} max={5} step={0.1} />
                <ModeToggle />
              </div>
                
            </div>
          </div>

          <div className="container mx-auto">
            {children}
          </div>
          
          <div>footer</div>
          <Cursor cursorScale={cursorScale}></Cursor>
        </ThemeProvider>
      </body>
    </html>
  );
}
