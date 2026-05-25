import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { MessageStatus } from "@/types";

const ACTION_MAP: Record<string, MessageStatus> = {
  approve: "approved",
  block: "blocked",
  pending: "pending",
  reply: "replied",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action as string;
    const replyText = body.reply_text as string | undefined;

    const status = ACTION_MAP[action];
    if (!status) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    const supabase = createServerClient();

    const updates: Record<string, unknown> = { status };
    if (action === "reply" && replyText) {
      updates.suggested_reply = replyText;
    }

    const { data: message, error } = await supabase
      .from("messages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    const descriptions: Record<string, string> = {
      approve: "Mensagem aprovada manualmente",
      block: "Mensagem bloqueada manualmente",
      pending: "Marcada como pendente de revisão",
      reply: replyText
        ? `Resposta enviada: ${replyText}`
        : "Marcada como respondida",
    };

    await supabase.from("message_events").insert({
      message_id: id,
      event_type: `manual_${action}`,
      description: descriptions[action],
    });

    return NextResponse.json({ message });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao atualizar mensagem";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
