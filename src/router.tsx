import { createBrowserRouter } from "react-router-dom";

import Index from "./pages/_index";
import NotFound from "./pages/404";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
