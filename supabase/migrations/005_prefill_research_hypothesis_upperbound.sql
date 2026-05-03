-- Richer prefilled research + hypothesized rationale; narrative fields use upper-bound wording; metric targets unchanged from 004.

-- Dedicated Sales Owner
UPDATE public.experiments SET
  research_basis = $rb$Research referenced: (1) B2B pipeline accountability — single-threaded opportunity ownership and stage-to-close responsibility (revenue ops “one owner” deal reviews); (2) CRM as system of record — no active opportunities living only in inboxes or side channels; (3) SMB founder-led velocity — weekly discovery throughput as a capacity check when headcount is tight.$rb$,
  hypothesized_target_note = $ht$Hypothesized targets rationale — upper bound everywhere: (1) Calls 5/week — top of the prior 3–5/week band so planning and reporting use one number. (2) Clients 2/month — top of 1–2/month. (3) Close quality 20% of discovery calls close — single explicit rate instead of a spread. (4) Pipeline 100% of active opportunities logged — compliance target at the maximum we expect to enforce.$ht$
WHERE id = 'f0000001-0000-4000-8000-000000000001';

-- Daily Outbound System
UPDATE public.experiments SET
  hypothesis = $h$If we send up to 50 targeted, personalized LinkedIn messages daily to ICP-matched prospects, then we'll generate consistent reply flow within 2 weeks, because volume accelerates learning and surfaces what messaging actually resonates.$h$,
  experiment_description = $e$Rose sends up to 50 personalized LinkedIn connection requests and messages per day to prospects matching our ICP (founder-led service businesses, up to 20 employees). Track reply rate and test 3 message variants simultaneously. Best performer becomes the control.$e$,
  research_basis = $rb$Research referenced: (1) Outbound “learning lane” norms — sustained daily touch volume so learning compounds (common in SDR-style outbound, often quoted in the 25–50 touches/day range for high-activity modes); (2) founder-led LinkedIn reply benchmarks for B2B services; (3) disciplined A/B messaging — pick one winning variant by end of the test window instead of endless parallel copy.$rb$,
  hypothesized_target_note = $ht$Hypothesized targets rationale — upper bound everywhere: (1) Messages 50/working day — top of the 20–50/day band. (2) Reply 20% reply rate — top of the 10–20% band expressed as one headline metric. (3) Outbound-sourced calls 10/week — top of the 5–10 band. (4) Winning variant by day 14 — latest day in the “end of week two” selection window so the team stops splitting traffic.$ht$
WHERE id = 'f0000002-0000-4000-8000-000000000002';

-- Proposal Follow-Up System
UPDATE public.experiments SET
  research_basis = $rb$Research referenced: (1) Multi-touch follow-up after proposals in consultative B2B — “silent no” vs true rejection; (2) structured cadence discipline (+2 / +5 / +10) to re-surface decisions without nagging; (3) recovery of stalled opportunities via explicit logging in CRM.$rb$,
  hypothesized_target_note = $ht$Hypothesized targets rationale — upper bound everywhere: (1) Written response 30% of proposals — top of the historical 15–30% style band for proposal engagement. (2) Close lift 40% vs baseline — top of an implied 20–40% improvement band when moving from ad hoc to systematic follow-up. (3) Deals recovered 2/month — high end when prior planning used “at least 1”. (4) Time to yes/no average capped at 10 calendar days — tight upper bound on decision latency.$ht$
WHERE id = 'f0000003-0000-4000-8000-000000000003';

-- ICP Audit
UPDATE public.experiments SET
  experiment_description = $e$Pull data on all past and current clients. Analyze by: industry vertical, company size, budget range, buyer persona (title/role), pain points, and time to close. Identify the top 5 with the best outcomes. Write a 1-page ICP doc. Update all outbound targeting and messaging to reflect it.$e$,
  research_basis = $rb$Research referenced: (1) Ideal Customer Profile tightening — narrow who you pursue before scaling volume (SaaS positioning and outbound personalization practice); (2) message–market fit — sharper ICP lifts reply quality faster than more volume; (3) pipeline hygiene — cap wrong-fit opps so outbound discipline matches the doc.$rb$,
  hypothesized_target_note = $ht$Hypothesized targets rationale — upper bound everywhere: (1) ICP doc approved by day 7 — latest acceptable day in the week-one window. (2) Reply lift 30% vs baseline — top of the 20–30% band. (3) Close lift 15% vs baseline — single headline uplift target from planning. (4) Wrong-fit share 10% max of pipeline outside ICP — ceiling aligned to “under 10%” intent expressed as one number.$ht$
WHERE id = 'f0000004-0000-4000-8000-000000000004';

-- $3K Starter Offer
UPDATE public.experiments SET
  hypothesis = $h$If we offer a $3K fixed-scope starter package with a defined 3 week deliverable, then more warm prospects will convert faster, because the decision feels low-risk even if the relationship grows into something larger.$h$,
  experiment_description = $e$Create "Sparken Starter" offer: brand audit + 1-page positioning strategy + 1 landing page. Fixed price ($3,000), fixed scope, 3 week delivery, one round of revisions. Pitch to 10 warm prospects who have previously expressed interest but not signed. Track close rate, time to yes/no, and upsell conversion within 60 days.$e$,
  research_basis = $rb$Research referenced: (1) Productized service entry offers and risk reversal in fixed-scope pilots (commonly discussed in the ~$2–5K pilot band for services); (2) decision-friction reduction for warm-but-hesitant buyers; (3) upsell path design after a bounded first delivery.$rb$,
  hypothesized_target_note = $ht$Hypothesized targets rationale — upper bound everywhere: (1) Close on warm pitches 35% — top of the 25–35% band on the first 10 pitches. (2) Time to signed 7-day median — aggressive end of the “within a week” intent. (3) Upsell 20% within 60 days — top of a 1-in-5 style expectation. (4) Revenue $3000 within 3 weeks of kickoff — latest acceptable delivery/revenue window from a 2–3 week scope band.$ht$
WHERE id = 'f0000005-0000-4000-8000-000000000005';
