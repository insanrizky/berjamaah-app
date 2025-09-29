# Environment Variables Configuration

This document outlines all environment variables used in the Berjamaah application, their purposes, and configuration instructions.

## 📋 **Overview**

The application uses environment variables for configuration to keep sensitive data secure and allow different settings across environments (development, staging, production).

## 🔴 **Required Variables**

These variables are **CRITICAL** - the application will not function without them.

### **Database Configuration**

#### `DATABASE_URL`

- **Purpose**: Primary database connection string for Prisma
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://postgres:password@localhost:5432/berjamaah`
- **Production**: Use Supabase pooled connection URL

#### `DIRECT_URL`

- **Purpose**: Direct database connection for migrations and admin operations
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://postgres:password@localhost:5432/berjamaah`
- **Production**: Use Supabase direct connection URL

### **Authentication Configuration**

#### `NEXTAUTH_SECRET`

- **Purpose**: Secret key for signing JWT tokens and session encryption
- **Format**: Random string (minimum 32 characters)
- **Example**: `your-super-secret-key-here-32-chars-min`
- **Generate**: `openssl rand -base64 32`

#### `NEXTAUTH_URL`

- **Purpose**: Base URL for NextAuth callbacks and redirects
- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`

## 🟡 **Optional Variables**

These variables enable specific features but the app will work without them.

### **Email Service (User Notifications)**

#### `RESEND_API_KEY`

- **Purpose**: API key for Resend email service
- **Obtain**: [Resend Dashboard](https://resend.com/api-keys)
- **Example**: `re_abc123def456_ghi789jkl012mno345`

#### `RESEND_FROM`

- **Purpose**: Default sender email address
- **Format**: Valid email address
- **Example**: `noreply@yourdomain.com`
- **Default**: `noreply@berjamaah.id`

### **File Upload Service (Image Storage)**

#### `CLOUDFLARE_R2_ENDPOINT`

- **Purpose**: Cloudflare R2 storage endpoint URL
- **Format**: `https://account-id.r2.cloudflarestorage.com`
- **Obtain**: Cloudflare Dashboard > R2

#### `CLOUDFLARE_R2_ACCESS_KEY_ID`

- **Purpose**: R2 access key identifier
- **Obtain**: Cloudflare Dashboard > R2 > Manage R2 API tokens

#### `CLOUDFLARE_R2_SECRET_ACCESS_KEY`

- **Purpose**: R2 secret access key
- **Obtain**: Cloudflare Dashboard > R2 > Manage R2 API tokens

#### `CLOUDFLARE_R2_BUCKET_NAME`

- **Purpose**: Name of the R2 bucket for file storage
- **Example**: `berjamaah-uploads`

#### `CLOUDFLARE_R2_PUBLIC_URL`

- **Purpose**: Public URL for accessing uploaded files
- **Format**: `https://pub-abc123.r2.dev`
- **Obtain**: Cloudflare Dashboard > R2 > Custom domains

#### `CLOUDFLARE_R2_REGION`

- **Purpose**: R2 region (usually auto for Cloudflare)
- **Default**: `auto`

### **Application Configuration**

#### `NEXT_PUBLIC_SERVER_URL`

- **Purpose**: Base URL for the application (used in client-side code)
- **Development**: `http://localhost:3000`
- **Production**: `https://yourdomain.com`
- **Note**: Public variable (accessible in browser)

#### `NEXT_PUBLIC_APP_NAME`

- **Purpose**: Application name for branding
- **Default**: `Berjamaah POSKU Bandung`
- **Note**: Public variable (accessible in browser)

#### `NEXT_PUBLIC_LOGO_URL`

- **Purpose**: URL to application logo
- **Default**: `/favicon.ico`
- **Note**: Public variable (accessible in browser)

### **Vercel Configuration**

#### `VERCEL_URL`

- **Purpose**: Vercel deployment URL for production webhooks
- **Format**: `yourdomain.com` (without https://)
- **Example**: `berjamaah.poskubandung.org`

### **Webhook Automation**

#### `WEBHOOK_SECRET`

- **Purpose**: Secret key for securing webhook endpoints
- **Format**: Random string for authentication
- **Example**: `your-webhook-secret-key-here`

#### `PROCESS_SCHEDULED_ACTIVATION_USERS_WEBHOOK_URL`

- **Purpose**: Webhook URL for processing scheduled user activations
- **Format**: Full HTTPS URL
- **Example**: `https://yourdomain.com/api/webhooks/process-scheduled-activation-users`

#### `ACTIVATE_PROGRAMS_WEBHOOK_URL`

- **Purpose**: Webhook URL for activating programs
- **Format**: Full HTTPS URL
- **Example**: `https://yourdomain.com/api/webhooks/activate-programs`

#### `DEACTIVATE_PROGRAMS_WEBHOOK_URL`

- **Purpose**: Webhook URL for deactivating programs
- **Format**: Full HTTPS URL
- **Example**: `https://yourdomain.com/api/webhooks/deactivate-programs`

## 🚀 **Setup Instructions**

### **Development Environment**

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the required variables:**

   ```bash
   # Minimum setup for local development
   DATABASE_URL="postgresql://postgres:password@localhost:5432/berjamaah_dev"
   DIRECT_URL="postgresql://postgres:password@localhost:5432/berjamaah_dev"
   NEXTAUTH_SECRET="$(openssl rand -base64 32)"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Test the configuration:**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/api/test-db
   ```

### **Production Environment (Vercel)**

1. **Set environment variables in Vercel Dashboard:**
   - Go to Project Settings > Environment Variables
   - Add each required variable for "Production" environment

2. **Or use Vercel CLI:**

   ```bash
   vercel env add DATABASE_URL production
   vercel env add DIRECT_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   ```

3. **Redeploy after setting variables:**
   ```bash
   vercel --prod
   ```

## 🔧 **Environment-Specific Values**

### **Local Development**

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/berjamaah_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/berjamaah_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
```

### **Production (Supabase + Vercel)**

```bash
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_SERVER_URL="https://yourdomain.com"
```

## ⚠️ **Security Best Practices**

1. **Never commit `.env` files to version control**
2. **Use different secrets for different environments**
3. **Rotate secrets regularly**
4. **Use strong, random values for `NEXTAUTH_SECRET`**
5. **Limit database user permissions in production**
6. **Use environment-specific API keys**

## 🔍 **Troubleshooting**

### **Database Connection Issues**

```bash
# Test database connectivity
npm run dev
# Visit: http://localhost:3000/api/test-db
```

### **Authentication Issues**

- Verify `NEXTAUTH_SECRET` is set and consistent
- Check `NEXTAUTH_URL` matches your domain

### **Build Issues**

- Check that all required variables are set in Vercel
- Verify `DATABASE_URL` format is correct
- Ensure migrations can run with provided credentials

## 📚 **Related Documentation**

- [Database Commands](./DATABASE_COMMANDS.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Admin Setup](./ADMIN_SETUP.md)

---

**Last Updated:** September 29, 2025  
**For Issues:** Check the troubleshooting section or create an issue in the repository
