import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "../_components/admin-sidebar";
import { AdminNavbar } from "../_components/admin-navbar";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminDashboardLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const session = await getAdminSession();

   return (
      <SidebarProvider>
         <AdminSidebar adminRole={session?.role} />
         <SidebarInset>
            <AdminNavbar />
            <main className="flex-1 p-6">
               {children}
            </main>
         </SidebarInset>
      </SidebarProvider>
   );
}
