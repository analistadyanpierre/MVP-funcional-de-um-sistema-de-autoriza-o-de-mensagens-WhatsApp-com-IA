import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServerClient();

    const { count: total } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true });

    const { count: approved } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: blocked } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "blocked");

    const { count: pending } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { data: recent } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    return NextResponse.json({
      stats: {
        total: total ?? 0,
        approved: approved ?? 0,
        blocked: blocked ?? 0,
        pending: pending ?? 0,
      },
      recent: recent ?? [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao buscar estatísticas";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
