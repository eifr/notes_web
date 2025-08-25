import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { AppSidebar } from "@/components/app-sidebar/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createRootRoute({
  component: () => (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main>
          <SidebarTrigger />
          <Outlet />
          <TanStackDevtools
            config={{
              position: "bottom-left",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  ),
});
