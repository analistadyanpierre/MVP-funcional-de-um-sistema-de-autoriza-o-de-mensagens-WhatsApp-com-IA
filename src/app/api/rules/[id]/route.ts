import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServerClient();

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name.trim();
    if (body.action !== undefined) updates.action = body.action;
    if (body.auto_reply !== undefined)
      updates.auto_reply = body.auto_reply?.trim() || null;
    if (body.active !== undefined) updates.active = body.active;
    if (body.keywords !== undefined) {
      updates.keywords = Array.isArray(body.keywords)
        ? body.keywords
        : String(body.keywords)
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean);
    }

    const { data, error } = await supabase
      .from("rules")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ rule: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar regra";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();
    const { error } = await supabase.from("rules").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir regra";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
