const SITE_URL = 'https://ligachess.ru/';

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

  try {
    await navigator.clipboard.writeText(`${data.text}\n${shareUrl}`);
    return true;
  } catch {
    return false;
  }
}
