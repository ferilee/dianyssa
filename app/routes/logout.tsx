import { redirect } from "react-router";
import { clearSessionCookie, revokeWebSession } from "../../server/auth/web-session.js";

export async function loader({ request }: { request: Request }) {
  await revokeWebSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": clearSessionCookie(),
    },
  });
}
