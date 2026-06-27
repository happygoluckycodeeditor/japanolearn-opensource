import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import { existsSync } from 'fs'

// ---------------------------------------------------------------------------
// Romaji → Hiragana conversion (Hepburn + common variants)
// ---------------------------------------------------------------------------

// Mapping sorted longest-first so greedy matching picks the right syllable.
const ROMAJI_MAP: [string, string][] = [
  // 4-char special small-tsu markers
  ['xtsu', 'っ'],
  ['ltsu', 'っ'],
  // 3-char compound syllables (must come before 2-char entries)
  ['sha', 'しゃ'], ['shi', 'し'], ['shu', 'しゅ'], ['she', 'しぇ'], ['sho', 'しょ'],
  ['chi', 'ち'], ['cha', 'ちゃ'], ['chu', 'ちゅ'], ['che', 'ちぇ'], ['cho', 'ちょ'],
  ['tsu', 'つ'],
  ['tya', 'ちゃ'], ['tyu', 'ちゅ'], ['tyo', 'ちょ'],
  ['nya', 'にゃ'], ['nyu', 'にゅ'], ['nyo', 'にょ'],
  ['hya', 'ひゃ'], ['hyu', 'ひゅ'], ['hyo', 'ひょ'],
  ['mya', 'みゃ'], ['myu', 'みゅ'], ['myo', 'みょ'],
  ['rya', 'りゃ'], ['ryu', 'りゅ'], ['ryo', 'りょ'],
  ['gya', 'ぎゃ'], ['gyu', 'ぎゅ'], ['gyo', 'ぎょ'],
  ['bya', 'びゃ'], ['byu', 'びゅ'], ['byo', 'びょ'],
  ['pya', 'ぴゃ'], ['pyu', 'ぴゅ'], ['pyo', 'ぴょ'],
  ['kya', 'きゃ'], ['kyu', 'きゅ'], ['kyo', 'きょ'],
  ['dzu', 'づ'], ['dji', 'ぢ'],
  ['dya', 'ぢゃ'], ['dyu', 'ぢゅ'], ['dyo', 'ぢょ'],
  ['jya', 'じゃ'], ['jyu', 'じゅ'], ['jyo', 'じょ'],
  ['zya', 'じゃ'], ['zyu', 'じゅ'], ['zyo', 'じょ'],
  // 2-char basic syllables
  ['ka', 'か'], ['ki', 'き'], ['ku', 'く'], ['ke', 'け'], ['ko', 'こ'],
  ['sa', 'さ'], ['si', 'し'], ['su', 'す'], ['se', 'せ'], ['so', 'そ'],
  ['ta', 'た'], ['ti', 'ち'], ['tu', 'つ'], ['te', 'て'], ['to', 'と'],
  ['na', 'な'], ['ni', 'に'], ['nu', 'ぬ'], ['ne', 'ね'], ['no', 'の'],
  ['ha', 'は'], ['hi', 'ひ'], ['fu', 'ふ'], ['hu', 'ふ'], ['he', 'へ'], ['ho', 'ほ'],
  ['ma', 'ま'], ['mi', 'み'], ['mu', 'む'], ['me', 'め'], ['mo', 'も'],
  ['ya', 'や'], ['yu', 'ゆ'], ['yo', 'よ'],
  ['ra', 'ら'], ['ri', 'り'], ['ru', 'る'], ['re', 'れ'], ['ro', 'ろ'],
  ['wa', 'わ'], ['wi', 'ゐ'], ['we', 'ゑ'], ['wo', 'を'],
  ['ga', 'が'], ['gi', 'ぎ'], ['gu', 'ぐ'], ['ge', 'げ'], ['go', 'ご'],
  ['za', 'ざ'], ['zi', 'じ'], ['zu', 'ず'], ['ze', 'ぜ'], ['zo', 'ぞ'],
  ['da', 'だ'], ['di', 'ぢ'], ['du', 'づ'], ['de', 'で'], ['do', 'ど'],
  ['ba', 'ば'], ['bi', 'び'], ['bu', 'ぶ'], ['be', 'べ'], ['bo', 'ぼ'],
  ['pa', 'ぱ'], ['pi', 'ぴ'], ['pu', 'ぷ'], ['pe', 'ぺ'], ['po', 'ぽ'],
  ['ja', 'じゃ'], ['ji', 'じ'], ['ju', 'じゅ'], ['jo', 'じょ'],
  ['fa', 'ふぁ'], ['fi', 'ふぃ'], ['fe', 'ふぇ'], ['fo', 'ふぉ'],
  // Single vowels
  ['a', 'あ'], ['i', 'い'], ['u', 'う'], ['e', 'え'], ['o', 'お'],
]

