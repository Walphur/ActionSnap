import { NextResponse } from "next/server";
import {
  clearAdminSession,
  isAdminProtectionEnabled,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password, action } = await request.json();

  if (action === "logout") {
    await clearAdminSession();
    return NextResponse.json({ ok: true });
  }

  if (!isAdminProtectionEnabled()) {
    await setAdminSession("open");
    return NextResponse.json({ ok: true, open: true });
  }

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  await setAdminSession(password);
  return NextResponse.json({ ok: true });
}
