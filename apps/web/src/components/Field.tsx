import type { ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  error: string;
  children: ReactNode;
};

export default function Field({ label, hint, error, children }: Props) {
  return (
    <div className="field">
      <label className="block">
        <span className="label">{label}</span>
        {children}
      </label>
      {hint && <p className="muted mt-1">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
