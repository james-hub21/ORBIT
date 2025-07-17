# ORBIT System - VS Code Setup Guide

## Complete Setup Instructions for Visual Studio Code with PowerShell

### Prerequisites Checklist

Before starting, ensure you have:
- [ ] Windows 10/11 with PowerShell 5.1 or later
- [ ] Node.js 18+ installed from [nodejs.org](https://nodejs.org/)
- [ ] Visual Studio Code installed from [code.visualstudio.com](https://code.visualstudio.com/)
- [ ] Git for Windows (optional) from [git-scm.com](https://git-scm.com/)

### Step 1: Project Setup

1. **Extract/Copy** the ORBIT project folder to your desired location (e.g., `C:\Projects\orbit`)
2. **Open VS Code** → File → Open Folder → Select the ORBIT project folder
3. **Install Extensions**: When prompted, click "Install" for recommended extensions, or install manually:
   - Tailwind CSS IntelliSense
   - TypeScript and JavaScript Language Features
   - Prettier - Code formatter
   - PowerShell
   - Auto Rename Tag
   - Path Intellisense

### Step 2: Terminal Configuration

1. **Open Terminal**: Press `Ctrl + Shift + ` (backtick) or View → Terminal
2. **Select PowerShell**: Click the dropdown next to the `+` icon and select "PowerShell"
3. **Set as Default**: Click the dropdown → Select Default Profile → PowerShell

### Step 3: Automated Setup (Recommended)

```powershell
# Run the automated setup script
.\scripts\dev.ps1
```

This script will:
- Check Node.js installation
- Create .env file from template
- Install dependencies
- Set up database schema
- Start the development server

### Step 4: Manual Setup (Alternative)

If you prefer manual setup or the script fails:

#### Install Dependencies
```powershell
npm install
```

#### Environment Configuration
```powershell
# Copy environment template
Copy-Item .env.example .env

# Edit .env file (use VS Code editor)
code .env
```

Fill in your Supabase credentials:
```env
DATABASE_URL=postgresql://postgres:your_password@db.project_id.supabase.co:5432/postgres
SESSION_SECRET=your_very_secure_random_string_here
NEXT_PUBLIC_SUPABASE_URL=https://your_project_id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_SUPABASE_URL=https://your_project_id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

#### Database Setup
```powershell
# Push database schema to Supabase
npm run db:push
```

#### Start Development
```powershell
# Start the development server
npm run dev
```

### Step 5: Supabase Setup

1. **Create Account**: Go to [supabase.com](https://supabase.com) and sign up
2. **New Project**: Click "New Project" and fill in:
   - Project name: `orbit-library-system`
   - Database password: Choose a secure password
   - Region: Select closest to your location
3. **Wait for Setup**: Database provisioning takes 2-3 minutes
4. **Get Credentials**:
   - Go to Settings → API
   - Copy "Project URL" and "anon public" key
   - Go to Settings → Database
   - Copy "Connection string" from Connection pooling section
   - Replace `[YOUR-PASSWORD]` with your database password

### Step 6: Development Workflow

#### VS Code Features
- **IntelliSense**: Auto-completion for TypeScript, React, and Tailwind
- **Error Highlighting**: Real-time error detection
- **Format on Save**: Automatic code formatting
- **Git Integration**: Built-in version control
- **Integrated Terminal**: Run commands without leaving VS Code

#### Common Commands
```powershell
# Development server
npm run dev

# Database operations
npm run db:push        # Push schema changes
npm run db:studio      # Open Drizzle Studio

# Build for production
npm run build

# TypeScript checking
npm run check
```

#### File Structure Navigation
```
orbit/
├── client/src/         # Frontend React app
│   ├── components/     # UI components
│   ├── pages/         # Route components
│   └── hooks/         # Custom React hooks
├── server/            # Backend Express app
├── shared/            # Shared types/schemas
├── api/               # Vercel serverless functions
└── scripts/           # PowerShell scripts
```

### Step 7: Deployment to Vercel

#### Quick Deploy
```powershell
# Run automated deployment
.\scripts\deploy.ps1
```

#### Manual Deploy
```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Step 8: Environment Variables for Production

In your Vercel dashboard, add these environment variables:
- `DATABASE_URL` - Your Supabase database connection string
- `SESSION_SECRET` - A secure random string (use password generator)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NODE_ENV` - Set to `production`

### Troubleshooting

#### Common Issues

**1. "npm is not recognized"**
- Solution: Restart VS Code after installing Node.js

**2. "PowerShell execution policy"**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**3. "Database connection failed"**
- Check DATABASE_URL format
- Verify Supabase project is active
- Ensure password is correct

**4. "Module not found" errors**
- Run `npm install` to install dependencies
- Check if all files are in the correct locations

**5. "Port already in use"**
- Stop other applications using port 5000
- Or change port in server configuration

#### Getting Help
- Check console output for error messages
- Review the main README.md for additional details
- Verify all environment variables are set correctly
- Ensure Supabase database is properly configured

### VS Code Extensions for Better Development

Essential extensions for ORBIT development:
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **TypeScript Importer** - Auto-import TypeScript modules
- **Prettier - Code formatter** - Consistent code formatting
- **Auto Rename Tag** - Rename HTML/JSX tags automatically
- **Bracket Pair Colorizer** - Visual bracket matching
- **GitLens** - Enhanced Git capabilities
- **Thunder Client** - REST API testing (alternative to Postman)

### Performance Tips

1. **Use TypeScript strict mode** for better error catching
2. **Enable format on save** for consistent code style
3. **Use the integrated terminal** for faster development
4. **Leverage IntelliSense** for faster coding
5. **Use the debugger** for troubleshooting

### Final Checklist

Before considering setup complete:
- [ ] All dependencies installed successfully
- [ ] .env file configured with correct values
- [ ] Database schema pushed to Supabase
- [ ] Development server starts without errors
- [ ] Application accessible at http://localhost:5000
- [ ] VS Code extensions installed and working
- [ ] No TypeScript errors in the editor

Your ORBIT system is now ready for development and deployment!