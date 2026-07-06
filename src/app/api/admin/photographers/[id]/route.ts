import { NextResponse } from "next/server";
import { requireAdminProfile } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminProfile();
    const { id } = await context.params;
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

    const { error: eventsError } = await supabase
      .from("events")
      .delete()
      .eq("photographer_id", id);

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    await supabase.from("purchases").update({ photographer_id: null }).eq("photographer_id", id);

    const { error: profileError } = await supabase.from("profiles").delete().eq("id", id);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError && !authError.message.includes("User not found")) {
      return NextResponse.json(
        {
          ok: true,
          warning: "Perfil eliminado, pero no se pudo borrar la cuenta de acceso.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error";
    const status = message === "No autorizado" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
