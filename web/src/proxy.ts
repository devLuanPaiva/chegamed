import { NextRequest, NextResponse } from "next/server";

import { PLAY_STORE_URL } from "@/lib/site-config";

type Platform = "android" | "ios" | "windows" | "other";

function detectPlatform(userAgent: string): Platform {
  if (/android/i.test(userAgent)) {
    return "android";
  }

  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "ios";
  }

  if (/windows/i.test(userAgent)) {
    return "windows";
  }

  return "other";
}

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const platform = detectPlatform(userAgent);

  if (platform === "windows" || platform === "other") {
    return NextResponse.redirect(PLAY_STORE_URL, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/link"],
};
