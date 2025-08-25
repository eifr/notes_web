import { Link } from "@tanstack/react-router";

export function Header({ title }: { title: string }) {
  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">{title}</Link>
        </div>
      </nav>
    </header>
  );
}
