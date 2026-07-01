import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminProfile } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  isActive: z.boolean(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminProfile();
    const { id } = await context.params;
    const body = bodySchema.parse(await request.json());

    const supabase = createServiceClient();
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!profile || profile.role !== "photographer") {
      return NextResponse.json({ error: "Fotógrafo no encontrado" }, { status: 404 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: body.isActive })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      id,
      isActive: body.isActive,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "No autorizado" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
