import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const mimeToExtension: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

const publicImgsDir = path.join(process.cwd(), "public", "imgs");

const getFileExtension = (file: File) => {
  const originalExtension = path.extname(file.name).toLowerCase();
  if (originalExtension) return originalExtension;

  return mimeToExtension[file.type] ?? ".png";
};

const isSupportedImageFile = (file: File) => {
  if (file.type.startsWith("image/")) {
    return true;
  }

  const extension = path.extname(file.name).toLowerCase();
  return Object.values(mimeToExtension).includes(extension);
};

export async function saveUploadedPublicImage(file: File, fileNamePrefix: string) {
  if (!isSupportedImageFile(file)) {
    throw new Error("The selected file must be an image.");
  }

  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Falta configurar BLOB_READ_WRITE_TOKEN en Vercel.");
  }

  const extension = getFileExtension(file);
  const fileName = `${fileNamePrefix}-${randomUUID()}${extension}`;

  // In Vercel production, write uploads to Blob storage because the function
  // filesystem is ephemeral and should not be used for persistent user files.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`imgs/${fileName}`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return blob.url;
  }

  await mkdir(publicImgsDir, { recursive: true });

  const absolutePath = path.join(publicImgsDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(absolutePath, bytes);

  return `/imgs/${fileName}`;
}

export async function saveUploadedGameCover(file: File) {
  return saveUploadedPublicImage(file, "game-cover");
}

export async function saveUploadedConsoleImage(file: File) {
  return saveUploadedPublicImage(file, "console-image");
}
