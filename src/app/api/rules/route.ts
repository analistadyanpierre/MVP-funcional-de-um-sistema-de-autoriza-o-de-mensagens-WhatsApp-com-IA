import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("rules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ rules: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao listar regras";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, keywords, action, auto_reply, active } = body;

    if (!name?.trim() || !action) {
      return NextResponse.json(
        { error: "Nome e ação são obrigatórios" },
        { status: 400 }
      );
    }

    const keywordList = Array.isArray(keywords)
      ? keywords
      : String(keywords)
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean);

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("rules")
      .insert({
        name: name.trim(),
        keywords: keywordList,
        action,
        auto_reply: auto_reply?.trim() || null,
        active: active !== false,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ rule: data }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao criar regra";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
