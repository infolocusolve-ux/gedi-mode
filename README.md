This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Live "ON GEDI" presence counter (optional)

The landing screen shows a live count of visitors currently on a Gedi, powered by Supabase Realtime Presence. It's optional — without configuration the app runs normally and the counter falls back to a static "GEDI LIVE" label instead of a number.

To enable it:

1. Create or select a project at the [Supabase dashboard](https://supabase.com/dashboard).
2. Copy **Project Settings → API → Project URL** and **Project Settings → API → anon public (publishable) key**.
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with those values.
4. Confirm Realtime is enabled for the project (**Project Settings → Realtime** — on by default for new projects).
5. Add both variables to your deployment platform's environment settings as well (e.g. Vercel → Project Settings → Environment Variables).

Never put the `service_role` / secret key in `NEXT_PUBLIC_*` variables or any client code — only the publishable key is safe to expose in the browser. See `.env.example` for details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
