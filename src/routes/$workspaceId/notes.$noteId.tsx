import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Editor } from "@/components/ui/editor";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useDebounce } from "@/hooks/useDebounce";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/$workspaceId/notes/$noteId")({
  component: Note,
});

export function Note() {
  const { noteId, workspaceId } = Route.useParams();
  const [markdown, setMarkdown] = useState<string>("");
  const mdxEditorRef = useRef<MDXEditorMethods>(null);
  const queryClient = useQueryClient();

  const { data: note } = useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      const { data } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();
      return data;
    },
    enabled: !!noteId,
  });

  useEffect(() => {
    if (note) {
      setMarkdown(note.content || "");
    }
  }, [note]);

  useEffect(() => {
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
  }, [noteId, markdown]);

  const debouncedMarkdown = useDebounce(markdown, 500);

  const { mutate: saveNote } = useMutation({
    mutationFn: async (content: string) => {
      return supabase.from("notes").update({ content }).eq("id", noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks", workspaceId] });
    },
  });

  useEffect(() => {
    if (note && debouncedMarkdown !== note.content) {
      saveNote(debouncedMarkdown);
    }
  }, [debouncedMarkdown, note, saveNote]);

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
