# ProofWork — a beginner-friendly full-stack + Supabase practice project

A small website where someone writes a resume claim ("Cut page load time by 40%")
and links the evidence that proves it. It exists to teach you one thing well:

> **how a frontend, a backend and a database talk to each other — and how to put all three on the internet safely.**

You will end up with three live pieces:

| Piece | What it is | Example URL (yours will differ) |
|---|---|---|
| **Frontend** | React app the visitor sees | `https://proofwork.vercel.app` |
| **Backend** | Express API that holds your secrets | `https://proofwork-api.onrender.com` |
| **Database** | Supabase Postgres table | `https://xxxx.supabase.co` |

Total cost: **$0** on free plans.

---

## Table of contents

1. [The big picture (read this first)](#1-the-big-picture-read-this-first)
2. [Before you start](#2-before-you-start)
3. [The folder map](#3-the-folder-map)
4. [Step 1 — Create your Supabase project](#step-1--create-your-supabase-project)
5. [Step 2 — Create the database table](#step-2--create-the-database-table)
6. [Step 3 — Get your keys (and know which one is dangerous)](#step-3--get-your-keys-and-know-which-one-is-dangerous)
7. [Step 4 — Run it on your own computer](#step-4--run-it-on-your-own-computer)
8. [Step 5 — Check that it actually works](#step-5--check-that-it-actually-works)
9. [Step 6 — Put the code on GitHub](#step-6--put-the-code-on-github)
10. [Step 7 — Deploy the backend](#step-7--deploy-the-backend-render)
11. [Step 8 — Deploy the frontend](#step-8--deploy-the-frontend-vercel)
12. [Step 9 — Connect the two](#step-9--connect-the-two-the-2-minute-step-everyone-forgets)
13. [🚨 Files that must never be uploaded or committed](#13--files-that-must-never-be-uploaded-or-committed)
14. [🚨 Vulnerabilities this project is exposed to](#14--vulnerabilities-this-project-is-exposed-to)
15. [Troubleshooting](#15-troubleshooting)
16. [Where to go next](#16-where-to-go-next)

---

## 1. The big picture (read this first)

Three programs, three jobs:

```
        ┌─────────────────────────────┐
        │   Browser (frontend)        │
        │   React + Vite              │
        │   URL: vercel.app           │
        └──────────────┬──────────────┘
                       │  fetch("https://api.../api/proofs")
                       │  (no secrets in the browser!)
                       ▼
        ┌─────────────────────────────┐
        │   Server (backend)          │
        │   Express + Node            │
        │   URL: onrender.com         │
        │   Holds the SECRET key      │
        └──────────────┬──────────────┘
                       │  supabase-js
                       ▼
        ┌─────────────────────────────┐
        │   Database (Supabase)       │
        │   Postgres table: proofs    │
        └─────────────────────────────┘
```

**The one idea that matters most:** the browser can be read by anybody. So the
browser gets *no secrets*. Everything sensitive lives in the backend, and the
frontend only ever asks the backend for what it needs.

That single rule protects you from the most common way beginner projects get
hacked, which we will come back to in [section 14](#14--vulnerabilities-this-project-is-exposed-to).

---

## 2. Before you start

Install these three things. Accept all the default options.

| Tool | Why | Check it worked |
|---|---|---|
| [Node.js](https://nodejs.org) (the **LTS** button) | runs both apps | `node -v` → `v20.x` or higher |
| [Git](https://git-scm.com) | sends code to GitHub | `git --version` |
| [VS Code](https://code.visualstudio.com) | editing the files | opens fine |

You also need free accounts on:

- [GitHub](https://github.com) — stores your code
- [Supabase](https://supabase.com) — the database
- [Render](https://render.com) — runs the backend
- [Vercel](https://vercel.com) — serves the frontend

All four can be signed into with your GitHub account, which saves time.

**How to open a terminal in the project folder:** in VS Code press
<kbd>Ctrl</kbd>+<kbd>`</kbd> (backtick). Do all the commands below from there.

---

## 3. The folder map

```
proofwork/
├── README.md              ← you are here
├── .gitignore             ← tells Git which files to ignore
│
├── backend/               ← runs on a server. Holds your secrets.
│   ├── package.json
│   ├── .env.example       ← a template. Safe to commit.
│   ├── .env               ← YOUR REAL SECRETS. Created by you. NEVER commit.
│   └── src/
│       ├── index.js       ← starts the server, sets up CORS
│       ├── config.js      ← reads and checks the environment variables
│       ├── supabase.js    ← the database client (secret key lives here)
│       └── routes/
│           └── proofs.js  ← GET and POST /api/proofs
│
├── frontend/              ← runs in the visitor's browser. No secrets.
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   ├── .env               ← just your backend URL. Not secret.
│   └── src/
│       ├── main.jsx       ← starts React
│       ├── App.jsx        ← the whole page: form + list
│       ├── api.js         ← every backend call, in one file
│       └── styles.css
│
└── database/
    └── schema.sql         ← paste this into Supabase to create the table
```

`frontend/` and `backend/` are **two separate npm projects**. Each has its own
`package.json`, so each one needs its own `npm install`.

---

## Step 1 — Create your Supabase project

1. Go to <https://supabase.com> and sign in.
2. Click **New project**.
3. Fill in:
   - **Name:** `proofwork`
   - **Database Password:** click *Generate a password* and **save it somewhere
     safe**. You will not need it for this project, but losing it is annoying.
   - **Region:** pick the one closest to you.
4. Click **Create new project** and wait ~2 minutes while it builds.

---

## Step 2 — Create the database table

1. In your Supabase project, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `database/schema.sql` from this project, copy **all** of it, and paste
   it into the editor.
4. Click **Run** (or press <kbd>Ctrl</kbd>+<kbd>Enter</kbd>).
5. You should see **Success. No rows returned**. That is correct — it created a
   table, not data.

Check it worked: click **Table Editor** in the sidebar. You should see a table
called **proofs** with the columns `id`, `name`, `claim`, `evidence_url`,
`created_at`.

> The `schema.sql` file also switches on **Row Level Security** and adds a rule
> that lets the public read rows but nobody write them. Only your backend can
> write, because it uses the secret key. We explain why in
> [section 14](#14--vulnerabilities-this-project-is-exposed-to).

---

## Step 3 — Get your keys (and know which one is dangerous)

In Supabase go to **Project Settings** (the gear icon) → **API**. You will see:

| Key | Looks like | Where it goes | Safe to expose? |
|---|---|---|---|
| **Project URL** | `https://abcd.supabase.co` | both `.env` files | ✅ Yes |
| **anon** / `public` key | `eyJhbGci...` | *not used in this project* | ✅ Yes (with RLS on) |
| **service_role** key | `eyJhbGci...` (long) | `backend/.env` **only** | 🚨 **NEVER** |

**The `service_role` key is the entire security of your project.** It ignores
Row Level Security, which means whoever holds it can read, change and delete
every row in your database. It belongs in one place only: `backend/.env`, on
your computer, and in the Render dashboard later.

If it ever ends up in your frontend, in a screenshot, in a public GitHub repo,
or in a chat message: go to Supabase → **Project Settings → API → Rotate** and
generate a new one immediately.

### Make the backend `.env`

In your terminal, from the project root:

```bash
cp backend/.env.example backend/.env      # Mac/Linux/Git Bash
```

On Windows **PowerShell** use:

```powershell
copy backend\.env.example backend\.env
```

Now open `backend/.env` in VS Code and paste your real values:

```ini
SUPABASE_URL=https://abcd.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-long-key...
CORS_ORIGIN=http://localhost:5173
PORT=4000
```

### Make the frontend `.env`

```bash
cp frontend/.env.example frontend/.env
```

```ini
VITE_API_URL=http://localhost:4000
```

That is not a secret, so nothing bad happens if it leaks.

---

## Step 4 — Run it on your own computer

You need **two terminals** open at the same time — one per app. That is normal,
not a mistake.

**Terminal 1 — the backend:**

```bash
cd backend
npm install
npm run dev
```

You should see:

```
✅ Backend running at http://localhost:4000
   Health check: http://localhost:4000/api/health
   Allowed frontend origins: http://localhost:5173
```

If you instead see `❌ Missing environment variable`, your `backend/.env` file is
missing or incomplete — go back to Step 3.

**Terminal 2 — the frontend:** click the **+** button in the terminal panel to
open a second terminal, then:

```bash
cd frontend
npm install
npm run dev
```

It prints something like `Local: http://localhost:5173/`. Open that link.

`npm run dev` keeps running and reloads automatically when you save a file. Stop
it with <kbd>Ctrl</kbd>+<kbd>C</kbd>.

---

## Step 5 — Check that it actually works

1. The page opens with a form on the left and a "Proof wall" on the right.
2. Fill in a name, a claim like `Shipped the checkout rewrite`, and an evidence
   link like `https://github.com/yourname/repo`.
3. Click **Add proof**. It appears at the top of the wall immediately.
4. Refresh the page. It is still there → the data really went to Supabase.
5. Go to Supabase → **Table Editor** → `proofs` and confirm the row.
6. Try the API by itself, in a browser tab:
   <http://localhost:4000/api/proofs> — you should see raw JSON.

Also test the failures on purpose, so you recognise them later:

- Put `hello` in the link box → the backend refuses it (it must start with
  `http://` or `https://`).
- Stop the backend with <kbd>Ctrl</kbd>+<kbd>C</kbd> and click **Add proof** →
  the frontend shows an error message instead of freezing.

If all of that works, the hard part is over.

---

## Step 6 — Put the code on GitHub

Render and Vercel deploy **from GitHub**, so the code has to get there first.

**Before you do this, confirm `.env` will not be uploaded.** From the project
root run:

```bash
git status --short
```

You must **not** see `backend/.env` or `frontend/.env` in that list. If you do,
fix `.gitignore` before continuing. (It is already set up correctly if you did
not change it.)

Now create the repo:

```bash
git init
git add .
git commit -m "Initial commit: ProofWork full-stack app"
git branch -M main
```

Then create an empty repo on GitHub (no README, no .gitignore — you already have
those), copy the URL it shows you, and run:

```bash
git remote add origin https://github.com/YOUR-NAME/proofwork.git
git push -u origin main
```

Open your repo on GitHub and double-check that `backend/.env` is **not** there.
You should only see `backend/.env.example`.

---

## Step 7 — Deploy the backend (Render)

1. Go to <https://render.com> → **New** → **Web Service**.
2. Connect your GitHub account and pick the `proofwork` repo.
3. Fill in the settings:

   | Setting | Value |
   |---|---|
   | **Name** | `proofwork-api` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | `Free` |

4. Scroll to **Environment Variables** and add these three (this is how secrets
   get to production — you never upload the `.env` file):

   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | `https://abcd.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | your long service_role key |
   | `CORS_ORIGIN` | `http://localhost:5173` *(we will add the real domain in Step 9)* |

5. Click **Create Web Service** and wait for the log to say
   `✅ Backend running at http://localhost:...`. That message is fine — Render
   assigns the public port for you.

6. Copy the URL Render gives you at the top of the page, e.g.
   `https://proofwork-api.onrender.com`.

7. Visit `https://proofwork-api.onrender.com/api/health`. You want
   `{"ok":true,...}`. If you get that, your backend is live on the internet.

> **Free plan note:** the service sleeps after ~15 minutes of no traffic. The
> first request afterwards takes 30–60 seconds to wake up. That is normal.

---

## Step 8 — Deploy the frontend (Vercel)

1. Go to <https://vercel.com> → **Add New** → **Project** → import your
   `proofwork` repo.
2. Vercel will try to detect a framework. Set these explicitly:

   | Setting | Value |
   |---|---|
   | **Root Directory** | `frontend` |
   | **Framework Preset** | `Vite` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |

3. Expand **Environment Variables** and add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://proofwork-api.onrender.com` (from Step 7, **no trailing slash**) |

4. Click **Deploy**. When it finishes you get a URL like
   `https://proofwork.vercel.app`.

Open it. The page loads, but adding a proof will probably fail — press
<kbd>F12</kbd>, open the **Console**, and you will likely see a CORS error. That
is expected. It is Step 9.

---

## Step 9 — Connect the two (the 2-minute step everyone forgets)

Right now your backend only trusts `http://localhost:5173`. It has to trust your
real Vercel domain too.

1. Copy your Vercel URL, e.g. `https://proofwork.vercel.app`.
2. In **Render** → your service → **Environment**, edit `CORS_ORIGIN` to:

   ```
   http://localhost:5173,https://proofwork.vercel.app
   ```

   (Keep localhost so local development still works. Separate values with a
   comma, no spaces needed.)
3. Click **Save Changes**. Render redeploys automatically — wait for it to go
   live.
4. Refresh your Vercel site and add a proof. It should work.

**If you change the frontend URL later, you must update `CORS_ORIGIN` again.**
That is by design: the backend only answers the sites you name.

### The mental model for "why the frontend can talk to the backend"

- `VITE_API_URL` = *where* the frontend sends requests. **The frontend controls this.**
- `CORS_ORIGIN` = *which sites the backend accepts requests from.* **The backend controls this.**

Both have to agree. When something breaks after deploying, check these two first.

---

## 13. 🚨 Files that must never be uploaded or committed

These are the files whose exposure causes real damage.

| File / folder | Why it must never be public | What happens if it leaks |
|---|---|---|
| `backend/.env` | Contains `SUPABASE_SERVICE_ROLE_KEY` | 🚨 Total database takeover: read, edit, delete every row — and every other table you add later |
| `frontend/.env` (if you ever put a secret in it) | Vite **bakes every `VITE_*` variable into the JavaScript** | 🚨 Same as above, and it is shipped to every visitor |
| Any `.env.local`, `.env.production`, `*.env.bak` | Same reason, different name | 🚨 Same as above. Your `.gitignore` covers these patterns |
| `node_modules/` | Tens of thousands of files, built for *your* machine | Not dangerous, just breaks builds and bloats the repo. Hosts run `npm install` themselves |
| `frontend/dist/` | Generated at build time | Vercel rebuilds it. Old files just confuse you |
| Anything in `frontend/public/` | **Everything in this folder is served publicly at your domain.** `public/notes.txt` becomes `yoursite.com/notes.txt` | 🚨 People put DB dumps, keys and drafts here without realising |
| `database/schema.sql` | Reveals your table names, columns and rules | Low risk, but attackers love a free map of your database. Keep it in Git, but **never** copy it into `frontend/public/` |
| `.git/` | Contains your whole history | 🚨 A leaked `.git` folder re-exposes deleted secrets forever |
| Supabase **Database Password** | Full direct Postgres access | 🚨 Bypasses your API and its validation completely |
| Supabase **service_role** key in any screenshot, Slack message, or AI chat | Same as the `.env` row | 🚨 Rotate it immediately |

### How to tell what you are about to upload

```bash
git status --short        # what changed
git ls-files              # what Git is actually tracking
```

`git ls-files` showing `.env` means it is tracked — remove it and rotate the key.

### "I leaked a key already" — the fix

Deleting the file and committing again is **not enough**; the old value stays in
Git history where anyone can find it.

1. **Rotate the key.** Supabase → Project Settings → API → **Rotate** the
   `service_role` key. The old one dies instantly.
2. Put the new key in `backend/.env` and in Render's Environment tab.
3. If it was only in your last commit and you have not pushed: `git commit --amend` or `git reset --soft HEAD~1`.
4. If it is already pushed: rotate first (step 1 always saves you), then
   consider the history rewrite tools `git filter-repo` or
   [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/). Treat a leaked
   key as public *even if* you rewrite history.

---

## 14. 🚨 Vulnerabilities this project is exposed to

This is a learning project, so it is honest about what it does **not** protect
against yet. Read this list before you show the site to anyone.

### Already handled ✅

| Risk | How this project handles it |
|---|---|
| Secret key in the browser | The frontend never imports Supabase. It only has the backend URL. `service_role` lives only in `backend/.env` |
| Anyone with the anon key writing to your DB | RLS is enabled with a read-only policy, so the anon key cannot insert |
| Any website calling your API | CORS allowlist; unknown origins are rejected |
| `javascript:` links running code when clicked | The backend only accepts `http://` and `https://` |
| Cross-site scripting (XSS) in the proof list | React escapes text. The code never uses `dangerouslySetInnerHTML` |
| Leaking internals through error messages | The backend returns short generic messages; real errors go to the server log only |
| Database bloat from huge text | Length limits in the API **and** `check` constraints in the table |
| Giant request bodies eating server memory | `express.json({ limit: '16kb' })` |
| A new window controlling your page | Every `target="_blank"` link also has `rel="noopener noreferrer"` |
| Secrets in Git | `.gitignore` covers `.env` and friends; only `.env.example` is committed |

### Still open ⚠️ — biggest first

**1. There is no login, so anyone can post.**
Right now the API accepts writes from anybody. A script could fill your proof
wall in seconds. *Fix:* add Supabase Auth, send the user's token from the
frontend, and have the backend verify it with `supabaseAdmin.auth.getUser(token)`
before inserting. That is the natural next step for this project.

**2. No rate limiting.**
Even with a public read, one person can hammer `/api/proofs` thousands of times
a minute. It will slow the app down and, on paid plans, cost money. *Fix:*
`npm install express-rate-limit` and add:

```js
import rateLimit from 'express-rate-limit'
app.use('/api/', rateLimit({ windowMs: 60_000, max: 60 }))
```

**3. No spam or abuse control on content.**
Somebody can post insults with your name on them, or 10,000 junk proofs. *Fix:*
require a login, keep a `status` column (`pending` / `approved`) and only show
approved rows on the public wall.

**4. The service_role key is a single point of failure.**
One accidental paste and everything is gone: your data, and anything you add to
this Supabase project in future. *Fix:* use the **anon key + RLS policies** in the
frontend for anything a logged-in user can do themselves, and keep
`service_role` strictly for admin-only jobs. Rotate it on a schedule.

**5. No HTTPS enforcement or security headers.**
Visitors can reach `http://` and there is nothing stopping your site being
embedded in a hidden iframe and clickjacked. *Fix:* Vercel and Render already
give you HTTPS; add `helmet` on the backend:

```js
import helmet from 'helmet'
app.use(helmet())
```

**6. Free-tier sleeping and cold starts.**
Not a security issue, but a reliability one: your backend sleeps after ~15
minutes and a visitor may see a 30–60 second spinner. *Fix:* upgrade the Render
plan, or ping `/api/health` periodically with a free uptime monitor.

**7. Dependencies go out of date and pick up known bugs.**
Run this once a month in both `backend/` and `frontend/`:

```bash
npm audit
npm audit fix
```

**8. Proofs are claims about yourself, so the data can simply be false.**
The app records a claim and a link; it does not check whether the link supports
the claim. The database stores `name` as free text, so anyone can type any name.
*Fix (for real trust, later):* require verification of the evidence URL, sign
entries, or let a third party attest to them. This is the hard product problem —
see "Where to go next".

### A 60-second review you can repeat

Before any deploy, re-check these four things:

1. Does `git status` show any `.env` file? → must be **no**
2. Is `CORS_ORIGIN` a specific list (no `*`)? → must be **yes**
3. Is `service_role` anywhere under `frontend/`? → search for it; must be **no**
4. Does `/api/health` respond, and does adding a proof still work? → must be **yes**

---

## 15. Troubleshooting

| What you see | What it means | Fix |
|---|---|---|
| `❌ Missing environment variable: SUPABASE_URL` | No `backend/.env` or it is empty | `cp backend/.env.example backend/.env` and fill it in |
| `Cannot find module 'express'` | You skipped `npm install` | Run it inside that folder (`cd backend` first) |
| `EADDRINUSE: port 4000 already in use` | Another process is on that port | Close the other terminal, or change `PORT` in `backend/.env` |
| Page loads, save fails, console says **CORS policy**, and Render logs say `Blocked request from a website that is not in CORS_ORIGIN` | The deployed frontend URL is not in `CORS_ORIGIN`. The backend answers **403** on purpose | Add it in Render and redeploy (Step 9) |
| `Request failed (500)` | The backend hit a database error | Open Render → **Logs** and read the real message |
| Data disappears after a redeploy | It never went to Supabase | Check Supabase → Table Editor. If the row is missing, the backend used the wrong key |
| Backend takes ~40s to answer | Render free plan was asleep | Normal. Wait, or ping `/api/health` to warm it |
| Supabase says `permission denied for table proofs` | You are using the anon key somewhere it should not be | The backend must use the `service_role` key |
| Frontend shows `undefined` for the API URL | You named the variable without the `VITE_` prefix | It must be `VITE_API_URL`, then restart `npm run dev` |
| Changes deploy but site looks old | Browser cache | Hard refresh: <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> |

**Golden debugging rule:** when something breaks, work backwards from the
database.

1. Is there a row in Supabase? → if no, the problem is the backend
2. Does `http://localhost:4000/api/proofs` (or the Render URL) return JSON? → if no, the problem is the backend
3. Does `F12 → Console` show an error on the page? → if yes, the problem is the frontend or CORS

---

## 16. Where to go next

In rough order of value for a beginner:

1. **Add login** with Supabase Auth, so proofs belong to a user. This is the
   single biggest step up in both realism and security. It also lets you delete
   the "anyone can post" vulnerability.
2. **Add a public profile page** — `/u/:username` showing only that person's
   proofs, plus a QR code you could print on a resume. That is the actual product
   idea this demo comes from.
3. **Add rate limiting and validation** (`express-rate-limit`, `zod`) so the API
   is safe to leave running in public.
4. **Add tests** so you can change code without breaking it. Start with one test
   for `POST /api/proofs` that checks a bad URL is rejected.
5. **Add a delete button** with proper ownership checks — a great way to learn
   why "you may only delete your own row" is a policy, not a UI question.

---

Built as a learning project. Everything above runs on free tiers, and none of
the steps require a credit card.
