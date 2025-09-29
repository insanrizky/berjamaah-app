# Database Commands Guide

## ✅ Optimized Commands Setup

Your package.json has been updated with clear, production-ready database commands that work both locally and on Vercel.

## 🚀 The 3 Commands You Need

### 1. **Database Refresh** (Reset + Migrate + Seed)

```bash
npm run db:refresh
```

**What it does:**

- ✅ Drops all tables and data
- ✅ Applies all migrations from scratch
- ✅ Seeds the database with initial data
- ✅ Perfect for: Starting fresh, fixing corrupted data

### 2. **Migrate Only** (Apply migrations without seeding)

```bash
npm run db:migrate
```

**What it does:**

- ✅ Applies pending migrations
- ✅ Does NOT run seed data
- ✅ Safe for production updates
- ✅ Perfect for: Adding new tables/columns

### 3. **Seed Only** (Add initial data)

```bash
npm run db:seed
```

**What it does:**

- ✅ Runs seed script only
- ✅ Adds initial/demo data
- ✅ Does NOT touch schema
- ✅ Perfect for: Adding test data

## 📋 Complete Command Reference

### Essential Commands

```bash
# 🔄 Complete database refresh (reset + migrate + seed)
npm run db:refresh

# 🛠️ Apply migrations only (safe for production)
npm run db:migrate

# 🌱 Seed database only
npm run db:seed

# 📊 Open Prisma Studio (database GUI)
npm run db:studio

# 🏗️ Build for production (includes migrations)
npm run build
```

## 🔧 How It Works

### **Local Development Flow:**

1. **Make schema changes** in `prisma/schema.prisma`
2. **Apply migration:** `npm run db:migrate` (creates and applies migration)
3. **Seed if needed:** `npm run db:seed`

### **Fresh Start Flow:**

```bash
npm run db:refresh  # One command does it all!
```

### **Production Deploy Flow:**

```bash
npm run build  # Automatically runs migrations + build
```

## 🛡️ Safety Features

### **Local vs Production:**

- **Local:** Uses `migrate dev` (interactive, safe)
- **Production:** Uses `migrate deploy` (non-interactive, fast)

### **Seed Separation:**

- Migrations run automatically in production
- Seeds only run when explicitly called
- No accidental data overwrites

### **Build Integration:**

- Vercel automatically runs migrations during build
- No manual database setup needed
- Zero-downtime deployments

## 📊 Command Matrix

| Command      | Local | Vercel | Migrations | Seeding | Data Loss |
| ------------ | ----- | ------ | ---------- | ------- | --------- |
| `db:refresh` | ✅    | ❌     | ✅         | ✅      | ⚠️ Yes    |
| `db:migrate` | ✅    | ✅     | ✅         | ❌      | ❌ No     |
| `db:seed`    | ✅    | ✅     | ❌         | ✅      | ❌ No     |
| `build`      | ✅    | ✅     | ✅         | ❌      | ❌ No     |

## 🎯 Common Scenarios

### **Starting Development:**

```bash
npm run db:refresh
```

### **Added new table/column:**

```bash
npm run db:migrate
```

### **Need test data:**

```bash
npm run db:seed
```

### **Database corrupted:**

```bash
npm run db:refresh
```

### **Production deployment:**

```bash
# Happens automatically with:
npm run build
```

### **Creating new migration:**

```bash
# Just run migrate after making schema changes
npm run db:migrate
# Prisma will prompt for migration name automatically
```

## 🔍 Troubleshooting

### **"Migration failed"**

```bash
npm run db:refresh  # Start fresh
```

### **"Out of sync"**

```bash
npm run db:refresh  # Reset and seed in one command
```

### **"Generate client"**

```bash
# Client is auto-generated with migrations and builds
# But if needed manually:
npx prisma generate
```

### **Vercel deployment issues:**

- Ensure `DATABASE_URL` is set in Vercel environment
- Check build logs for migration errors
- Verify `DIRECT_URL` for connection pooling

## 🎛️ Environment Variables

Ensure these are set:

### **Local (.env.local):**

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/berjamaah_local"
DIRECT_URL="postgresql://user:pass@localhost:5432/berjamaah_local"
```

### **Vercel (Environment Variables):**

```env
DATABASE_URL="postgresql://..."  # Supabase pooled connection
DIRECT_URL="postgresql://..."    # Supabase direct connection
```

## ⚡ Quick Reference

```bash
# The 3 main commands:
npm run db:refresh  # 🔄 Fresh start
npm run db:migrate  # 🛠️ Update schema
npm run db:seed     # 🌱 Add data

# For debugging:
npm run db:studio   # 📊 Visual database browser
```

This setup ensures your database operations are consistent, safe, and work perfectly in both development and production! 🚀
