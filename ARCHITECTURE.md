# MN Signal v0.1 — Architecture

**Status:** Proposed implementation baseline  
**Business goal:** Founder-led AI automation agency  
**Budget:** Free-first; no paid infrastructure required for the first demo  
**Initial demonstration niche:** Real-estate lead operations  
**Repository:** https://github.com/MNNithin123/mn-signal-dashboard

## 1. Product definition

MN Signal v0.1 is a repeatable lead-operations service that helps a small real-estate business capture enquiries, organise them, track follow-up, and see what needs attention.

Do not position v0.1 as a universal ERP, autonomous employee, or multi-tenant SaaS. Deliver one useful, testable workflow first.

**Outcome:** fewer missed enquiries and clearer follow-up ownership.

## 2. Current assets discovered

- Existing Next.js dashboard repository: MNNithin123/mn-signal-dashboard.
- Existing dashboard is built with Next.js 15, React 19 and Tailwind CSS.
- Existing dashboard supports fictional demo data and an optional server-side Notion read connection.
- Existing Notion CRM: MN Signal | Lead CRM.
- Existing CRM fields: Name (title), Email, Phone, Area, Budget, Buy / Sell, Date, Message, Source, Status.
- Existing CRM status options are New, In progress and Done.
- Existing dashboard's internal status model expects New, Contacted, Qualified and Closed. This is a schema mismatch to resolve before enabling live mode.
- Existing SOP and brand guideline pages already exist in Notion.

## 3. Architecture decision

Use the smallest stack that reuses existing assets:

| Layer | v0.1 choice | Responsibility |
| --- | --- | --- |
| User interface | Existing Next.js dashboard | Overview, leads table, pipeline and settings |
| Application/API | Next.js server routes | Server-side data access and validation |
| Primary data store | Existing Notion Lead CRM | Demo-stage lead records |
| Workflow orchestration | Make.com | Form/webhook intake, notifications and follow-up workflow |
| AI capability | Model API or manually invoked AI first | Lead summary, classification and draft response |
| Documentation | Notion | SOPs, context bank, decisions and handover |
| Source control | GitHub | Application code, schema notes and change history |
| Hosting | Existing Vercel project if already configured; otherwise local demo first | Demo deployment |

### Why Notion first, not Supabase

The project already has a Notion CRM and a Notion integration path in the dashboard. Reusing it keeps the first demo free and avoids introducing a second database before there is a demonstrated need.

Revisit Supabase when the service needs stronger relational querying, row-level security, per-client tenancy, reliable write APIs, or data that should not live in Notion.

## 4. System flow

1. A prospect submits an enquiry through a form or approved channel.
2. Make receives the submission (or the operator imports it during the first manual test).
3. The workflow validates required fields and checks for likely duplicates.
4. A lead record is created in the client's CRM.
5. The client-facing dashboard reads the lead through a server-side API.
6. AI can summarise and suggest a priority or follow-up; it must not make irreversible decisions.
7. A human reviews and approves outbound communication.
8. The workflow records the outcome and next action.

**Human approval is required** before sending messages, changing commercial status to Won/Lost, or taking any action with financial or legal impact.

## 5. v0.1 scope

### Included
- Fictional demo mode.
- Lead overview and counts.
- Search and status filters.
- Lead list and simple pipeline.
- Server-side Notion read integration, once schema mapping is corrected.
- Clear connection/error state; no silent fallback from live data to demo data.
- Basic setup documentation and test cases.

### Deferred
- Multi-client accounts and tenant isolation.
- Client-facing self-service onboarding.
- Autonomous email/WhatsApp sending.
- Billing, subscriptions and usage metering.
- Advanced agent orchestration or vector search.
- Full ERP/accounting/inventory features.
- Production handling of sensitive or high-volume customer data.

## 6. Security and reliability rules

- Never commit API keys, passwords, real customer records or .env.local.
- Keep Notion credentials on the server only; never use NEXT_PUBLIC_ for secrets.
- Use fictional data until access control and data mapping are verified.
- The current shared Basic Auth gate is a demo-only guard, not multi-tenant authentication.
- Do not expose one client's data to another client. For any pilot, use a separate client workspace/database and separate credentials until a proper tenant-aware auth/data model exists.
- Test duplicate submissions, missing fields, malformed input, API failures and permission failures.
- Do not enable automated outbound messages without explicit client approval and opt-out handling.

## 7. Acceptance criteria for v0.1

- App starts locally with the documented commands.
- TypeScript check and production build pass.
- Demo mode works without secrets and clearly labels fictional data.
- Search and filters work against demo data.
- Live mode either returns correctly mapped Notion records or shows a clear error.
- No credentials or real customer data are present in the repository.
- README accurately explains setup and limitations.

## 8. Next architecture decisions

1. Confirm the first pilot niche remains real-estate lead management.
2. Decide whether to update the Notion CRM status options or map its current three statuses in code.
3. Decide the first intake source (Tally form, website form, or manual test).
4. Confirm whether a Vercel deployment already exists before adding deployment work.
5. Only after the demo works, add a Make webhook scenario and AI-assisted lead summary.
