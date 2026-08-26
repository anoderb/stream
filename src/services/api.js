// ===== Service API esportex =====
export const API = 'https://api.esportex.site/api/streams'

export const CATS = [
  'all', 'football', 'basketball', 'race', 'badminton', 'tennis', 'fight',
  'amfootball', 'baseball', 'volleyball', 'hockey', 'rugby', 'cricket', 'other',
]

export const LABEL = {
  all: 'Semua', football: '⚽ Sepak Bola', basketball: '🏀 Basket',
  race: '🏎 Race', badminton: '🏸 Badminton', tennis: '🎾 Tennis',
  fight: '🥊 Fight', amfootball: '🏈 NFL', baseball: '⚾ Baseball',
  volleyball: '🏐 Voli', hockey: '🏒 Hockey', rugby: '🏉 Rugby',
  cricket: '🏏 Cricket', other: 'Lainnya',
}

export const LABEL_SHORT = {
  all: 'Semua', football: 'Football', basketball: 'Basket', race: 'Race',
  badminton: 'Badminton', tennis: 'Tennis', fight: 'Fight', amfootball: 'NFL',
  baseball: 'Baseball', volleyball: 'Voli', hockey: 'Hockey', rugby: 'Rugby',
  cricket: 'Cricket', other: 'Lainnya',
}

// Parse string "YYYY-MM-DD HH:mm" sebagai waktu WIB (+07:00)
export const parse = t => (t ? new Date(t.replace(' ', 'T') + '+07:00') : null)

// Status event: live | upcoming | ended
export const statusOf = m => {
  const n = new Date()
  const a = parse(m.kickoff)
  const b = parse(m.endTime)
  if (a && n < a) return 'upcoming'
  if (a && b && n >= a && n <= b) return 'live'
  return 'ended'
}

// Format waktu WIB
export const fmtTime = t => {
  const d = parse(t)
  if (!d) return '—'
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta',
  }).format(d) + ' WIB'
}

// "Mulai 45 mnt lagi" / "Live sejak 10 mnt" / "Selesai"
export const relTime = m => {
  const st = statusOf(m)
  const n = new Date()
  if (st === 'live') {
    const diff = Math.floor((n - parse(m.kickoff)) / 60000)
    return `Live sejak ${diff}m`
  }
  if (st === 'upcoming') {
    const diff = Math.floor((parse(m.kickoff) - n) / 60000)
    if (diff < 1) return 'Mulai sebentar lagi'
    if (diff < 60) return `Mulai ${diff} mnt lagi`
    const h = Math.floor(diff / 60)
    const mm = diff % 60
    return `Mulai ${h} j ${mm} m lagi`
  }
  return 'Selesai'
}

export const slugify = str =>
  (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || 'match'

// Ambil data, flatten per kategori + sort by kickoff
export async function fetchStreams() {
  const r = await fetch(API)
  if (!r.ok) throw new Error('HTTP ' + r.status)
  const d = await r.json()
  const rows = []
  for (const c of CATS.filter(x => x !== 'all')) {
    ;(d[c] || []).forEach(m => rows.push({ ...m, category: c }))
  }
  rows.sort((a, b) => (parse(a.kickoff) || 0) - (parse(b.kickoff) || 0))
  return rows
}
