// Cloud sync for the three synced keys. Local-first: localStorage stays the
// source the UI reads from, and works offline / logged out. When someone is
// signed in, changes are pushed to Supabase and pulled on sign-in and when the
// tab regains focus.

import { readJSON, writeJSON, setWriteListener } from './storage'
import { MERGERS, SYNCED_KEYS, EMPTY, same } from './syncMerge'

let client = null
let userId = null
let timer = null
let pending = new Set()
let applying = false
let onStatus = () => {}

export function setSyncStatusListener(fn) {
  onStatus = fn || (() => {})
}

/** Tell the React hooks (which cache in memory) to re-read a key from storage. */
function refresh(key) {
  window.dispatchEvent(new StorageEvent('storage', { key }))
}

async function push(keys) {
  if (!client || !userId || keys.length === 0) return
  const rows = keys.map((k) => ({
    user_id: userId,
    key: k,
    value: readJSON(k, EMPTY[k]),
    updated_at: new Date().toISOString(),
  }))
  const { error } = await client.from('user_state').upsert(rows, { onConflict: 'user_id,key' })
  if (error) throw error
}

/** Merge what's in the cloud with what's on this device, then make both match. */
export async function pullAndMerge() {
  if (!client || !userId) return
  onStatus('syncing')
  try {
    const { data, error } = await client.from('user_state').select('key,value').eq('user_id', userId)
    if (error) throw error
    const remote = Object.fromEntries((data || []).map((r) => [r.key, r.value]))

    const toPush = []
    applying = true
    for (const k of SYNCED_KEYS) {
      const local = readJSON(k, EMPTY[k])
      const merged = MERGERS[k](local, remote[k])
      if (!same(merged, local)) {
        writeJSON(k, merged)
        refresh(k)
      }
      // don't create empty rows just because a key has never been used
      const isEmpty = same(merged, EMPTY[k])
      if (k in remote ? !same(merged, remote[k]) : !isEmpty) toPush.push(k)
    }
    applying = false
    await push(toPush)
    onStatus('synced')
  } catch (err) {
    applying = false
    console.warn('[sync] pull failed', err)
    onStatus('error')
  }
}

function schedulePush(key) {
  if (applying || !SYNCED_KEYS.includes(key)) return
  pending.add(key)
  clearTimeout(timer)
  timer = setTimeout(flush, 800)
}

/** Push anything waiting. Safe to call any time. */
export async function flush() {
  clearTimeout(timer)
  const keys = [...pending]
  pending = new Set()
  if (keys.length === 0) return
  try {
    onStatus('syncing')
    await push(keys)
    onStatus('synced')
  } catch (err) {
    keys.forEach((k) => pending.add(k))
    console.warn('[sync] push failed', err)
    onStatus('error')
  }
}

function onVisible() {
  if (document.visibilityState === 'visible') pullAndMerge()
}

/** Begin syncing for a signed-in user. */
export async function startSync(supabaseClient, id) {
  client = supabaseClient
  userId = id
  setWriteListener(schedulePush)
  document.addEventListener('visibilitychange', onVisible)
  await pullAndMerge()
}

/** Stop syncing (on sign-out). Optionally wipe the synced keys from this device. */
export function stopSync({ clearLocal = false } = {}) {
  setWriteListener(null)
  document.removeEventListener('visibilitychange', onVisible)
  clearTimeout(timer)
  pending = new Set()
  client = null
  userId = null
  if (clearLocal) {
    applying = true
    for (const k of SYNCED_KEYS) {
      writeJSON(k, EMPTY[k])
      refresh(k)
    }
    applying = false
  }
}
