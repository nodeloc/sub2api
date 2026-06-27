// Known login-agreement / legal document IDs → i18n title keys, so the standard
// docs show a localized title in the footer and on the legal page even though the
// admin-authored title is single-language. Unknown IDs fall back to the raw title.
const LEGAL_DOC_TITLE_KEYS: Record<string, string> = {
  terms: 'legal.docTitles.terms',
  'usage-policy': 'legal.docTitles.usagePolicy',
  'supported-regions': 'legal.docTitles.supportedRegions',
  'service-specific-terms': 'legal.docTitles.serviceSpecificTerms',
  privacy: 'legal.docTitles.privacy',
  'privacy-policy': 'legal.docTitles.privacy',
}

export function legalDocTitleKey(id: string): string | null {
  return LEGAL_DOC_TITLE_KEYS[id] ?? null
}
