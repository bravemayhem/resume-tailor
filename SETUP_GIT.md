# Git and GitHub Setup Instructions

Since there were permission issues initializing git automatically, please run these commands manually:

## 1. Initialize Git Repository

```bash
cd /Users/aminehbeltran/resume-tailor
git init
```

## 2. Create GitHub Repository

You have two options:

### Option A: Using GitHub Web Interface
1. Go to https://github.com/new
2. Create a new repository named `resume-tailor`
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL

### Option B: Using GitHub CLI (if installed)
```bash
gh repo create resume-tailor --public --source=. --remote=origin --push
```

## 3. Link Local Repository to GitHub

After creating the GitHub repository, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/resume-tailor.git
git branch -M main
git add .
git commit -m "Initial commit: Resume Tailor application"
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.
