import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api-guard";
import { detectRacerNumbers, getDetectionProviders } from "@/lib/detect-numbers";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const { imageUrl } = (await request.json()) as { imageUrl?: string };
    if (!imageUrl?.trim()) {
      return NextResponse.json({ error: "Falta imageUrl" }, { status: 400 });
    }

    const providers = getDetectionProviders();
    if (providers.length === 0) {
      return NextResponse.json(
        {
          error: "Sin APIs configuradas",
          hint: "Agregá GOOGLE_GEMINI_API_KEY en .env.local (gratis en Google AI Studio)",
        },
        { status: 400 }
      );
    }

    const numbers = await detectRacerNumbers(imageUrl.trim());
    return NextResponse.json({ providers, numbers });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
