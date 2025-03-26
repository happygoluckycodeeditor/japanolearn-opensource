import { ipcMain } from 'electron'
import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

// Function to detect query type
function detectQueryType(query: string): 'kanji' | 'kana' | 'english' | 'all' {
  // Check if query contains any Kanji (common Unicode range)
  if (/[一-龯]/.test(query)) {
    return 'kanji'
  }
  // Check if query is exclusively Hiragana/Katakana (including prolonged sound mark)
  if (/^[\u3040-\u30FFー]+$/.test(query)) {
    return 'kana'
  }
  // Check if query contains only English letters (and spaces)
  if (/^[a-zA-Z\s]+$/.test(query)) {
    return 'english'
  }
  // Fallback: if mixed or ambiguous, search in all columns
  return 'all'
}

export function setupDictionaryHandlers(): void {
  // Connect to the SQLite database
  const dbPath = app.isPackaged
    ? path.join(process.resourcesPath, 'jmdict.sqlite')
    : path.join(app.getAppPath(), 'resources', 'jmdict.sqlite')

  const db = new Database(dbPath)

  ipcMain.handle('dictionary:search', async (_, query: string) => {
    if (!query) {
      return []
    }

    const queryType = detectQueryType(query)
    let stmt, results

    try {
      if (queryType === 'kanji') {
        // First try exact match in kanji table with improved sorting
        stmt = db.prepare(`
          SELECT e.id,
            GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
            GROUP_CONCAT(DISTINCT r.reading) AS readings,
            GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
            MIN(CASE
              WHEN k.kanji = ? THEN 1
              WHEN k.kanji LIKE ? THEN 2
              ELSE 3
            END) AS match_type
          FROM entries e
          LEFT JOIN kanji k ON e.id = k.entry_id
          LEFT JOIN readings r ON e.id = r.entry_id
          LEFT JOIN meanings m ON e.id = m.entry_id
          WHERE e.id IN (
            SELECT entry_id FROM kanji
            WHERE kanji LIKE ?
          )
          GROUP BY e.id
          ORDER BY match_type, LENGTH(MIN(k.kanji))
          LIMIT 50
        `)
        results = stmt.all(query, `%${query}%`, `%${query}%`)

        // If no results, try FTS search with improved sorting
        if (results.length === 0) {
          stmt = db.prepare(`
            SELECT e.id,
              GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
              GROUP_CONCAT(DISTINCT r.reading) AS readings,
              GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
              MIN(CASE
                WHEN k.kanji = ? THEN 1
                WHEN k.kanji LIKE ? THEN 2
                ELSE 3
              END) AS match_type
            FROM entries e
            LEFT JOIN kanji k ON e.id = k.entry_id
            LEFT JOIN readings r ON e.id = r.entry_id
            LEFT JOIN meanings m ON e.id = m.entry_id
            WHERE e.id IN (
              SELECT entry_id FROM kanji
              WHERE rowid IN (
                SELECT rowid FROM kanji_fts
                WHERE kanji_fts MATCH ?
              )
            )
            GROUP BY e.id
            ORDER BY match_type, LENGTH(MIN(k.kanji))
            LIMIT 50
          `)
          results = stmt.all(query, `%${query}%`, `${query}*`)
        }
      } else if (queryType === 'kana') {
        // First try exact match in readings table with improved sorting
        stmt = db.prepare(`
          SELECT e.id,
            GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
            GROUP_CONCAT(DISTINCT r.reading) AS readings,
            GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
            MIN(CASE
              WHEN r.reading = ? THEN 1
              WHEN r.reading LIKE ? THEN 2
              ELSE 3
            END) AS match_type
          FROM entries e
          LEFT JOIN kanji k ON e.id = k.entry_id
          LEFT JOIN readings r ON e.id = r.entry_id
          LEFT JOIN meanings m ON e.id = m.entry_id
          WHERE e.id IN (
            SELECT entry_id FROM readings
            WHERE reading LIKE ?
          )
          GROUP BY e.id
          ORDER BY match_type, LENGTH(MIN(r.reading))
          LIMIT 50
        `)
        results = stmt.all(query, `%${query}%`, `%${query}%`)

        // If no results, try FTS search with improved sorting
        if (results.length === 0) {
          stmt = db.prepare(`
            SELECT e.id,
              GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
              GROUP_CONCAT(DISTINCT r.reading) AS readings,
              GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
              MIN(CASE
                WHEN r.reading = ? THEN 1
                WHEN r.reading LIKE ? THEN 2
                ELSE 3
              END) AS match_type
            FROM entries e
            LEFT JOIN kanji k ON e.id = k.entry_id
            LEFT JOIN readings r ON e.id = r.entry_id
            LEFT JOIN meanings m ON e.id = m.entry_id
            WHERE e.id IN (
              SELECT entry_id FROM readings
              WHERE rowid IN (
                SELECT rowid FROM readings_fts
                WHERE readings_fts MATCH ?
              )
            )
            GROUP BY e.id
            ORDER BY match_type, LENGTH(MIN(r.reading))
            LIMIT 50
          `)
          results = stmt.all(query, `%${query}%`, `${query}*`)
        }
      } else if (queryType === 'english') {
        // First try exact match in meanings table with improved sorting
        stmt = db.prepare(`
          SELECT e.id,
            GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
            GROUP_CONCAT(DISTINCT r.reading) AS readings,
            GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
            MIN(CASE
              WHEN m.meaning = ? THEN 1
              WHEN m.meaning LIKE ? THEN 2
              ELSE 3
            END) AS match_type
          FROM entries e
          LEFT JOIN kanji k ON e.id = k.entry_id
          LEFT JOIN readings r ON e.id = r.entry_id
          LEFT JOIN meanings m ON e.id = m.entry_id
          WHERE e.id IN (
            SELECT entry_id FROM meanings
            WHERE meaning LIKE ?
          )
          GROUP BY e.id
          ORDER BY match_type, LENGTH(MIN(m.meaning))
          LIMIT 50
        `)
        results = stmt.all(query, `%${query}%`, `%${query}%`)

        // If no results, try FTS search with improved sorting
        if (results.length === 0) {
          stmt = db.prepare(`
            SELECT e.id,
              GROUP_CONCAT(DISTINCT k.kanji) AS kanji,
              GROUP_CONCAT(DISTINCT r.reading) AS readings,
              GROUP_CONCAT(DISTINCT m.meaning) AS meanings,
              MIN(CASE
                WHEN m.meaning = ? THEN 1
                WHEN m.meaning LIKE ? THEN 2
                ELSE 3
              END) AS match_type
            FROM entries e
            LEFT JOIN kanji k ON e.id = k.entry_id
            LEFT JOIN readings r ON e.id = r.entry_id
            LEFT JOIN meanings m ON e.id = m.entry_id
            WHERE e.id IN (
              SELECT entry_id FROM meanings
              WHERE rowid IN (
                SELECT rowid FROM meanings_fts
                WHERE meanings_fts MATCH ?
              )
            )
            GROUP BY e.id
            ORDER BY match_type, LENGTH(MIN(m.meaning))
            LIMIT 50
          `)
          results = stmt.all(query, `%${query}%`, `${query}*`)
        }
      } else {
        // Fallback: search in all columns
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
            SELECT entry_id FROM kanji WHERE kanji LIKE ?
            UNION
            SELECT entry_id FROM readings WHERE reading LIKE ?
            UNION
            SELECT entry_id FROM meanings WHERE meaning LIKE ?
          )
          GROUP BY e.id
          ORDER BY match_type,
            CASE
              WHEN k.kanji LIKE ? THEN LENGTH(MIN(k.kanji))
              WHEN r.reading LIKE ? THEN LENGTH(MIN(r.reading))
              ELSE LENGTH(MIN(m.meaning))
            END
          LIMIT 50
        `)
        results = stmt.all(
          query,
          query,
          query,
          `%${query}%`,
          `%${query}%`,
          `%${query}%`,
          `%${query}%`,
          `%${query}%`,
          `%${query}%`,
          `%${query}%`,
          `%${query}%`
        )

        // If no results, try FTS search with improved sorting
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
            ORDER BY match_type,
              CASE
                WHEN k.kanji LIKE ? THEN LENGTH(MIN(k.kanji))
                WHEN r.reading LIKE ? THEN LENGTH(MIN(r.reading))
                ELSE LENGTH(MIN(m.meaning))
              END
            LIMIT 50
          `)
          results = stmt.all(
            query,
            query,
            query,
            `%${query}%`,
            `%${query}%`,
            `%${query}%`,
            `${query}*`,
            `${query}*`,
            `${query}*`,
            `%${query}%`,
            `%${query}%`
          )
        }
      }

      // Remove the match_type field from results before sending
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
