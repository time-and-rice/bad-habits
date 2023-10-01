import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
import { Link, Outlet } from "react-router-dom";

import { BarMenu, MenuItem } from "~/components/app-menu";
import { auth } from "~/firebase/initialize";
import { Guard } from "~/hocs/guard";

const MeLayout = Guard("AfterAuth", () => {
  const client = useQueryClient();

  async function onLogOut() {
    client.clear();
    await signOut(auth);

    toast.success("Logged out.");
  }

  return (
    <div className="prose max-w-full">
      <div className="max-w-screen-sm mx-auto">
        <div className="px-4 py-2 flex justify-between items-center">
          <div className="space-x-2">
            <Link to="bad-habits" className="app-link">
              Bad habits
            </Link>
          </div>

          <div className="mr-[-14px]">
            <BarMenu>
              <MenuItem to="account">Account</MenuItem>
              <MenuItem onClick={onLogOut}>Log out</MenuItem>
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
