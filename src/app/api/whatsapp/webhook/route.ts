import { NextRequest, NextResponse } from "next/server";
import { processIncomingMessage } from "@/lib/message-processor";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? "whatsapp_verify_token";

function extractWhatsAppMessage(body: Record<string, unknown>): {
  sender_name?: string;
  sender_phone: string;
  content: string;
} | null {
  try {
    const entry = (body.entry as unknown[])?.[0] as Record<string, unknown>;
    const changes = (entry?.changes as unknown[])?.[0] as Record<string, unknown>;
    const value = changes?.value as Record<string, unknown>;
    const messages = value?.messages as unknown[];

    if (!messages?.length) return null;

    const msg = messages[0] as Record<string, unknown>;
    const from = String(msg.from ?? "");
    const type = String(msg.type ?? "text");

    let content = "";
    if (type === "text") {
      const text = msg.text as Record<string, string>;
      content = text?.body ?? "";
    } else {
      content = `[Mensagem do tipo: ${type}]`;
    }

    const contacts = value?.contacts as unknown[];
    const contact = contacts?.[0] as Record<string, unknown>;
    const profile = contact?.profile as Record<string, string>;

    return {
      sender_name: profile?.name,
      sender_phone: from,
      content,
    };
  } catch {
    return null;
  }
}

/** GET — verificação do webhook Meta/WhatsApp */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** POST — receber mensagens do WhatsApp Business API */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const extracted = extractWhatsAppMessage(
      body as Record<string, unknown>
    );

    if (!extracted?.content?.trim()) {
      return NextResponse.json({ received: true, processed: false });
    }

    const result = await processIncomingMessage({
      ...extracted,
      source: "whatsapp",
    });

    return NextResponse.json({
      received: true,
      processed: true,
      message_id: result.message.id,
      status: result.message.status,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro no webhook";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
