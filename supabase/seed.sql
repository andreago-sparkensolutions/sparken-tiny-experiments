-- Seed: 5 experiments, 20 metrics — all current_value NULL, metric status pending
-- Requires migrations through 007 (target_upper_bound numeric + assignee_email on metrics).

BEGIN;

INSERT INTO public.experiments (
  id, title, emoji, status, category, observation, question, hypothesis, experiment_description,
  research_basis, hypothesized_target_note, target_owner_email
)
VALUES (
  'f0000001-0000-4000-8000-000000000001',
  'Dedicated Sales Owner',
  '🎯',
  'running',
  'Sales',
  $obs$Deals aren't getting closed because nobody fully owns the process from first touch to signed contract. Leads come in, conversations start, and then momentum dies — not from rejection, but from no one following through.$obs$,
  $q$What happens to close rate and pipeline visibility when one person is accountable for every step of the sales cycle?$q$,
  $h$If one person owns sales end-to-end, then we'll close more consistently, because there's nowhere for leads to fall through the cracks and accountability creates urgency.$h$,
  $e$Assign Rose as dedicated Sales Owner. She runs all outreach, books discovery calls, handles follow-up sequences, and owns the close. Weekly pipeline review with Andrea every Monday. All activity logged in CRM.$e$,
  $rb$Research referenced: (1) B2B pipeline accountability — single-threaded opportunity ownership and stage-to-close responsibility (revenue ops “one owner” deal reviews); (2) CRM as system of record — no active opportunities living only in inboxes or side channels; (3) SMB founder-led velocity — weekly discovery throughput as a capacity check when headcount is tight.$rb$,
  $ht$Hypothesized targets rationale — upper bound everywhere: (1) Calls 5/week — top of the prior 3–5/week band so planning and reporting use one number. (2) Clients 2/month — top of 1–2/month. (3) Close quality 20% of discovery calls close — single explicit rate instead of a spread. (4) Pipeline 100% of active opportunities logged — compliance target at the maximum we expect to enforce.$ht$,
  'rose@sparken.example'
);

INSERT INTO public.metrics (id, experiment_id, label, target_value, target_upper_bound, current_value, warning_threshold, status, sort_order, assignee_email) VALUES
  ('f1000001-0000-4000-8000-000000000001', 'f0000001-0000-4000-8000-000000000001', 'Calls booked / week', NULL, 5, NULL, 'Below 3 per week triggers review', 'pending', 0, 'rose@sparken.example'),
  ('f1000001-0000-4000-8000-000000000002', 'f0000001-0000-4000-8000-000000000001', 'Clients closed / month', NULL, 2, NULL, '0 new clients in any rolling 30-day window', 'pending', 1, 'rose@sparken.example'),
  ('f1000001-0000-4000-8000-000000000003', 'f0000001-0000-4000-8000-000000000001', 'Close rate', NULL, 20, NULL, 'Below 10% close rate triggers messaging review', 'pending', 2, 'rose@sparken.example'),
  ('f1000001-0000-4000-8000-000000000004', 'f0000001-0000-4000-8000-000000000001', 'Pipeline visibility', NULL, 100, NULL, 'Any active opportunity missing from CRM more than 48 hours', 'pending', 3, 'rose@sparken.example');

