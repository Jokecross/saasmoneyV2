import type { Metadata } from "next";
import "./globals.css";
import { AuthWrapper } from "@/components/providers/auth-wrapper";

export const metadata: Metadata = {
  title: "SaaS Money - Accompagnement SaaS Premium",
  description: "Plateforme d'accompagnement SaaS avec IA, coaching et réservations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-white antialiased">
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}