function romajiToHiragana(romaji: string): string {
  const s = romaji.toLowerCase()
  let result = ''
  let i = 0

  while (i < s.length) {
    const ch = s[i]
    const next = i + 1 < s.length ? s[i + 1] : ''

    // ----------------------------------------------------------------
    // Handle 'n' — can be ん or the start of a kana syllable (na/ni/…)
    // ----------------------------------------------------------------
    if (ch === 'n') {
      if (next === 'n') {
        result += 'ん'
        i += 2
        continue
      }
      if (next === "'") {
        result += 'ん'
        i += 2
        continue
      }
      if (next === '') {
        result += 'ん'
        i += 1
        continue
      }
      // 'n' before a consonant (not 'y' and not a vowel) → ん
      if (!'aeiouy'.includes(next)) {
        result += 'ん'
        i += 1
        continue
      }
      // Otherwise fall through so 'na', 'ni', etc. get matched below
    }

    // ----------------------------------------------------------------
    // Double consonants → っ (gemination), e.g. kk→っk, ssh→っsh
    // ----------------------------------------------------------------
    if (ch === next && !'aeioun'.includes(ch)) {
      result += 'っ'
      i += 1 // consume one consonant; next iteration handles the syllable
      continue
    }

    // ----------------------------------------------------------------
    // Greedy longest-first map lookup
    // ----------------------------------------------------------------
    let matched = false
    for (const [rom, kana] of ROMAJI_MAP) {
      if (s.startsWith(rom, i)) {
        result += kana
        i += rom.length
        matched = true
        break
      }
    }

    if (!matched) {
      result += ch // pass through unchanged (e.g. spaces, hyphens)
      i += 1
    }
  }

  return result
}

/** Returns true when every character in the string is kana (hiragana/katakana/ー). */
function isFullyKana(s: string): boolean {
  return s.length > 0 && /^[\u3040-\u30FFー]+$/.test(s)
}

// ---------------------------------------------------------------------------
// Query type detection
// ---------------------------------------------------------------------------