INSERT INTO public.experiments (
  id, title, emoji, status, category, observation, question, hypothesis, experiment_description,
  research_basis, hypothesized_target_note, target_owner_email
)
VALUES (
  'f0000002-0000-4000-8000-000000000002',
  'Daily Outbound System',
  '📣',
  'running',
  'Sales',
  $obs$Sparken has no consistent lead generation engine. New clients arrive through referrals or accidental timing — neither is predictable or scalable. There is no way to forecast revenue because there is no control over top-of-funnel.$obs$,
  $q$Can we build a predictable, measurable pipeline by running structured daily outbound on LinkedIn?$q$,
  $h$If we send up to 50 targeted, personalized LinkedIn messages daily to ICP-matched prospects, then we'll generate consistent reply flow within 2 weeks, because volume accelerates learning and surfaces what messaging actually resonates.$h$,
  $e$Rose sends up to 50 personalized LinkedIn connection requests and messages per day to prospects matching our ICP (founder-led service businesses, up to 20 employees). Track reply rate and test 3 message variants simultaneously. Best performer becomes the control.$e$,
  $rb$Research referenced: (1) Outbound “learning lane” norms — sustained daily touch volume so learning compounds (common in SDR-style outbound, often quoted in the 25–50 touches/day range for high-activity modes); (2) founder-led LinkedIn reply benchmarks for B2B services; (3) disciplined A/B messaging — pick one winning variant by end of the test window instead of endless parallel copy.$rb$,
  $ht$Hypothesized targets rationale — upper bound everywhere: (1) Messages 50/working day — top of the 20–50/day band. (2) Reply 20% reply rate — top of the 10–20% band expressed as one headline metric. (3) Outbound-sourced calls 10/week — top of the 5–10 band. (4) Winning variant by day 14 — latest day in the “end of week two” selection window so the team stops splitting traffic.$ht$,
  'rose@sparken.example'
);

INSERT INTO public.metrics (id, experiment_id, label, target_value, target_upper_bound, current_value, warning_threshold, status, sort_order, assignee_email) VALUES
  ('f1000002-0000-4000-8000-000000000001', 'f0000002-0000-4000-8000-000000000002', 'Messages sent / day', NULL, 50, NULL, 'Below 20 messages on a working day', 'pending', 0, 'rose@sparken.example'),
  ('f1000002-0000-4000-8000-000000000002', 'f0000002-0000-4000-8000-000000000002', 'Reply rate', NULL, 20, NULL, 'Below 10% reply rate', 'pending', 1, 'rose@sparken.example'),
  ('f1000002-0000-4000-8000-000000000003', 'f0000002-0000-4000-8000-000000000002', 'Calls booked / week from outbound', NULL, 10, NULL, 'Below 5 calls in a week', 'pending', 2, 'rose@sparken.example'),
  ('f1000002-0000-4000-8000-000000000004', 'f0000002-0000-4000-8000-000000000002', 'Winning message variant identified', NULL, 1, NULL, 'No winning variant by day 21', 'pending', 3, 'rose@sparken.example');

INSERT INTO public.experiments (
  id, title, emoji, status, category, observation, question, hypothesis, experiment_description,
  research_basis, hypothesized_target_note, target_owner_email
)
VALUES (
  'f0000003-0000-4000-8000-000000000003',
  'Proposal Follow-Up System',
  '📬',
  'running',
  'Sales',
  $obs$Multiple proposals have been sent with no structured follow-up. When prospects go quiet, silence has been treated as rejection. Revenue is likely being left on the table because most people don't say no — they just get busy and forget.$obs$,
  $q$How many deals can we recover by implementing a consistent 3-touch follow-up sequence after every proposal?$q$,
  $h$If we add a structured 3-touch follow-up after every proposal, then close rate will increase by at least 20%, because most prospects need a nudge, not a no, and a timely follow-up re-surfaces the decision at the right moment.$h$,
  $e$After every proposal sent — Touch 1 at +2 days (friendly check-in), Touch 2 at +5 days (value reinforcement, share a relevant insight or case study), Touch 3 at +10 days (final ask with a soft deadline). Log every proposal, every follow-up sent, and every response in CRM.$e$,
  $rb$Research referenced: (1) Multi-touch follow-up after proposals in consultative B2B — “silent no” vs true rejection; (2) structured cadence discipline (+2 / +5 / +10) to re-surface decisions without nagging; (3) recovery of stalled opportunities via explicit logging in CRM.$rb$,
  $ht$Hypothesized targets rationale — upper bound everywhere: (1) Written response 30% of proposals — top of the historical 15–30% style band for proposal engagement. (2) Close lift 40% vs baseline — top of an implied 20–40% improvement band when moving from ad hoc to systematic follow-up. (3) Deals recovered 2/month — high end when prior planning used “at least 1”. (4) Time to yes/no average capped at 10 calendar days — tight upper bound on decision latency.$ht$,
  'rose@sparken.example'
);

