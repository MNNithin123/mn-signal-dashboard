# MN Signal Real Estate Lead Dashboard

A Next.js dashboard for viewing real-estate leads from Notion. It supports public fictional demo mode first, with an optional server-side Notion connection that can be enabled later in Vercel settings.

## What this project does

- **Demo mode:** works without credentials and uses fictional records only.
- **Notion mode:** reads leads through a server-side API route. Notion secrets are never included in browser code.
- **Basic access gate for live mode:** once either Notion environment variable is configured, the whole site requires HTTP Basic Authentication using `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD`. This prevents accidentally exposing the live dashboard when the Notion connection is enabled.
- **No silent fallback:** if Notion mode is selected and the connection fails, the dashboard shows an error instead of presenting demo records as live data.

The basic password gate is suitable only as a simple single-workspace MVP. It is **not** a full multi-user authentication system or multi-tenant client-isolation system. Before giving separate clients access, implement individual accounts and server-side tenant authorization.

## Deploy the demo to GitHub and Vercel

1. Extract the ZIP.
2. Create a GitHub repository. Upload the **contents** of the `mn-signal-dashboard` folder, not the ZIP file and not an extra parent folder.
3. Confirm `package.json` is at the root of the GitHub repository.
4. In Vercel, choose **Add New → Project**, import the repository, and deploy it.
5. Leave the Notion and dashboard credential variables unset for now. The app will use fictional demo leads.

No `.env.local` file or local build is required before the first Vercel demo deployment.

## Connect Notion later in Vercel

1. In Notion, open [My Integrations](https://www.notion.so/my-integrations) and create an internal integration with read access to the leads database.
2. Copy the integration secret. Keep it private.
3. Open the leads database in Notion and share it with the integration you created.
4. Copy the database ID from the database URL. If the URL contains extra query parameters, use the database's 32-character ID.
5. In Vercel, open your project → **Settings → Environment Variables**. Add these variables for the Production environment:

   - `NOTION_API_KEY` — your private Notion integration secret.
   - `NOTION_DATABASE_ID` — the ID of the database shared with the integration.
   - `DASHBOARD_USERNAME` — a username you choose for the dashboard.
   - `DASHBOARD_PASSWORD` — a long, unique password. Do not reuse your other passwords.

6. Save the variables and redeploy the project from Vercel.
7. Open the site. The browser will ask for the dashboard username and password. After authentication, open **Settings** in the dashboard and switch Demo Mode off to load Notion leads.

If you configure either Notion variable but forget the dashboard credentials, the app deliberately returns a setup message rather than making live data public. If Notion is configured but the API fails, the dashboard displays an error and does not pretend demo data is live.

## Notion property mapping

The integration tries to identify common property names and types for lead name, email, phone, property interest, date, status, and budget. Your Notion integration must have access to the database. If your database uses unusual property names, adjust the mapping in `lib/notion.ts` before connecting live data.

## Local development (optional)

1. Install Node.js LTS.
2. Open a terminal in the folder containing `package.json`.
3. Run `npm install` and then `npm run dev`.
4. Open `http://localhost:3000`.

You can also run `npm run typecheck` and `npm run build` to check the project.

## Keep secrets out of GitHub

- Never commit `.env.local`, `.env`, tokens, passwords, or real customer records.
- `.gitignore` excludes local environment files.
- `.env.example` contains variable names only and is safe to commit.
- Add production secrets only in Vercel Environment Variables.
- Do not put a Notion token in a `NEXT_PUBLIC_...` variable; variables with that prefix can be exposed to the browser.

## Important limitations

- The included Basic Auth gate protects the whole app with one shared username/password. It does not provide individual user accounts, account recovery, audit logs, or separate client workspaces.
- For multiple paying clients, use a proper authentication provider and store a trusted mapping between each authenticated user and their own Notion integration/database. Do not let users choose arbitrary database IDs in browser requests.
- Before using real customer data, verify authentication, database permissions, and the deployed URL yourself.
