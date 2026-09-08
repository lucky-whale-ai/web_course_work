import {createApi} from './api.js';
import {d1Store} from './d1.js';
import seed from '../data/seed.json';
let ready, handle;
async function initialize(db) {
  // Idempotent seed is separate from schema migrations. Existing records are preserved.
  const initialized=await db.prepare('SELECT id FROM records WHERE collection = ? AND id = ?').bind('_meta','seed-v1').first();
  if (!initialized) {
    const statements=[];
    for(const [table,rows] of Object.entries(seed)) for(const row of rows) statements.push(db.prepare('INSERT OR IGNORE INTO records (collection,id,data,email,nickname) VALUES (?,?,?,?,?)').bind(table,row.id,JSON.stringify(row),table==='users'?row.email.toLowerCase():null,table==='users'?row.nickname.toLowerCase():null));
    for(let i=0;i<statements.length;i+=25) await db.batch(statements.slice(i,i+25));
    await db.prepare('INSERT OR IGNORE INTO records (collection,id,data) VALUES (?,?,?)').bind('_meta','seed-v1','{}').run();
  }
  handle=createApi(d1Store(db));
}
export default {async fetch(request,env) {
  if (!new URL(request.url).pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
  ready ||= initialize(env.DB).catch(error=>{ready=null;throw error;});
  try { await ready; return await handle(request); }
  catch { return new Response(JSON.stringify({messageRu:'Хранилище временно недоступно.',messageEn:'Storage is temporarily unavailable.'}),{status:503,headers:{'Content-Type':'application/json'}}); }
}};