INSERT INTO public.metrics (id, experiment_id, label, target_value, target_upper_bound, current_value, warning_threshold, status, sort_order, assignee_email) VALUES
  ('f1000003-0000-4000-8000-000000000001', 'f0000003-0000-4000-8000-000000000003', 'Follow-up response rate', NULL, 30, NULL, 'Below 15% response rate in a month', 'pending', 0, 'rose@sparken.example'),
  ('f1000003-0000-4000-8000-000000000002', 'f0000003-0000-4000-8000-000000000003', 'Close rate lift vs. baseline', NULL, 40, NULL, 'Below 20% lift vs. baseline after 10 proposals', 'pending', 1, 'rose@sparken.example'),
  ('f1000003-0000-4000-8000-000000000003', 'f0000003-0000-4000-8000-000000000003', 'Deals recovered / month', NULL, 2, NULL, '0 deals recovered in any 45-day window', 'pending', 2, 'rose@sparken.example'),
  ('f1000003-0000-4000-8000-000000000004', 'f0000003-0000-4000-8000-000000000003', 'Average time to response', NULL, 10, NULL, 'Rolling average exceeds 14 days', 'pending', 3, 'rose@sparken.example');

INSERT INTO public.experiments (
  id, title, emoji, status, category, observation, question, hypothesis, experiment_description,
  research_basis, hypothesized_target_note, target_owner_email
)
VALUES (
  'f0000004-0000-4000-8000-000000000004',
  'ICP Audit',
  '🔍',
  'running',
  'Positioning',
  $obs$Sparken's outreach produces inconsistent results. Some prospects immediately understand the value and move fast. Others seem confused about what we do or who we're for. The difference correlates with client type, not message quality — which means we're targeting too broadly.$obs$,
  $q$Who are the clients Sparken has loved working with, and what specific attributes do they share — so we can deliberately target more of them?$q$,
  $h$If we analyze our best past clients and rebuild targeting and messaging around their shared attributes, then reply rates and close rates will both improve significantly, because specificity creates resonance and reduces friction.$h$,
  $e$Pull data on all past and current clients. Analyze by: industry vertical, company size, budget range, buyer persona (title/role), pain points, and time to close. Identify the top 5 with the best outcomes. Write a 1-page ICP doc. Update all outbound targeting and messaging to reflect it.$e$,
  $rb$Research referenced: (1) Ideal Customer Profile tightening — narrow who you pursue before scaling volume (SaaS positioning and outbound personalization practice); (2) message–market fit — sharper ICP lifts reply quality faster than more volume; (3) pipeline hygiene — cap wrong-fit opps so outbound discipline matches the doc.$rb$,
  $ht$Hypothesized targets rationale — upper bound everywhere: (1) ICP doc approved by day 7 — latest acceptable day in the week-one window. (2) Reply lift 30% vs baseline — top of the 20–30% band. (3) Close lift 15% vs baseline — single headline uplift target from planning. (4) Wrong-fit share 10% max of pipeline outside ICP — ceiling aligned to “under 10%” intent expressed as one number.$ht$,
  'andrea@sparken.example'
);

