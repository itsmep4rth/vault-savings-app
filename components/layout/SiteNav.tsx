import Link from "next/link";
import { auth } from "@/auth";
import SignOutButton from "./SignOutButton";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/log", label: "Log savings" },
  { href: "/dashboard/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default async function SiteNav() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="text-sm font-semibold tracking-wide">
          Vault
        </Link>

        <nav className="flex items-center gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}

          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}
