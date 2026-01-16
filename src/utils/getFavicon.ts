export function getFavicon(url: string) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?sz=256&domain=${hostname}`;
  } catch {
    return null;
  }
}
