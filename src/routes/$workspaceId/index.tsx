import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/Header";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/$workspaceId/")({
  component: Workspace,
});

function Workspace() {
  const { workspaceId } = Route.useParams();
  const [newNotebookName, setNewNotebookName] = useState("");
  const queryClient = useQueryClient();

  const { data: workspace } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const { data } = await supabase
        .from("workspaces")
        .select("name, notebooks (id, name)")
        .eq("id", workspaceId)
        .single();
      return data;
    },
  });

  const { mutate: createNotebook } = useMutation({
    mutationFn: async (name: string) => {
      return supabase
        .from("notebooks")
        .insert({ name, workspace_id: workspaceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notebooks", workspaceId],
      });
      setNewNotebookName("");
    },
  });

  const handleCreateNotebook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;
    createNotebook(newNotebookName);
  };

  const { mutate: deleteNotebook } = useMutation({
    mutationFn: async (notebookId: string) => {
      return supabase.from("notebooks").delete().eq("id", notebookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notebooks", workspaceId],
      });
    },
  });

  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(
    null
  );
  const [editingNotebookName, setEditingNotebookName] = useState("");

  const { mutate: updateNotebook } = useMutation({
    mutationFn: async (notebookId: string) => {
      return supabase
        .from("notebooks")
        .update({ name: editingNotebookName })
        .eq("id", notebookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notebooks", workspaceId],
      });
      setEditingNotebookId(null);
      setEditingNotebookName("");
    },
  });

  return (
    <>
      <Header title={`Workspace: ${workspace?.name}`} />
      <div className="p-2">
        <form onSubmit={handleCreateNotebook}>
          <Input
            type="text"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            placeholder="New notebook name"
          />
          <Button type="submit">Create Notebook</Button>
        </form>
        <h2>Notebooks</h2>
        <ul>
          {workspace?.notebooks.map((notebook: any) => (
            <li key={notebook.id}>
              {editingNotebookId === notebook.id ? (
                <>
                  <Input
                    type="text"
                    value={editingNotebookName}
                    onChange={(e) => setEditingNotebookName(e.target.value)}
                  />
                  <Button onClick={() => updateNotebook(notebook.id)}>
                    Save
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setEditingNotebookId(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <div className="space-x-3">
                  <Link
                    to="/$workspaceId/notebook/$notebookId"
                    params={{ notebookId: notebook.id, workspaceId }}
                  >
                    {notebook.name}
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingNotebookId(notebook.id);
                      setEditingNotebookName(notebook.name);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteNotebook(notebook.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
