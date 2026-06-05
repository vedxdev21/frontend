export function toDisplayText(value, fallback = '') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    const text = value.map((item) => toDisplayText(item)).filter(Boolean).join(', ');
    return text || fallback;
  }

  if (typeof value === 'object') {
    if ('start' in value || 'end' in value) {
      const text = [value.start, value.end].map((item) => toDisplayText(item)).filter(Boolean).join(' - ');
      return text || fallback;
    }

    for (const key of ['content', 'text', 'message', 'title', 'body', 'name', 'label']) {
      if (value[key]) return toDisplayText(value[key], fallback);
    }

    const text = Object.values(value)
      .map((item) => toDisplayText(item))
      .filter(Boolean)
      .join(' ');
    return text || fallback;
  }

  return fallback;
}

export function formatEnumLabel(value, fallback = '') {
  return toDisplayText(value, fallback).replace(/_/g, ' ');
}
