// Supabase クライアント
// VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY が設定されていれば有効になる
// 未設定の場合は localStorage のみで動作（オフラインモード）

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// デバイス固有IDの生成・取得（ブラウザ永続）
function getDeviceId(): string {
  const key = 'pg_land_device_id_v1';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

// ── Supabase REST API ヘルパー ─────────────────────────
async function sbFetch(path: string, options: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase not configured');
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error: ${res.status} ${err}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── プロファイル管理 ──────────────────────────────────
export interface SbProfile {
  id: string;
  device_id: string;
  slot_index: number;
  name: string;
  animal_idx: number;
}

export async function syncProfile(slotIndex: number, name: string, animalIdx: number): Promise<string | null> {
  if (!isSupabaseEnabled) return null;
  try {
    const deviceId = getDeviceId();
    const data = await sbFetch('/profiles', {
      method: 'POST',
      body: JSON.stringify({ device_id: deviceId, slot_index: slotIndex, name, animal_idx: animalIdx }),
      headers: { 'Prefer': 'return=representation,resolution=merge-duplicates' },
    }) as SbProfile[];
    return data?.[0]?.id ?? null;
  } catch (e) {
    console.warn('[Supabase] syncProfile failed:', e);
    return null;
  }
}

export async function loadProfiles(): Promise<SbProfile[]> {
  if (!isSupabaseEnabled) return [];
  try {
    const deviceId = getDeviceId();
    return (await sbFetch(`/profiles?device_id=eq.${encodeURIComponent(deviceId)}&select=*`)) ?? [];
  } catch (e) {
    console.warn('[Supabase] loadProfiles failed:', e);
    return [];
  }
}

// ── 進捗管理 ──────────────────────────────────────────
export interface SbProgress {
  id: string;
  profile_id: string;
  app_id: string;
  level_index: number;
  stars: Record<number, number>;
  unlocked_count: number;
}

export async function syncProgress(
  profileId: string,
  appId: string,
  levelIndex: number,
  stars: Record<number, number>,
  unlockedCount: number,
): Promise<void> {
  if (!isSupabaseEnabled || !profileId) return;
  try {
    await sbFetch('/progress', {
      method: 'POST',
      body: JSON.stringify({ profile_id: profileId, app_id: appId, level_index: levelIndex, stars, unlocked_count: unlockedCount }),
      headers: { 'Prefer': 'return=minimal,resolution=merge-duplicates' },
    });
  } catch (e) {
    console.warn('[Supabase] syncProgress failed:', e);
  }
}

export async function loadProgress(profileId: string, appId: string): Promise<SbProgress | null> {
  if (!isSupabaseEnabled || !profileId) return null;
  try {
    const rows = (await sbFetch(`/progress?profile_id=eq.${encodeURIComponent(profileId)}&app_id=eq.${encodeURIComponent(appId)}&select=*`)) as SbProgress[];
    return rows?.[0] ?? null;
  } catch (e) {
    console.warn('[Supabase] loadProgress failed:', e);
    return null;
  }
}
