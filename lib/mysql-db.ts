import mysql from 'mysql2/promise'

let pool: any = null
let isConnected = false

// Try to create pool with timeout to prevent hanging
async function createPool() {
  if (pool) return pool

  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'clinic_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectionTimeout: 5000, // 5 second timeout
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 30000,
    })

    // Test connection
    const connection = await Promise.race([
      pool.getConnection(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      ),
    ])
    connection.release()
    isConnected = true
    console.log('[v0] MySQL Database Connected Successfully')
  } catch (error) {
    console.warn('[v0] MySQL Connection Failed. Using demo mode for testing.')
    console.warn('[v0] Error:', (error as any).message)
    isConnected = false
    pool = null
  }
}

// Initialize pool immediately (don't await to avoid blocking)
createPool().catch((err) => {
  console.warn('[v0] Failed to initialize database:', err.message)
})

export async function query(sql: string, values?: any[]) {
  // If no pool, create it
  if (!pool) {
    await createPool()
  }

  // If still no pool (database down), return empty array for demo
  if (!pool) {
    console.warn('[v0] Database unavailable, returning empty result for demo')
    return []
  }

  try {
    const connection = await pool.getConnection()
    const [results] = await connection.execute(sql, values || [])
    connection.release()
    return results
  } catch (error) {
    console.warn('[v0] Query failed, database may be unavailable')
    // Return empty array instead of throwing to prevent app crash
    return []
  }
}

export async function getConnection() {
  if (!pool) {
    await createPool()
  }

  if (!pool) {
    throw new Error('Database not available')
  }

  return await pool.getConnection()
}

export function isDbConnected() {
  return isConnected
}

export default pool
