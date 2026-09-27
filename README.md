# ASCIIgram

A social platform for ASCII art — an Instagram-style feed where users create, share, like, and comment on ASCII-art posts, with profiles, follows, hashtags, trending, and an explore page. Built with Next.js (App Router) and backed by Neon Postgres.

## What it does

- **Create posts** — compose ASCII art in the built-in ASCII editor (`components/ascii-editor.tsx`) and publish to your profile.
- **Feed & explore** — chronological feed of followed users, an explore grid, and a trending page.
- **Social graph** — follow/unfollow users, user profiles with avatar editor (pixel-art avatar maker).
- **Engagement** — like posts, comment threads, hashtag pages (`/tag/[tag]`).
- **Auth** — register/login/logout with session cookies, protected routes via `middleware.ts`.
- **Dark/light theme** — via `next-themes`.

## Features

- Pixel-art CSS aesthetic with a retro terminal vibe (`app/pixel-art.css`)
- Full CRUD for posts (`/api/posts`, `/api/posts/[id]`, likes, comments)
- Auth API (`/api/auth/login|register|logout|me`)
- Profile API with avatar upload (`/api/profile/avatar`)
- Feed, trending, and hashtag APIs
- Mobile nav + responsive layout
- shadcn/ui component library (Radix primitives) + Embla carousel + Recharts

## Tech stack

- [Next.js](https://nextjs.org/) 15 (App Router, SSR + API routes)
- [React](https://react.dev/) 19 + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 3
- [Neon](https://neon.tech/) Postgres via `@neondatabase/serverless`
- [shadcn/ui](https://ui.shadcn.com/) on [Radix UI](https://www.radix-ui.com/)
- [Lucide](https://lucide.dev/) icons, React Hook Form + Zod, `next-themes`
- Package manager: [pnpm](https://pnpm.io/)

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up the database (Neon Postgres or any Postgres)
#    Create your tables, then add the connection string:
cp .env.example .env   # if present; otherwise create .env
# .env:
# DATABASE_URL=postgres://user:password@host/db

# 3. Run the dev server
pnpm dev
# open http://localhost:3000

# 4. Production build + start
pnpm build && pnpm start
```

## Project structure

```
.
├── app/
│   ├── api/                  # REST API routes (auth, posts, feed, comments, likes, follows, profile, trending, hashtags)
│   ├── create/               # Post creation page (ASCII editor)
│   ├── explore/ feed/        # Explore grid + home feed
│   ├── login/ register/      # Auth pages
│   ├── post/[id]/            # Single post view
│   ├── profile/              # Current-user profile
│   ├── tag/[tag]/ trending/  # Hashtag + trending pages
│   ├── layout.tsx globals.css pixel-art.css
│   └── page.tsx              # Landing / home
├── components/
│   ├── ascii-editor.tsx      # ASCII art composer
│   ├── pixel-avatar-editor.tsx
│   ├── create-post-form.tsx feed-post.tsx comment-*.tsx follow-button.tsx
│   └── ui/                   # shadcn/ui primitives
├── hooks/  use-auth.tsx use-toast.ts
├── lib/    db.ts auth.ts utils.ts
└── middleware.ts             # Route protection
```

## Environment variables

| Variable     | Required | Description                          |
|--------------|----------|--------------------------------------|
| `DATABASE_URL` | Yes    | Postgres connection string (Neon)    |

No other secrets needed. Never commit `.env` — it is in `.gitignore`.

## Deployment

This is a **dynamic** app (SSR + API routes + database), so it needs a Node server, not a static host:

1. Provision a Postgres database (Neon recommended) and set `DATABASE_URL`.
2. Deploy to Vercel, Netlify, or any Node host: `pnpm build && pnpm start`.
3. Set the `DATABASE_URL` environment variable on the host.
4. Static hosts (Cloudflare Pages static / GitHub Pages) are **not** suitable — the API routes and auth need a server.

## License

Free to use and modify.

---

Built by Girish Lade — [ladestack.in](https://ladestack.in)
