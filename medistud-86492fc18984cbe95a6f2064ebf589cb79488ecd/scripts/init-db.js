const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

async function initializeDatabase() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'clinic_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  try {
    const connection = await pool.getConnection()

    console.log('Checking if staff_users table exists...')
    const [tables] = await connection.execute("SHOW TABLES LIKE 'staff_users'")

    if (tables.length === 0) {
      console.log('staff_users table not found. Please run mysql-schema.sql first.')
      connection.release()
      process.exit(1)
    }

    console.log('Checking for existing admin user...')
    const [adminRows] = await connection.execute("SELECT email FROM staff_users WHERE email = 'admin@pticlinic.com'")

    if (adminRows.length === 0) {
      console.log('Creating default admin user...')

      const hashedPassword = await bcrypt.hash('admin123', 10)

      await connection.execute(
        `INSERT INTO staff_users 
         (email, full_name, password_hash, role, can_create_records, can_create_staff, can_edit_records, can_delete_records, department, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          'admin@pticlinic.com',
          'System Administrator',
          hashedPassword,
          'ADMIN',
          1,
          1,
          1,
          1,
          'Administration',
          1,
        ]
      )

      console.log('✓ Admin user created successfully!')
      console.log('  Email: admin@pticlinic.com')
      console.log('  Password: admin123')
    } else {
      console.log('Admin user already exists.')
    }

    console.log('\nCreating additional staff users...')

    const staffUsers = [
      {
        email: 'doctor@pticlinic.com',
        full_name: 'Dr. John Smith',
        password: 'doctor123',
        role: 'DOCTOR',
        can_create_records: 1,
        can_edit_records: 1,
        department: 'Medical',
      },
      {
        email: 'nurse@pticlinic.com',
        full_name: 'Jane Nurse',
        password: 'nurse123',
        role: 'NURSE',
        can_create_records: 1,
        can_edit_records: 1,
        department: 'Nursing',
      },
      {
        email: 'staff@pticlinic.com',
        full_name: 'Staff Member',
        password: 'staff123',
        role: 'STAFF',
        can_create_records: 0,
        can_edit_records: 0,
        department: 'General',
      },
      {
        email: 'viewer@pticlinic.com',
        full_name: 'Viewer Only',
        password: 'viewer123',
        role: 'VIEWER',
        can_create_records: 0,
        can_edit_records: 0,
        department: 'General',
      },
    ]

    for (const user of staffUsers) {
      const [existingUser] = await connection.execute('SELECT email FROM staff_users WHERE email = ?', [user.email])

      if (existingUser.length === 0) {
        const hashedPassword = await bcrypt.hash(user.password, 10)

        await connection.execute(
          `INSERT INTO staff_users 
           (email, full_name, password_hash, role, can_create_records, can_edit_records, can_delete_records, department, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.email, user.full_name, hashedPassword, user.role, user.can_create_records, user.can_edit_records, 0, user.department, 1]
        )

        console.log(`✓ ${user.role} user created: ${user.email}`)
      }
    }

    connection.release()
    console.log('\nDatabase initialization complete!')
    console.log('\nTest Users:')
    console.log('────────────────────────────────────────')
    console.log('ADMIN      | admin@pticlinic.com        | admin123')
    console.log('DOCTOR     | doctor@pticlinic.com       | doctor123')
    console.log('NURSE      | nurse@pticlinic.com        | nurse123')
    console.log('STAFF      | staff@pticlinic.com        | staff123')
    console.log('VIEWER     | viewer@pticlinic.com       | viewer123')
    console.log('────────────────────────────────────────')
    process.exit(0)
  } catch (error) {
    console.error('Error initializing database:', error)
    process.exit(1)
  }
}

initializeDatabase()
