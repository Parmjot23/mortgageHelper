# Mortgage Helper

A comprehensive full-stack Next.js application for managing mortgage leads, referrers, and checklist templates. Built with TypeScript, Prisma, and SQLite.

## Features

- **Lead Management**: Complete mortgage lead tracking with financial information, application status, and source tracking
- **Referrer Management**: Track bank referrers who send leads (BANK source type only)
- **Checklist Templates**: Manage document checklists organized by lead type (Purchase, Refinance, Other)
- **Voice Assistant**: AI-powered voice assistant using Google Gemini for hands-free project assistance
- **Application Workflow**: 5-stage status tracking from initial contact to approval

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **AI**: Google Gemini API for voice assistant
- **UI**: Custom components with Heroicons

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Set up the database**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npx prisma db seed
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Voice Assistant

The application includes an AI-powered voice assistant that can help you navigate and manage your mortgage leads:

- **Activation**: Click the microphone button in the bottom-right corner
- **Voice Commands**: Speak naturally about leads, referrers, templates, etc.
- **Text Input**: Type messages if voice isn't available
- **Context Aware**: The AI understands your current page and application state

### Example Voice Commands:
- "Create a new purchase lead for John Smith"
- "Show me all leads from the ABC Bank referrer"
- "Add a document checklist for refinance applications"
- "Update lead status to contacted"

## Application Structure

- **Dashboard**: Overview of leads, status distribution, and recent activity
- **Leads**: Manage mortgage applications with full financial details
- **Referrers**: Bank referrer management (BANK source type only)
- **Checklist Templates**: Document checklists organized by application type

## Database Schema

- **Leads**: Personal info, financial data, application status, source tracking
- **Referrers**: Bank referrer names and relationships
- **Checklist Templates**: Document checklists by lead type
- **Tasks**: Action items with due dates
- **Notes**: Lead-specific communications
- **Emails**: Email tracking and history

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
