import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/profile")) {
    const address = request.nextUrl.pathname.split("/")[2];
    if (!address) {
      return NextResponse.rewrite(new URL("/explore", request.url));
    }
  }
}
