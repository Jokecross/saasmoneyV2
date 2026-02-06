import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Mode développement sans Supabase - on laisse passer toutes les requêtes
  // L'authentification est gérée côté client avec les données mockées
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
