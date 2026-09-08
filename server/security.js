const encoder = new TextEncoder();
const hex = bytes => [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
const unhex = value => Uint8Array.from(value.match(/../g) || [], n => parseInt(n, 16));
export const token = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export async function digest(value) {
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))));
}
export async function hashPassword(password, salt = token()) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt:unhex(salt), iterations:100000, hash:'SHA-256'}, key, 256);
  return `pbkdf2:100000:${salt}:${hex(new Uint8Array(bits))}`;
}
export async function verifyPassword(password, stored) {
  if (!stored?.startsWith('pbkdf2:100000:')) return false;
  const result = await hashPassword(password, stored.split(':')[2]);
  let difference = result.length ^ stored.length;
  for (let i = 0; i < result.length; i++) difference |= result.charCodeAt(i) ^ (stored.charCodeAt(i) || 0);
  return difference === 0;
}
