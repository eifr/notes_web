import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/Header";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Divide } from "lucide-react";

export const Route = createFileRoute("/$workspaceId/notebook/$notebookId")({
  component: Notebook,
});

function Notebook() {
  const { notebookId, workspaceId } = Route.useParams();
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const queryClient = useQueryClient();

  const { data: notebook } = useQuery({
    queryKey: ["notebook", notebookId],
    queryFn: async () => {
      const { data } = await supabase
        .from("notebooks")
        .select("name, notes (id, title)")
        .eq("id", notebookId)
        .single();
      return data;
    },
  });

  const { mutate: createNote } = useMutation({
    mutationFn: async (title: string) => {
      return supabase.from("notes").insert({ title, notebook_id: notebookId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notebook", notebookId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notebooks", workspaceId],
      });
      setNewNoteTitle("");
    },
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    let noteTitle = newNoteTitle.trim();
    if (!noteTitle) {
      noteTitle = new Date().toLocaleString();
    }
    createNote(noteTitle);
  };

  const { mutate: deleteNote } = useMutation({
    mutationFn: async (noteId: string) => {
      return supabase.from("notes").delete().eq("id", noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notebook", notebookId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notebooks", workspaceId],
      });
    },
  });

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState("");

  const { mutate: updateNote } = useMutation({
    mutationFn: async (noteId: string) => {
      return supabase
        .from("notes")
        .update({ title: editingNoteTitle })
        .eq("id", noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notebook", notebookId],
      });
      queryClient.invalidateQueries({
        queryKey: ["notebooks", workspaceId],
      });
      setEditingNoteId(null);
      setEditingNoteTitle("");
    },
  });

  return (
    <>
      <Header title={`Notebook: ${notebook?.name}`} />
      <div className="p-2">
        <form onSubmit={handleCreateNote}>
          <Input
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="New note title"
          />
          <Button type="submit">Create Note</Button>
        </form>
        <h2>Notes</h2>
        <ul>
          {notebook?.notes.map((note: any) => (
            <li key={note.id}>
              {editingNoteId === note.id ? (
                <>
                  <Input
                    type="text"
                    value={editingNoteTitle}
                    onChange={(e) => setEditingNoteTitle(e.target.value)}
                  />
                  <Button onClick={() => updateNote(note.id)}>Save</Button>
                  <Button
                    variant="destructive"
                    onClick={() => setEditingNoteId(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <div className="space-x-3">
                  <Link
                    to={`/$workspaceId/notes/$noteId`}
                    params={{ noteId: note.id, workspaceId }}
                  >
                    {note.title}
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingNoteId(note.id);
                      setEditingNoteTitle(note.title);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteNote(note.id)}
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
