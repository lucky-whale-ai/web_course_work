export function d1Store(db) {
  function values(table,row) { return [table,row.id,JSON.stringify(row),table==='users'?row.email.toLowerCase():null,table==='users'?row.nickname.toLowerCase():null]; }
  return {
    async all(table) { return (await db.prepare('SELECT data FROM records WHERE collection = ?').bind(table).all()).results.map(r=>JSON.parse(r.data)); },
    async get(table,id) { const row=await db.prepare('SELECT data FROM records WHERE collection = ? AND id = ?').bind(table,id).first(); return row?JSON.parse(row.data):null; },
    async insert(table,row) { await db.prepare('INSERT INTO records (collection,id,data,email,nickname) VALUES (?,?,?,?,?)').bind(...values(table,row)).run(); },
    async put(table,row) { await db.prepare('INSERT INTO records (collection,id,data,email,nickname) VALUES (?,?,?,?,?) ON CONFLICT(collection,id) DO UPDATE SET data=excluded.data,email=excluded.email,nickname=excluded.nickname').bind(...values(table,row)).run(); },
    async remove(table,id) { await db.prepare('DELETE FROM records WHERE collection = ? AND id = ?').bind(table,id).run(); }
  };
}
