import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

import type { EligibilityCheckResult, EligibilityVerdict } from '@/lib/api/eligibility-client';

const VERDICT_COLOR: Record<EligibilityVerdict, string> = {
  eligible:          '#22c55e',
  likely_eligible:   '#4ade80',
  insufficient_info: '#f59e0b',
  ineligible:        '#ef4444',
};

const VERDICT_LABEL: Record<EligibilityVerdict, string> = {
  eligible:          'ELIGIBLE',
  likely_eligible:   'LIKELY ELIGIBLE',
  insufficient_info: 'INSUFFICIENT INFO',
  ineligible:        'NOT ELIGIBLE',
};

// Thunder design tokens (mirrors globals.css dark theme)
const T = {
  bg:          '#0d0d0d',
  surface:     '#111111',
  border:      '#2e2e2e',
  textPrimary: '#ededed',
  textSecond:  '#a1a1a1',
  textTert:    '#717171',
  accent:      '#ffffff',
  // status
  green:       '#22c55e',
  red:         '#ef4444',
  amber:       '#f59e0b',
  // disclaimer dark amber tones
  disclaimerBg:     '#1a1200',
  disclaimerBorder: '#f59e0b',
  disclaimerText:   '#fde68a',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: T.textPrimary,
    backgroundColor: T.bg,
  },
  disclaimer: {
    backgroundColor: T.disclaimerBg,
    borderWidth: 1,
    borderColor: T.disclaimerBorder,
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 9,
    color: T.disclaimerText,
    fontFamily: 'Helvetica-Bold',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  schemeName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: T.accent,
  },
  meta: {
    fontSize: 9,
    color: T.textTert,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: T.textTert,
    marginBottom: 6,
    marginTop: 14,
  },
  summary: {
    fontSize: 11,
    lineHeight: 1.6,
    color: T.textPrimary,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: T.textSecond,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    fontSize: 10,
    color: T.textTert,
    width: 14,
  },
  criterionBlock: {
    marginBottom: 6,
    paddingLeft: 10,
  },
  criterionDescription: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: T.textPrimary,
  },
  criterionDetail: {
    fontSize: 9,
    color: T.textTert,
    marginTop: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 56,
    right: 56,
    textAlign: 'center',
    fontSize: 8,
    color: T.textTert,
    borderTopWidth: 1,
    borderTopColor: T.border,
    paddingTop: 6,
  },
});

export interface EligibilityPdfProps {
  schemeName: string;
  schemeId: string;
  userContext: string;
  result: EligibilityCheckResult;
  generatedAt: string;
}

export function createEligibilityPdf({
  schemeName,
  userContext,
  result,
  generatedAt,
}: EligibilityPdfProps) {
  const verdictColor = VERDICT_COLOR[result.verdict] ?? '#f59e0b';
  const verdictLabel = VERDICT_LABEL[result.verdict] ?? 'UNKNOWN';

  const fails   = result.criteria.filter((c) => c.status === 'fail');
  const passes  = result.criteria.filter((c) => c.status === 'pass');
  const unclear = result.criteria.filter((c) => c.status === 'unclear');
  const missing = result.criteria.filter((c) => c.status === 'missing');

  return (
    <Document title={`${schemeName} — Eligibility Assessment`}>
      <Page size="A4" style={styles.page}>

        {/* 1. Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            AI-GENERATED ELIGIBILITY ASSESSMENT — For informational purposes only. Verify against
            official scheme documentation before applying.
          </Text>
        </View>

        {/* 2. Header */}
        <View style={styles.header}>
          <Text style={styles.schemeName}>{schemeName}</Text>
          <Text style={styles.meta}>Eligibility Check · Generated {generatedAt}</Text>
        </View>

        {/* 3. Verdict */}
        <View style={{ marginBottom: 14 }}>
          <View
            style={{
              backgroundColor: verdictColor,
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 3,
              alignSelf: 'flex-start',
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#ffffff' }}>
              {verdictLabel}
            </Text>
          </View>
          <Text style={styles.summary}>{result.summary}</Text>
        </View>

        {/* 4. Company Context */}
        <View>
          <Text style={styles.sectionLabel}>COMPANY INFORMATION ASSESSED</Text>
          <Text style={styles.bodyText}>{userContext}</Text>
        </View>

        {/* 5. Failed Criteria */}
        {fails.length > 0 && (
          <View>
            <Text style={[styles.sectionLabel, { color: T.red }]}>FAILED CRITERIA</Text>
            {fails.map((c, i) => (
              <View key={i} style={styles.criterionBlock}>
                <Text style={styles.criterionDescription}>{c.description}</Text>
                {!!c.detail && (
                  <Text style={[styles.criterionDetail, { color: T.red }]}>{c.detail}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 6. Passed Criteria */}
        {passes.length > 0 && (
          <View>
            <Text style={[styles.sectionLabel, { color: T.green }]}>PASSED CRITERIA</Text>
            {passes.map((c, i) => (
              <View key={i} style={styles.criterionBlock}>
                <Text style={styles.criterionDescription}>{c.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 7. Unclear Criteria */}
        {unclear.length > 0 && (
          <View>
            <Text style={[styles.sectionLabel, { color: T.amber }]}>UNCLEAR CRITERIA</Text>
            {unclear.map((c, i) => (
              <View key={i} style={styles.criterionBlock}>
                <Text style={styles.criterionDescription}>{c.description}</Text>
                {!!c.detail && (
                  <Text style={[styles.criterionDetail, { color: T.amber }]}>{c.detail}</Text>
                )}
                {!!c.followup_question && (
                  <Text style={[styles.criterionDetail, { fontFamily: 'Helvetica-Oblique' }]}>
                    → {c.followup_question}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 8. Missing Info */}
        {missing.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>MISSING INFO</Text>
            {missing.map((c, i) => (
              <View key={i} style={styles.criterionBlock}>
                <Text style={styles.criterionDescription}>{c.description}</Text>
                {!!c.detail && <Text style={styles.criterionDetail}>{c.detail}</Text>}
                {!!c.followup_question && (
                  <Text style={[styles.criterionDetail, { fontFamily: 'Helvetica-Oblique' }]}>
                    → {c.followup_question}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 9. Tips */}
        {result.tips.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>TIPS</Text>
            {result.tips.map((t, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={[styles.bodyText, { fontFamily: 'Helvetica-Bold' }]}>{t.area}</Text>
                <Text style={styles.bodyText}>{t.advice}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 10. Footer */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Page ${pageNumber} of ${totalPages} · AI-generated eligibility assessment — verify against official scheme documentation before applying`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
