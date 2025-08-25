import { Calendar, Home, Inbox, NotebookIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, linkOptions } from "@tanstack/react-router";

// Menu items.
const items = linkOptions([
  {
    title: "Home",
    to: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    to: "/inbox",
    icon: Inbox,
  },
  {
    title: "Calendar",
    to: "/calendar",
    icon: Calendar,
  },
  {
    title: "Note",
    to: "/notes/$noteId",
    params: { noteId: "1" },
    icon: NotebookIcon,
  },
]);

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Notebook</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link {...item}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
