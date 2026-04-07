import { getIronSession } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { type SessionData, sessionOptions } from "@/lib/session";

const publicAssetExtension =
  /\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?|ttf|eot)$/i;

export async function proxy(request: NextRequest) {
  if (publicAssetExtension.test(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );

  if (!session.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!login|register|forgot-password|reset-password|_next/static|_next/image|favicon).*)",
  ],
};
