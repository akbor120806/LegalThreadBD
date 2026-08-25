# Legal Thread BD

A full-stack legal-services platform for Bangladesh — built with **Next.js
(App Router)**, **JavaScript**, and **MySQL**. Citizens can find verified
lawyers, book online/offline consultations, read simplified legal knowledge,
and download legal documents. A completely separate, credential-protected
**Admin Panel** lets a single admin manage lawyers, appointments, users, and
call-back requests.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, plain CSS (no framework)
- **Backend:** Next.js Route Handlers (API routes), Node.js
- **Database:** MySQL (via `mysql2`)
- **Auth:** JWT sessions in httpOnly cookies (`jose`), passwords hashed with `bcryptjs`

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your MySQL credentials and a long random `JWT_SECRET`.

## 3. Create the database and load the schema

```bash
mysql -u root -p -e "CREATE DATABASE legalthreadbd"
mysql -u root -p legalthreadbd < database/schema.sql
```

This creates all tables (`users`, `admins`, `lawyers`, `appointments`,
`legal_categories`, `legal_documents`, `contact_requests`) and seeds some
sample lawyers, categories, and documents.

> Note: the `admins` table is created **empty on purpose** — there is no
> public sign-up route for admins anywhere in the app.

## 4. Create your admin account

This is the **only** way to create an admin login, and it only works from
the server/terminal — nobody can create one through the website:

```bash
npm run create-admin -- youradminname YourStrongPassword123
```

(Or just run `npm run create-admin` and follow the prompts.)

## 5. Run the app

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login (not linked anywhere on the
  public site — only reachable if you know the URL and the credentials
  created in step 4)

## How authentication works

- **Public users** register/login at `/register` and `/login`, choosing a
  role: **Client** or **Lawyer**.
  - A session cookie (`lt_session`) is issued and the navbar automatically
    switches from **Login / Register** to **Dashboard / Logout**.
  - Clients land on `/dashboard`; lawyers land on `/lawyer-dashboard` —
    `middleware.js` enforces this automatically even if someone tries the
    wrong URL directly.
  - Registering as a lawyer also creates a matching row in the `lawyers`
    table (linked via `lawyers.user_id`), so they immediately appear in the
    public "Find a Lawyer" directory.
- **Admin** logs in separately at `/admin/login` using a totally different
  cookie (`lt_admin_session`) and a totally different database table
  (`admins`). Regular client/lawyer accounts can never access `/admin/*`.
- `middleware.js` protects `/admin/*` (except `/admin/login`), `/dashboard/*`
  (clients), and `/lawyer-dashboard/*` (lawyers).

## Lawyer ↔ Client appointment workflow

1. A client books an appointment from a lawyer's profile page → status
   `pending`.
2. The lawyer sees it on `/lawyer-dashboard` and can:
   - **Accept** → status `confirmed`
   - **Reject** → status `cancelled` (`cancelled_by = 'lawyer'`)
   - **Propose New Time** → status `reschedule_requested`, with
     `proposed_date` / `proposed_time` / an optional note
3. If a new time was proposed, the client sees it on `/dashboard` and can:
   - **Accept New Time** → status becomes `confirmed` and the appointment's
     date/time are updated to the proposed ones
   - **Decline** → status `cancelled` (`cancelled_by = 'client'`)
4. Once a confirmed appointment has happened, the lawyer can mark it
   **Completed** from their dashboard.

Every lawyer's **Accepted** and **Rejected** counts are tracked live and
shown both on their own dashboard and on the admin panel's Lawyers list
(`/admin/lawyers`) — click a lawyer's name there to open a full dashboard
view of their profile, stats, and appointment history.

## Project structure

```
app/
  (site)/            → public pages, wrapped with Nav + Footer
    page.js           → homepage
    login/ register/  → auth pages
    lawyers/           → lawyer directory + [id] detail & booking
    legal-awareness/   → legal knowledge by category
    documents/         → downloadable legal documents
    about/
    dashboard/         → logged-in client's appointments
  lawyer-dashboard/   → logged-in lawyer's profile + appointment requests
  admin/
    login/             → standalone admin login (no sidebar)
    (protected)/        → everything else under /admin, wrapped with sidebar
      page.js           → admin dashboard
      lawyers/          → CRUD
      appointments/     → status management
      users/            → read-only directory
      messages/         → call-back request management
  api/                → all backend route handlers (REST-style JSON)
components/           → Nav, Footer, LawyerCard, BookingForm, CallBackForm, AdminSidebar
lib/                  → db.js (MySQL pool), auth.js (JWT), session.js (cookies)
database/schema.sql   → full schema + seed data
scripts/create-admin.js → CLI to create/reset the admin account
middleware.js          → route protection for /admin and /dashboard
```

## Notes

- Consultation fees are shown in BDT (৳).
- The seed data includes 6 sample lawyers across Criminal, Civil, Corporate
  and Tax law, and 10 sample legal documents — replace/extend these from the
  admin panel once you're logged in.

## New features

### 🌗 Dark mode
A theme toggle (🌙/☀️) sits in the navbar on every public page. The choice
is saved to `localStorage`, so it's remembered on the next visit, and an
inline script in `app/layout.js` applies it before the page paints so there's
no flash of the wrong theme. The admin panel is always dark by design and is
unaffected by this toggle.

### 🌐 Bangla / English toggle
A language toggle (বাং/EN) also sits in the navbar. It translates the navbar,
homepage, and Legal Knowledge page headings via `components/LanguageProvider.js`
and the dictionary in `lib/translations.js`. To translate more text elsewhere
in the site, add a new key to that dictionary and use `t('your_key')` (via
`useLanguage()` in a client component, or the `<T k="your_key" />` helper
inside server components).

### 🤖 AI Legal Assistant
A chat widget (on the homepage and the Legal Knowledge page) lets visitors
ask general legal questions in Bengali or English and get a plain-language
answer, with a disclaimer that it isn't a substitute for a real lawyer.

To enable it:
1. Get an API key from https://console.anthropic.com
2. Add it to `.env` as `ANTHROPIC_API_KEY=sk-ant-...`
3. Restart the dev server

Without a key set, the widget still renders but shows a friendly "not
configured yet" message instead of crashing the page.
