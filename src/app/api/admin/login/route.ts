import { NextResponse } from "next/server";
import { z } from "zod";
import { adminPasswordMatches, isConfiguredAdminEmail } from "@/lib/admin-emails";
import { promoteUserToAdmin, resolveAdminAccess } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { email, password } = bodySchema.parse(await request.json());
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const user = data.user;
    if (!user) {
      return NextResponse.json({ error: "No se pudo validar la sesion." }, { status: 401 });
    }

    let adminProfile = await resolveAdminAccess(user);

    if (!adminProfile && adminPasswordMatches(password)) {
      adminProfile = await promoteUserToAdmin(user);
    }

    if (!adminProfile) {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          error: "Esta cuenta no tiene permisos de administrador.",
          hint: isConfiguredAdminEmail(user.email)
            ? "No pudimos activar el rol admin. Contacta soporte."
            : "Agrega tu email a ADMIN_EMAILS en Render o usa la contrasena ADMIN_PASSWORD.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      profile: { id: adminProfile.id, fullName: adminProfile.full_name },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Email o contrasena invalidos." }, { status: 400 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error en login admin" },
      { status: 500 }
    );
  }
}
