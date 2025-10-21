export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const date = url.searchParams.get("date"); // YYYY-MM-DD

  try {
    if (date) {
      const { results } = await context.env.DB
        .prepare("SELECT * FROM tickets WHERE date(due) = ? ORDER BY created_at DESC")
        .bind(date)
        .all();
      return Response.json({ ok: true, items: results ?? [] });
    } else {
      const { results } = await context.env.DB
        .prepare("SELECT * FROM tickets ORDER BY created_at DESC")
        .all();
      return Response.json({ ok: true, items: results ?? [] });
    }
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const required = ["cliente", "etapa", "risco", "due", "analista", "ticket_url"];
    for (const k of required) {
      if (!body[k] || String(body[k]).trim() === "") {
        return Response.json({ ok: false, error: `Campo obrigatório ausente: ${k}` }, { status: 400 });
      }
    }

    const id = crypto.randomUUID();

    const stmt = context.env.DB.prepare(
      `INSERT INTO tickets (id, cliente, etapa, risco, due, analista, obs, ticket_url, status)
       VALUES(?, ?, ?, ?, ?, ?, ?, ?, 'open')`
    ).bind(
      id,
      body.cliente,
      body.etapa,
      body.risco,
      body.due,        // <<<<<< due (padronizado)
      body.analista,
      body.obs ?? "",
      body.ticket_url
    );

    await stmt.run();
    return Response.json({ ok: true, id });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
