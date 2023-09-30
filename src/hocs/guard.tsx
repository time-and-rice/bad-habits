import { FC } from "react";
import { Navigate } from "react-router-dom";

import { useAuthSafely } from "~/providers/auth";

export function Guard<P extends object>(
  pattern: "BeforeAuth" | "AfterAuth",
  Comp: FC<P>,
): FC<P> {
  return function WrappedWithGuard(props: P) {
    const comp = <Comp {...props} />;

    const { authUser } = useAuthSafely();

    switch (pattern) {
      case "BeforeAuth":
        if (!authUser) return comp;
        break;

      case "AfterAuth":
        if (authUser) return comp;
        break;
    }

    return <Navigate to="/" />;
  };
}
