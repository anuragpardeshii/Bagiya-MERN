// Keep the country code when supplied; never guess one from a local number.
function normalizePhone(value) {
  if (typeof value !== 'string' || !/^\+?[\d ()-]+$/.test(value.trim()))
    return null;
  const digits = value.replace(/\D/g, '');
  return /^\d{7,15}$/.test(digits) ? digits : null;
}
module.exports = { normalizePhone };
