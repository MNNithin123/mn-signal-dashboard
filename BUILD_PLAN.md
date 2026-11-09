# MN Signal v0.1 — Build Plan

**Principle:** one complete, reliable business workflow before adding more features.

## Phase 0 — Protect and understand the existing project

- [ ] Keep the existing repository; do not create a competing duplicate.
- [ ] Confirm the current GitHub main branch and latest files.
- [ ] Clone the repository locally.
- [ ] Install the Node.js LTS release.
- [ ] Run npm install.
- [ ] Run npm run typecheck.
- [ ] Run npm run build.
- [ ] Run npm run dev and inspect the dashboard in a browser.
- [ ] Keep demo mode enabled.

Commands:

```bash
git clone https://github.com/MNNithin123/mn-signal-dashboard.git
cd mn-signal-dashboard
npm install
npm run dev
```

In a second terminal, run:

```bash
npm run typecheck
npm run build
```

## Phase 1 — Make the demo reliable

- [ ] Check the overview counts against the fictional demo records.
- [ ] Test search, status filters and pipeline columns.
- [ ] Confirm empty states and reset filters.
- [ ] Confirm all demo records are clearly fictional.
- [ ] Fix any build, type or runtime errors before connecting real data.

## Phase 2 — Align the CRM data contract

Current Notion CRM status values: New, In progress, Done.  
Current dashboard status values: New, Contacted, Qualified, Closed.

Choose one canonical status model before live mode. Recommended agency pipeline:

- New
- Contacted
- Qualified
- Proposal
- Won
- Lost

Migration rule: preserve existing records; do not silently reinterpret Done as Won. Review existing rows and map them deliberately. If retaining the three existing statuses for the first demo, map New → New, In progress → Contacted, and Done → Needs review (not automatically Won).

Also verify the Date field type and property mapping. Prefer a native Notion date property in a later schema cleanup rather than a free-text date.

## Phase 3 — First end-to-end intake workflow

Start with a manual test, then automate:

1. Submit a fictional enquiry.
2. Validate name and at least one contact method.
3. Check for a likely duplicate using email/phone.
4. Create a lead record with status New.
5. Show the record in the dashboard.
6. Record source and captured time.
7. Create a follow-up task or reminder for a human operator.

Only after the manual path is reliable, connect a Make webhook and the chosen form.

## Phase 4 — AI assistance (not autonomy)

Add one AI capability:
- Input: a lead's message and relevant non-sensitive business rules.
- Output: short summary, missing information, suggested priority, suggested next action, and a draft reply.
- Save the suggestion for review.
- Require a human to approve any outbound message.

Do not let the model invent budget, intent, urgency or customer facts. Return "unknown" when information is missing.

## Phase 5 — Pilot readiness

- [ ] Use a separate test workspace/database for a pilot client.
- [ ] Confirm client permission to process the submitted data.
- [ ] Verify access control and secret storage.
- [ ] Agree scope, support expectations and acceptance criteria in writing.
- [ ] Test normal, missing, duplicate and failure cases.
- [ ] Document pause/rollback and handover.
- [ ] Obtain client approval before production activation.

## Definition of done

v0.1 is complete when a fictional lead can be captured, validated, stored, displayed, searched, moved through a human-managed pipeline, and safely reviewed — with a repeatable setup guide and passing type/build checks.

## Current first action

Run the Phase 0 commands in the existing GitHub repository and send back the first error/output if anything fails. Do not add paid services or connect live customer data yet.
