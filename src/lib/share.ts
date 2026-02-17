let activeOverlay: HTMLDivElement | null = null;

function closeShareModal() {
  if (activeOverlay) {
    activeOverlay.remove();
    activeOverlay = null;
  }
}

function showDesktopShareModal(text: string, url: string): Promise<boolean> {
  return new Promise((resolve) => {
    closeShareModal();

    const encoded = encodeURIComponent(text + '\n' + url);
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    const channels = [
      { name: 'Telegram', color: '#0088cc', icon: '✈️', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
      { name: 'WhatsApp', color: '#25D366', icon: '💬', href: `https://wa.me/?text=${encoded}` },
      { name: 'VK', color: '#4680C2', icon: '🔵', href: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedText}` },
      { name: 'Viber', color: '#7360F2', icon: '📱', href: `viber://forward?text=${encoded}` },
    ];

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);animation:fadeIn .2s ease';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { closeShareModal(); resolve(false); }
    });

    const modal = document.createElement('div');
    modal.style.cssText = 'background:#1e293b;border-radius:16px;padding:24px;max-width:340px;width:calc(100% - 32px);box-shadow:0 25px 50px rgba(0,0,0,0.4);animation:scaleIn .2s ease';

    const title = document.createElement('div');
    title.textContent = 'Поделиться';
    title.style.cssText = 'font-size:18px;font-weight:700;color:white;text-align:center;margin-bottom:16px;font-family:inherit';
    modal.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px';

    channels.forEach((ch) => {
      const btn = document.createElement('a');
      btn.href = ch.href;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.style.cssText = `display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;background:${ch.color}20;border:1px solid ${ch.color}40;color:white;text-decoration:none;font-size:14px;font-weight:500;font-family:inherit;transition:background .15s;cursor:pointer`;
      btn.innerHTML = `<span style="font-size:18px">${ch.icon}</span>${ch.name}`;
      btn.addEventListener('mouseenter', () => { btn.style.background = ch.color + '40'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = ch.color + '20'; });
      btn.addEventListener('click', () => { setTimeout(() => { closeShareModal(); resolve(true); }, 300); });
      grid.appendChild(btn);
    });
    modal.appendChild(grid);

    const copyBtn = document.createElement('button');
    copyBtn.style.cssText = 'width:100%;padding:10px;border-radius:10px;background:#334155;border:1px solid #475569;color:white;font-size:14px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit;transition:background .15s';
    copyBtn.innerHTML = '<span style="font-size:16px">📋</span>Скопировать ссылку';
    copyBtn.addEventListener('mouseenter', () => { copyBtn.style.background = '#475569'; });
    copyBtn.addEventListener('mouseleave', () => { copyBtn.style.background = '#334155'; });
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text + '\n' + url);
        copyBtn.innerHTML = '<span style="font-size:16px">✅</span>Скопировано!';
        setTimeout(() => { closeShareModal(); resolve(true); }, 1000);
      } catch {
        closeShareModal();
        resolve(false);
      }
    });
    modal.appendChild(copyBtn);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    activeOverlay = overlay;
  });
}

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

  return showDesktopShareModal(data.text, shareUrl);
}
