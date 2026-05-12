-- Scheme detail content tables — FINAL design.
--
-- Design principle:
--   - schemes                     = listing page + single source of truth
--   - scheme_field_translations   = localized overrides for name/administrator/jurisdiction
--   - scheme_sections             = detail page collapsible sections
--   - scheme_metadata             = extra metadata cards NOT in schemes table
--
-- Changes from draft:
--   1. scheme_id changed from 'aef' → 'hk.aef' (follows {jurisdiction}.{slug} convention)
--   2. scheme_metadata uses field_key (e.g. 'investment_stage') instead of free-text label
--   3. difficulty is int 1-5, locale = null (universal, not translated)
--   4. investment_stage & fund_type use fixed enum keys, not free text
--   5. scheme_field_translations added for name/administrator/jurisdiction i18n
--
-- Run AFTER 010_schemes_schema_v2.sql.

-- ── Reference: schemes (existing, NOT modified) ───────────────────────────────
--
--   id            text primary key          -- e.g. 'hk.aef', 'hk.bud-easy'
--   name          text not null             -- default language (English)
--   administrator text not null             -- default language (English)
--   jurisdiction  text not null             -- default language (English)
--   status        text not null             -- 'open', 'coming-soon', 'closed'
--   currency      text not null default 'HKD'
--   max_funding   numeric                   -- null = uncapped
--   next_deadline timestamptz               -- null = rolling
--   corpus        text not null
--   version       int not null default 1
--   last_updated  timestamptz not null default now()
--   source_url    text
--
-- Single source of truth. Do NOT duplicate these in scheme_metadata.

-- ── Table: scheme_field_translations ──────────────────────────────────────────
-- Localized overrides for scheme fields that need translation.
--
-- How it works:
--   1. schemes.name / administrator / jurisdiction store the default (English)
--   2. If a row exists here for the requested locale, use it
--   3. If no row exists, fall back to the schemes table value
--
-- Fields that can be translated:
--   - 'name'          → 計劃名稱
--   - 'administrator' → 管理機構
--   - 'jurisdiction'  → 地區
--
-- Adding a new language = insert rows. No schema changes.

CREATE TABLE scheme_field_translations (
  scheme_id TEXT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  locale    TEXT NOT NULL,              -- 'zh', 'en', 'ja', etc.
  field     TEXT NOT NULL,              -- 'name', 'administrator', 'jurisdiction'
  value     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (scheme_id, locale, field)
);

COMMENT ON TABLE scheme_field_translations IS
  'Localized overrides for scheme fields. Falls back to schemes table if no translation exists.';

COMMENT ON COLUMN scheme_field_translations.field IS
  'Which scheme field is translated: name, administrator, or jurisdiction.';

-- ── Table: scheme_sections ────────────────────────────────────────────────────
-- One row per collapsible section on the detail page.
-- Add new section types by inserting rows — no schema changes.

CREATE TABLE scheme_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id     TEXT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  locale        TEXT NOT NULL DEFAULT 'zh',
  section_key   TEXT NOT NULL,          -- e.g. 'overview', 'eligibility', 'success_stories'
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,          -- plain text or markdown; lists use '|' separator
  display_order INT NOT NULL DEFAULT 0, -- controls render order on the detail page
  is_list       BOOLEAN DEFAULT FALSE,  -- render as <ol> when true; split content by '|'
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(scheme_id, locale, section_key)
);

COMMENT ON TABLE scheme_sections IS
  'Per-section content for scheme detail pages. Add new section types by inserting rows.';

COMMENT ON COLUMN scheme_sections.section_key IS
  'UI section identifier: overview, eligibility, application, highlights, success_stories, etc.';

COMMENT ON COLUMN scheme_sections.content IS
  'Section body. For lists, use "|" separator (e.g. "Item one|Item two|Item three").';

COMMENT ON COLUMN scheme_sections.is_list IS
  'When true, content is split by "|" and rendered as <ol>. When false, rendered as paragraphs.';

-- ── Table: scheme_metadata ────────────────────────────────────────────────────
-- Extra metadata cards on detail pages. ONLY attributes NOT in schemes table.
--
-- Fixed enum fields (application validates these):
--   field_key = 'investment_stage' → value in ['development', 'growth', 'mature']
--   field_key = 'fund_type'        → value in ['government', 'corporate', 'university']
--   field_key = 'difficulty'       → value in ['1','2','3','4','5'], locale IS NULL
--
-- Add new field types by inserting rows with any field_key. No schema changes.

CREATE TABLE scheme_metadata (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id     TEXT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  field_key     TEXT NOT NULL,          -- e.g. 'investment_stage', 'fund_type', 'difficulty'
  value         TEXT NOT NULL,          -- enum key or int string; UI maps to translated label
  locale        TEXT,                   -- null for universal fields (e.g. difficulty 1-5)
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(scheme_id, field_key, locale)
);

COMMENT ON TABLE scheme_metadata IS
  'Extra metadata cards for scheme detail pages. Only store attributes NOT in schemes table. field_key uses enum keys; UI maps to human-readable labels.';

COMMENT ON COLUMN scheme_metadata.field_key IS
  'Identifier for the metadata type. Enum examples: investment_stage, fund_type. Universal examples: difficulty.';

COMMENT ON COLUMN scheme_metadata.value IS
  'Stored as enum key or numeric string. NOT human-readable text. UI maps to translated labels.';

