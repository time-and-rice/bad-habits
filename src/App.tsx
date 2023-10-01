import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Fragment } from "react";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./providers/auth";
import { router } from "./router";

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <Fragment>
      <AuthProvider>
        <QueryClientProvider client={client}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AuthProvider>
      <Toaster position="top-right" />
    </Fragment>
  );
}
