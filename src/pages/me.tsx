import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { Link, Outlet } from "react-router-dom";

import { BarMenu, MenuItem } from "~/components/app-menu";
import { auth } from "~/firebase/initialize";
import { Guard } from "~/hocs/guard";

const MeLayout = Guard("AfterAuth", () => {
  return (
    <div>
      <div className="max-w-screen-sm mx-auto">
        <div className="px-4 py-2 flex justify-between items-center">
          <div className="space-x-2">
            <Link to="/" className="app-link">
              Index
            </Link>

            <Link to="/" className="app-link">
              Index
            </Link>
          </div>

          <div className="mr-[-14px]">
            <BarMenu>
              <MenuItem to="account">Account</MenuItem>
              <MenuItem
                onClick={async () => {
                  await signOut(auth);
                  toast.success("Logged out.");
                }}
              >
                Log out
              </MenuItem>
            </BarMenu>
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 pb-8">
        <Outlet />
      </div>
    </div>
  );
});

export default MeLayout;
