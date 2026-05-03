-- Research notes + hypothesized numeric framing; normalize metric targets to single high numbers / absolutes.

ALTER TABLE public.experiments
  ADD COLUMN IF NOT EXISTS research_basis text,
  ADD COLUMN IF NOT EXISTS hypothesized_target_note text;

COMMENT ON COLUMN public.experiments.research_basis IS 'Sources or reasoning referenced when designing the experiment.';
COMMENT ON COLUMN public.experiments.hypothesized_target_note IS 'How numeric metric targets were chosen (upper bound of ranges, absolutes replacing % lift, etc.).';

-- Dedicated Sales Owner
UPDATE public.experiments SET
  research_basis = $rb$Referenced: single-owner pipeline accountability (coverage models where one rep owns stage-to-close + CRM hygiene) and typical SMB velocity assumptions for founder-led sales.$rb$,
  hypothesized_target_note = $ht$Metric targets use the upper bound of prior ranges (e.g., 5 calls/week, 2 clients/month). Close-rate percentage became 3 won deals/month as an auditable count consistent with roughly five weekly calls at modest win rates once ownership is enforced.$ht$
WHERE id = 'f0000001-0000-4000-8000-000000000001';

UPDATE public.metrics SET target_value = '5 calls booked per week', warning_threshold = 'Below 3 calls/week triggers review'
WHERE id = 'f1000001-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '2 new clients per month', warning_threshold = '0 new clients in any rolling 30-day window'
WHERE id = 'f1000001-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '3 won deals per month', warning_threshold = 'Fewer than 2 won deals in a month triggers messaging review'
WHERE id = 'f1000001-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '100% of active opportunities logged in CRM', warning_threshold = 'Any active opportunity missing from CRM more than 48 hours'
WHERE id = 'f1000001-0000-4000-8000-000000000004';

-- Daily Outbound System
UPDATE public.experiments SET
  research_basis = $rb$Referenced: outbound “learning lane” volume (roughly 25–50 touches/day in SDR-style workflows) and reply-rate heuristics for founder-led B2B LinkedIn outreach.$rb$,
  hypothesized_target_note = $ht$50 messages/day is the high end of the prior band. 15 replies/week and 10 outbound-sourced calls/week are mid-case absolutes once copy–ICP fit lands. One winning variant by day 14 caps parallel messaging tests.$ht$
WHERE id = 'f0000002-0000-4000-8000-000000000002';

UPDATE public.metrics SET target_value = '50 LinkedIn messages sent per working day', warning_threshold = 'Below 35 messages on a working day'
WHERE id = 'f1000002-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '15 prospect replies recorded per week', warning_threshold = 'Fewer than 8 replies in a week'
WHERE id = 'f1000002-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '10 discovery calls booked per week from outbound', warning_threshold = 'Fewer than 6 calls in a week'
WHERE id = 'f1000002-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '1 winning outbound message variant selected by day 14', warning_threshold = 'No winning variant by day 21'
WHERE id = 'f1000002-0000-4000-8000-000000000004';

-- Proposal Follow-Up System
UPDATE public.experiments SET
  research_basis = $rb$Referenced: multi-touch follow-up after proposals in consultative B2B (persistence vs. “silent no”) and recovery of stalled decisions with structured nudges.$rb$,
  hypothesized_target_note = $ht$Replaced percentage lift metrics with countable outcomes: 6 written responses/month, 2 incremental wins/month from follow-up, 2 recovered deals/month, and a 10-day average decision window.$ht$
WHERE id = 'f0000003-0000-4000-8000-000000000003';

UPDATE public.metrics SET target_value = '6 written prospect responses per month after proposals', warning_threshold = 'Fewer than 3 responses in a month'
WHERE id = 'f1000003-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '2 incremental won deals per month attributed to follow-up', warning_threshold = 'Fewer than 1 incremental win in a month'
WHERE id = 'f1000003-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '2 deals recovered per month via follow-up sequence', warning_threshold = '0 deals recovered in any 45-day window'
WHERE id = 'f1000003-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '10 calendar days maximum average from proposal to yes or no', warning_threshold = 'Rolling average exceeds 12 days'
WHERE id = 'f1000003-0000-4000-8000-000000000004';

-- ICP Audit
UPDATE public.experiments SET
  research_basis = $rb$Referenced: ICP tightening and message–market fit work (narrowing who you pursue before scaling volume) common in SaaS positioning and outbound personalization literature.$rb$,
  hypothesized_target_note = $ht$The prior +20–30% reply lift band became 24 qualified replies/week as an absolute post-ICP bar. +15% close lift became 5 incremental closes per quarter. Pipeline discipline is at most 3 off-ICP active opportunities at once.$ht$
WHERE id = 'f0000004-0000-4000-8000-000000000004';

UPDATE public.metrics SET target_value = '1 ICP document approved and shared by day 7', warning_threshold = 'Not approved by day 10'
WHERE id = 'f1000004-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '24 qualified inbound or outbound replies per week', warning_threshold = 'Below 16 replies in a week'
WHERE id = 'f1000004-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '5 incremental closed-won deals per quarter after ICP launch', warning_threshold = 'Fewer than 3 incremental closes in a quarter'
WHERE id = 'f1000004-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '3 off-ICP opportunities maximum in active pipeline at once', warning_threshold = 'More than 5 off-ICP opportunities in pipeline'
WHERE id = 'f1000004-0000-4000-8000-000000000004';

-- $3K Starter Offer
UPDATE public.experiments SET
  research_basis = $rb$Referenced: productized entry offers and risk reversal in fixed-scope pilots (~$2–5K) to compress decision cycles for warm but hesitant buyers.$rb$,
  hypothesized_target_note = $ht$The prior 25–35% close band became 4 signed starters from the first 10 warm pitches. Time-to-close stays at a 7-day median. Upsell is 1 full engagement within 60 days of starter delivery. Revenue is $3000 within 21 days of kickoff per starter.$ht$
WHERE id = 'f0000005-0000-4000-8000-000000000005';

UPDATE public.metrics SET target_value = '4 Starter offers signed within first 10 warm pitches', warning_threshold = 'Fewer than 2 signings from first 10 pitches'
WHERE id = 'f1000005-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '7 calendar days median from pitch to signed agreement', warning_threshold = 'Median exceeds 10 days'
WHERE id = 'f1000005-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '1 full-service upsell within 60 days of starter delivery', warning_threshold = '0 upsells after first 5 fulfilled starters'
WHERE id = 'f1000005-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '$3000 net revenue per starter within 21 days of kickoff', warning_threshold = 'Below $3000 or delivery beyond 21 days without written change order'
WHERE id = 'f1000005-0000-4000-8000-000000000004';
