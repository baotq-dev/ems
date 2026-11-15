// Date formatting helpers

export function formatDateToDMY(isoDate?: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  }
  return isoDate;
}

export function formatDMYToISO(dmyDate?: string): string {
  if (!dmyDate) return '';
  const parts = dmyDate.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return dmyDate;
}
