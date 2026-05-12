function getContextTextValue(formData: FormData): string {
  const contextTextRaw = formData.get('contextText') ?? formData.get('companyContextText') ?? formData.get('companyContext');
  return typeof contextTextRaw === 'string' ? contextTextRaw.trim() : '';
}

export function hasRawContextInput(formData: FormData): boolean {
  const hasFiles = formData
    .getAll('files')
    .some((entry) => entry instanceof File && entry.size > 0);
  const hasUrls = formData
    .getAll('urls')
    .some((entry) => typeof entry === 'string' && entry.trim().length > 0);

  return getContextTextValue(formData).length > 0 || hasFiles || hasUrls;
}