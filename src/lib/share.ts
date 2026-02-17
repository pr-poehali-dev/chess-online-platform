const SITE_URL = 'https://ligachess.ru/';

function fallbackCopy(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

export async function shareContent(data: { title: string; text: string; url?: string }): Promise<boolean> {
  const shareUrl = data.url || SITE_URL;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile && navigator.share) {
    try {
      await navigator.share({ title: data.title, text: data.text, url: shareUrl });
      return true;
    } catch {
      return false;
    }
  }

  const copyText = `${data.text}\n${shareUrl}`;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(copyText);
      return true;
    } catch {
      return fallbackCopy(copyText);
    }
  }

  return fallbackCopy(copyText);
}
