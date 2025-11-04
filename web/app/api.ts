const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function iFetch(url: string, options?: RequestInit) {
  return fetch(url, options).catch(() => new Response('{}', { status: 503, statusText: 'Service Unavailable', }));
}

export async function getApi<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const response = await iFetch(`${API_BASE_URL}${path}` + (params ? '?' + new URLSearchParams(Object.entries(params).map(([k, v]) => [k, v.toString()])).toString() : ''));
  return response.json();
}

export async function postApi<T>(path: string, body: Record<string, any>): Promise<T> {
  const response = await iFetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

async function toBase64(bytes: ArrayBuffer) {
  return await new Promise<string>((resolve,) => {
    const reader = Object.assign(new FileReader(), {
      onload: () => resolve(reader.result!.toString().replace(/^data:application\/octet-stream;base64,/, '')),
    });
    reader.readAsDataURL(new File([bytes], "", { type: "application/octet-stream" }));
  });
}

async function fromBase64(str: string) {
  const res = await fetch("data:application/octet-stream;base64," + str);
  return res.arrayBuffer();
}

export let privateKeyBase64: string | null = null;
export let privateKeyImported: CryptoKey | null = null;
export let publicKeyBase64: string | null = null;
export let publicKeyFingerprint: string | null = null;

export function keyValid() { return privateKeyBase64 && privateKeyImported && publicKeyBase64 && publicKeyFingerprint; }

/**尝试从本地加载密钥对。可能抛出异常 */
export async function loadKeyPair() {
  privateKeyBase64 = localStorage.getItem('privateKey');
  publicKeyBase64 = localStorage.getItem('publicKey');
  if (!privateKeyBase64 || !publicKeyBase64) return;

  privateKeyImported = await crypto.subtle.importKey('pkcs8', await fromBase64(privateKeyBase64), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['sign']);
  publicKeyFingerprint = new Uint8Array(await crypto.subtle.digest('SHA-256', await fromBase64(publicKeyBase64))).reduce((hex, byte) =>
    hex + byte.toString(16).padStart(2, '0'), ''
  );;
}

export async function generateKeyPair() {
  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const prvKeyBuffer = await crypto.subtle.exportKey('pkcs8', pair.privateKey), pubKeyBuffer = await crypto.subtle.exportKey('spki', pair.publicKey);
  const prvKeyBase64 = await toBase64(prvKeyBuffer), pubKeyBase64 = await toBase64(pubKeyBuffer);
  localStorage.setItem('privateKey', prvKeyBase64);
  localStorage.setItem('publicKey', pubKeyBase64);

  await loadKeyPair();
}

export function clearKeyPair() {
  localStorage.removeItem('privateKey');
  localStorage.removeItem('publicKey');
  privateKeyBase64 = null;
  privateKeyImported = null;
  publicKeyBase64 = null;
  publicKeyFingerprint = null;
}