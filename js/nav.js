// Shared app shell: sidebar nav (desktop) + topbar (mobile), plus the
// user chip / sign-out control. Every protected page calls mountShell()
// after requireSession() resolves so the nav can show the real profile.
import { signOut, initials } from './supabase-client.js';

const NAV_ITEMS = [
  { href: 'index.html', icon: 'icon-home', label: 'Home' },
  { href: 'play.html', icon: 'icon-play', label: 'Play' },
  { href: 'puzzles.html', icon: 'icon-puzzle', label: 'Puzzles' },
  { href: 'bots.html', icon: 'icon-bot', label: 'Bots' },
  { href: 'profile.html', icon: 'icon-user', label: 'Profile' },
  { href: 'settings.html', icon: 'icon-settings', label: 'Settings' },
];

export function mountShell({ active, profile }) {
  const sidebar = document.getElementById('sidebar');
  const topbar = document.getElementById('topbar');
  const scrim = document.getElementById('scrim');
  if (!sidebar) return;

  const navHtml = NAV_ITEMS.map((item) => `
    <a class="nav-link ${item.href === active ? 'active' : ''}" href="${item.href}">
      <svg class="icon"><use href="assets/icons.svg#${item.icon}"/></svg>
      ${item.label}
    </a>
  `).join('');

  const name = profile?.display_name || profile?.username || 'Player';
  const rating = profile?.ratings?.rapid ?? 1200;

  sidebar.innerHTML = `
    <div class="brand">
      <div class="mark"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L9 7h6l-3-5zM8 8v3h2v2H8v2h2v2H6v-2H4v-2h2V11H4V8h4zm8 0v3h2v2h-2v2h2v2h-4v-2h-2v-2h2V11h-2V8h4z"/></svg></div>
      MasterChess
    </div>
    <nav class="nav-group">${navHtml}</nav>
    <div class="sidebar-foot">
      <a class="user-chip" href="profile.html">
        <div class="avatar" style="width:32px;height:32px;font-size:.75rem;">${initials(name)}</div>
        <div style="flex:1;min-width:0;">
          <div class="name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(name)}</div>
          <div class="rating">${rating} rapid</div>
        </div>
      </a>
      <a class="nav-link" href="#" id="sign-out-link" style="margin-top:.25rem;">
        <svg class="icon"><use href="assets/icons.svg#icon-logout"/></svg>
        Sign out
      </a>
    </div>
  `;

  if (topbar) {
    topbar.innerHTML = `
      <button class="btn btn-icon btn-ghost" id="menu-toggle" aria-label="Menu">
        <svg class="icon"><use href="assets/icons.svg#icon-users"/></svg>
      </button>
      <div class="brand" style="padding:0;font-size:1.05rem;">
        <div class="mark" style="width:28px;height:28px;"><svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M12 2L9 7h6l-3-5zM8 8v3h2v2H8v2h2v2H6v-2H4v-2h2V11H4V8h4zm8 0v3h2v2h-2v2h2v2h-4v-2h-2v-2h2V11h-2V8h4z"/></svg></div>
        MasterChess
      </div>
      <a class="avatar" href="profile.html" style="width:30px;height:30px;font-size:.7rem;">${initials(name)}</a>
    `;
    const toggle = document.getElementById('menu-toggle');
    toggle.onclick = () => { sidebar.classList.add('open'); scrim.classList.add('open'); };
    scrim.onclick = () => { sidebar.classList.remove('open'); scrim.classList.remove('open'); };
  }

  document.getElementById('sign-out-link').onclick = (e) => { e.preventDefault(); signOut(); };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
