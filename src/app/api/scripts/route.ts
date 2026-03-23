import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getScriptsByUser, getScriptById } from "@/lib/db";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  const scriptId = request.nextUrl.searchParams.get("id");

  if (scriptId) {
    const script = getScriptById(scriptId);
    if (!script) {
      return NextResponse.json({ error: "Script not found" }, { status: 404 });
    }
    return NextResponse.json(script);
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const user = getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ scripts: [], credits: 3 });
  }

  const scripts = getScriptsByUser(user.id);
  return NextResponse.json({
    scripts,
    credits: user.credits_remaining,
    plan: user.plan,
  });
}
