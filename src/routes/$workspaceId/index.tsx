import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/$workspaceId/")({
  component: Workspace,
});

function Workspace() {
  const { workspaceId } = Route.useParams();
  const [notebooks, setNotebooks] = useState<any[]>([]);
  const [workspaceName, setWorkspaceName] = useState("");
  const [newNotebookName, setNewNotebookName] = useState("");

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspaces")
        .select("name, notebooks (id, name)")
        .eq("id", workspaceId)
        .single();

      if (workspaceError) {
        console.error("Error fetching workspace name:", workspaceError);
      } else {
        setWorkspaceName(workspaceData.name);
        setNotebooks(workspaceData.notebooks);
      }
    };

    fetchWorkspaceDetails();
  }, [workspaceId]);

  const fetchNotebooks = async () => {
    const { data: notebooksData, error: notebooksError } = await supabase
      .from("notebooks")
      .select("*")
      .eq("workspace_id", workspaceId);

    if (notebooksError) {
      console.error("Error fetching notebooks:", notebooksError);
    } else {
      setNotebooks(notebooksData);
    }
  };

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookName.trim()) return;

    const { error } = await supabase
      .from("notebooks")
      .insert({ name: newNotebookName, workspace_id: workspaceId });

    if (error) {
      console.error("Error creating notebook:", error);
    } else {
      setNewNotebookName("");
      fetchNotebooks();
    }
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    const { error } = await supabase
      .from("notebooks")
      .delete()
      .eq("id", notebookId);

    if (error) {
      console.error("Error deleting notebook:", error);
    } else {
      fetchNotebooks();
    }
  };

  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(
    null
  );
  const [editingNotebookName, setEditingNotebookName] = useState("");

  const handleUpdateNotebook = async (notebookId: string) => {
    if (!editingNotebookName.trim()) return;

    const { error } = await supabase
      .from("notebooks")
      .update({ name: editingNotebookName })
      .eq("id", notebookId);

    if (error) {
      console.error("Error updating notebook:", error);
    } else {
      setEditingNotebookId(null);
      setEditingNotebookName("");
      fetchNotebooks();
    }
  };

  return (
    <>
      <Header title={`Workspace: ${workspaceName}`} />
      <div className="p-2">
        <form onSubmit={handleCreateNotebook}>
          <input
            type="text"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            placeholder="New notebook name"
          />
          <button type="submit">Create Notebook</button>
        </form>
        <h2>Notebooks</h2>
        <ul>
          {notebooks.map((notebook) => (
            <li key={notebook.id}>
              {editingNotebookId === notebook.id ? (
                <>
                  <input
                    type="text"
                    value={editingNotebookName}
                    onChange={(e) => setEditingNotebookName(e.target.value)}
                  />
                  <button onClick={() => handleUpdateNotebook(notebook.id)}>
                    Save
                  </button>
                  <button onClick={() => setEditingNotebookId(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/$workspaceId/notebook/$notebookId"
                    params={{ notebookId: notebook.id, workspaceId }}
                  >
                    {notebook.name}
                  </Link>
                  <button
                    onClick={() => {
                      setEditingNotebookId(notebook.id);
                      setEditingNotebookName(notebook.name);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteNotebook(notebook.id)}>
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
