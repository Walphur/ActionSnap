import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/admin-auth";

/** Returns 401 JSON if the caller is not an admin. */
export async function requireAdminApi() {
  try {
    const profile = await requireAdminProfile();
    return { ok: true as const, profile };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: message },
        { status: message === "No autorizado" ? 401 : 500 }
      ),
    };
  }
}
