# MN Signal v0.1 — Lead Data Contract

This is the application-level contract for the first real-estate lead workflow. It documents the intended meaning of fields; it does not automatically change the existing Notion database.

## Lead

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| id | string | Yes | Stable record identifier |
| name | string | Yes | Person or organisation name |
| email | string | One contact method | Email address |
| phone | string | One contact method | Phone number |
| area | string | No | Location/property area |
| interest | string | No | Buy, Sell, Both, or free-text requirement |
| budget | string | No | Stated budget, preserving original currency/wording |
| message | string | No | Original enquiry |
| source | string | No | Form, website, referral, manual, etc. |
| createdAt | ISO datetime | Yes | Captured timestamp |
| status | enum | Yes | New, Contacted, Qualified, Proposal, Won, Lost |
| nextAction | string | No | Next human-owned action |
| nextFollowUpAt | ISO datetime | No | Planned follow-up time |

## Status transitions

- New → Contacted or Lost
- Contacted → Qualified or Lost
- Qualified → Proposal or Lost
- Proposal → Won or Lost
- Won/Lost are terminal for the initial workflow; reopening requires an explicit operator action.

Do not infer Won from a generic Done status. Keep historical status changes in an activity log when that feature is added.

## Existing Notion CRM mapping

The current database has:
- Name (title)
- Email (email)
- Phone (phone_number)
- Area (text)
- Budget (text)
- Buy / Sell (select: Buy, Sell, Both)
- Date (text)
- Message (text)
- Source (select: tally)
- Status (status: New, In progress, Done)

Known mismatch: the current dashboard code expects a different status vocabulary. Before live mode, update the mapper or migrate the Notion status options and test against real property payloads.

## Validation rules

- Trim whitespace from text inputs.
- Require name and at least one of email or phone.
- Validate email shape when supplied.
- Preserve phone as text; do not parse it as a number.
- Treat budget as text in v0.1 because currencies and formats may differ.
- Do not assume timezone from a date-only value.
- Avoid collecting sensitive personal data not needed for the enquiry.
- Use a duplicate warning based on normalized email or phone; do not silently delete records.

## Example fictional lead

```json
{
  "id": "demo-lead-001",
  "name": "Aarav Demo",
  "email": "aarav@example.test",
  "phone": "+91 90000 00000",
  "area": "Anantapur",
  "interest": "Buy",
  "budget": "₹35–45 lakh",
  "message": "Looking for a 2 BHK apartment.",
  "source": "website-demo",
  "createdAt": "2026-11-09T09:00:00+05:30",
  "status": "New",
  "nextAction": "Review enquiry",
  "nextFollowUpAt": null
}
```

All sample data must remain fictional. Never place real client records in GitHub.
