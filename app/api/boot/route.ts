import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET() {
  const uuid = randomUUID();
  const memoryKB = 64 * 1024 + Math.floor(Math.random() * 4096);
  const cpuMhz = [100, 120, 133, 166, 200][Math.floor(Math.random() * 5)];
  const banner = [
    "Adam Esch Personal Computer Version 1.0",
    "(C) Copyright Esch Systems LLC 1995",
    "",
    `UUID: ${uuid}`,
    "",
    `Main Processor : Pentium-class @ ${cpuMhz}MHz`,
    `Memory Test    : ${memoryKB} KB OK`,
    "",
    "Detecting IDE Primary Master   ... OK",
    "Detecting IDE Primary Slave    ... None",
    "Detecting IDE Secondary Master ... CD-ROM",
    "Detecting IDE Secondary Slave  ... None",
    "",
    "Initializing USB Controllers ..... Done",
    "Verifying DMI Pool Data .......... OK",
    "Mounting LAYER-000 ............... OK",
    "",
    "Booting from C:\\...",
  ];
  return NextResponse.json({ uuid, banner });
}
