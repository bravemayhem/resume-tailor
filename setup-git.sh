#!/bin/bash

# Resume Tailor - Git and GitHub Setup Script

echo "🚀 Setting up Git repository for Resume Tailor..."

# Initialize git repository
echo "📦 Initializing git repository..."
git init

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found!"
    read -p "Do you want to create the GitHub repository using GitHub CLI? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔗 Creating GitHub repository..."
        gh repo create resume-tailor --public --source=. --remote=origin --push
        echo "✅ Repository created and linked!"
        exit 0
    fi
fi

# Manual setup instructions
echo ""
echo "📝 Manual GitHub Setup:"
echo "1. Go to https://github.com/new"
echo "2. Create a new repository named 'resume-tailor'"
echo "3. Do NOT initialize with README, .gitignore, or license"
echo "4. Copy the repository URL"
echo ""
read -p "Enter your GitHub repository URL (or press Enter to skip): " repo_url

if [ ! -z "$repo_url" ]; then
    echo "🔗 Linking to remote repository..."
    git remote add origin "$repo_url"
    git branch -M main
    git add .
    git commit -m "Initial commit: Resume Tailor application"
    echo "📤 Pushing to GitHub..."
    git push -u origin main
    echo "✅ Setup complete!"
else
    echo "⏭️  Skipping remote setup. You can add it later with:"
    echo "   git remote add origin YOUR_REPO_URL"
    echo "   git push -u origin main"
fi
