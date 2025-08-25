import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/notes/$noteId")({
  component: Note,
});

export function Note() {
  const { noteId } = Route.useParams();
  return <Header title={`Note ${noteId}`} />;
}
