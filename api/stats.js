import { neon } from "@neondatabase/serverless";

// The counter opened at this number when the public stats page shipped.
// It is a fixed, disclosed offset, not an estimate of past traffic.
const BASELINE = 5000;
const MAX_PER_REQUEST = 240;

let schemaReady = false;

function client() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return url ? neon(url) : null;
}

async function ensureSchema(sql) {
  if (schemaReady) return;
  await sql`
    create table if not exists vanta_daily (
      day date primary key,
      names bigint not null default 0,
      sessions bigint not null default 0
    )
  `;
  await sql`
    create table if not exists vanta_style_daily (
      day date not null,
      style text not null,
      names bigint not null default 0,
      primary key (day, style)
    )
  `;
  schemaReady = true;
}

async function readStats(sql) {
  const [totals] = await sql`
    select
      coalesce(sum(names), 0)::bigint as total,
      coalesce(sum(names) filter (where day = current_date), 0)::bigint as today,
      coalesce(sum(names) filter (where day >= current_date - 6), 0)::bigint as week
    from vanta_daily
  `;
  const styles = await sql`
    select style, sum(names)::bigint as names
    from vanta_style_daily
    where day >= current_date - 6
    group by style
    order by names desc
    limit 5
  `;
  return {
    total: BASELINE + Number(totals?.total ?? 0),
    today: Number(totals?.today ?? 0),
    week: Number(totals?.week ?? 0),
    baseline: BASELINE,
    styles: styles.map((row) => ({ style: row.style, names: Number(row.names) })),
  };
}

export default async function handler(request, response) {
  response.setHeader("cache-control", "no-store");

  const sql = client();
  if (!sql) {
    response.status(200).json({ configured: false, total: BASELINE, today: 0, week: 0, baseline: BASELINE, styles: [] });
    return;
  }

  try {
    await ensureSchema(sql);

    if (request.method === "POST") {
      const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
      const count = Math.min(MAX_PER_REQUEST, Math.max(0, Number(body.count) || 0));
      const style = String(body.style || "unknown").slice(0, 32).replace(/[^a-z-]/gi, "") || "unknown";

      if (count > 0) {
        await sql`
          insert into vanta_daily (day, names, sessions)
          values (current_date, ${count}, 1)
          on conflict (day) do update
            set names = vanta_daily.names + ${count},
                sessions = vanta_daily.sessions + 1
        `;
        await sql`
          insert into vanta_style_daily (day, style, names)
          values (current_date, ${style}, ${count})
          on conflict (day, style) do update
            set names = vanta_style_daily.names + ${count}
        `;
      }
    } else if (request.method !== "GET") {
      response.status(405).json({ error: "method_not_allowed" });
      return;
    }

    response.status(200).json({ configured: true, ...(await readStats(sql)) });
  } catch (error) {
    console.error("stats", error);
    response.status(200).json({ configured: false, total: BASELINE, today: 0, week: 0, baseline: BASELINE, styles: [] });
  }
}