INSERT INTO public.metrics (id, experiment_id, label, target_value, target_upper_bound, current_value, warning_threshold, status, sort_order, assignee_email) VALUES
  ('f1000004-0000-4000-8000-000000000001', 'f0000004-0000-4000-8000-000000000004', 'ICP document completed', NULL, 7, NULL, 'Not approved by day 10', 'pending', 0, 'andrea@sparken.example'),
  ('f1000004-0000-4000-8000-000000000002', 'f0000004-0000-4000-8000-000000000004', 'Reply rate after ICP update', NULL, 30, NULL, 'Below 20% lift vs. baseline in a month', 'pending', 1, 'andrea@sparken.example'),
  ('f1000004-0000-4000-8000-000000000003', 'f0000004-0000-4000-8000-000000000004', 'Close rate after ICP update', NULL, 15, NULL, 'Below 5% lift vs. baseline in a quarter', 'pending', 2, 'andrea@sparken.example'),
  ('f1000004-0000-4000-8000-000000000004', 'f0000004-0000-4000-8000-000000000004', 'Wrong-fit leads in pipeline', NULL, 10, NULL, 'More than 25% of pipeline outside ICP', 'pending', 3, 'andrea@sparken.example');

INSERT INTO public.experiments (
  id, title, emoji, status, category, observation, question, hypothesis, experiment_description,
  research_basis, hypothesized_target_note, target_owner_email
)
VALUES (
  'f0000005-0000-4000-8000-000000000005',
  '$3K Starter Offer',
  '💰',
  'running',
  'Offer',
  $obs$Warm prospects who like Sparken are still hesitating before signing. The full engagement feels like a significant commitment for someone who hasn't worked with us before. The gap between "interested" and "signed" is too wide.$obs$,
  $q$Would a smaller, fixed-scope entry offer reduce friction enough to get more prospects to say yes faster — and still lead to full engagements?$q$,
  $h$If we offer a $3K fixed-scope starter package with a defined 3 week deliverable, then more warm prospects will convert faster, because the decision feels low-risk even if the relationship grows into something larger.$h$,
  $e$Create "Sparken Starter" offer: brand audit + 1-page positioning strategy + 1 landing page. Fixed price ($3,000), fixed scope, 3 week delivery, one round of revisions. Pitch to 10 warm prospects who have previously expressed interest but not signed. Track close rate, time to yes/no, and upsell conversion within 60 days.$e$,
  $rb$Research referenced: (1) Productized service entry offers and risk reversal in fixed-scope pilots (commonly discussed in the ~$2–5K pilot band for services); (2) decision-friction reduction for warm-but-hesitant buyers; (3) upsell path design after a bounded first delivery.$rb$,
  $ht$Hypothesized targets rationale — upper bound everywhere: (1) Close on warm pitches 35% — top of the 25–35% band on the first 10 pitches. (2) Time to signed 7-day median — aggressive end of the “within a week” intent. (3) Upsell 20% within 60 days — top of a 1-in-5 style expectation. (4) Revenue $3000 within 3 weeks of kickoff — latest acceptable delivery/revenue window from a 2–3 week scope band.$ht$,
  'andrea@sparken.example'
);

INSERT INTO public.metrics (id, experiment_id, label, target_value, target_upper_bound, current_value, warning_threshold, status, sort_order, assignee_email) VALUES
  ('f1000005-0000-4000-8000-000000000001', 'f0000005-0000-4000-8000-000000000005', 'Close rate on warm prospects', NULL, 35, NULL, 'Below 25% close rate on first 10 pitches', 'pending', 0, 'andrea@sparken.example'),
  ('f1000005-0000-4000-8000-000000000002', 'f0000005-0000-4000-8000-000000000005', 'Time to close', NULL, 7, NULL, 'Median exceeds 14 days', 'pending', 1, 'andrea@sparken.example'),
  ('f1000005-0000-4000-8000-000000000003', 'f0000005-0000-4000-8000-000000000005', 'Upsell rate to full engagement', NULL, 20, NULL, '0 upsells after first 5 fulfilled starters', 'pending', 2, 'andrea@sparken.example'),
  ('f1000005-0000-4000-8000-000000000004', 'f0000005-0000-4000-8000-000000000005', 'Revenue per starter (net of time)', NULL, 3000, NULL, 'Below $3000 or delivery beyond 3 weeks without written change order', 'pending', 3, 'andrea@sparken.example');

COMMIT;
