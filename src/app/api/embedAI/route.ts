import { NextRequest, NextResponse } from "next/server";
import { embedAndIndexAllContent } from "@/features/chatbot/lib/embed_and_indexes";

// POST /api/reindex
export async function POST(req: NextRequest) {
  try {
    await embedAndIndexAllContent({ forceReindex: true });
    return NextResponse.json({ message: "Embedding and indexing complete!" });
  } catch (err: any) {
    console.error("Indexing failed:", err);
    return NextResponse.json(
      { error: "Indexing failed", details: err.message || err.toString() },
      { status: 500 }
    );
  }
}
