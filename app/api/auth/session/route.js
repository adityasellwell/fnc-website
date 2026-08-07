import { NextResponse } from "next/server";
import { createSession, destroySession } from "@/lib/auth-jwt";
import { checkSessionRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request) {
  const limitRes = await checkSessionRateLimit(getClientIp(request));
  if (!limitRes.success) {
    return rateLimitResponse();
  }

  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    await createSession(idToken);
    return NextResponse.json({ success: true, message: "Session created successfully." });
  } catch (error) {
    console.error("POST /api/auth/session failed:", error);
    // Firebase error codes (e.g. "auth/id-token-expired") are not sensitive —
    // surfacing them lets the client show something actionable instead of a
    // generic dead-end message.
    return NextResponse.json(
      { error: "Authentication failed", code: error?.code || null, detail: error?.message || null },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  try {
    await destroySession();
    return NextResponse.json({ success: true, message: "Session destroyed successfully." });
  } catch (error) {
    console.error("DELETE /api/auth/session failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
