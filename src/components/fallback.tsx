import { PropsWithChildren, ReactNode } from "react";

import { ErrorView } from "./error";

type FallbackProps = {
  loading: boolean;
  loadingFallback?: ReactNode;
  error: Error | undefined;
  errorFallback?: ReactNode;
};

export function Fallback(props: PropsWithChildren<FallbackProps>) {
  if (props.loading) {
    if (typeof props.loadingFallback != "undefined")
      return props.loadingFallback;

    return (
      <div className="flex justify-center items-center mx-2 my-8">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (props.error) {
    if (typeof props.errorFallback != "undefined") return props.errorFallback;

    return (
      <div className="m-2">
        <ErrorView>{`Error happened.\n${props.error.message}`}</ErrorView>
      </div>
    );
  }

  return props.children;
}
