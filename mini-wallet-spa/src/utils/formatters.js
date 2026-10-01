/**
 * Format number into Indonesian Rupiah currency format.
 * Example: 1500000 -> "Rp 1.500.000"
 * @param {number|string} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount).replace(/\s+/g, ' ');
}

/**
 * Format ISO date string into Indonesian Date with Time (Jam & Menit WIB)
 * Example: "2026-10-01T12:30:00Z" -> "01 Okt 2026, 19:30 WIB"
 * @param {string|Date} dateInput
 * @param {boolean} includeTime
 * @returns {string}
 */
export function formatDate(dateInput, includeTime = true) {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthStr = monthNames[date.getMonth()];
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (!includeTime) {
    return `${day} ${monthStr} ${year}`;
  }

  return `${day} ${monthStr} ${year}, ${hours}:${minutes} WIB`;
}
