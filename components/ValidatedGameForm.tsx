'use client';

import { createContext, FormEvent, ReactNode, useContext, useMemo, useState } from "react";
import AlertWarningIcon from "@/components/icons/AlertWarningIcon";
import SweetAlertModal from "@/components/SweetAlertModal";
import { GameFormFieldName, gameFormSchema, getGameFormValues } from "@/src/lib/game-form-schema";

interface ValidatedGameFormProps {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}

const fieldLabels: Record<GameFormFieldName, string> = {
  title: "Title",
  developer: "Developer",
  genre: "Genre",
  price: "Price",
  releaseDate: "Release Date",
  console_id: "Console",
  description: "Description",
};

type FieldErrorsMap = Partial<Record<GameFormFieldName, string[]>>;

const ValidationErrorsContext = createContext<FieldErrorsMap>({});

export function GameFieldError({ name }: { name: GameFormFieldName }) {
  const errors = useContext(ValidationErrorsContext);
  const message = errors[name]?.[0];

  if (!message) return null;

  return <span className="mt-2 block text-xs font-medium text-rose-300">{message}</span>;
}

export default function ValidatedGameForm({
  action,
  children,
  className = "",
}: ValidatedGameFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrorsMap>({});
  const [showAlert, setShowAlert] = useState(false);

  const message = useMemo(() => {
    const labels = Object.entries(fieldErrors)
      .filter(([, messages]) => messages?.length)
      .map(([fieldName]) => fieldLabels[fieldName as GameFormFieldName]);

    if (!labels.length) return "";
    return `Completa los siguientes campos antes de continuar: ${labels.join(", ")}.`;
  }, [fieldErrors]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const parsed = gameFormSchema.safeParse(getGameFormValues(formData));

    if (!parsed.success) {
      event.preventDefault();
      setFieldErrors(parsed.error.flatten().fieldErrors as FieldErrorsMap);
      setShowAlert(true);
      return;
    }

    setFieldErrors({});
    setShowAlert(false);
  };

  return (
    <>
      <ValidationErrorsContext.Provider value={fieldErrors}>
        <form action={action} onSubmit={handleSubmit} className={className} noValidate>
          {children}
        </form>
      </ValidationErrorsContext.Provider>

      <SweetAlertModal
        open={showAlert}
        icon={<AlertWarningIcon />}
        title="Campos incompletos"
        message={message}
        confirmLabel="Entendido"
        onConfirm={() => setShowAlert(false)}
        confirmClassName="btn min-w-32 border border-amber-400/30 bg-amber-500 text-white hover:bg-amber-400"
      />
    </>
  );
}
