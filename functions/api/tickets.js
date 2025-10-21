// functions/api/tickets.js
// API de tickets (D1) — GET/POST. Binding: env.DB

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=UTF-8" },
  });
}

// GET /api/tickets?date=YYYY-MM-DD&analista=...&etapa=...
export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");        // YYYY-MM-DD
    const analista = url.searchParams.get("analista") || "";
    const etapa = url.searchParams.get("etapa") || "";

    // IMPORTANTE: use o nome da coluna do seu banco.
    // Se você criou como "devido", mantenha "devido".
    // Se criou como "due", troque aqui!
    let sql = "SELECT * FROM tickets WHERE 1=1";
    const params = [];

    if (date)    { sql += " AND devido = ?";   params.push(date); }
    if (analista){ sql += " AND analista = ?"; params.push(analista); }
    if (etapa)   { sql += " AND etapa = ?";    params.push(etapa); }

    sql += " ORDER BY devido ASC, created_at DESC";

    const stmt = env.DB.prepare(sql);
    const res = await stmt.bind(...params).all();

    return json({ ok: true, rows: res.results || [] });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}

// POST /api/tickets
// Body JSON: { cliente, etapa, risco, devido, analista, obs, ticket_url, status? }
export async function onRequestPost({ env, request }) {
  try {
    const body = await request.json();

    const required = ["cliente", "etapa", "risco", "devido", "analista"];
    for (const k of required) {
      if (!body[k] || String(body[k]).trim() === "") {
        return json({ ok: false, error: `Campo obrigatório ausente: ${k}` }, 400);
      }
    }

    const id        = crypto.randomUUID();
    const cliente   = String(body.cliente).trim();
    const etapa     = String(body.etapa).trim();
    const risco     = String(body.risco).trim();
    const devido    = String(body.devido).trim();  // YYYY-MM-DD
    const analista  = String(body.analista).trim();
    const obs       = (body.obs || "").toString();
    const ticketUrl = (body.ticket_url || "").toString();
    const status    = (body.status || "open").toString();

    const sql = `
      INSERT INTO tickets (id, cliente, etapa, risco, devido, analista, obs, ticket_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await env.DB.prepare(sql)
      .bind(id, cliente, etapa, risco, devido, analista, obs, ticketUrl, status)
      .run();

    return json({ ok: true, id });
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500);
  }
}
