# PTI Clinic - Simple Start Guide

## The Problem You Had
The app was hanging because it was trying to connect to MySQL on startup without a database set up.

## The Fix
I've updated the app to:
- Not hang when MySQL isn't available
- Work in "demo mode" without a database
- Handle database unavailability gracefully

## How to Run (3 Simple Steps)

### Step 1: Open Terminal in Project Directory
```bash
cd /vercel/share/v0-project
```

### Step 2: Start the Development Server
```bash
pnpm dev
```

**That's it!** The app will start immediately without hanging. It will work in demo mode.

### Step 3: Open in Browser
```
http://localhost:3000
```

**Login with:**
- Email: `admin@pticlinic.com`
- Password: `admin123`

---

## Optional: Set Up Real Database (if you want MySQL)

If you want to use a real MySQL database instead of demo mode:

### 1. Install MySQL (if not already installed)
```bash
# On Mac
brew install mysql

# On Windows
# Download from https://dev.mysql.com/downloads/mysql/

# On Linux
sudo apt-get install mysql-server
```

### 2. Start MySQL Service
```bash
# On Mac/Linux
mysql.server start

# On Windows (after installation, MySQL should auto-start)
```

### 3. Create Database
```bash
mysql -u root -p < mysql-schema.sql
# When prompted, enter your MySQL root password (or press Enter if no password)
```

### 4. Create `.env.local` File in Project Root
Create a new file called `.env.local` and add:
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=clinic_db
```

Replace `your_password_here` with your MySQL root password (or leave empty if no password).

### 5. Restart Dev Server
```bash
pnpm dev
```

Now it will use the real MySQL database instead of demo mode.

---

## Troubleshooting

### App still hangs?
1. Make sure port 3000 is free:
   ```bash
   lsof -i :3000  # Check what's using port 3000
   kill -9 <PID>   # Kill the process (replace <PID> with the number shown)
   ```

2. Clear the build cache:
   ```bash
   rm -rf .next
   pnpm dev
   ```

### Can't login even with demo credentials?
- Check browser console for errors (F12 → Console tab)
- Make sure you're using the correct email: `admin@pticlinic.com`

### Want to switch back to demo mode?
- Delete or comment out the `.env.local` file
- Restart the dev server

---

## Where Files Are

Everything is in one place:
```
/vercel/share/v0-project/
├── package.json          (dependencies)
├── .env.local.example    (copy this to .env.local)
├── mysql-schema.sql      (database structure)
├── app/                  (all pages and components)
├── lib/                  (utilities and helpers)
└── public/               (static files)
```

**That's it!** The project is ready to use.
