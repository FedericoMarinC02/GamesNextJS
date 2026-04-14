import { NextResponse } from "next/server";
import { saveUploadedPublicImage } from "@/src/lib/game-cover";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const prefix = formData.get("prefix")?.toString().trim() || "upload";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "No se recibio ninguna imagen valida." },
        { status: 400 },
      );
    }

    const safePrefix = prefix.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "upload";
    const url = await saveUploadedPublicImage(file, safePrefix);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Blob upload route error:", error);
    return NextResponse.json(
      { error: "No se pudo procesar la subida de la imagen." },
      { status: 500 },
    );
  }
}
