/* Shared with the browser extension by scripts/package-extension.cjs. */
(function () {
  function parseWebUrl(value) {
    const url = new URL(value);
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error('Use a website URL without embedded credentials');
    return url;
  }
  function normalizeAllowedLink(value) {
    if (typeof value !== 'string' || !value.trim() || value.length > 2048)
      throw new Error('Enter a domain or website URL (up to 2,048 characters)');
    const raw = value.trim();
    const url = parseWebUrl(raw.includes('://') ? raw : `https://${raw}`);
    url.hash = '';
    return url.pathname === '/' && !url.search ? url.origin : url.href;
  }
  function isAllowedUrl(value, links, appOrigin) {
    try {
      const url = parseWebUrl(value);
      if (url.origin === appOrigin) return true;
      url.hash = '';
      return links.some((link) => {
        const rule = parseWebUrl(link);
        return (
          rule.origin === url.origin &&
          ((rule.pathname === '/' && !rule.search) || rule.href === url.href)
        );
      });
    } catch {
      return false;
    }
  }
  const policy = { normalizeAllowedLink, isAllowedUrl };
  if (typeof module !== 'undefined') module.exports = policy;
  else globalThis.BagiyaFocusPolicy = policy;
})();
