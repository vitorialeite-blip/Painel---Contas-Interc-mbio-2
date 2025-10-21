// functions/api/tickets/[id].js
// DELETE /api/tickets/:id — remove item da agenda (D1)

export async function onRequestDelete({ env, params }) {
  try {
    const id = params.id || "";
    if (!id) return new Response(JSON.stringify({ ok:false, error:"ID não informado" }), {
      status: 400, headers: { "content-type": "application/json" }
    });

    const sql  = "DELETE FROM tickets WHERE id = ?";
    const info = await env.DB.prepare(sql).bind(id).run();

    return new Response(JSON.stringify({ ok: true, changes: info.meta?.changes || 0 }), {
      headers: { "content-type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error:String(err) }), {
      status: 500, headers: { "content-type": "application/json" }
    });
  }
}
