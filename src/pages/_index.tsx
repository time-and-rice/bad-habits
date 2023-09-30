import { useEffect } from "react";

import { getHttpsFunctionUrl } from "~/firebase/initialize";

async function healthCheck() {
  return fetch(getHttpsFunctionUrl("healthCheck"));
}

export default function Index() {
  useEffect(() => {
    healthCheck()
      .then((res) => res.json())
      .then(console.log)
      .catch(console.error);
  }, []);

  return <div>Index</div>;
}
