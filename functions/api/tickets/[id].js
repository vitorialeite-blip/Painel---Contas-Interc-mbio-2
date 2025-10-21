export async function onRequestDelete(context) {
  const { params } = context;
  const id = params.id;

  try {
    await context.env.DB.prepare("DELETE FROM tickets WHERE id = ?").bind(id).run();
    return Response.json({ ok: true });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function onRequestPatch(context) {
  const { params } = context;
  const id = params.id;

  try {
    const body = await context.request.json();
    const fields = [];
    const values = [];

    for (const [k, v] of Object.entries(body)) {
      if (["cliente","etapa","risco","due","analista","obs","ticket_url","status"].includes(k)) {
        fields.push(`${k} = ?`);
        values.push(v);
      }
    }
    if (!fields.length) return Response.json({ ok:false, error:"Nada para atualizar" }, { status:400 });

    const sql = `UPDATE tickets SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    await context.env.DB.prepare(sql).bind(...values).run();
    return Response.json({ ok: true });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
