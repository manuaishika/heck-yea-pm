// Cloud sync against user_progress (one row per item). Local-first:
// localStorage stays the source the UI reads from, and works offline /
// logged out. When someone is signed in, changes are pushed to Supabase and
// pulled on sign-in and when the tab regains focus.

import { readJSON, writeJSON, setWriteListener } from './storage'
import { SYNCED_KEYS, ITEM_TYPE, EMPTY, same, toRows, mergeFromRows } from './syncMerge'

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
  const rows = keys.flatMap((k) => {
    const value = readJSON(k, EMPTY[k])
    return toRows(k, value).map((r) => ({
      user_id: userId,
      item_type: ITEM_TYPE[k],
      item_id: r.item_id,
      status: r.status,
      updated_at: new Date().toISOString(),
    }))
  })
  if (rows.length === 0) return
  const { error } = await client
    .from('user_progress')
    .upsert(rows, { onConflict: 'user_id,item_type,item_id' })
  if (error) throw error
}

/** Merge what's in the cloud with what's on this device, then make both match. */
export async function pullAndMerge() {
  if (!client || !userId) return
  onStatus('syncing')
  try {
    const { data, error } = await client
      .from('user_progress')
      .select('item_type,item_id,status')
      .eq('user_id', userId)
    if (error) throw error
    const rowsByType = {}
    for (const r of data || []) {
      ;(rowsByType[r.item_type] ??= []).push(r)
    }

    const toPush = []
    applying = true
    for (const k of SYNCED_KEYS) {
      const type = ITEM_TYPE[k]
      const local = readJSON(k, EMPTY[k])
      const merged = mergeFromRows(k, rowsByType[type], local)
      if (!same(merged, local)) {
        writeJSON(k, merged)
        refresh(k)
      }
      const isEmpty = same(merged, EMPTY[k])
      const hadRemote = Boolean(rowsByType[type]?.length)
      if (!isEmpty && (!hadRemote || !same(merged, local))) toPush.push(k)
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

/** "Delete my account and data": removes cloud rows + the auth user, then this device's local copy. */
export async function deleteAccount() {
  if (!client) return { error: new Error('Not signed in') }
  const { error } = await client.rpc('delete_my_account')
  if (error) return { error }
  stopSync({ clearLocal: true })
  return { error: null }
}
