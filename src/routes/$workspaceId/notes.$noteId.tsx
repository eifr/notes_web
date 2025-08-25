import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Editor } from "@/components/ui/editor";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useDebounce } from "@/hooks/useDebounce";
import type { MDXEditorMethods } from "@mdxeditor/editor";

export const Route = createFileRoute("/$workspaceId/notes/$noteId")({
  component: Note,
});

export function Note() {
  const { noteId } = Route.useParams();
  const [note, setNote] = useState<any>(null);
  const [markdown, setMarkdown] = useState<string>("");
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  useEffect(() => {
    const fetchNote = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();

      if (error) {
        console.error("Error fetching note:", error);
      } else {
        setNote(data);
        setMarkdown(data.content || "");
      }
    };

    fetchNote();

    const channel = supabase
      .channel(`notes:${noteId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notes",
          filter: `id=eq.${noteId}`,
        },
        (payload) => {
          if (payload.new.content !== markdown) {
            mdxEditorRef.current?.setMarkdown(payload.new.content || "");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noteId]);

  const debouncedMarkdown = useDebounce(markdown, 500);

  useEffect(() => {
    const saveNote = async () => {
      if (note && debouncedMarkdown !== note.content) {
        const { error } = await supabase
          .from("notes")
          .update({ content: debouncedMarkdown })
          .eq("id", noteId);

        if (error) {
          console.error("Error saving note:", error);
        }
      }
    };

    saveNote();
  }, [debouncedMarkdown, noteId, note]);

  if (!note) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title={`Note: ${note.title}`} />
      <div className="flex-grow">
        <Editor
          editorRef={mdxEditorRef}
          value={markdown}
          fieldChange={setMarkdown}
        />
      </div>
    </div>
  );
}
