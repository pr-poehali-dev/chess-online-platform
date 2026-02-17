export async function shareContent(data: { title: string; text: string; url?: string }): Promise<boolean> {
  const shareUrl = data.url || window.location.href;

  if (navigator.share) {
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
