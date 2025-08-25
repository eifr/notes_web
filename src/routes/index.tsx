import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export const Route = createFileRoute("/")({
  component: Home,
});

export function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const createWorkspaceAndRedirect = async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .insert({ name: "New Workspace" })
        .select()
        .single();

      if (error) {
        console.error("Error creating workspace:", error);
      } else if (data) {
        navigate({ to: `/workspace/${data.id}` });
      }
    };

    createWorkspaceAndRedirect();
  }, [navigate]);

  return (
    <div>
      <p>Creating a new workspace...</p>
    </div>
  );
}
