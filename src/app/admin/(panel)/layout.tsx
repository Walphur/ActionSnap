import { redirect } from "next/navigation";
import { getAdminProfile } from "@/lib/admin-auth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getAdminProfile();

  if (!profile) {
    redirect("/admin/login");
  }

  return children;
}
