let activeOverlay: HTMLDivElement | null = null;

function closeShareModal() {
  if (activeOverlay) {
    activeOverlay.remove();
    activeOverlay = null;
  }
}

function applyStyles(el: HTMLElement, styles: Partial<CSSStyleDeclaration>) {
  Object.assign(el.style, styles);
}

function showDesktopShareModal(text: string, url: string): Promise<boolean> {
  return new Promise((resolve) => {
    closeShareModal();

    const fullText = text + '\n' + url;
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const encoded = encodeURIComponent(fullText);

    const channels = [
      { name: 'Telegram', bg: 'rgba(0,136,204,0.15)', border: 'rgba(0,136,204,0.3)', hover: 'rgba(0,136,204,0.3)', icon: '✈️', href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
      { name: 'WhatsApp', bg: 'rgba(37,211,102,0.15)', border: 'rgba(37,211,102,0.3)', hover: 'rgba(37,211,102,0.3)', icon: '💬', href: `https://wa.me/?text=${encoded}` },
      { name: 'VK', bg: 'rgba(70,128,194,0.15)', border: 'rgba(70,128,194,0.3)', hover: 'rgba(70,128,194,0.3)', icon: '🔵', href: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedText}` },
      { name: 'Viber', bg: 'rgba(115,96,242,0.15)', border: 'rgba(115,96,242,0.3)', hover: 'rgba(115,96,242,0.3)', icon: '📱', href: `viber://forward?text=${encoded}` },
    ];

    const overlay = document.createElement('div');
    applyStyles(overlay, {
      position: 'fixed',
      top: '0', left: '0', right: '0', bottom: '0',
      zIndex: '99999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) { closeShareModal(); resolve(false); }
    });

    const modal = document.createElement('div');
    applyStyles(modal, {
      background: '#1e293b',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '340px',
      width: 'calc(100% - 32px)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
    });

    const title = document.createElement('div');
    title.textContent = 'Поделиться';
    applyStyles(title, {
      fontSize: '18px',
      fontWeight: '700',
      color: 'white',
      textAlign: 'center',
      marginBottom: '16px',
    });
    modal.appendChild(title);

    const grid = document.createElement('div');
    applyStyles(grid, {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '12px',
    });

    channels.forEach((ch) => {
      const btn = document.createElement('a');
      btn.href = ch.href;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      applyStyles(btn, {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '10px',
        background: ch.bg,
        border: `1px solid ${ch.border}`,
        color: 'white',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
      });
      btn.innerHTML = `<span style="font-size:18px">${ch.icon}</span>${ch.name}`;
      btn.addEventListener('mouseenter', () => { btn.style.background = ch.hover; });
      btn.addEventListener('mouseleave', () => { btn.style.background = ch.bg; });
      btn.addEventListener('click', () => { setTimeout(() => { closeShareModal(); resolve(true); }, 300); });
      grid.appendChild(btn);
    });
    modal.appendChild(grid);

    const copyBtn = document.createElement('button');
    applyStyles(copyBtn, {
      width: '100%',
      padding: '10px',
      borderRadius: '10px',
      background: '#334155',
      border: '1px solid #475569',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    });
    copyBtn.innerHTML = '<span style="font-size:16px">📋</span>Скопировать ссылку';
    copyBtn.addEventListener('mouseenter', () => { copyBtn.style.background = '#475569'; });
    copyBtn.addEventListener('mouseleave', () => { copyBtn.style.background = '#334155'; });
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(fullText);
        copyBtn.innerHTML = '<span style="font-size:16px">✅</span>Скопировано!';
        setTimeout(() => { closeShareModal(); resolve(true); }, 1000);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = fullText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        copyBtn.innerHTML = '<span style="font-size:16px">✅</span>Скопировано!';
        setTimeout(() => { closeShareModal(); resolve(true); }, 1000);
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

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile && navigator.share) {
    try {
      await navigator.share({ title: data.title, text: data.text, url: shareUrl });
      return true;
    } catch {
      return false;
    }
  }

  return showDesktopShareModal(data.text, shareUrl);
}
