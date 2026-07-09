import { redirect } from "react-router";

export async function loader() {
  return redirect("/", {
    headers: {
      "Set-Cookie": "session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
}
