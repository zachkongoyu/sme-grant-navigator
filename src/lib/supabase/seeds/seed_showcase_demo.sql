-- ─────────────────────────────────────────────────────────────────────────────
-- seed_showcase_demo.sql
-- 20 mock projects for local / staging showcase demo.
-- Run in Supabase SQL editor (service role).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Seed fake auth users ───────────────────────────────────────────────────
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
values
  ('00000001-0000-0000-0000-000000000001', 'alice@demo.thunder', 'x', now(), now(), now(), '{"provider":"email"}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000002', 'bob@demo.thunder',   'x', now(), now(), now(), '{"provider":"email"}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000003', 'carol@demo.thunder', 'x', now(), now(), now(), '{"provider":"email"}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000004', 'dev@demo.thunder',   'x', now(), now(), now(), '{"provider":"email"}', '{}', 'authenticated', 'authenticated'),
  ('00000001-0000-0000-0000-000000000005', 'eva@demo.thunder',   'x', now(), now(), now(), '{"provider":"email"}', '{}', 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- ── 2. Seed profiles ──────────────────────────────────────────────────────────
insert into public.profiles (id, display_name, headline, roles, location, is_public, credits_balance, free_checks_used)
values
  ('00000001-0000-0000-0000-000000000001', 'Alice Chen',   'Building fintech for the unbanked',      '{"founder"}',              'Singapore',   true, 0, 0),
  ('00000001-0000-0000-0000-000000000002', 'Bob Lam',      'Full-stack founder. Ex-Google.',          '{"founder","engineer"}',   'Hong Kong',   true, 0, 0),
  ('00000001-0000-0000-0000-000000000003', 'Carol Wu',     'Health tech & longevity obsessed',       '{"founder","sme_owner"}',  'Taipei',      true, 0, 0),
  ('00000001-0000-0000-0000-000000000004', 'Dev Patel',    'Developer tools & AI infra',              '{"founder"}',              'Bangalore',   true, 0, 0),
  ('00000001-0000-0000-0000-000000000005', 'Eva Müller',   'Product designer turned founder',        '{"founder","advisor"}',    'Berlin',      true, 0, 0)
on conflict (id) do nothing;

-- ── 3. Seed 20 projects ───────────────────────────────────────────────────────
insert into public.projects (slug, created_by, makers, name, tagline, description, web_url, stage, status, platform, sector, seeking, traction)
values

-- AI / Tools
('staxio',
 '00000001-0000-0000-0000-000000000004',
 array['00000001-0000-0000-0000-000000000004']::uuid[],
 'Staxio',
 'Drag-and-drop AI pipeline builder for non-engineers',
 'Staxio lets product teams wire up LLM workflows without writing a line of code. Chain prompts, conditionals, and API calls visually.',
 'https://staxio.io', 'building', 'published',
 array['web'], array['ai','b2b'], array['beta-users','investment'], '340 waitlist signups'),

('draftpilot',
 '00000001-0000-0000-0000-000000000001',
 array['00000001-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000002']::uuid[],
 'DraftPilot',
 'AI co-pilot for grant and proposal writing',
 'Trained on thousands of successful grant applications. DraftPilot suggests structure, flags weak sections, and auto-fills boilerplate.',
 'https://draftpilot.ai', 'launched', 'published',
 array['web'], array['ai','b2b'], array['investment','partnerships'], '1,200 drafts generated'),

('lumendb',
 '00000001-0000-0000-0000-000000000004',
 array['00000001-0000-0000-0000-000000000004']::uuid[],
 'LumenDB',
 'Postgres-compatible vector DB you can self-host in 60 seconds',
 'Drop-in replacement that adds pgvector semantics to any Postgres instance. No external infra, no vendor lock-in.',
 null, 'building', 'published',
 array['api','desktop'], array['ai','deeptech'], array['beta-users','engineers'], '80 GitHub stars in week 1'),

-- Fintech
('claripay',
 '00000001-0000-0000-0000-000000000001',
 array['00000001-0000-0000-0000-000000000001']::uuid[],
 'ClariPay',
 'Cross-border payroll for distributed teams in Southeast Asia',
 'Single dashboard to pay contractors in SGD, HKD, PHP, IDR and MYR. Automatic local tax withholding and payslip generation.',
 'https://claripay.co', 'launched', 'published',
 array['web'], array['fintech','b2b'], array['investment'], '$40K MRR, 60 companies'),

('coincheck-hk',
 '00000001-0000-0000-0000-000000000002',
 array['00000001-0000-0000-0000-000000000002']::uuid[],
 'CoinCheck',
 'Crypto tax calculator built for HK residents',
 'Connects to 30+ exchanges and wallets. Generates HKIRD-ready reports in minutes. Supports DeFi, staking and NFT transactions.',
 'https://coincheck.hk', 'launched', 'published',
 array['web'], array['fintech'], array['beta-users'], '2,000 reports generated'),

('float-float',
 '00000001-0000-0000-0000-000000000001',
 array['00000001-0000-0000-0000-000000000001']::uuid[],
 'Float',
 'Cash flow forecasting for SMEs — no spreadsheets',
 'Connect your accounting software and see a rolling 90-day cash position. Get alerts before you run dry.',
 null, 'building', 'published',
 array['web'], array['fintech','b2b'], array['co-founder','investment'], '47 early-access signups, pre-revenue'),

-- Health
('longeviq',
 '00000001-0000-0000-0000-000000000003',
 array['00000001-0000-0000-0000-000000000003']::uuid[],
 'LongeviQ',
 'Personalised longevity protocols from your bloodwork',
 'Upload lab results, get an evidence-based action plan. Tracks biomarkers over time and adjusts recommendations as you improve.',
 'https://longeviq.com', 'launched', 'published',
 array['web','ios'], array['healthtech'], array['investment','beta-users'], '900 active users, 4.8★ rating'),

('physioloop',
 '00000001-0000-0000-0000-000000000003',
 array['00000001-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000005']::uuid[],
 'PhysioLoop',
 'Remote physio rehab with AI form correction',
 'Patients do exercises at home via phone camera. AI checks form in real time and sends progress reports to the physio.',
 null, 'building', 'published',
 array['ios','android'], array['healthtech'], array['investment','co-founder'], '3 clinic pilots running'),

-- PropTech
('stackdeed',
 '00000001-0000-0000-0000-000000000002',
 array['00000001-0000-0000-0000-000000000002']::uuid[],
 'StackDeed',
 'Fractional property ownership on-chain',
 'Tokenise residential property into 1,000 shares. Investors buy fractions, earn rental yield, and trade on a secondary market.',
 'https://stackdeed.io', 'idea', 'published',
 array['web'], array['proptech','fintech'], array['investment','advisors'], 'White paper live; 5 property owners in talks'),

('rentready',
 '00000001-0000-0000-0000-000000000005',
 array['00000001-0000-0000-0000-000000000005']::uuid[],
 'RentReady',
 'Instant tenant screening and lease signing for landlords',
 'Full credit, reference and background check in under 10 minutes. Digital lease with e-signature. Deposit held in escrow.',
 'https://rentready.app', 'launched', 'published',
 array['web','ios','android'], array['proptech','b2b'], array['partnerships'], '500 leases signed'),

-- EdTech
('classcal',
 '00000001-0000-0000-0000-000000000005',
 array['00000001-0000-0000-0000-000000000005']::uuid[],
 'Classcal',
 'Live tutoring marketplace with instant matching',
 'Students get matched to a verified tutor in under 2 minutes. Pay per session, no subscriptions. Tutors set their own rates.',
 'https://classcal.com', 'launched', 'published',
 array['web','ios'], array['edtech','b2b'], array['investment'], '3,000 sessions booked'),

('syntaxbuddy',
 '00000001-0000-0000-0000-000000000004',
 array['00000001-0000-0000-0000-000000000004']::uuid[],
 'SyntaxBuddy',
 'Learn to code through debugging real bugs',
 'Instead of toy exercises, learners fix intentionally broken real-world repos. Hints are Socratic — the AI never just gives the answer.',
 null, 'building', 'published',
 array['web'], array['edtech','ai'], array['beta-users','co-founder'], '200 beta learners'),

-- B2B SaaS
('reviewsync',
 '00000001-0000-0000-0000-000000000002',
 array['00000001-0000-0000-0000-000000000002']::uuid[],
 'ReviewSync',
 'Aggregate and respond to reviews from every platform in one place',
 'Google, Tripadvisor, OpenRice, Yelp — one inbox. AI drafts contextual replies. Sentiment trends and competitor benchmarking.',
 'https://reviewsync.io', 'launched', 'published',
 array['web','chrome-extension'], array['b2b'], array['partnerships','investment'], '$8K MRR'),

('onboardkit',
 '00000001-0000-0000-0000-000000000001',
 array['00000001-0000-0000-0000-000000000001','00000001-0000-0000-0000-000000000005']::uuid[],
 'OnboardKit',
 'No-code employee onboarding workflows',
 'Build onboarding checklists with tasks, videos, quizzes and e-signatures. Managers see completion in real time. Integrates with Notion and Slack.',
 'https://onboardkit.co', 'launched', 'published',
 array['web'], array['b2b'], array['investment'], '120 companies, $15K MRR'),

('pingdesk',
 '00000001-0000-0000-0000-000000000004',
 array['00000001-0000-0000-0000-000000000004']::uuid[],
 'PingDesk',
 'On-call rotation and incident management for small eng teams',
 'Lightweight alternative to PagerDuty. Set up rotations in 5 minutes. Alerts via WhatsApp, Telegram or SMS. Post-mortem templates included.',
 null, 'building', 'published',
 array['web','api'], array['b2b','deeptech'], array['beta-users'], '40 teams in beta'),

-- Consumer / B2C
('wanderlist-app',
 '00000001-0000-0000-0000-000000000003',
 array['00000001-0000-0000-0000-000000000003']::uuid[],
 'Wanderlist',
 'Collaborative travel planning that actually works',
 'Shared itinerary builder with voting, budgeting, and live map. No more 47-tab group chats. Works offline.',
 'https://wanderlist.app', 'launched', 'published',
 array['ios','android'], array['b2c'], array['investment'], '50K downloads, 4.7★'),

('mealprepd',
 '00000001-0000-0000-0000-000000000005',
 array['00000001-0000-0000-0000-000000000005']::uuid[],
 'MealPrepd',
 'Meal plan generator that adapts to your fridge',
 'Photo your fridge, get a weekly meal plan with a shopping delta. Learns your taste preferences over time. Generates a grocery list.',
 null, 'building', 'published',
 array['ios'], array['b2c','ai'], array['beta-users'], '600 beta users'),

-- DeepTech
('latentlens',
 '00000001-0000-0000-0000-000000000004',
 array['00000001-0000-0000-0000-000000000004']::uuid[],
 'LatentLens',
 'Visual debugging for neural network activations',
 'See what your model is "looking at" layer by layer. Drag sliders to compare activation maps across runs. Works with PyTorch and JAX.',
 'https://latentlens.dev', 'launched', 'published',
 array['web','desktop'], array['ai','deeptech'], array['engineers','beta-users'], '1,500 researchers using it'),

('soilsense',
 '00000001-0000-0000-0000-000000000003',
 array['00000001-0000-0000-0000-000000000003','00000001-0000-0000-0000-000000000001']::uuid[],
 'SoilSense',
 'IoT soil health monitoring for smallholder farms',
 'Cheap wireless sensors + mobile app. Tracks NPK, moisture and pH. AI recommends when and how much to irrigate and fertilise.',
 null, 'building', 'published',
 array['ios','android','api'], array['deeptech','b2b'], array['investment','partnerships'], '12 farm pilots in Vietnam'),

('carbonledger',
 '00000001-0000-0000-0000-000000000001',
 array['00000001-0000-0000-0000-000000000001']::uuid[],
 'CarbonLedger',
 'Scope 1, 2 and 3 emissions tracking for SMEs',
 'Connect your suppliers, utilities and logistics data. Automated carbon accounting aligned with GHG Protocol. Export audit-ready reports.',
 'https://carbonledger.co', 'launched', 'published',
 array['web','api'], array['b2b','deeptech'], array['investment','advisors'], '30 enterprise pilots, raising seed')

on conflict (slug) do nothing;
