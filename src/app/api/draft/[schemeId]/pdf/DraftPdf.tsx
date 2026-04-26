import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  disclaimer: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 4,
    padding: 10,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#92400e',
    fontFamily: 'Helvetica-Bold',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  schemeName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#111827',
  },
  meta: {
    fontSize: 9,
    color: '#6b7280',
  },
  body: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 56,
    right: 56,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
});

interface DraftPdfProps {
  schemeName: string;
  draftMarkdown: string;
  generatedAt: string;
}

export function createDraftPdf({ schemeName, draftMarkdown, generatedAt }: DraftPdfProps) {
  return (
    <Document title={`${schemeName} — Draft Application`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            AI-GENERATED DRAFT — For human review only. Verify all [TODO] items before submission.
            Thunder does not guarantee grant approval. This is not professional advisory.
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.schemeName}>{schemeName}</Text>
          <Text style={styles.meta}>Draft Application · Generated {generatedAt}</Text>
        </View>

        <View>
          <Text style={styles.body}>{draftMarkdown}</Text>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `Page ${pageNumber} of ${totalPages} · AI-generated draft — review all [TODO] items before submission`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
