import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Missing BLOB_READ_WRITE_TOKEN." },
      { status: 500 },
    );
  }

  const body = await request.json();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*"],
        maximumSizeInBytes: 10 * 1024 * 1024,
        addRandomSuffix: true,
        allowOverwrite: false,
      }),
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Blob upload route error:", error);
    return NextResponse.json(
      { error: "Failed to handle upload." },
      { status: 500 },
    );
  }
}
