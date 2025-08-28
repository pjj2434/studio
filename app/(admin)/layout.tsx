// app/dashboard/layout.tsx



import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { AppSidebar } from "./__components/app-sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = await auth.api.getSession({
    headers: await headers()
  });
    
  // Redirect to login if not authenticated
  if (!data || !data.session) {
    // Redirect to the login page
    redirect("/login");
  }

  

   return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
           
            {/* You can make breadcrumbs dynamic based on the route if needed */}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 px-8 py-6 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}