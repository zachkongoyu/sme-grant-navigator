import { getSupabase } from '.';

export interface SchemeSection {
  readonly id: string;
  readonly scheme_id: string;
  readonly locale: string;
  readonly section_key: string;
  readonly title: string;
  readonly content: string;
  readonly display_order: number;
  readonly is_list: boolean;
}

export interface SchemeMetadata {
  readonly id: string;
  readonly scheme_id: string;
  readonly field_key: string;
  readonly value: string;
  readonly locale: string | null;
  readonly display_order: number;
}

export interface SchemeFieldTranslation {
  readonly scheme_id: string;
  readonly locale: string;
  readonly field: string;
  readonly value: string;
}

export interface SchemeDetail {
  readonly sections: ReadonlyArray<SchemeSection>;
  readonly metadata: ReadonlyArray<SchemeMetadata>;
  readonly fieldTranslations: ReadonlyArray<SchemeFieldTranslation>;
}

export async function fetchSchemeSections(
  schemeId: string,
  locale: string,
): Promise<ReadonlyArray<SchemeSection>> {
  try {
    const supabase = getSupabase();
    const { data, error, status, statusText } = await supabase
      .from('scheme_sections')
      .select('*')
      .eq('scheme_id', schemeId)
      .eq('locale', locale)
      .order('display_order', { ascending: true });

    if (error) {
      console.error(
        `fetchSchemeSections(schemeId=${schemeId}, locale=${locale}) failed:`,
        { message: error.message, code: error.code, details: error.details, hint: error.hint, status, statusText },
      );
      return [];
    }

    console.log(`fetchSchemeSections(schemeId=${schemeId}, locale=${locale}) returned ${data?.length ?? 0} rows`);
    return (data ?? []) as ReadonlyArray<SchemeSection>;
  } catch (error) {
    console.error('Unexpected scheme sections load failure:', error);
    return [];
  }
}

export async function fetchSchemeMetadata(
  schemeId: string,
): Promise<ReadonlyArray<SchemeMetadata>> {
  try {
    const supabase = getSupabase();
    const { data, error, status, statusText } = await supabase
      .from('scheme_metadata')
      .select('*')
      .eq('scheme_id', schemeId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error(
        `fetchSchemeMetadata(schemeId=${schemeId}) failed:`,
        { message: error.message, code: error.code, details: error.details, hint: error.hint, status, statusText },
      );
      return [];
    }

    console.log(`fetchSchemeMetadata(schemeId=${schemeId}) returned ${data?.length ?? 0} rows`);
    return (data ?? []) as ReadonlyArray<SchemeMetadata>;
  } catch (error) {
    console.error('Unexpected scheme metadata load failure:', error);
    return [];
  }
}

export async function fetchSchemeFieldTranslations(
  schemeId: string,
  locale: string,
): Promise<ReadonlyArray<SchemeFieldTranslation>> {
  try {
    const supabase = getSupabase();
    const { data, error, status, statusText } = await supabase
      .from('scheme_field_translations')
      .select('*')
      .eq('scheme_id', schemeId)
      .eq('locale', locale);

    if (error) {
      console.error(
        `fetchSchemeFieldTranslations(schemeId=${schemeId}, locale=${locale}) failed:`,
        { message: error.message, code: error.code, details: error.details, hint: error.hint, status, statusText },
      );
      return [];
    }

    console.log(`fetchSchemeFieldTranslations(schemeId=${schemeId}, locale=${locale}) returned ${data?.length ?? 0} rows`);
    return (data ?? []) as ReadonlyArray<SchemeFieldTranslation>;
  } catch (error) {
    console.error('Unexpected scheme field translations load failure:', error);
    return [];
  }
}

export async function fetchSchemeDetail(
  schemeId: string,
  locale: string,
): Promise<SchemeDetail> {
  const [sections, metadata, fieldTranslations] = await Promise.all([
    fetchSchemeSections(schemeId, locale),
    fetchSchemeMetadata(schemeId),
    fetchSchemeFieldTranslations(schemeId, locale),
  ]);

  return { sections, metadata, fieldTranslations };
}
