# GoHighLevel Workflow Build Spec: Commercial Intro + Evergreen Biweekly Follow-Up

Built from the `ranlock-commercial-growth-director` skill (SKILL.md) and the
`RANLOCK_Commercial_Prospect_Template.csv` schema, for RANLOCK Roofing &
Construction LLC's commercial B2B outreach.

**Status: draft build spec, not deployed.** No GoHighLevel connector/API
session is available in this environment, so nothing has been created inside
GHL. This document is the implementation blueprint — a human with GHL admin
access (or Zapier admin access) needs to build it from these steps.

**Assumption:** "biweekly" = every 14 days. If you meant twice a week, change
the wait step in Phase 3 from 14 days to 3-4 days.

---

## 1. Prerequisites (confirm before enabling any automation)

Per the skill's "Sending authority" rules, do **not** turn this workflow live
until all of these are true:

- [ ] Sending mailbox approved for commercial outreach (not `support@ranlock.com`
      used for a general inbox unless it's also the approved sending mailbox)
- [ ] Sending domain authenticated (SPF, DKIM, DMARC) in GHL
- [ ] Contacts entering this workflow come from a verified source only
      (no unverified/guessed emails — `email_status` must be `verified`, not
      `probable`)
- [ ] Unsubscribe link present in every email step
- [ ] Suppression list / Do-Not-Contact field wired to stop entry
- [ ] Daily send limit set (start small — e.g. 20-30/day — for a new or
      lightly-used domain)
- [ ] Reply routing confirmed (replies land somewhere a human monitors)
- [ ] Human owner assigned for positive replies (default: Robert Randazzo)

---

## 2. Required GHL setup (one-time)

### 2.1 Custom fields (map from CSV schema)

Create these custom fields on the Contact object if they don't already exist,
mirroring `assets/master-prospect-template.csv`:

| CSV column | GHL custom field | Type |
|---|---|---|
| `prospect_id` | Prospect ID | Text |
| `business_type` | Business Type | Text/Dropdown |
| `contact_title` | Contact Title | Text |
| `locations_or_properties` | Locations/Properties | Text |
| `service_opportunity` | Service Opportunity | Text |
| `lead_source` | Lead Source | Text |
| `source_url` | Source URL | Text |
| `source_checked_date` | Source Checked Date | Date |
| `email_status` | Email Status | Dropdown: verified / probable / invalid |
| `qualification_score` | Qualification Score | Number |
| `sequence_name` | Sequence Name | Text |
| `reply_status` | Reply Status | Dropdown (see §5) |
| `do_not_contact` | Do Not Contact | Checkbox |
| `approved_for_outreach` | Approved for Outreach | Checkbox |

### 2.2 Tags

- `commercial-prospect`
- `segment-property-mgmt`, `segment-hoa`, `segment-solar`, `segment-gc`,
  `segment-facilities`, `segment-other` (one per target category from
  SKILL.md's default target categories — apply the one matching `business_type`)
- `sequence-intro-active`
- `sequence-followup-active`
- `do-not-contact`
- `replied`

### 2.3 Pipeline

Use (or create) a **Commercial Outreach** pipeline with stages:

1. New Prospect
2. Intro Sequence Active
3. Nurture / Biweekly Follow-Up
4. Replied — Human Review
5. Appointment Set
6. Opportunity / Estimate Requested
7. Won
8. Lost / Not Interested
9. Suppressed (Do Not Contact)

(If a different pipeline/stage naming already exists in your GHL account from
the `qualification-and-pipeline.md` reference — which wasn't available to
re-check when this was written — rename these to match rather than running
two parallel pipelines.)

---

## 3. Workflow: "Commercial – Intro + Evergreen Biweekly Follow-Up"

**Entry trigger:** Contact tagged `commercial-prospect` AND
`approved_for_outreach = true` AND `do_not_contact = false` AND
`email_status = verified`.

**Entry filters (hard stop conditions, re-checked at every step via
"if/else" re-entry filter, not just at trigger time):**
- `do_not_contact = true` → exit immediately, add tag `do-not-contact`, move
  pipeline stage to **Suppressed**.
- Contact has replied (any inbound email logged) → exit immediately, remove
  from workflow, move to **Replied — Human Review**.

### Phase 1 — Introduction sequence

| Step | Action | Timing |
|---|---|---|
| 1 | Add tag `sequence-intro-active`; set pipeline stage **Intro Sequence Active** | Immediate |
| 2 | Send Email 1 (introduction, 2-3 services max, low-pressure CTA, opt-out, sender identity + address) | Immediate |
| 3 | Wait | 4 business days |
| 4 | If/else: has contact replied or unsubscribed? → Yes: exit to Phase 4. No: continue | — |
| 5 | Send Email 2 (value-add / case-relevant follow-up, same segment framing) | — |
| 6 | Wait | 5 business days |
| 7 | If/else: replied/unsubscribed? → Yes: exit to Phase 4. No: continue | — |
| 8 | Send Email 3 (final intro-sequence touch, soft close) | — |
| 9 | Remove tag `sequence-intro-active`; add tag `sequence-followup-active`; move pipeline stage **Nurture / Biweekly Follow-Up** | — |

Use `references/outreach-playbook.md` and `assets/email-sequence.md` copy for
the actual email bodies once those files are available again — do not
draft final send copy from memory of a file you can't currently see; ask for
a re-upload if the exact approved copy matters for compliance/brand reasons.

### Phase 2 — Evergreen biweekly follow-up loop

This is the "always" part: after the intro sequence, the contact enters an
indefinite 14-day cycle until they reply, unsubscribe, book, or are marked
Do Not Contact. Build as a loop (GHL supports looping back to an earlier
action, or use "Wait" + "Go to Action" back to the top of this phase):

| Step | Action | Timing |
|---|---|---|
| 1 | Wait | 14 days |
| 2 | If/else: replied / unsubscribed / do_not_contact? → Yes: exit to Phase 4 | — |
| 3 | Send biweekly follow-up email (rotate 3-4 templates: industry insight, seasonal/storm-relevant reminder, social proof, direct check-in — avoid repeating the same email verbatim every cycle) | — |
| 4 | Log touch count on contact (increment a "Follow-Up Count" custom field) | — |
| 5 | Go to Action → Step 1 of this phase (loop) | — |

Optional guardrail: cap the loop at a high-but-finite number (e.g. 26 cycles
= 1 year) and route to a "Long-Term Nurture — Review" pipeline stage for a
human decision, rather than truly infinite automation. Recommended even
though the request was "always," since GHL best practice avoids literally
unbounded loops without periodic human review.

### Phase 3 — Task creation (parallel branch, not blocking the email loop)

On every reply detected (any phase): create a GHL task —
- Title: `Reply from {{contact.first_name}} {{contact.last_name}} — {{contact.company_name}}`
- Owner: Robert Randazzo (default; reassign per contact type if the account
  has other sales staff)
- Due: same day
- Description: link to the reply thread + classification (see §5)

### Phase 4 — Exit handling

| Trigger | Action |
|---|---|
| Reply detected | Remove all `sequence-*` tags, add `replied`, stop workflow, move pipeline stage **Replied — Human Review**, create task (Phase 3) |
| Unsubscribe / manual Do Not Contact | Set `do_not_contact = true`, add tag `do-not-contact`, add to GHL global suppression, stop workflow, move pipeline stage **Suppressed** — never re-import into this or any future workflow |
| Bounce / delivery failure | Set `email_status = invalid`, stop workflow, flag for manual research/re-verification before any future re-entry |

---

## 4. Zapier layer (Sheets → GHL)

Per SKILL.md's default stack, prospects originate in Google Sheets. Build one
Zap:

1. **Trigger:** New/updated row in Sheets where `ready_for_crm = TRUE` and
   `approved_for_outreach = TRUE` and `do_not_contact = FALSE`.
2. **Action:** Create/Update Contact in GHL, mapping every column per §2.1.
3. **Action:** Add tags `commercial-prospect` + segment tag (from
   `business_type`).
4. **Filter step** before the workflow-trigger tag is applied: block rows
   where `email_status != verified` — unverified/`probable` emails must not
   auto-enroll (SKILL.md: "Never automatically enroll old, unverified, or
   do-not-contact records into an email workflow").

This tag application is what fires the GHL workflow trigger in §3.

---

## 5. Reply classification → pipeline/tag mapping

| Reply status | Pipeline stage | Tag |
|---|---|---|
| Positive interest | Opportunity / Estimate Requested | `replied`, `positive` |
| Request for information | Replied — Human Review | `replied`, `info-requested` |
| Capability statement requested | Replied — Human Review | `replied`, `capability-doc` |
| Vendor registration requested | Replied — Human Review | `replied`, `vendor-reg` |
| Inspection/estimate requested | Appointment Set (pending) | `replied`, `estimate-requested` |
| Appointment requested | Appointment Set | `replied`, `appointment` |
| Referral to another contact | Replied — Human Review | `replied`, `referral` |
| Not now | Nurture / Biweekly Follow-Up (re-enter Phase 2 only, never Phase 1) | `not-now` |
| Not interested | Lost / Not Interested | `not-interested` |
| Wrong contact | Replied — Human Review | `wrong-contact` |
| Unsubscribe | Suppressed | `do-not-contact` |
| Out of office | (no stage change, auto-continue) | — |
| Delivery failure | (see §3 Phase 4) | `bounced` |
| Human review required | Replied — Human Review | `needs-review` |

---

## 6. Open items / needs your input

1. **Exact copy** for the intro and biweekly emails — pull from
   `references/outreach-playbook.md` and `assets/email-sequence.md`, which
   aren't available in this session anymore. Re-upload the skill zip if you
   want the workflow built with that exact approved language rather than the
   placeholders noted above.
2. **Pipeline/tag names** — if you already have a `qualification-and-pipeline.md`
   spec with different stage/tag names in production, tell me and I'll
   reconcile this doc to match instead of introducing a second naming scheme.
3. **Sending mailbox/domain** — confirm which mailbox and domain this will
   send from so the §1 prerequisite checklist can be marked off.
4. **Loop cap** — confirm whether you want the biweekly loop truly infinite
   or capped with a human-review checkpoint (recommended: cap at ~1 year).
