# How to Run the PTI Clinic Management System

## Simple Answer

**Run everything from this directory:** `/vercel/share/v0-project/`

That's it. Don't go into any subdirectories. This is your main project folder.

---

## Step-by-Step Setup

### 1. Open Your Code Editor
- Open the folder: `/vercel/share/v0-project/`
- This is your complete project - everything is here

### 2. Install Dependencies (First Time Only)
```bash
pnpm install
```
Or if you prefer npm:
```bash
npm install
```

### 3. Set Up Database (MySQL)
If you don't have MySQL running locally, you need to:
1. Install MySQL on your computer
2. Start MySQL service
3. Create a database:
```bash
mysql -u root -p < mysql-schema.sql
```

### 4. Configure Environment Variables
Create a file named `.env.local` in the project root with:
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=clinic_db
```

Replace `your_password` with your MySQL password.

### 5. Start the Development Server
```bash
pnpm dev
```

### 6. Open in Browser
Go to: `http://localhost:3000`

**Login with demo credentials:**
- Email: `admin@pticlinic.com`
- Password: `admin123`

---

## Project Structure

```
/vercel/share/v0-project/          ← YOUR PROJECT (run from here)
├── app/                           ← React/Next.js pages and components
├── lib/                           ← Utility functions and helpers
├── public/                        ← Static files (passports will be stored here)
├── package.json                   ← Project dependencies
├── mysql-schema.sql               ← Database schema
├── .env.local                     ← Your local environment variables
└── node_modules/                  ← Dependencies (auto-generated)
```

---

## Important Notes

1. **Never go into subdirectories to run the project** - Always use `/vercel/share/v0-project/` as your main working directory

2. **Database is required** - The app needs MySQL running. If you don't have MySQL:
   - Install it from mysql.com
   - Or use a service like AWS RDS, PlanetScale, or similar
   - Then update `.env.local` with the correct credentials

3. **Passport uploads** - Photos are stored in `/public/passports/` directory automatically

4. **Demo accounts available:**
   - Admin: `admin@pticlinic.com` / `admin123`
   - Doctor: `doctor@pticlinic.com` / `doctor123`
   - Nurse: `nurse@pticlinic.com` / `nurse123`
   - Receptionist: Can be created by admin

---

## Common Commands

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build |
| `pnpm lint` | Check code quality |

---

## Troubleshooting

**Problem: "Cannot find module"**
- Solution: Run `pnpm install` again

**Problem: "MySQL connection failed"**
- Solution: Check your `.env.local` file has correct MySQL credentials
- Make sure MySQL service is running

**Problem: "Port 3000 already in use"**
- Solution: Run on different port: `pnpm dev -- -p 3001`

**Problem: "Database tables don't exist"**
- Solution: Run `mysql -u root -p < mysql-schema.sql` to create tables

---

## That's It!

Your project is ready to go. All the code is in this single directory. No confusing nested folders. Just develop, save, and the dev server will automatically reload.

Happy coding!
