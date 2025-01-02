/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"


import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react"


import { cn } from "@/lib/utils"
import About from "@/components/sections/about/page";

export default function Home() {
  return (
    <div className="container mx-auto">
      <About></About>
    </div>
  );
}
