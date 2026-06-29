function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function payloadToInterpolationMap(
  payload: Record<string, unknown>,
): Record<string, string> {
  const map: Record<string, string> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value == null) {
      map[key] = '';
      continue;
    }
    map[key] = escapeHtml(String(value));
  }

  return map;
}

export function interpolateTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => values[key] ?? '');
}

export function htmlToPlainText(html: string): string {
  let text = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n');

  // Strip remaining tags repeatedly so partial/overlapping tags cannot survive.
  let previous: string;
  do {
    previous = text;
    text = text.replace(/<[^>]*>/g, '');
  } while (text !== previous);

  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    // Decode &amp; last so e.g. "&amp;lt;" does not get double-unescaped to "<".
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
