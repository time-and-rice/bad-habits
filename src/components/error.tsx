import type { ReactNode } from "react";

export function ErrorView({ children }: { children: ReactNode }) {
  return (
    <div className="alert alert-error justify-start text-start whitespace-pre-wrap">
      {children}
    </div>
  );
}

export function ErrorOrNull(props: { errorMessage?: string }) {
  if (!props.errorMessage) return null;
  return <ErrorView>{props.errorMessage}</ErrorView>;
}
