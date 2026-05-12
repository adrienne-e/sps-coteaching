import { getStore } from "@netlify/blobs";

const STORE_NAME = "sps-coteaching";
const ENTRIES_KEY = "entries";

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  // GET — load all entries
  if (req.method === "GET") {
    try {
      const raw = await store.get(ENTRIES_KEY);
      const entries = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify(entries), { status: 200, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify([]), { status: 200, headers: corsHeaders });
    }
  }

  // POST — save a new entry
  if (req.method === "POST") {
    try {
      const newEntry = await req.json();
      let entries = [];
      try {
        const raw = await store.get(ENTRIES_KEY);
        if (raw) entries = JSON.parse(raw);
      } catch (e) {}
      entries.push(newEntry);
      await store.set(ENTRIES_KEY, JSON.stringify(entries));
      return new Response(JSON.stringify({ ok: true, total: entries.length }), { status: 200, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: corsHeaders });
    }
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
};

export const config = {
  path: "/api/entries",
};
