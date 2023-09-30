import { Outlet } from "react-router-dom";

import { Guard } from "~/hocs/guard";

const AuthLayout = Guard("BeforeAuth", () => {
  return (
    <div className="prose max-w-md mx-auto px-4 py-8">
      <Outlet />
    </div>
  );
});

export default AuthLayout;
