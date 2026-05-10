"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  productName: string;
};

type FormState = {
  customerName: string;
  customerSurname: string;
  email: string;
  phone: string;
  message: string;
};

const INITIAL_FORM_STATE: FormState = {
  customerName: "",
  customerSurname: "",
  email: "",
  phone: "",
  message: "",
};

export default function ProductInquiryModal({ open, onClose, productName }: Props) {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setFormState(INITIAL_FORM_STATE);
    setStatusMessage(null);
    setStatusType(null);
  }, [open, productName]);

  if (!open) return null;

  const onFieldChange = (field: keyof FormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const response = await fetch("/api/contact-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          customerName: formState.customerName,
          customerSurname: formState.customerSurname,
          email: formState.email,
          phone: formState.phone,
          message: formState.message,
        }),
      });

      const data = (await response.json()) as {
        status?: string;
        message?: string;
      };

      if (!response.ok || data.status === "validation_failed" || data.status === "mail_failed") {
        setStatusType("error");
        setStatusMessage(data.message || "Η αποστολή απέτυχε. Δοκίμασε ξανά.");
        return;
      }

      setStatusType("success");
      setStatusMessage("Το αίτημά σου στάλθηκε με επιτυχία.");
      setFormState(INITIAL_FORM_STATE);
    } catch {
      setStatusType("error");
      setStatusMessage("Η αποστολή απέτυχε. Δοκίμασε ξανά.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/45 px-4 py-8">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Κλείσιμο φόρμας ενδιαφέροντος"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[760px] overflow-hidden rounded-[0.5rem] border border-black/10 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-black/8 px-6 py-5 sm:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
              Ρωτήστε για διαθεσιμότητα
            </p>
            <h3 className="mt-2 text-2xl font-bold text-black">{productName}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-black/10 text-xl text-black/55 transition hover:border-primary hover:text-primary"
            aria-label="Κλείσιμο φόρμας ενδιαφέροντος"
          >
            ×
          </button>
        </div>

        <form onSubmit={submitForm} className="space-y-5 px-6 py-6 sm:px-8">
          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Όνομα προϊόντος</label>
            <input
              type="text"
              value={productName}
              readOnly
              className="w-full rounded-[1.25rem] border border-black/10 bg-[#f7faf7] px-4 py-3 text-sm text-black/70 outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-black">Όνομα</label>
              <input
                type="text"
                value={formState.customerName}
                onChange={(event) => onFieldChange("customerName", event.target.value)}
                required
                className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-black">Επίθετο</label>
              <input
                type="text"
                value={formState.customerSurname}
                onChange={(event) => onFieldChange("customerSurname", event.target.value)}
                required
                className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-black">Email</label>
              <input
                type="email"
                value={formState.email}
                onChange={(event) => onFieldChange("email", event.target.value)}
                required
                className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-black">Τηλέφωνο</label>
              <input
                type="tel"
                value={formState.phone}
                onChange={(event) => onFieldChange("phone", event.target.value)}
                required
                className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Σχόλια</label>
            <textarea
              value={formState.message}
              onChange={(event) => onFieldChange("message", event.target.value)}
              rows={5}
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-primary"
            />
          </div>

          {statusMessage ? (
            <div
              className={[
                "rounded-[1.25rem] px-4 py-3 text-sm",
                statusType === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-800",
              ].join(" ")}
            >
              {statusMessage}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-[1rem] border border-primary/15 bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Αποστολή..." : "Αποστολή"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
