import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/$workspaceId/notebook/$notebookId")({
  component: Notebook,
});

function Notebook() {
  const { notebookId, workspaceId } = Route.useParams();
  const [notes, setNotes] = useState<any[]>([]);
  const [notebookName, setNotebookName] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");

  const fetchNotes = async () => {
    const { data: notesData, error: notesError } = await supabase
      .from("notes")
      .select("*")
      .eq("notebook_id", notebookId);

    if (notesError) {
      console.error("Error fetching notes:", notesError);
    } else {
      setNotes(notesData);
    }
  };

  useEffect(() => {
    const fetchNotebookDetails = async () => {
      const { data: notebookData, error: notebookError } = await supabase
        .from("notebooks")
        .select("name, notes (id, title)")
        .eq("id", notebookId)
        .single();

      if (notebookError) {
        console.error("Error fetching notebook name:", notebookError);
      } else {
        setNotebookName(notebookData.name);
        setNotes(notebookData.notes);
      }
    };

    fetchNotebookDetails();
  }, [notebookId]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const { error } = await supabase
      .from("notes")
      .insert({ title: newNoteTitle, notebook_id: notebookId });

    if (error) {
      console.error("Error creating note:", error);
    } else {
      setNewNoteTitle("");
      fetchNotes();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      console.error("Error deleting note:", error);
    } else {
      fetchNotes();
    }
  };

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState("");

  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteTitle.trim()) return;

    const { error } = await supabase
      .from("notes")
      .update({ title: editingNoteTitle })
      .eq("id", noteId);

    if (error) {
      console.error("Error updating note:", error);
    } else {
      setEditingNoteId(null);
      setEditingNoteTitle("");
      fetchNotes();
    }
  };

  return (
    <>
      <Header title={`Notebook: ${notebookName}`} />
      <div className="p-2">
        <form onSubmit={handleCreateNote}>
          <input
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="New note title"
          />
          <button type="submit">Create Note</button>
        </form>
        <h2>Notes</h2>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              {editingNoteId === note.id ? (
                <>
                  <input
                    type="text"
                    value={editingNoteTitle}
                    onChange={(e) => setEditingNoteTitle(e.target.value)}
                  />
                  <button onClick={() => handleUpdateNote(note.id)}>
                    Save
                  </button>
                  <button onClick={() => setEditingNoteId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <Link
                    to={`/$workspaceId/notes/$noteId`}
                    params={{ noteId: note.id, workspaceId }}
                  >
                    {note.title}
                  </Link>
                  <button
                    onClick={() => {
                      setEditingNoteId(note.id);
                      setEditingNoteTitle(note.title);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteNote(note.id)}>
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
