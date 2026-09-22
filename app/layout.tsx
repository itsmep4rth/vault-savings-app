import "./globals.css";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import SiteNav from "@/components/layout/SiteNav";

export const metadata = {
  title: "Vault",
  description: "Save with a goal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <SiteNav />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
