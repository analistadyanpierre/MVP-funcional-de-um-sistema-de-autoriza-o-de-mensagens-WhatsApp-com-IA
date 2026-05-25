import { NextRequest, NextResponse } from "next/server";
import { processIncomingMessage } from "@/lib/message-processor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sender_name, sender_phone, content } = body;

    if (!sender_phone?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "Telefone e mensagem são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await processIncomingMessage({
      sender_name: sender_name?.trim(),
      sender_phone: sender_phone.trim(),
      content: content.trim(),
      source: "simulator",
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao processar mensagem";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
