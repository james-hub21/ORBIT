# ORBIT System - Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- A Supabase account and project
- A Vercel account
- PowerShell (for Windows users)

## Step 1: Clone and Setup

1. Download/clone the project to your local machine
2. Open PowerShell and navigate to the project directory
3. Install dependencies:
```powershell
npm install
```

## Step 2: Supabase Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Create a new project (or use existing)
3. Wait for the database to be provisioned
4. Navigate to Settings → Database
5. Under "Connection string", copy the "URI" connection string
6. Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Environment Variables

1. Copy the environment template:
```powershell
Copy-Item .env.example .env
```

2. Edit `.env` file with your actual values:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
SESSION_SECRET=your-very-secure-random-string-here
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase
VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase
```

## Step 4: Database Migration

Push the database schema to Supabase:
```powershell
npm run db:push
```

## Step 5: Local Testing

Test the application locally:
```powershell
npm run dev
```

Visit `http://localhost:5000` to ensure everything works.

## Step 6: Vercel Deployment

### Option A: Vercel CLI (Recommended)

1. Install Vercel CLI:
```powershell
npm install -g vercel
```

2. Login to Vercel:
```powershell
vercel login
```

3. Deploy:
```powershell
vercel --prod
```

### Option B: Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import from Git (connect your repository)
4. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 7: Configure Production Environment

In your Vercel project settings, add these environment variables:

```
DATABASE_URL=your_supabase_database_url
SESSION_SECRET=your_session_secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

## Step 8: Domain Configuration

1. In Vercel, go to your project settings
2. Navigate to "Domains"
3. Add your custom domain or use the provided `.vercel.app` domain

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify DATABASE_URL is correctly formatted
   - Check Supabase project is active
   - Ensure password is correct

2. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Review build logs for specific errors

3. **Authentication Issues**
   - Confirm Supabase environment variables are set
   - Check if authentication is properly configured

4. **Missing Environment Variables**
   - Ensure all required variables are set in both `.env` and Vercel
   - Double-check variable names (case-sensitive)

## Production Monitoring

After deployment:
- Monitor Vercel function logs
- Check Supabase database performance
- Verify all features work as expected
- Test user authentication flow

## Rollback Strategy

If issues arise:
1. Revert to previous Vercel deployment
2. Check environment variables
3. Verify database schema integrity
4. Test locally before redeploying

For additional support, refer to the main README.md file.