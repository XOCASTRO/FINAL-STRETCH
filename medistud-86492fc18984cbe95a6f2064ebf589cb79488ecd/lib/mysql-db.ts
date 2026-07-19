import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clinic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function query(sql: string, values?: any[]) {
  try {
    const connection = await pool.getConnection()
    const [results] = await connection.execute(sql, values || [])
    connection.release()
    return results
  } catch (error) {
    console.error('MySQL Query Error:', error)
    throw error
  }
}

export async function getConnection() {
  return await pool.getConnection()
}

export default pool
