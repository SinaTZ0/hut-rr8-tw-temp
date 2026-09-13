import { sql } from "drizzle-orm";

import { db } from "../db/client.server";

const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

export async function loader() {
  try {
    await db.execute(sql`select 1`);

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ status: "unavailable" }), {
      status: 503,
      headers: responseHeaders,
    });
  }
}
