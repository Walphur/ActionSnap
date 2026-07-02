import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Legacy upload deshabilitado — usar /api/photographer/upload con sesión. */
export async function POST() {
  return NextResponse.json(
    {
      error: "Endpoint deshabilitado por seguridad",
      hint: "Subí fotos desde el panel del fotógrafo (/fotografos).",
    },
    { status: 410 }
  );
}
