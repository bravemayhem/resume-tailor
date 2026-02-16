# Resume Tailor

A web application that helps job seekers customize their resumes for specific job applications using AI.

## Features

- **Master Resume Management**: Store and manage your master resume in Markdown format
- **AI-Powered Tailoring**: Uses Anthropic's Claude API to tailor your resume to job descriptions
- **Live Preview**: Edit your resume with a split-screen Markdown editor and live preview
- **Multiple Templates**: Choose from different CSS themes for your resume
- **PDF Export**: Export your tailored resume as a professional PDF

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Setup

### Option 1: Environment Variable (Recommended for Security)
1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
2. Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. Restart the development server if running.

### Option 2: Browser Settings
1. Start the app and go to the Settings page.
2. Enter your Anthropic API key. It will be stored in your browser's local storage.

## Usage

1. Create or import your Master Resume
3. Paste a job description and let AI tailor your resume
4. Edit and export as PDF

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Anthropic Claude API
- react-markdown
- react-to-print
