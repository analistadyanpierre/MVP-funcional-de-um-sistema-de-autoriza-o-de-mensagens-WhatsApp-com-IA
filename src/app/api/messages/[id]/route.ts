import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: message, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("id", id)
      .single();

    if (msgError) throw msgError;

    const { data: events } = await supabase
      .from("message_events")
      .select("*")
      .eq("message_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({ message, events: events ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Mensagem não encontrada";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