COMMENT ON COLUMN scheme_metadata.locale IS
  'null for universal/non-translated fields (e.g. difficulty 1-5). Set for localized fields.';

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX scheme_sections_scheme_id_idx ON scheme_sections(scheme_id, locale, display_order);
CREATE INDEX scheme_metadata_scheme_id_idx  ON scheme_metadata(scheme_id, display_order);
CREATE INDEX scheme_field_translations_scheme_id_idx ON scheme_field_translations(scheme_id, locale);

-- ── Triggers: updated_at ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheme_sections_updated_at
  BEFORE UPDATE ON scheme_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheme_metadata_updated_at
  BEFORE UPDATE ON scheme_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheme_field_translations_updated_at
  BEFORE UPDATE ON scheme_field_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE scheme_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_field_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY scheme_sections_public_read ON scheme_sections FOR SELECT USING (true);
CREATE POLICY scheme_sections_service_all ON scheme_sections FOR ALL TO service_role USING (true);

CREATE POLICY scheme_metadata_public_read ON scheme_metadata FOR SELECT USING (true);
CREATE POLICY scheme_metadata_service_all ON scheme_metadata FOR ALL TO service_role USING (true);

CREATE POLICY scheme_field_translations_public_read ON scheme_field_translations FOR SELECT USING (true);
CREATE POLICY scheme_field_translations_service_all ON scheme_field_translations FOR ALL TO service_role USING (true);

-- ── Seed: hk.aef (Alibaba Entrepreneurs Fund) ─────────────────────────────────

-- 1. Insert base scheme row (required for FK constraints)
INSERT INTO schemes (id, name, administrator, jurisdiction, status, currency, max_funding, next_deadline, corpus, version, last_updated, source_url)
VALUES (
  'hk.aef',
  'Alibaba Entrepreneurs Fund',
  'Alibaba Group',
  'Hong Kong / Taiwan',
  'open',
  'HKD',
  1000000000,
  NULL,
  '',
  1,
  NOW(),
  'https://www.alibabafund.com'
)
ON CONFLICT (id) DO NOTHING;

-- 2. scheme_field_translations: Chinese overrides for name/administrator/jurisdiction
INSERT INTO scheme_field_translations (scheme_id, locale, field, value) VALUES
('hk.aef', 'zh', 'name',          '阿里巴巴創業者基金'),
('hk.aef', 'zh', 'administrator', '阿里巴巴集團'),
('hk.aef', 'zh', 'jurisdiction',  '香港 / 台灣');

-- 2. scheme_sections: collapsible sections
INSERT INTO scheme_sections (scheme_id, locale, section_key, title, content, display_order, is_list) VALUES
('hk.aef', 'zh', 'overview', '計劃總覽',
 '阿里巴巴創業者基金（Alibaba Entrepreneurs Fund，簡稱 AEF）是阿里巴巴集團於 2015 年創立的非營利項目。
該基金分別在香港成立了 10 億港元的基金，旨在向創業家和年輕人提供企業資本及策略指導。|
該計劃是將透過首次公開發行（IPO）和其他方式收回的資金進行再投資，以支持更多初創企業。',
 1, false),

('hk.aef', 'zh', 'eligibility', '申請資格',
 '香港投資計劃：創辦人需為香港永久居民，或公司在香港有實質業務運作。|
台灣投資計劃：主要創辦人或多數成員來自台灣，或主要團隊在台灣發展。|
企業階段：專注於投資「成長期」的新創公司，即商業模式已通過市場驗證、產品或服務具備市場潛力並希望加速擴張的企業，通常為 A 輪或 B 輪之後的階段。|
產業領域：投資領域廣泛且不限行業，包括人工智慧、金融科技、醫療健康、電子商務、綠色科技、物流等。',
 2, true),

('hk.aef', 'zh', 'application', '申請方法',
 '線上申請：創業者需透過官方網站提交個人資料、企業簡介及商業計畫書。|
初步審核與溝通：專業投資經理會進行篩選，若計畫書入選，通常會在提交後一個月內安排會面討論。|
盡職調查（Due Diligence）：對入圍的公司進行深入的業務評估與調查。|
資本投資：雙方就投資條款、金額及架構進行協商並最終確定投資。',
 3, true),

('hk.aef', 'zh', 'highlights', '計劃重點',
 '阿里巴巴生態系賦能：獲投企業可對接阿里巴巴旗下的電子商務、雲服務、物流（菜鳥）、金融支付（支付寶）等業務資源。|
導師指導與資源鏈結：組織經驗豐富的企業家和行業領導者提供策略指導，並定期舉辦交流晚會或閉門講座。|
全球視野：透過基金的國際網絡，協助新創團隊從在地市場邁向區域及國際市場。',
 4, true),

('hk.aef', 'zh', 'success_stories', '成功例子',
 'GoGoVan（現稱 GoGoX）：香港初創物流平台，獲 AEF 投資後迅速擴展至亞洲多個城市，並成功於納斯達克上市。|
DayDayCook（日日煮）：線上烹飪內容平台，透過 AEF 資金支持成功進軍中國內地市場，並於紐約證券交易所上市。',
 5, true);

-- 3. scheme_metadata: extra attributes NOT in schemes table
--    field_key uses enum keys; UI maps to human-readable labels via messages files
--    difficulty is int 1-5, locale = null (universal, not translated)
INSERT INTO scheme_metadata (scheme_id, field_key, value, locale, display_order) VALUES
('hk.aef', 'investment_stage', 'growth',    NULL, 1),   -- development / growth / mature (universal)
('hk.aef', 'fund_type',        'corporate', NULL, 2),   -- government / corporate / university (universal)
('hk.aef', 'difficulty',       '4',         NULL, 3);  -- 1-5, no locale
