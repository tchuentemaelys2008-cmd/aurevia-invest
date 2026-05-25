import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin";
import LandingClient from "@/components/LandingClient";

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const auth = await getAuthUser();
  if (auth) {
    redirect(isAdminRole(auth.role) ? "/admin/dashboard" : "/dashboard");
  }
  const params = await searchParams;
  if (params.ref) {
    redirect(`/register?ref=${params.ref}`);
  }
  return <LandingClient />;
}
