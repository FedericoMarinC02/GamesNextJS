'use client';

import { ReactNode } from "react";

interface SweetAlertModalProps {
  open: boolean;
  icon: ReactNode;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  confirmClassName?: string;
}

export default function SweetAlertModal({
  open,
  icon,
  title,
  message,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  confirmClassName = "btn btn-primary min-w-32 text-white",
}: SweetAlertModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-base-200 p-8 text-center shadow-2xl">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h2 className="text-3xl font-black tracking-tight text-white">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-white/65">{message}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onCancel ? (
            <button type="button" onClick={onCancel} className="btn btn-ghost min-w-32">
              {cancelLabel ?? "Cancel"}
            </button>
          ) : null}
          <button type="button" onClick={onConfirm} className={confirmClassName}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
