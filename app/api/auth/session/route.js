import { NextResponse } from "next/server";
import { createSession, destroySession } from "@/lib/auth-jwt";

export async function POST(request) {
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
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
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
