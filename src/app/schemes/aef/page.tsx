import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { CollapsibleSection } from '@/components/CollapsibleSection';
import MetadataTabs from './MetadataTabs';
import InvestmentStage from './InvestmentStage';

export const metadata: Metadata = {
  title: '阿里巴巴創業者基金 | Thunder',
  description: '阿里巴巴創業者基金（AEF）是阿里巴巴集團於 2015 年創立的非營利項目，旨在向創業家和年輕人提供企業資本及策略指導。',
};

export default function FundDetailPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-text-primary">
      <div className="mx-auto max-w-2xl px-6 py-12">

        {/* ── Back button ── */}
        <div className="mb-6">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 text-sm text-text-tertiary transition hover:text-text-primary"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            返回列表
          </Link>
        </div>

        {/* ── Hero ── */}
        <div className="border-b border-border pb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-tertiary">
            香港 / 台灣 · 阿里巴巴集團
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] leading-tight">
            阿里巴巴創業者基金
          </h1>

          {/* ── Key stats inline ── */}
          <div className="mt-6 flex flex-wrap gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">基金規模</p>
              <p className="mt-1 font-mono text-xl font-semibold text-text-primary">HK$1B</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">投資階段</p>
              <div className="mt-1">
                <InvestmentStage />
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">基金類型</p>
              <p className="mt-1 font-mono text-xl font-semibold text-text-primary">企業導向</p>
            </div>
          </div>
        </div>

        {/* ── Right-rail: actions + links ── */}
        <div className="py-8 border-b border-border grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Official links */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">官方網站</p>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href="https://www.alibabafund.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm underline underline-offset-4 transition"
                  style={{ color: 'var(--accent)' }}
                >
                  Alibaba Entrepreneurs Fund
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-2.5 w-2.5 shrink-0 opacity-60">
                    <path d="M2 10L10 2M5 2h5v5" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://www.jumpstarter.hk"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-sm underline underline-offset-4 transition"
                  style={{ color: 'var(--accent)' }}
                >
                  JUMPSTARTER 競賽
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-2.5 w-2.5 shrink-0 opacity-60">
                    <path d="M2 10L10 2M5 2h5v5" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Right column: difficulty + save */}
          <div className="flex flex-col gap-4">
            {/* Application difficulty */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">申請難度</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: i <= 4 ? '#f97316' : 'var(--border)',
                    }}
                  />
                ))}
                <span className="ml-1.5 text-xs font-medium text-text-primary">偏高</span>
              </div>
            </div>

            {/* Save action (dummy) */}
            <button
              type="button"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] transition hover:border-accent hover:text-accent"
            >
              <span className="flex items-center justify-center gap-2 text-base normal-case tracking-normal">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M6 4.5a1.5 1.5 0 0 1 1.5-1.5h9A1.5 1.5 0 0 1 18 4.5V21l-6-3-6 3V4.5Z" />
                </svg>
                <span>收藏基金</span>
              </span>
            </button>
          </div>
        </div>

        {/* ── Structured content ── */}
        <div className="mt-8 space-y-0">
          <CollapsibleSection title="計劃總覽" defaultOpen>
            <div className="space-y-4 text-sm leading-7 text-text-secondary">
              <p>
                阿里巴巴創業者基金（Alibaba Entrepreneurs Fund，簡稱 AEF）是阿里巴巴集團於 2015 年創立的非營利項目。
                該基金分別在香港成立了 10 億港元的基金，以及在台灣成立了 100 億新台幣的基金，旨在向創業家和年輕人提供企業資本及策略指導。
              </p>
              <p>
                該計劃是將透過首次公開發行（IPO）和其他方式收回的資金進行再投資，以支持更多初創企業。
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="申請資格" hasNumbers>
            <ol className="list-decimal list-inside space-y-3 text-sm leading-7 text-text-secondary">
              <li>
                <span className="font-medium text-text-primary">香港投資計劃：</span>
                創辦人需為香港永久居民，或公司在香港有實質業務運作。
              </li>
              <li>
                <span className="font-medium text-text-primary">台灣投資計劃：</span>
                主要創辦人或多數成員來自台灣，或主要團隊在台灣發展。
              </li>
              <li>
                <span className="font-medium text-text-primary">企業階段：</span>
                專注於投資「成長期」的新創公司，即商業模式已通過市場驗證、產品或服務具備市場潛力並希望加速擴張的企業，通常為 A 輪或 B 輪之後的階段。
              </li>
              <li>
                <span className="font-medium text-text-primary">產業領域：</span>
                投資領域廣泛且不限行業，包括人工智慧、金融科技、醫療健康、電子商務、綠色科技、物流等。
              </li>
            </ol>
          </CollapsibleSection>

          <CollapsibleSection title="申請方法" hasNumbers>
            <ol className="list-decimal list-inside space-y-3 text-sm leading-7 text-text-secondary">
              <li>
                <span className="font-medium text-text-primary">線上申請：</span>
                創業者需透過官方網站提交個人資料、企業簡介及商業計畫書。
              </li>
              <li>
                <span className="font-medium text-text-primary">初步審核與溝通：</span>
                專業投資經理會進行篩選，若計畫書入選，通常會在提交後一個月內安排會面討論。
              </li>
              <li>
                <span className="font-medium text-text-primary">盡職調查（Due Diligence）：</span>
                對入圍的公司進行深入的業務評估與調查。
              </li>
              <li>
                <span className="font-medium text-text-primary">資本投資：</span>
                雙方就投資條款、金額及架構進行協商並最終確定投資。
              </li>
            </ol>
          </CollapsibleSection>

          <CollapsibleSection title="計劃重點" hasNumbers>
            <ol className="list-decimal list-inside space-y-3 text-sm leading-7 text-text-secondary">
              <li>
                <span className="font-medium text-text-primary">阿里巴巴生態系賦能：</span>
                獲投企業可對接阿里巴巴旗下的電子商務、雲服務、物流（菜鳥）、金融支付（支付寶）等業務資源。
              </li>
              <li>
                <span className="font-medium text-text-primary">導師指導與資源鏈結：</span>
                組織經驗豐富的企業家和行業領導者提供策略指導，並定期舉辦交流晚會或閉門講座。
              </li>
              <li>
                <span className="font-medium text-text-primary">全球視野：</span>
                透過基金的國際網絡，協助新創團隊從在地市場邁向區域及國際市場。
              </li>
            </ol>
          </CollapsibleSection>

          <CollapsibleSection title="成功例子">
            <div className="space-y-4 text-sm leading-7 text-text-secondary">
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="font-medium text-text-primary">GoGoVan（現稱 GoGoX）</p>
                <p className="mt-1">
                  香港初創物流平台，獲 AEF 投資後迅速擴展至亞洲多個城市，並成功於納斯達克上市。
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="font-medium text-text-primary">DayDayCook（日日煮）</p>
                <p className="mt-1">
                  線上烹飪內容平台，透過 AEF 資金支持成功進軍中國內地市場，並於紐約證券交易所上市。
                </p>
              </div>
            </div>
          </CollapsibleSection>

        </div>

        {/* ── Metadata tags ── */}
        <MetadataTabs />

      </div>
    </div>
  );
}
