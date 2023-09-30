import { useState } from "react";

export function useTryState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  return {
    loading,
    setLoading,
    error,
    setError,
  };
}
