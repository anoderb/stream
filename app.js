(() => {
  const API = 'https://api.esportex.site/api/streams';
  const CATS = ['all','football','basketball','race','badminton','tennis','fight','amfootball','baseball','volleyball','hockey','rugby','cricket','other'];
  const LABEL = {all:'Semua',football:'⚽ Sepak Bola',basketball:'🏀 Basket',race:'🏎 Race',badminton:'🏸 Badminton',tennis:'🎾 Tennis',fight:'🥊 Fight',amfootball:'🏈 NFL',baseball:'⚾ Baseball',volleyball:'🏐 Voli',hockey:'🏒 Hockey',rugby:'🏉 Rugby',cricket:'🏏 Cricket',other:'Lainnya'};
  const LABEL_SHORT = {all:'Semua',football:'Football',basketball:'Basket',race:'Race',badminton:'Badminton',tennis:'Tennis',fight:'Fight',amfootball:'NFL',baseball:'Baseball',volleyball:'Voli',hockey:'Hockey',rugby:'Rugby',cricket:'Cricket',other:'Lainnya'};

  const $ = s => document.querySelector(s);
  const grid = $('#grid'), catsEl = $('#cats'), searchEl = $('#search'), metaEl = $('#meta'), toastEl = $('#toast');
  let rows = [], cat = 'all', q = '', lastFetch = 0, lastUpdate = null;

  const esc = s => {
    if (!s) return '';
    const d = {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'};
    return String(s).replace(/[&<>'"]/g, c => d[c]);
  };
  const parse = t => t ? new Date(t.replace(' ', 'T') + '+07:00') : null;
  const statusOf = m => {
    const n = new Date(), a = parse(m.kickoff), b = parse(m.endTime);
    if (a && n < a) return 'upcoming';
    if (a && b && n >= a && n <= b) return 'live';
    return 'ended';
  };
  const fmtTime = t => {
    const d = parse(t);
    if (!d) return '—';
    return new Intl.DateTimeFormat('id-ID', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', timeZone:'Asia/Jakarta' }).format(d) + ' WIB';
  };
  const showToast = msg => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 2400);
  };

  function slugify(str) {
    return (str||'')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g,'')
      .replace(/[\s]+/g,'-')
      .replace(/-+/g,'-')
      .trim() || 'match';
  }

  function renderCats() {
    catsEl.innerHTML = CATS.map(c =>
      `<button class="cat-pill ${c === cat ? 'active' : ''}" data-cat="${c}">${LABEL[c]}</button>`
    ).join('');
  }

  function filtered() {
    return rows.filter(m =>
      (cat === 'all' || m.category === cat) &&
      `${m.tag} ${m.league} ${m.category}`.toLowerCase().includes(q.toLowerCase())
    );
  }

  function renderStats(data) {
    const live = rows.filter(m => statusOf(m) === 'live').length;
    const up = rows.filter(m => statusOf(m) === 'upcoming').length;
    $('#sLive').textContent = live;
    $('#sUpcoming').textContent = up;
    $('#sTotal').textContent = rows.length;
    $('#sCount').textContent = `${data.length} event`;
    metaEl.textContent = lastUpdate ? `Update ${lastUpdate.toLocaleTimeString('id-ID')} · ${rows.length} event` : 'Siap';
  }

  function serverDots(count) {
    return Array.from({length: Math.min(count, 5)}, () =>
      '<div class="server-dot active"></div>'
    ).join('');
  }

  function render() {
    renderCats();
    const data = filtered();
    renderStats(data);
    if (!data.length) {
      grid.innerHTML = `<div class="state-msg">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted);margin:auto"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>Tidak ada event yang cocok.</p>
      </div>`;
      return;
    }
    grid.innerHTML = data.map((m, i) => {
      const st = statusOf(m);
      const can = m.iframes && m.iframes.length;
      const serverCount = can ? m.iframes.length : 0;
      const slug = slugify(m.tag) + '-' + i;
      const badgeSt = st === 'live' ? '<span class="badge badge-live">🔴 Live</span>' :
                      st === 'upcoming' ? '<span class="badge badge-upcoming">⏰ Upcoming</span>' :
                      '<span class="badge badge-ended">Selesai</span>';
      return `<article class="event-card" data-slug="${esc(slug)}">
        <div class="card-poster">
          ${m.poster
            ? `<img src="${esc(m.poster)}" loading="lazy" alt="${esc(m.tag)}" onerror="this.parentNode.querySelector('.poster-placeholder').style.display='flex';this.remove()">`
            : ''}
          <div class="poster-placeholder" style="${m.poster ? 'display:none' : 'display:flex'}">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          </div>
          <div class="badge-row">
            <span class="badge badge-cat">${esc(LABEL_SHORT[m.category] || m.category)}</span>
            ${badgeSt}
          </div>
        </div>
        <div class="card-body">
          <div class="card-league">${esc(m.league || 'Unknown League')}</div>
          <div class="card-title">${esc(m.tag)}</div>
          <div class="card-meta">
            <div class="card-meta-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${fmtTime(m.kickoff)}
            </div>
            <div class="card-meta-servers">
              <div class="server-dots">${serverDots(serverCount)}</div>
              ${serverCount} server
            </div>
          </div>
          <button class="watch-btn ${can ? 'can-watch' : 'no-server'}" ${can ? '' : 'disabled'} data-idx="${i}">
            ${can
              ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Tonton Sekarang'
              : 'Belum tersedia'}
          </button>
        </div>
      </article>`;
    }).join('');

    grid.querySelectorAll('.can-watch').forEach(btn => {
      btn.onclick = () => {
        const match = data[+btn.dataset.idx];
        const slug = slugify(match.tag) + '-' + btn.dataset.idx;
        history.pushState({slug, idx: +btn.dataset.idx}, '', '#' + slug);
        openPlayer(match);
      };
    });

    // card click → go to slug
    grid.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        const slug = card.dataset.slug;
        const m = data.find((x,i) => slugify(x.tag)+'-'+i === slug);
        if (m && m.iframes && m.iframes.length) {
          history.pushState({slug, idx: data.indexOf(m)}, '', '#' + slug);
          openPlayer(m);
        }
      });
    });
  }

  async function load(force = false) {
    const now = Date.now();
    if (!force && now - lastFetch < 30000 && lastFetch) {
      showToast(`Cooldown ${Math.ceil((30000 - (now - lastFetch)) / 1000)}s lagi`);
      return;
    }
    lastFetch = now;
    grid.innerHTML = Array(3).fill('<div class="skeleton"></div>').join('');
    metaEl.textContent = 'Mengambil data...';
    try {
      const r = await fetch(API + '?_=' + now);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const d = await r.json();
      rows = [];
      for (const c of CATS.filter(x => x !== 'all')) {
        (d[c] || []).forEach(m => rows.push({ ...m, category: c }));
      }
      rows.sort((a, b) => (parse(a.kickoff) || 0) - (parse(b.kickoff) || 0));
      lastUpdate = new Date();
      render();

      // check hash for deep link
      checkHash();
    } catch (e) {
      console.error(e);
      grid.innerHTML = `<div class="state-msg">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted);margin:auto"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>Gagal memuat data. <button onclick="location.reload()" style="color:var(--accent);font-weight:700;background:none;border:none;cursor:pointer">Coba lagi →</button></p>
      </div>`;
      metaEl.textContent = 'Error: ' + e.message;
    }
  }

  function checkHash() {
    const h = location.hash.slice(1);
    if (!h || !rows.length) return;
    const m = rows.find((x,i) => slugify(x.tag)+'-'+i === h);
    if (m && m.iframes && m.iframes.length) {
      cat = m.category;
      render();
      setTimeout(() => openPlayer(m), 300);
    }
  }

  let activeIframes = [];
  function openPlayer(m) {
    const modal = $('#modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    $('#playerTitle').textContent = m.tag;
    $('#playerSub').textContent = `${m.league || ''} · ${fmtTime(m.kickoff)}`;
    activeIframes = m.iframes || [];
    renderServerTabs(0);
  }

  function renderServerTabs(activeIdx) {
    const tabs = $('#serverTabs');
    tabs.innerHTML = activeIframes.map((s, i) =>
      `<button class="server-tab ${i === activeIdx ? 'active' : ''}" data-i="${i}">${esc(s.server || ('Server ' + (i + 1)))}</button>`
    ).join('');
    tabs.querySelectorAll('.server-tab').forEach(tab => {
      tab.onclick = () => {
        const i = +tab.dataset.i;
        setFrame(activeIframes[i]?.url);
        renderServerTabs(i);
      };
    });
    if (activeIframes[activeIdx]) setFrame(activeIframes[activeIdx].url);
  }

  function setFrame(url) { $('#frame').src = url || 'about:blank'; }

  function closeModal() {
    setFrame('about:blank');
    $('#modal').classList.remove('open');
    $('#modal').setAttribute('aria-hidden', 'true');
    history.pushState({}, '', location.pathname);
  }

  // Events
  catsEl.onclick = e => {
    if (e.target.matches('.cat-pill')) { cat = e.target.dataset.cat; q = ''; searchEl.value = ''; render(); }
  };
  let debounce;
  searchEl.oninput = e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => { q = e.target.value.trim(); render(); }, 150);
  };
  $('#clearBtn').onclick = () => { searchEl.value = ''; q = ''; render(); };
  $('#refreshBtn').onclick = () => load(false);
  $('#topRefresh').onclick = () => load(false);
  $('#closeBtn').onclick = closeModal;
  $('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };
  document.onkeydown = e => { if (e.key === 'Escape') closeModal(); };
  window.onpopstate = () => {
    if (location.hash) {
      closeModal();
      checkHash();
    } else {
      closeModal();
    }
  };

  // Theme
  const saved = localStorage.getItem('nobaryu-theme') || 'dark';
  document.documentElement.dataset.theme = saved;
  updateThemeIcon(saved);
  $('#themeBtn').onclick = () => {
    const n = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = n;
    localStorage.setItem('nobaryu-theme', n);
    updateThemeIcon(n);
  };
  function updateThemeIcon(theme) {
    const icon = $('#themeIcon');
    if (theme === 'dark') {
      icon.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
    } else {
      icon.setAttribute('d', 'M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z');
    }
  }

  load(true);
})();
