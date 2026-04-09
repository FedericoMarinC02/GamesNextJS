"use client";

import { createContext, FormEvent, ReactNode, useContext, useMemo, useState } from "react";
import AlertWarningIcon from "@/components/icons/AlertWarningIcon";
import SweetAlertModal from "@/components/SweetAlertModal";
import {
  ConsoleFormFieldName,
  consoleFormSchema,
  getConsoleFormValues,
} from "@/src/lib/console-form-schema";

interface ValidatedConsoleFormProps {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}

const fieldLabels: Record<ConsoleFormFieldName, string> = {
  name: "Name",
  manufacturer: "Manufacturer",
  releaseDate: "Release Date",
  description: "Description",
};

type FieldErrorsMap = Partial<Record<ConsoleFormFieldName, string[]>>;

const ValidationErrorsContext = createContext<FieldErrorsMap>({});

export function ConsoleFieldError({ name }: { name: ConsoleFormFieldName }) {
  const errors = useContext(ValidationErrorsContext);
  const message = errors[name]?.[0];

  if (!message) return null;

  return <span className="mt-2 block text-xs font-medium text-rose-300">{message}</span>;
}

export default function ValidatedConsoleForm({
  action,
  children,
  className = "",
}: ValidatedConsoleFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrorsMap>({});
  const [showAlert, setShowAlert] = useState(false);

  const message = useMemo(() => {
    const labels = Object.entries(fieldErrors)
      .filter(([, messages]) => messages?.length)
      .map(([fieldName]) => fieldLabels[fieldName as ConsoleFormFieldName]);

    if (!labels.length) return "";
    return `Completa los siguientes campos antes de continuar: ${labels.join(", ")}.`;
  }, [fieldErrors]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const parsed = consoleFormSchema.safeParse(getConsoleFormValues(formData));

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
