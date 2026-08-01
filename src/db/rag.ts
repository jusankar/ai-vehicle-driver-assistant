import { db } from "./index.ts";
import { kbEmbeddings } from "./schema.ts";
import { sql } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "DUMMY_KEY",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Retrieves the top N relevant document chunks from PostgreSQL using pgvector cosine distance.
 */
export async function retrieveRelevantContext(query: string, limit = 3): Promise<string[]> {
  try {
    const embedRes = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: query
    });

    const vector = embedRes.embeddings?.[0]?.values;
    if (!vector || vector.length !== 768) {
      console.warn("Failed to generate query embedding for: ", query);
      return [];
    }

    const vectorString = `[${vector.join(",")}]`;

    // Select chunks and order by cosine distance (<=>)
    const results = await db.select({
      text: kbEmbeddings.text,
      distance: sql<number>`${kbEmbeddings.embedding} <=> ${vectorString}::vector`
    })
    .from(kbEmbeddings)
    .orderBy(sql`${kbEmbeddings.embedding} <=> ${vectorString}::vector`)
    .limit(limit);

    console.log(`RAG retrieved ${results.length} chunks for query: "${query}"`);
    return results.map(r => r.text);
  } catch (error) {
    console.error("RAG retrieval failed:", error);
    return [];
  }
}
