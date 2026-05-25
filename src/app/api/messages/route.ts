import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ messages: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao listar mensagens";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
