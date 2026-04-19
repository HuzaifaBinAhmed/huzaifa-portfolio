// ─── Cursor Glow ───────────────────────────────────────────────────────────────
const glow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
  if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
});

// ─── Canvas Particle Background ────────────────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function randRange(a, b) { return Math.random() * (b - a) + a; }

function initParticles() {
  particles = [];
  const count = Math.floor(W * H / 18000);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: randRange(0, W), y: randRange(0, H),
      r: randRange(0.5, 2),
      vx: randRange(-0.2, 0.2), vy: randRange(-0.15, -0.05),
      alpha: randRange(0.2, 0.8)
    });
  }
}
initParticles();

function drawParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(99,179,237,${p.alpha})`;
    ctx.fill();
    p.x += p.vx; p.y += p.vy;
    if (p.y < -5) { p.y = H + 5; p.x = randRange(0, W); }
    if (p.x < -5) p.x = W + 5;
    if (p.x > W + 5) p.x = -5;
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ─── Active Nav on Scroll ──────────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.side-nav a');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

// ─── Scroll Reveal ─────────────────────────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ─── Skill Bars ────────────────────────────────────────────────────────────────
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
      skillObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

const skillsSection = document.getElementById('skills');
if (skillsSection) skillObs.observe(skillsSection);

// ─── Typing Effect ─────────────────────────────────────────────────────────────
const typingEl = document.getElementById('typing-text');
const phrases = ['.NET Developer', 'Automation Engineer', 'Backend Developer', 'Discord Bot Builder', 'Problem Solver'];
let pi = 0, ci = 0, deleting = false;

function type() {
  const phrase = phrases[pi];
  if (!deleting) {
    typingEl.textContent = phrase.slice(0, ++ci);
    if (ci === phrase.length) { deleting = true; setTimeout(type, 1800); return; }
  } else {
    typingEl.textContent = phrase.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(type, deleting ? 55 : 90);
}
if (typingEl) setTimeout(type, 600);

// ─── GitHub Repos ──────────────────────────────────────────────────────────────
async function fetchRepos() {
  const grid = document.getElementById('gh-grid');
  if (!grid) return;
  grid.innerHTML = '<p style="color:var(--muted);font-size:.85rem">Loading repositories…</p>';
  try {
    const res = await fetch('https://api.github.com/users/HuzaifaBinAhmed/repos?per_page=100&sort=updated&direction=desc');
    if (!res.ok) throw new Error('API error');
    const repos = await res.json();
    const filtered = repos.filter(r => !r.fork && r.size > 0).slice(0, 6);
    if (!filtered.length) { grid.innerHTML = '<p style="color:var(--muted);font-size:.85rem">No repos found.</p>'; return; }
    grid.innerHTML = '';
    filtered.forEach(r => {
      const card = document.createElement('a');
      card.href = r.html_url;
      card.target = '_blank';
      card.rel = 'noopener';
      card.className = 'repo-card';
      card.innerHTML = `
        <div class="repo-name">
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/></svg>
          ${r.name.replace(/[-_]/g, ' ')}
        </div>
        <div class="repo-desc">${r.description || 'No description provided.'}</div>
        <div class="repo-meta">
          ${r.language ? `<span class="repo-lang">${r.language}</span>` : ''}
          ${r.stargazers_count ? `<span>⭐ ${r.stargazers_count}</span>` : ''}
          ${r.forks_count ? `<span>🍴 ${r.forks_count}</span>` : ''}
        </div>`;
      grid.appendChild(card);
    });
    // re-observe new cards
    grid.querySelectorAll('.repo-card').forEach(el => { el.classList.add('reveal'); revealObs.observe(el); });
  } catch(e) {
    grid.innerHTML = `<p style="color:var(--muted);font-size:.85rem">Could not load repositories. <a href="https://github.com/HuzaifaBinAhmed" target="_blank">View on GitHub ↗</a></p>`;
  }
}
fetchRepos();
