import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";

export default async function RootPage() {
  const auth = await getAuthUser();
  if (auth) {
    redirect(isAdminRole(auth.role) ? "/admin/dashboard" : "/dashboard");
  }
  redirect("/login");
}
