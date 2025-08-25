import { NotebookIcon } from "lucide-react";
import { useEffect, useState } from "react";
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

export function AppSidebar() {
  const [notebooks, setNotebooks] = useState<any[] | null>(null);

  const { workspaceId } = useParams({ strict: false });

  useEffect(() => {
    if (!workspaceId) return;

    const fetchNotebooks = async () => {
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
      setNotebooks(data);
    };

    fetchNotebooks();
  }, [workspaceId]);
  if (!workspaceId) return null;
  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Notebooks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {notebooks?.map((notebook) => (
                <SidebarMenuItem key={notebook.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      to="/$workspaceId/notebook/$notebookId"
                      params={{ notebookId: notebook.id, workspaceId }}
                    >
                      <NotebookIcon />
                      <span>{notebook.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenu>
                    {notebook.notes.map((note: any) => (
                      <SidebarMenuItem key={note.id}>
                        <SidebarMenuButton asChild>
                          <Link
                            to="/$workspaceId/notes/$noteId"
                            params={{ noteId: note.id, workspaceId }}
                          >
                            <span>{note.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
