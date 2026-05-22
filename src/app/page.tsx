import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";

export default async function RootPage() {
  const auth = await getAuthUser();
  if (auth) {
    redirect(auth.role === "ADMIN" ? "/admin/dashboard" : "/dashboard");
  }
  redirect("/login");
}
