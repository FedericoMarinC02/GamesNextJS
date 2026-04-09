'use client';

import { ChangeEvent, useMemo, useState } from "react";

interface CoverUploadFieldProps {
  initialCover: string;
  title: string;
  /** Defaults to `coverFile` (games). Use e.g. `imageFile` if the server reads another name. */
  inputName?: string;
  required?: boolean;
  labels?: {
    section?: string;
    heading?: string;
    description?: string;
    noCustom?: string;
    current?: string;
    footer?: string;
  };
}

const fallbackCover = "/imgs/no-cover.png";

const resolveCover = (cover: string) => {
  if (!cover || cover.trim() === "" || cover.trim().toLowerCase() === "no-image.png") {
    return fallbackCover;
  }

  return cover;
};

const defaultLabels = {
  section: "Cover Image",
  heading: "Actualizar portada",
  description: "Sube una imagen nueva para reemplazar la portada actual del juego.",
  noCustom: "Sin portada personalizada",
  current: "Portada actual",
  footer: "Si no subes una imagen nueva, se conserva la portada actual.",
};

export default function CoverUploadField({
  initialCover,
  title,
  inputName = "coverFile",
  required = false,
  labels: labelsProp,
}: CoverUploadFieldProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const [preview, setPreview] = useState(resolveCover(initialCover));
  const [fileName, setFileName] = useState("");
  const noCustomLabel = labels.noCustom ?? defaultLabels.noCustom;
  const currentLabel = labels.current ?? defaultLabels.current;

  const helperText = useMemo(() => {
    if (fileName) return fileName;
    if (preview === fallbackCover) return noCustomLabel;
    return currentLabel;
  }, [fileName, preview, noCustomLabel, currentLabel]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName("");
      setPreview(resolveCover(initialCover));
      return;
    }

    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
      <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-base-100/60 shadow-2xl">
        <img
          src={preview}
          alt={`${title} cover preview`}
          className="h-[320px] w-full object-cover"
        />
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-base-100/45 p-5 shadow-xl">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">
            {labels.section}
          </p>
          <h3 className="mt-2 text-xl font-bold text-white">{labels.heading}</h3>
          <p className="mt-2 text-sm leading-6 text-white/60">{labels.description}</p>
        </div>

        <label className="form-control w-full">
          <input
            type="file"
            name={inputName}
            accept="image/*"
            required={required}
            onChange={handleChange}
            className="file-input file-input-bordered w-full bg-base-100/70"
          />

          <div className="mt-4 space-y-2">
            <p className="text-sm text-white/70">{helperText}</p>
            <p className="text-sm text-white/45">{labels.footer}</p>
          </div>
        </label>
      </div>
    </div>
  );
}
