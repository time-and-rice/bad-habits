import { createBrowserRouter } from "react-router-dom";

import Index from "./pages/_index";
import NotFound from "./pages/404";
import AuthLayout from "./pages/auth";
import LogIn from "./pages/auth.log-in";
import SignUp from "./pages/auth.sign-up";
import MeLayout from "./pages/me";
import Account from "./pages/me.account";
import BadHabits from "./pages/me.bad-habits";
import BadHabitsNew from "./pages/me.bad-habits.new";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "sign-up",
        element: <SignUp />,
      },
      {
        path: "log-in",
        element: <LogIn />,
      },
    ],
  },
  {
    path: "/me",
    element: <MeLayout />,
    children: [
      {
        path: "account",
        element: <Account />,
      },
      {
        path: "bad-habits",
        element: <BadHabits />,
      },
      {
        path: "bad-habits/new",
        element: <BadHabitsNew />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
