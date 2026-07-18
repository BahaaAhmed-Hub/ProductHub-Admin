# ProductHub Admin

Internal ops console for ProductHub — cross-tenant company, billing, internal
team, security, integrations, and compliance management. Separate app/repo
from the customer-facing [ProductHub](https://github.com/BahaaAhmed-Hub/ProductHub)
product, but shares the **same Supabase project**: this console reads and
writes across every tenant through a new set of `platform_admins`-gated RLS
policies (see ProductHub's `supabase/migrations/0025_platform_admin.sql`)
rather than maintaining its own copy of the schema.

Only people with a row in `platform_admins` (ProductHub's own staff — not
customers) can sign in here.

## Setup

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
npm run dev
```

Points at the same Supabase project as ProductHub — no separate backend to
stand up. Both `supabase/migrations` and `supabase/functions` for this
console's tables/Edge Functions (`platform-stats`, `platform-invite-admin`,
`platform-reset-password`) live in the ProductHub repo, since it's the
single source of truth for that project's schema.

## Sections

- **Overview** — platform-wide KPIs, recent admin actions, plan distribution
- **Companies** — every org on the platform: plan, status, seats; a detail
  view per company (users, end customers, account activity, account controls)
- **Internal Team** — ProductHub's own staff with console access
- **Billing & Subscription** — live Stripe MRR/invoices aggregated across
  every company (no local billing table — always asks Stripe directly)
- **Security & Access** — 2FA enforcement, IP allowlist, API keys, audit log
- **Integrations** — internal tooling connections (Slack/GitHub/Jira/Zendesk
  are static demo rows, same convention as ProductHub's own Integrations
  screen — no real OAuth behind them)
- **Notifications & Alerts** — alert rule config
- **Compliance & Data** — retention policy, backup status, GDPR/CCPA request log

Impersonation ("log in as this user") is intentionally **not** wired up to
real session-switching — that needs signed short-lived tokens and careful
security review, out of scope for this pass. The UI is there; it's honest
about not doing anything real yet.
