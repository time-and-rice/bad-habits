import { httpsCallable } from "firebase/functions";
import { useEffect } from "react";

import { functions } from "~/firebase/initialize";

export default function Index() {
  useEffect(() => {
    httpsCallable(functions, "home")().then(console.log).catch(console.error);
  }, []);
  return <div>Index</div>;
}
