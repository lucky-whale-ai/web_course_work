import {registrationErrors, normalizePhone} from '../src/validation.js';
import {token, digest, hashPassword, verifyPassword} from './security.js';

const publicUser = ({id, firstName, lastName, nickname, email, phone, role}) => ({id, firstName, lastName, nickname, email, phone, role});
const fail = (status, messageRu, messageEn, extra = {}) => { throw {status, messageRu, messageEn, ...extra}; };
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', ...headers}});
const clean = (v, max = 2000) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const categories = new Set(['oil', 'power', 'civil', 'industry']);
const statuses = new Set(['new', 'processing', 'done']);
const denied = () => fail(401, 'Войдите в учётную запись.', 'Please sign in.');

export function createApi(store) {
  // A short per-process throttle supplements session checks; it is not the database.
  const attempts = new Map();
  function throttle(key, limit) {
    const now = Date.now();
    if (attempts.size > 2000) for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
    const entry = attempts.get(key);
    if (!entry || entry.until < now) { attempts.set(key, {count:1, until:now+60000}); return; }
    if (++entry.count > limit) fail(429, 'Слишком много попыток. Подождите минуту.', 'Too many attempts. Please wait a minute.');
  }
  return async function handle(request) {
    try {
      const url = new URL(request.url), method = request.method;
      const path = url.pathname.replace(/^\/api/, '').replace(/\/$/, '') || '/';
      const ip = request.headers.get('cf-connecting-ip') || 'local';
      if (!['GET', 'HEAD'].includes(method)) {
        const origin = request.headers.get('origin');
        if (origin && origin !== url.origin) fail(403, 'Недопустимый источник запроса.', 'Invalid request origin.');
        if (!(request.headers.get('content-type') || '').includes('application/json') && !['/logout'].includes(path) && method !== 'DELETE' && !path.startsWith('/favorites/')) fail(415, 'Ожидается JSON.', 'JSON is required.');
      }
      let body = {};
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const raw = await request.text();
        if (raw.length > 16000) fail(413, 'Запрос слишком большой.', 'Request is too large.');
        try { body = raw ? JSON.parse(raw) : {}; } catch { fail(400, 'Некорректный JSON.', 'Invalid JSON.'); }
        if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'Ожидается объект.', 'An object is required.');
      }
      const rawToken = request.headers.get('cookie')?.match(/(?:^|;\s*)roof_session=([a-f0-9]{64})(?:;|$)/)?.[1];
      const session = rawToken ? await store.get('sessions', await digest(rawToken)) : null;
      const user = session && session.expiresAt > Date.now() ? await store.get('users', session.userId) : null;
      const cookie = (value, age = 28800) => `roof_session=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${url.protocol === 'https:' ? '; Secure' : ''}`;
      async function signIn(account, status = 200) {
        if (session) await store.remove('sessions', session.id);
        const secret = token();
        await store.insert('sessions', {id:await digest(secret), userId:account.id, expiresAt:Date.now()+28800000});
        return json({user:publicUser(account)}, status, {'Set-Cookie':cookie(secret)});
      }
      if (path === '/health' && method === 'GET') return json({ok:true});
      if (path === '/me' && method === 'GET') return json({user:user ? publicUser(user) : null});
      if (path === '/register' && method === 'POST') {
        throttle(`register:${ip}`, 8);
        const errors = registrationErrors(body, {confirm:true});
        if (Object.keys(errors).length) fail(422, 'Проверьте поля регистрации.', 'Check the registration fields.', {errors});
        const account = {
          id:crypto.randomUUID(), firstName:clean(body.firstName,60), lastName:clean(body.lastName,60),
          patronymic:clean(body.patronymic,60), phone:normalizePhone(body.phone), email:clean(body.email,254).toLowerCase(),
          birthDate:body.birthDate, nickname:body.nickname, role:'user', agreementAt:new Date().toISOString(),
          passwordHash:await hashPassword(body.password), createdAt:new Date().toISOString()
        };
        try { await store.insert('users', account); } catch (e) {
          if (e.code === 'CONFLICT' || /UNIQUE/.test(e.message)) fail(409, 'Email или никнейм уже занят.', 'Email or nickname is already in use.');
          throw e;
        }
        return signIn(account, 201);
      }
      if (path === '/login' && method === 'POST') {
        throttle(`login:${ip}`, 15);
        const login = clean(body.login || body.email,254).toLowerCase();
        const account = (await store.all('users')).find(u => u.email.toLowerCase() === login || u.nickname.toLowerCase() === login);
        const dummy = 'pbkdf2:100000:'+'0'.repeat(64)+':'+'0'.repeat(64);
        const valid = await verifyPassword(clean(body.password,100), account?.passwordHash || dummy);
        if (!account || !valid) fail(401, 'Неверный логин или пароль.', 'Incorrect login or password.');
        return signIn(account);
      }
      if (path === '/logout' && method === 'POST') {
        if (session) await store.remove('sessions', session.id);
        return json({ok:true}, 200, {'Set-Cookie':cookie('',0)});
      }
      if (path === '/projects' && method === 'GET') {
        let rows = await store.all('projects');
        const q = clean(url.searchParams.get('q'),100).toLocaleLowerCase();
        const category = url.searchParams.get('category');
        if (category) rows = rows.filter(p => p.category === category);
        if (q) rows = rows.filter(p => [p.title,p.titleEn,p.location,p.locationEn,p.client,p.clientEn].some(v => v?.toLocaleLowerCase().includes(q)));
        const sort = url.searchParams.get('sort'), lang = url.searchParams.get('lang') === 'en' ? 'en' : 'ru';
        rows.sort(sort === 'title' ? (a,b) => (lang==='en'?a.titleEn:a.title).localeCompare(lang==='en'?b.titleEn:b.title,lang) : sort === 'oldest' ? (a,b) => a.dateTo.localeCompare(b.dateTo) : (a,b) => b.dateTo.localeCompare(a.dateTo));
        const total = rows.length, pages = Math.max(1, Math.ceil(total/6));
        const page = Math.min(pages, Math.max(1, Number.parseInt(url.searchParams.get('page'),10)||1));
        return json({items:rows.slice((page-1)*6,page*6), total, pages, page});
      }
      if (path.startsWith('/projects/') && method === 'GET') {
        const project = await store.get('projects', decodeURIComponent(path.slice(10)));
        if (!project) fail(404, 'Объект не найден.', 'Project not found.');
        return json(project);
      }
      if (path === '/favorites' && method === 'GET') {
        if (!user) denied();
        const rows = (await store.all('favorites')).filter(f => f.userId === user.id);
        if (url.searchParams.get('expand') === 'projects') {
          const projects = await store.all('projects');
          return json(rows.map(f=>({...f,project:projects.find(p=>p.id===f.projectId)})).filter(f=>f.project));
        }
        return json(rows);
      }
      if (path.startsWith('/favorites/') && ['PUT','DELETE'].includes(method)) {
        if (!user) denied();
        const projectId = decodeURIComponent(path.slice(11)), id = `${user.id}:${projectId}`;
        if (!await store.get('projects', projectId)) fail(404, 'Объект не найден.', 'Project not found.');
        if (method === 'PUT') await store.put('favorites', {id,userId:user.id,projectId});
        else await store.remove('favorites',id);
        return json({ok:true});
      }
      if (path === '/requests' && method === 'POST') {
        throttle(`request:${user?.id || ip}`,10);
        if (!['question','partner'].includes(body.type) || !clean(body.name,120) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(body.email,254)) || typeof body.message !== 'string' || body.message.trim().length<10 || body.message.length>2000 || ![true,'on'].includes(body.consent) || (body.type==='partner' && !clean(body.company,120))) fail(422, 'Проверьте имя, email, сообщение и согласие.', 'Check your name, email, message and consent.');
        const row = {id:crypto.randomUUID(), userId:user?.id || null, name:clean(body.name,120), email:clean(body.email,254), phone:clean(body.phone,30), type:body.type, company:clean(body.company,120), category:categories.has(body.category)?body.category:null, message:clean(body.message), status:'new', createdAt:new Date().toISOString()};
        await store.insert('requests', row);
        return json(row,201);
      }
      if (path === '/requests' && method === 'GET') {
        if (!user) denied();
        let rows = (await store.all('requests')).filter(r=>user.role==='admin'||r.userId===user.id);
        const status = url.searchParams.get('status');
        if (status) rows = rows.filter(r=>r.status===status);
        return json(rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
      }
      if (path.startsWith('/requests/') && method === 'PATCH') {
        if (!user) denied();
        if (user.role !== 'admin') fail(403, 'Доступ только администратору.', 'Administrator access required.');
        if (!statuses.has(body.status)) fail(422, 'Неизвестный статус.', 'Unknown status.');
        const row = await store.get('requests',decodeURIComponent(path.slice(10)));
        if (!row) fail(404, 'Обращение не найдено.', 'Request not found.');
        const updated = {...row,status:body.status,updatedAt:new Date().toISOString()};
        await store.put('requests',updated);
        return json(updated);
      }
      return json({messageRu:'Ресурс не найден.',messageEn:'Resource not found.'},404);
    } catch (e) {
      if (e.status) return json({messageRu:e.messageRu,messageEn:e.messageEn,...(e.errors?{errors:e.errors}:{})},e.status);
      console.error('API error:', e.message || 'Unexpected storage error');
      return json({messageRu:'Ошибка сервера. Попробуйте позже.',messageEn:'Server error. Please try again later.'},500);
    }
  };
}
