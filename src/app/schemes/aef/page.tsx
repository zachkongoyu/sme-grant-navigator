import React from 'react';
import type { Metadata } from 'next';
import { getScheme } from '@/lib/schemes';
import { fetchSchemeDetail } from '@/lib/supabase/scheme-details';
import type { SchemeSection, SchemeMetadata, SchemeFieldTranslation } from '@/lib/supabase/scheme-details';
import type { Scheme } from '@/types';
import FundDetailClient from './FundDetailClient';

export const metadata: Metadata = {
  title: '阿里巴巴創業者基金 | Thunder',
  description: '阿里巴巴創業者基金（AEF）是阿里巴巴集團於 2015 年創立的非營利項目，旨在向創業家和年輕人提供企業資本及策略指導。',
};

// Fallback data when DB is not yet migrated or scheme doesn't exist
const fallbackSections: SchemeSection[] = [
  {
    id: 'fallback-1',
    scheme_id: 'hk.aef',
    locale: 'zh',
    section_key: 'overview',
    title: '計劃總覽',
    content: `阿里巴巴創業者基金（Alibaba Entrepreneurs Fund，簡稱 AEF）是阿里巴巴集團於 2015 年創立的非營利項目。該基金分別在香港成立了 10 億港元的基金，旨在向創業家和年輕人提供企業資本及策略指導。|
該計劃是將透過首次公開發行（IPO）和其他方式收回的資金進行再投資，以支持更多初創企業。`,
    display_order: 1,
    is_list: false,
  },
  {
    id: 'fallback-2',
    scheme_id: 'hk.aef',
    locale: 'zh',
    section_key: 'eligibility',
    title: '申請資格',
    content: `香港投資計劃：創辦人需為香港永久居民，或公司在香港有實質業務運作。|
台灣投資計劃：主要創辦人或多數成員來自台灣，或主要團隊在台灣發展。|
企業階段：專注於投資「成長期」的新創公司，即商業模式已通過市場驗證、產品或服務具備市場潛力並希望加速擴張的企業，通常為 A 輪或 B 輪之後的階段。|
產業領域：投資領域廣泛且不限行業，包括人工智慧、金融科技、醫療健康、電子商務、綠色科技、物流等。`,
    display_order: 2,
    is_list: true,
  },
  {
    id: 'fallback-3',
    scheme_id: 'hk.aef',
    locale: 'zh',
    section_key: 'application',
    title: '申請方法',
    content: `線上申請：創業者需透過官方網站提交個人資料、企業簡介及商業計畫書。|
初步審核與溝通：專業投資經理會進行篩選，若計畫書入選，通常會在提交後一個月內安排會面討論。|
盡職調查（Due Diligence）：對入圍的公司進行深入的業務評估與調查。|
資本投資：雙方就投資條款、金額及架構進行協商並最終確定投資。`,
    display_order: 3,
    is_list: true,
  },
  {
    id: 'fallback-4',
    scheme_id: 'hk.aef',
    locale: 'zh',
    section_key: 'highlights',
    title: '計劃重點',
    content: `阿里巴巴生態系賦能：獲投企業可對接阿里巴巴旗下的電子商務、雲服務、物流（菜鳥）、金融支付（支付寶）等業務資源。|
導師指導與資源鏈結：組織經驗豐富的企業家和行業領導者提供策略指導，並定期舉辦交流晚會或閉門講座。|
全球視野：透過基金的國際網絡，協助新創團隊從在地市場邁向區域及國際市場。`,
    display_order: 4,
    is_list: true,
  },
  {
    id: 'fallback-5',
    scheme_id: 'hk.aef',
    locale: 'zh',
    section_key: 'success_stories',
    title: '成功例子',
    content: `GoGoVan（現稱 GoGoX）：香港初創物流平台，獲 AEF 投資後迅速擴展至亞洲多個城市，並成功於納斯達克上市。|
DayDayCook（日日煮）：線上烹飪內容平台，透過 AEF 資金支持成功進軍中國內地市場，並於紐約證券交易所上市。`,
    display_order: 5,
    is_list: true,
  },
];

const fallbackMetadata: SchemeMetadata[] = [
  { id: 'fallback-m1', scheme_id: 'hk.aef', field_key: 'investment_stage', value: 'growth', locale: 'zh', display_order: 1 },
  { id: 'fallback-m2', scheme_id: 'hk.aef', field_key: 'fund_type', value: 'corporate', locale: 'zh', display_order: 2 },
  { id: 'fallback-m3', scheme_id: 'hk.aef', field_key: 'difficulty', value: '4', locale: null, display_order: 3 },
];

const fallbackFieldTranslations: SchemeFieldTranslation[] = [
  { scheme_id: 'hk.aef', locale: 'zh', field: 'name', value: '阿里巴巴創業者基金' },
  { scheme_id: 'hk.aef', locale: 'zh', field: 'administrator', value: '阿里巴巴集團' },
  { scheme_id: 'hk.aef', locale: 'zh', field: 'jurisdiction', value: '香港 / 台灣' },
];

const fallbackScheme: Scheme = {
  id: 'hk.aef',
  name: 'Alibaba Entrepreneurs Fund',
  status: 'open',
  maxFunding: 1_000_000_000,
  currency: 'HKD',
  links: [
    { label: 'Alibaba Entrepreneurs Fund', url: 'https://www.alibabafund.com' },
    { label: 'JUMPSTARTER 競賽', url: 'https://www.jumpstarter.hk' },
  ],
  corpus: null,
  sourceUrl: 'https://www.alibabafund.com',
  administrator: 'Alibaba Group',
  updatedAt: null,
  jurisdiction: 'Hong Kong / Taiwan',
  nextDeadline: null,
  version: 1,
};

export default async function FundDetailPage() {
  const schemeId = 'hk.aef';
  const locale = 'zh';

  const [scheme, detail] = await Promise.all([
    getScheme(schemeId),
    fetchSchemeDetail(schemeId, locale),
  ]);

  const resolvedScheme = scheme ?? fallbackScheme;
  const sections = detail.sections.length > 0 ? detail.sections : fallbackSections;
  const metadata = detail.metadata.length > 0 ? detail.metadata : fallbackMetadata;
  const fieldTranslations = detail.fieldTranslations.length > 0
    ? detail.fieldTranslations
    : fallbackFieldTranslations;

  return (
    <FundDetailClient
      scheme={resolvedScheme}
      sections={sections}
      metadata={metadata}
      fieldTranslations={fieldTranslations}
    />
  );
}
