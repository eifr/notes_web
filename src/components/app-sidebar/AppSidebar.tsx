import { supabase } from "@/lib/supabaseClient";
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
import { Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, Paperclip, SidebarIcon, StickyNote } from "lucide-react";

export function AppSidebar() {
  const { workspaceId } = useParams({ strict: false });

  const { data: notebooks } = useQuery({
    queryKey: ["notebooks", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return;
      const { data } = await supabase
        .from("notebooks")
        .select(
          `
          id,
          name,
          notes (
            id,
            title
          )
        `
        )
        .eq("workspace_id", workspaceId);
      return data;
    },
    enabled: !!workspaceId,
  });

  if (!workspaceId) return null;
  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                to="/$workspaceId"
                params={{ workspaceId }}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {notebooks?.map((notebook) => (
          <SidebarGroup key={notebook.id}>
            <SidebarGroupLabel asChild>
              <Link
                to="/$workspaceId/notebook/$notebookId"
                params={{ notebookId: notebook.id, workspaceId }}
                className="w-full block"
              >
                {notebook.name}
              </Link>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {notebook.notes.map((note: any) => (
                  <SidebarMenuItem key={note.id}>
                    <SidebarMenuButton asChild>
                      <Link
                        to="/$workspaceId/notes/$noteId"
                        params={{ noteId: note.id, workspaceId }}
                      >
                        <StickyNote className="w-3 h-3" />
                        <span>{note.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
