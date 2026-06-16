# Pile Computations

A web application for performing helical pile engineering computations. Built with Next.js and backed by Supabase, with support for exporting results as PDF reports.

🔗 **Live demo:** [helical-pile-computations.vercel.app](https://helical-pile-computations.vercel.app)

## Features

- Helical pile load and capacity calculations
- Interactive charts and data visualisation via Recharts
- PDF report generation and export
- Authentication and data persistence via Supabase
- Responsive UI built with Radix UI and Tailwind CSS

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19
- **Language:** TypeScript
- **Database / Auth:** Supabase
- **UI:** Radix UI, Tailwind CSS, Lucide icons
- **Charts:** Recharts
- **PDF Export:** pdf-lib, Puppeteer
- **Forms:** React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for auth and database)

### Installation

```bash
git clone https://github.com/HHadi03/pile-computations.git
cd pile-computations
npm install
```

### Environment Variables

Create a `.env.local` file in the root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment

The app is deployed on [Vercel](https://vercel.com). To deploy your own instance, connect the repository to Vercel and add the environment variables above in the project settings.
