export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
}

export function parseCurrency(value: string): number {
  if (!value.trim()) return 0;

  const normalized = value
    .replace(/[^\d,.-]/g, '')
    .trim();

  const decimalNormalized = normalized.includes(',')
    ? normalized.replace(/\./g, '').replace(',', '.')
    : normalized;

  const parsed = Number(decimalNormalized);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, parsed);
}
