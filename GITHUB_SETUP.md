# GitHub Repository Setup Guide

Due to permission restrictions in this environment, please follow these steps manually from your terminal.

## Step 1: Navigate to Project Directory

```bash
cd /Users/aminehbeltran/resume-tailor
```

## Step 2: Initialize Git Repository

```bash
git init
git branch -M main
```

## Step 3: Create GitHub Repository

You have two options:

### Option A: Using GitHub Web Interface (Recommended)

1. Go to https://github.com/new
2. Repository name: `resume-tailor`
3. Description: "AI-powered resume tailoring tool"
4. Choose Public or Private
5. **Important**: Do NOT check "Initialize this repository with a README" (we already have one)
6. Click "Create repository"

### Option B: Using GitHub CLI (if you have it installed)

```bash
gh repo create resume-tailor --public --description "AI-powered resume tailoring tool" --source=. --remote=origin --push
```

If you use GitHub CLI, you can skip to Step 5.

## Step 4: Link Local Repository to GitHub

After creating the repository on GitHub, copy the repository URL (it will look like `https://github.com/YOUR_USERNAME/resume-tailor.git`), then run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/resume-tailor.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 5: Make Initial Commit and Push

```bash
git add .
git commit -m "Initial commit: Resume Tailor application"
git push -u origin main
```

## Verification

After completing these steps, verify the setup:

```bash
git remote -v
git status
```

You should see your GitHub repository URL listed as `origin`.

## Troubleshooting

If you encounter permission errors:
- Make sure you're running the commands from your own terminal (not through this sandboxed environment)
- Check that you have write permissions in the directory: `ls -ld /Users/aminehbeltran/resume-tailor`
- If git init fails, try: `sudo git init` (though this shouldn't be necessary)
