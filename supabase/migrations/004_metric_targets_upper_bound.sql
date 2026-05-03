-- Metric targets: use upper bound of numeric bands (e.g. 5/week not 3–5/week)
-- and upper bound of % bands (e.g. 40% increase not 20–40%).

-- Dedicated Sales Owner
UPDATE public.experiments SET
  hypothesized_target_note = $ht$Targets use the upper bound of count bands (5 per week, 2 per month) and a single rate goal (20% of calls close) instead of spread ranges.$ht$
WHERE id = 'f0000001-0000-4000-8000-000000000001';

UPDATE public.metrics SET target_value = '5 per week', warning_threshold = 'Below 3 per week triggers review'
WHERE id = 'f1000001-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '2 per month', warning_threshold = '0 new clients in any rolling 30-day window'
WHERE id = 'f1000001-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '20% of discovery calls close', warning_threshold = 'Below 10% close rate triggers messaging review'
WHERE id = 'f1000001-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '100% of active opportunities logged in CRM', warning_threshold = 'Any active opportunity missing from CRM more than 48 hours'
WHERE id = 'f1000001-0000-4000-8000-000000000004';

-- Daily Outbound System
UPDATE public.experiments SET
  hypothesized_target_note = $ht$50 messages per working day (upper of 20–50); 20% reply rate (upper of 10–20%); 10 discovery calls per week from outbound (upper of 5–10). One winning variant by day 14.$ht$
WHERE id = 'f0000002-0000-4000-8000-000000000002';

UPDATE public.metrics SET target_value = '50 per working day', warning_threshold = 'Below 20 messages on a working day'
WHERE id = 'f1000002-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '20% reply rate', warning_threshold = 'Below 10% reply rate'
WHERE id = 'f1000002-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '10 per week from outbound', warning_threshold = 'Below 5 calls in a week'
WHERE id = 'f1000002-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '1 winning variant by day 14', warning_threshold = 'No winning variant by day 21'
WHERE id = 'f1000002-0000-4000-8000-000000000004';

-- Proposal Follow-Up System
UPDATE public.experiments SET
  hypothesized_target_note = $ht$30% of proposals get a written response; 40% increase in close rate vs. baseline when a lift band was implied; 2 deals recovered per month; average decision within 10 calendar days.$ht$
WHERE id = 'f0000003-0000-4000-8000-000000000003';

UPDATE public.metrics SET target_value = '30% of proposals receive a written response', warning_threshold = 'Below 15% response rate in a month'
WHERE id = 'f1000003-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '40% increase in close rate vs. baseline', warning_threshold = 'Below 20% lift vs. baseline after 10 proposals'
WHERE id = 'f1000003-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '2 deals recovered per month', warning_threshold = '0 deals recovered in any 45-day window'
WHERE id = 'f1000003-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '10 calendar days max average to yes or no', warning_threshold = 'Rolling average exceeds 14 days'
WHERE id = 'f1000003-0000-4000-8000-000000000004';

-- ICP Audit
UPDATE public.experiments SET
  hypothesized_target_note = $ht$30% increase in reply rate vs. baseline (upper of 20–30%); 15% increase in close rate vs. baseline; at most 10% of active pipeline leads outside ICP.$ht$
WHERE id = 'f0000004-0000-4000-8000-000000000004';

UPDATE public.metrics SET target_value = 'Approved by day 7', warning_threshold = 'Not approved by day 10'
WHERE id = 'f1000004-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '30% increase in reply rate vs. baseline', warning_threshold = 'Below 20% lift vs. baseline in a month'
WHERE id = 'f1000004-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '15% increase in close rate vs. baseline', warning_threshold = 'Below 5% lift vs. baseline in a quarter'
WHERE id = 'f1000004-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '10% max of pipeline leads outside ICP', warning_threshold = 'More than 25% of pipeline outside ICP'
WHERE id = 'f1000004-0000-4000-8000-000000000004';

-- $3K Starter Offer
UPDATE public.experiments SET
  hypothesized_target_note = $ht$35% of warm pitches convert (upper of 25–35%); 7-day median to signed; 20% upsell to full engagement within 60 days (upper of 1-in-5 style bands); $3000 within 3 weeks of kickoff (upper of 2–3 week delivery).$ht$
WHERE id = 'f0000005-0000-4000-8000-000000000005';

UPDATE public.metrics SET target_value = '35% of warm pitches sign', warning_threshold = 'Below 25% close rate on first 10 pitches'
WHERE id = 'f1000005-0000-4000-8000-000000000001';
UPDATE public.metrics SET target_value = '7 days median pitch to signed', warning_threshold = 'Median exceeds 14 days'
WHERE id = 'f1000005-0000-4000-8000-000000000002';
UPDATE public.metrics SET target_value = '20% upsell to full engagement within 60 days', warning_threshold = '0 upsells after first 5 fulfilled starters'
WHERE id = 'f1000005-0000-4000-8000-000000000003';
UPDATE public.metrics SET target_value = '$3000 within 3 weeks of kickoff', warning_threshold = 'Below $3000 or delivery beyond 3 weeks without written change order'
WHERE id = 'f1000005-0000-4000-8000-000000000004';