function detectQueryType(query: string): 'kanji' | 'kana' | 'romaji' | 'all' {
  if (/[一-龯]/.test(query)) return 'kanji'
  if (/^[\u3040-\u30FFー]+$/.test(query)) return 'kana'
  // Pure ASCII → attempt romaji conversion; treat as romaji regardless so we
  // always run the kana reading search in addition to an English gloss search.
  if (/^[a-zA-Z'\s]+$/.test(query)) return 'romaji'
  return 'all'
}

export function setupDictionaryHandlers(): void {
  // Use the same path as defined in index.ts - the copied file in user data directory
  const dictionaryDbPath = path.join(app.getPath('userData'), 'jmdict.sqlite')

  console.log('Setting up dictionary handlers')
  console.log('Dictionary path:', dictionaryDbPath)
  console.log('Dictionary exists:', existsSync(dictionaryDbPath))

  // Connect to the SQLite database
  const db = new Database(dictionaryDbPath)

  // ---------------------------------------------------------------------------
  // Reusable SQL helpers (prepared once, reused per search call)
  // ---------------------------------------------------------------------------

  /** Search the readings table.
   *  Ranking: 1 = exact, 2 = prefix (reading LIKE 'q%'), 3 = substring. */
  function searchByReading(kana: string): Record<string, unknown>[] {
    const exact = kana
    const prefix = `${kana}%`
    const sub = `%${kana}%`
    const stmt = db.prepare(`
      SELECT e.id,
        GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
        GROUP_CONCAT(DISTINCT r.reading) AS readings,
        GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
        MIN(CASE
          WHEN r.reading = ?   THEN 1
          WHEN r.reading LIKE ? THEN 2
          ELSE 3
        END) AS match_type
      FROM entries e
      LEFT JOIN kanji k ON e.id = k.entry_id
      LEFT JOIN readings r ON e.id = r.entry_id
      LEFT JOIN meanings m ON e.id = m.entry_id
      WHERE e.id IN (SELECT entry_id FROM readings WHERE reading LIKE ?)
      GROUP BY e.id
      ORDER BY match_type, LENGTH(MIN(r.reading))
      LIMIT 50
    `)
    let rows = stmt.all(exact, prefix, sub) as Record<string, unknown>[]
    if (rows.length === 0) {
      const ftsstmt = db.prepare(`
        SELECT e.id,
          GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
          GROUP_CONCAT(DISTINCT r.reading) AS readings,
          GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
          MIN(CASE
            WHEN r.reading = ?   THEN 1
            WHEN r.reading LIKE ? THEN 2
            ELSE 3
          END) AS match_type
        FROM entries e
        LEFT JOIN kanji k ON e.id = k.entry_id
        LEFT JOIN readings r ON e.id = r.entry_id
        LEFT JOIN meanings m ON e.id = m.entry_id
        WHERE e.id IN (
          SELECT entry_id FROM readings
          WHERE rowid IN (SELECT rowid FROM readings_fts WHERE readings_fts MATCH ?)
        )
        GROUP BY e.id
        ORDER BY match_type, LENGTH(MIN(r.reading))
        LIMIT 50
      `)
      rows = ftsstmt.all(exact, prefix, `${kana}*`) as Record<string, unknown>[]
    }
    return rows
  }

  /** Search the meanings (English gloss) table.
   *  Ranking: 1 = exact gloss, 2 = gloss starts with query, 3 = substring. */
  function searchByMeaning(q: string): Record<string, unknown>[] {
    const exact = q
    const prefix = `${q}%`
    const sub = `%${q}%`
    const stmt = db.prepare(`
      SELECT e.id,
        GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
        GROUP_CONCAT(DISTINCT r.reading) AS readings,
        GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
        MIN(CASE
          WHEN m.meaning = ?   THEN 1
          WHEN m.meaning LIKE ? THEN 2
          ELSE 3
        END) AS match_type
      FROM entries e
      LEFT JOIN kanji k ON e.id = k.entry_id
      LEFT JOIN readings r ON e.id = r.entry_id
      LEFT JOIN meanings m ON e.id = m.entry_id
      WHERE e.id IN (SELECT entry_id FROM meanings WHERE meaning LIKE ?)
      GROUP BY e.id
      ORDER BY match_type, LENGTH(MIN(m.meaning))
      LIMIT 50
    `)
    let rows = stmt.all(exact, prefix, sub) as Record<string, unknown>[]
    if (rows.length === 0) {
      const ftsstmt = db.prepare(`
        SELECT e.id,
          GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
          GROUP_CONCAT(DISTINCT r.reading) AS readings,
          GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
          MIN(CASE
            WHEN m.meaning = ?   THEN 1
            WHEN m.meaning LIKE ? THEN 2
            ELSE 3
          END) AS match_type
        FROM entries e
        LEFT JOIN kanji k ON e.id = k.entry_id
        LEFT JOIN readings r ON e.id = r.entry_id
        LEFT JOIN meanings m ON e.id = m.entry_id
        WHERE e.id IN (
          SELECT entry_id FROM meanings
          WHERE rowid IN (SELECT rowid FROM meanings_fts WHERE meanings_fts MATCH ?)
        )
        GROUP BY e.id
        ORDER BY match_type, LENGTH(MIN(m.meaning))
        LIMIT 50
      `)
      rows = ftsstmt.all(exact, prefix, `${q}*`) as Record<string, unknown>[]
    }
    return rows
  }

  ipcMain.handle('dictionary:search', async (_, query: string) => {
    if (!query) {
      return []
    }

    const queryType = detectQueryType(query)
    let results: Record<string, unknown>[]

    try {
      if (queryType === 'kanji') {
        // ----------------------------------------------------------------
        // Kanji search — rank: exact=1, prefix=2, substring=3
        // ----------------------------------------------------------------
        const exact = query
        const prefix = `${query}%`
        const sub = `%${query}%`
        let stmt = db.prepare(`
          SELECT e.id,
            GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
            GROUP_CONCAT(DISTINCT r.reading) AS readings,
            GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
            MIN(CASE
              WHEN k.kanji = ?   THEN 1
              WHEN k.kanji LIKE ? THEN 2
              ELSE 3
            END) AS match_type
          FROM entries e
          LEFT JOIN kanji k ON e.id = k.entry_id
          LEFT JOIN readings r ON e.id = r.entry_id
          LEFT JOIN meanings m ON e.id = m.entry_id
          WHERE e.id IN (SELECT entry_id FROM kanji WHERE kanji LIKE ?)
          GROUP BY e.id
          ORDER BY match_type, LENGTH(MIN(k.kanji))
          LIMIT 50
        `)
        results = stmt.all(exact, prefix, sub) as Record<string, unknown>[]

        if (results.length === 0) {
          stmt = db.prepare(`
            SELECT e.id,
              GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
              GROUP_CONCAT(DISTINCT r.reading) AS readings,
              GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
              MIN(CASE
                WHEN k.kanji = ?   THEN 1
                WHEN k.kanji LIKE ? THEN 2
                ELSE 3
              END) AS match_type
            FROM entries e
            LEFT JOIN kanji k ON e.id = k.entry_id
            LEFT JOIN readings r ON e.id = r.entry_id
            LEFT JOIN meanings m ON e.id = m.entry_id
            WHERE e.id IN (
              SELECT entry_id FROM kanji
              WHERE rowid IN (SELECT rowid FROM kanji_fts WHERE kanji_fts MATCH ?)
            )
            GROUP BY e.id
            ORDER BY match_type, LENGTH(MIN(k.kanji))
            LIMIT 50
          `)
          results = stmt.all(exact, prefix, `${query}*`) as Record<string, unknown>[]
        }
      } else if (queryType === 'kana') {
        // ----------------------------------------------------------------
        // Kana search — prefix matches beat substring matches
        // ----------------------------------------------------------------
        results = searchByReading(query)
      } else if (queryType === 'romaji') {
        // ----------------------------------------------------------------
        // Romaji search — convert to hiragana first, then:
        //   1. Search readings with the kana form (prefix-first)
        //   2. Also search English meanings with the original ASCII text
        //   3. Merge: kana hits first, then unique English-only hits
        //
        // This makes `kuruma` → くるま【車】 appear before "kuruma prawn"
        // ----------------------------------------------------------------
        const kana = romajiToHiragana(query.trim())
        const kanaResults: Record<string, unknown>[] = isFullyKana(kana)
          ? searchByReading(kana)
          : []

        const englishResults = searchByMeaning(query)

        const seenIds = new Set(kanaResults.map((r) => r.id))
        results = [
          ...kanaResults,
          ...englishResults.filter((r) => !seenIds.has(r.id))
        ]
      } else {
        // ----------------------------------------------------------------
        // Mixed / fallback — search all three columns
        // ----------------------------------------------------------------
        const sub = `%${query}%`
        let stmt = db.prepare(`
          SELECT e.id,
            GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
            GROUP_CONCAT(DISTINCT r.reading) AS readings,
            GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
            MIN(CASE
              WHEN k.kanji = ? OR r.reading = ? OR m.meaning = ? THEN 1
              WHEN k.kanji LIKE ? OR r.reading LIKE ? OR m.meaning LIKE ? THEN 2
              ELSE 3
            END) AS match_type
          FROM entries e
          LEFT JOIN kanji k ON e.id = k.entry_id
          LEFT JOIN readings r ON e.id = r.entry_id
          LEFT JOIN meanings m ON e.id = m.entry_id
          WHERE e.id IN (
            SELECT entry_id FROM kanji    WHERE kanji   LIKE ?
            UNION
            SELECT entry_id FROM readings WHERE reading LIKE ?
            UNION
            SELECT entry_id FROM meanings WHERE meaning LIKE ?
          )
          GROUP BY e.id
          ORDER BY match_type, LENGTH(MIN(COALESCE(k.kanji, r.reading, m.meaning)))
          LIMIT 50
        `)
        results = stmt.all(
          query, query, query,
          `${query}%`, `${query}%`, `${query}%`,
          sub, sub, sub
        ) as Record<string, unknown>[]

        if (results.length === 0) {
          stmt = db.prepare(`
            SELECT e.id,
              GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
              GROUP_CONCAT(DISTINCT r.reading) AS readings,
              GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
              MIN(CASE
                WHEN k.kanji = ? OR r.reading = ? OR m.meaning = ? THEN 1
                WHEN k.kanji LIKE ? OR r.reading LIKE ? OR m.meaning LIKE ? THEN 2
                ELSE 3
              END) AS match_type
            FROM entries e
            LEFT JOIN kanji k ON e.id = k.entry_id
            LEFT JOIN readings r ON e.id = r.entry_id
            LEFT JOIN meanings m ON e.id = m.entry_id
            WHERE e.id IN (
              SELECT entry_id FROM kanji
                WHERE rowid IN (SELECT rowid FROM kanji_fts WHERE kanji_fts MATCH ?)
              UNION
              SELECT entry_id FROM readings
                WHERE rowid IN (SELECT rowid FROM readings_fts WHERE readings_fts MATCH ?)
              UNION
              SELECT entry_id FROM meanings
                WHERE rowid IN (SELECT rowid FROM meanings_fts WHERE meanings_fts MATCH ?)
            )
            GROUP BY e.id
            ORDER BY match_type, LENGTH(MIN(COALESCE(k.kanji, r.reading, m.meaning)))
            LIMIT 50
          `)
          results = stmt.all(
            query, query, query,
            `${query}%`, `${query}%`, `${query}%`,
            `${query}*`, `${query}*`, `${query}*`
          ) as Record<string, unknown>[]
        }
      }

      // Strip the internal match_type column before returning to the renderer
      return results.map((result) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { match_type, ...rest } = result
        return rest
      })
    } catch (error) {
      console.error(`Error searching for "${query}":`, error)
      throw error
    }
  })
}
