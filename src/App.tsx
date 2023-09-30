import { Fragment } from "react";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./providers/auth";
import { router } from "./router";

export function App() {
  return (
    <Fragment>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster position="top-right" />
    </Fragment>
  );
}
