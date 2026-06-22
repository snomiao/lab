---
name: snolab
description: Publish a static tool to lab.snomiao.com — deploy it as a named branch of the snolab Cloudflare Pages project, add a linking card to the lab homepage, and handle deploy/auth/cache. Use when asked to "publish/add a tool to the lab", "put X on lab.snomiao.com", or "add a card to the lab homepage".
---

# snolab — publish a static tool to lab.snomiao.com

`lab.snomiao.com` is the homepage of **雪星实验室**. It is the production root of a single
Cloudflare Pages project named **`snolab`**, which also hosts every individual tool as a
*named-branch* deploy. Publishing a new tool is two independent deploys to the **same** project:

1. The tool itself → a **named branch** → served at `https://<toolname>.snolab.pages.dev`.
2. A **card** added to the homepage → redeploy the production root → linked from `lab.snomiao.com`.

## Fixed facts (this account / repo)

| Thing | Value |
|---|---|
| Pages project | `snolab` |
| Cloudflare account | SNOLAB — `0beef4cd2d2da6befa47d8d149d6e157` |
| Production branch | `main` |
| Production root deploy dir | `./legacy` (in the `snomiao/lab` repo) |
| Homepage file | `legacy/index.html` |
| Live URLs | `https://snolab.pages.dev` and `https://lab.snomiao.com` |
| Lab repo | `git@github.com:snomiao/lab`, working branch `master` |

> Why `./legacy` is the deploy root: the legacy tools use **absolute** asset paths
> (`/static/…`, `/evetools/…`, `/logos/…`), so the deploy directory must place those at the
> site root. The homepage lives at `legacy/index.html`, which maps to `/`.

## Auth — read this first (it's the only fiddly part)

`wrangler` is authenticated via an **OAuth token** stored at
`/root/.config/.wrangler/config/default.toml` (scope includes `pages:write`).

**Gotcha:** the repo's `.env.local` contains a `CLOUDFLARE_API_TOKEN` that **lacks Pages
permissions** (it returns `Authentication error` / code 10000 on Pages calls). `wrangler`
auto-loads `.env`/`.env.local` from the working dir, so that bad token silently overrides the
good OAuth creds and breaks deploys. Also `wrangler whoami` may wrongly report "not authenticated".

**Reliable fix:** extract the OAuth token and pass it explicitly as `CLOUDFLARE_API_TOKEN` on
every deploy command (it works as a bearer token for the Pages API and overrides `.env.local`):

```bash
OAT=$(grep oauth_token /root/.config/.wrangler/config/default.toml | sed 's/.*= *"//;s/"//')
```

If `default.toml` is missing/expired, log in fresh (interactive OAuth, must be run where the
browser can reach `http://localhost:8976`): from a dir **without** a `.env.local`,
`unset CLOUDFLARE_API_TOKEN && wrangler login`.

---

## Step 1 — Deploy the tool as a named branch of `snolab`

Do **not** create a separate Pages project per tool. Deploy the tool's built/static folder to a
named branch; Cloudflare serves branch deploys at `<branch>.<project>.pages.dev`. Only the
**production** branch (`main`) is the live root, so this never touches `lab.snomiao.com`.

Run from the tool's repo (the dir containing its `index.html`):

```bash
OAT=$(grep oauth_token /root/.config/.wrangler/config/default.toml | sed 's/.*= *"//;s/"//')
CLOUDFLARE_API_TOKEN="$OAT" CLOUDFLARE_ACCOUNT_ID=0beef4cd2d2da6befa47d8d149d6e157 \
  npx wrangler pages deploy . --project-name snolab --branch <toolname> --commit-dirty=true
# => https://<toolname>.snolab.pages.dev
```

`<toolname>` becomes the subdomain (lowercase, hyphens; e.g. branch `visualization` →
`https://visualization.snolab.pages.dev`).

## Step 2 — Add a card to the lab homepage

Edit `legacy/index.html` in the `snomiao/lab` repo. Cards are `<a class="card">` inside a
`<section><div class="grid">`. Add (or reuse) a section and insert a card whose `href` is the
tool's **full** branch URL (it's a different subdomain, so an absolute URL is required — not a
relative path):

```html
<a class="card" href="https://<toolname>.snolab.pages.dev">
  <span class="name">Tool Display Name</span>
  <span class="desc">One-line description of what the tool does.</span>
</a>
```

> For local legacy tools the `href` is a root-relative, **URL-encoded** path
> (e.g. `/evetools/`, `/JS%E9%9B%86%E5%90%88%E8%BF%90%E7%AE%97.html`). New external/branch
> tools use the full `https://<toolname>.snolab.pages.dev` URL.

Then redeploy the production root from the **`snomiao/lab` repo root**:

```bash
OAT=$(grep oauth_token /root/.config/.wrangler/config/default.toml | sed 's/.*= *"//;s/"//')
CLOUDFLARE_API_TOKEN="$OAT" CLOUDFLARE_ACCOUNT_ID=0beef4cd2d2da6befa47d8d149d6e157 \
  wrangler pages deploy ./legacy --project-name snolab --branch main --commit-dirty=true
```

## Step 3 — Cache / verification

After the production deploy the card is **instantly** live on the raw deploy URL
(`https://<hash>.snolab.pages.dev`) and on `https://snolab.pages.dev`. The custom domain
`lab.snomiao.com` is a proxied Cloudflare edge (origin sends `cache-control: max-age=14400`,
i.e. 4h), so in the worst case it can serve stale for up to 4h.

**Cache purge does NOT work with the tokens on this box** — both the `.env.local`
`CLOUDFLARE_API_TOKEN` and the wrangler `oauth_token` return `Authentication error` (code 10000)
on `POST /zones/{zone}/purge_cache` (no `cache_purge` scope). So **natural TTL expiry is the
fallback** — don't chase the purge API.

In practice the custom domain usually responds `cf-cache-status: DYNAMIC` and refreshes within
~a minute (the initial miss after a deploy is propagation lag, not a 4h cache). Verify:

```bash
# canonical (always fresh):
curl -s -L https://snolab.pages.dev/ | grep -o 'Tool Display Name'
# custom domain (may lag briefly; a ?v= query also bypasses any edge cache):
curl -s -L https://lab.snomiao.com/ | grep -o 'Tool Display Name'
```

## Step 4 — Commit the repos

In the **tool's own repo**: ensure `.wrangler/` is gitignored (wrangler writes a local deploy
cache there), then commit + push.

```bash
grep -qxF '.wrangler/' .gitignore || printf '.wrangler/\n' >> .gitignore
git add -A && git commit -m "Deploy to snolab as <toolname> branch" && git push origin HEAD
```

In the **`snomiao/lab` repo** (the homepage edit):

```bash
git add -A && git commit -m "Add <Tool Display Name> card to tool index" && git push origin HEAD
```

## Quick recap

```
tool repo:  wrangler pages deploy . --project-name snolab --branch <toolname>   → <toolname>.snolab.pages.dev
lab repo:   edit legacy/index.html (card href=https://<toolname>.snolab.pages.dev)
            wrangler pages deploy ./legacy --project-name snolab --branch main  → snolab.pages.dev / lab.snomiao.com
auth:       CLOUDFLARE_API_TOKEN=$OAT (oauth_token from default.toml) — overrides the bad .env.local token
cache:      purge API unauthorized; verify on snolab.pages.dev (fresh), lab.snomiao.com lags ≤4h
```
