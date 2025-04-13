import React, { useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import Roles from "./roles/page";



export default function About() {
  const [selectedValue, setSelectedValue] = useState("");
  return (
    <div>
      <h1 className="text-6xl font-bold mt-12 mb-2">About me</h1>
      <span className="m-auto">I am a passionate 15-year-old</span>
      <Select onValueChange={(value) => setSelectedValue(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="uhhhh" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Roles</SelectLabel>
            <SelectItem value="web">Web Developer</SelectItem>
            <SelectItem value="roblox">Roblox Scripter</SelectItem>
            <SelectItem value="video">Video Editor</SelectItem>
            <SelectItem value="guitar">Guitarist</SelectItem>
            <SelectItem value="code">Programmer</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <span className="m-auto">https://github.com/RiceTheWhite</span>
      <span className="m-auto">discord: @antho1ogy</span>
      <span className="m-auto">roblox (i dont play very often): https://www.roblox.com/users/2573059566/profile</span>


      <div className="m-auto">
        <Roles role={selectedValue}></Roles>
      </div>
    </div>
  )
}
