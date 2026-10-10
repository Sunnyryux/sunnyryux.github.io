/* Navigation and presentation. All editable content lives in content.js. */
(() => {
  'use strict';
  const root = document.getElementById('sunny-brand');
  const data = window.SUNNY_CONTENT;
  if (!root || !data) return;
  const find = id => root.querySelector('#' + id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const slot = (label, lines = 3) => '<div class="copy-slot" aria-label="' + escape(label) + ': not yet added">' + '<span aria-hidden="true"></span>'.repeat(lines) + '</div>';
  const copy = (value, label, lines = 3) => value ? '<p>' + escape(value) + '</p>' : slot(label, lines);
  const tags = values => values?.length ? '<div class="tag-row">' + values.map(v => '<span>' + escape(v) + '</span>').join('') + '</div>' : '';
  const image = (src, alt, extra = '') => '<img src="' + escape(src) + '" alt="' + escape(alt) + '" loading="lazy" ' + extra + '>';
  let selectedCareer = 'ea';
  let selectedRole = 0;
  let currentView = 'home';
  let previewRoute = 'home';
  let expandedReels = false;
  const preview = !!window.SUNNY_PREVIEW;

  find('home-heading').innerHTML = escape(data.profile.name) + '<span>.</span>';
  root.querySelector('.brand-message').innerHTML = escape(data.profile.brandMessage).replace('in Progress.','<span>in Progress.</span>');
  find('profile-focus').innerHTML = data.profile.focus ? escape(data.profile.focus) : '<span class="focus-slot" aria-label="Professional focus: not yet added"></span>';
  find('profile-statement').innerHTML = copy(data.profile.statement, 'My perspective', 2);
  find('profile-mission').innerHTML = copy(data.profile.mission, 'Next mission', 3);
  find('profile-location').textContent = data.profile.location;
  find('hero-poster').src = data.profile.backgroundPoster;
  find('hero-video-link').href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(data.profile.backgroundVideoId);
  find('profile-keywords').innerHTML = data.profile.keywords.length ? data.profile.keywords.map(k => '<span>' + escape(k) + '</span>').join('') : '<div class="keyword-space" aria-label="Focus keywords: not yet added"></div>';

  function renderCareer() {
    const career = data.careers.find(c => c.id === selectedCareer) || data.careers[0];
    selectedCareer = career.id;
    const role = career.roles[selectedRole] || career.roles[0];
    find('career-nav').innerHTML = data.careers.map(c => '<button type="button" class="chapter-button" data-career="' + escape(c.id) + '" aria-controls="career-detail" aria-pressed="' + (c.id === career.id) + '"><span>' + escape(c.years) + '</span><strong>' + escape(c.company) + '</strong></button>').join('');
    const roleTabs = career.roles.length > 1 ? '<div class="role-tabs" aria-label="EA roles">' + career.roles.map((r,i) => '<button type="button" data-role="' + i + '" aria-pressed="' + (r === role) + '" aria-controls="career-role">' + escape(r.shortTitle || r.title) + '</button>').join('') + '</div><p class="overlap-note">' + escape(career.overlapNote) + '</p>' : '';
    const fields = [['WHY THIS CHAPTER','why'],['THE CHALLENGE','challenge'],['MY APPROACH','approach'],['WHAT I LEARNED','insight'],['WHAT CHANGED','impact']];
    const visual = career.image ? '<figure class="career-visual">' + image(career.image, career.imageAlt) + '<figcaption>' + escape(career.imageCaption) + '</figcaption></figure>' : '<div class="chapter-art"><strong>' + escape(career.company) + '</strong><span>' + escape(career.years) + '</span></div>';
    const related = career.projects.length ? '<div class="related-work"><p class="small-label">EXPLORE THE WORK</p><div class="related-links">' + career.projects.map(id => {const p = data.projects.find(p => p.id === id); return p ? '<a href="#project/' + escape(id) + '">' + escape(p.title) + '<span aria-hidden="true">↗</span></a>' : '';}).join('') + '</div></div>' : '';
    find('career-detail').innerHTML = '<div class="chapter-top"><h2>' + escape(career.company) + '</h2><span>' + escape(career.period) + '</span></div>' + (career.headline ? '<h3 class="chapter-headline">' + escape(career.headline) + '</h3>' : slot('Career chapter headline', 1)) + tags(career.keywords) + roleTabs + '<div id="career-role"><h3 class="role-title">' + escape(role.title) + '</h3><p class="role-period">' + escape(role.period) + '</p><div class="story-grid">' + fields.map(([label,key]) => '<section class="story-step ' + (key === 'impact' ? 'impact-step' : '') + '"><h4>' + label + '</h4>' + copy(role[key],label,2) + '</section>').join('') + '</div></div>' + visual + related;
  }

  function reelCard(reel) {
    return '<a class="reel-card" href="' + escape(reel.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escape(reel.title) + ', opens on YouTube">' + image(reel.image,'Campaign film thumbnail from the supplied portfolio') + '<div class="reel-meta"><span>' + escape(reel.title) + '</span><span aria-hidden="true">↗</span></div></a>';
  }
  function renderReels() {
    find('reel-grid').innerHTML = data.reels.slice(0, expandedReels ? data.reels.length : 6).map(reelCard).join('');
    find('more-reels').hidden = expandedReels || data.reels.length <= 6;
  }
  find('project-grid').innerHTML = data.projects.map(p => '<a class="project-card" href="#project/' + escape(p.id) + '"><div class="image-wrap">' + image(p.image,p.imageAlt) + '</div><div class="card-copy"><p class="project-number">' + escape(p.number + ' / ' + p.brand) + '</p><h2>' + escape(p.title) + '</h2>' + copy(p.summary,'Project summary',2) + '<p class="card-period">' + escape(p.period + ' / ' + p.category) + '</p><span class="card-link">Explore project ↗</span></div></a>').join('');
  renderReels();

  function renderProject(id) {
    const project = data.projects.find(p => p.id === id);
    find('project-overview').hidden = !!project;
    find('project-detail').hidden = !project;
    if (!project) return;
    const metrics = project.metrics.length ? '<div class="case-metrics">' + project.metrics.map(m => '<div class="case-metric"><p class="metric-value">' + escape(m.value) + '</p><p class="metric-label">' + escape(m.label) + '</p><p class="metric-note">' + escape(m.note) + '</p></div>').join('') + '</div>' : slot('Results and metrics',3);
    const actions = project.actions.length ? '<ul>' + project.actions.map(a => '<li>' + escape(a) + '</li>').join('') + '</ul>' : slot('Key decisions and actions',3);
    const linkedReels = project.reelIds.map(id => data.reels.find(r => r.id === id)).filter(Boolean);
    const gallery = project.gallery.length ? '<div class="case-gallery">' + project.gallery.map(src => image(src,'Supporting campaign image from the supplied portfolio')).join('') + '</div>' : '';
    const nextIndex = (data.projects.indexOf(project) + 1) % data.projects.length;
    find('project-detail').innerHTML = '<a class="back-link" href="#project">← All projects</a><p class="eyebrow">' + escape(project.number + ' / ' + project.brand + ' / ' + project.period) + '</p><h1 class="case-title">' + escape(project.title) + '</h1>' + (project.subtitle ? '<p class="case-subtitle">' + escape(project.subtitle) + '</p>' : slot('Project introduction',2)) + tags(project.keywords) + '<figure class="case-hero">' + image(project.image,project.imageAlt) + '</figure><div class="case-columns"><div><section class="case-section"><h3>The context</h3>' + copy(project.context,'Project context') + '</section><section class="case-section"><h3>My role</h3>' + copy(project.role,'My role') + '</section></div><div><section class="case-section"><h3>The decisions</h3>' + actions + '</section><section class="case-section"><h3>The impact</h3>' + metrics + copy(project.outcome,'Outcome') + '</section></div></div><div class="case-insight"><p class="eyebrow">WHAT THIS TAUGHT ME</p>' + copy(project.insight,'Project lesson',2) + '</div>' + gallery + (project.video ? '<a class="action action-light" href="' + escape(project.video) + '" target="_blank" rel="noopener noreferrer">' + escape(project.videoLabel) + ' ↗</a>' : '') + (linkedReels.length ? '<h2 class="case-reels">In motion.</h2><div class="reel-grid">' + linkedReels.map(reelCard).join('') + '</div>' : '') + '<div class="case-footer"><a href="#career">← Back to career</a><a href="#project/' + escape(data.projects[nextIndex].id) + '">Next project ↗</a></div>';
  }

  find('about-intro').innerHTML = copy(data.about.intro,'My story',5);
  find('about-image').src = data.about.image;
  find('about-image').alt = data.about.imageAlt;
  find('philosophy-grid').innerHTML = data.about.philosophy.map((p,i) => '<section class="philosophy-item"><span>' + String(i+1).padStart(2,'0') + '</span><h2>' + escape(p.title) + '</h2>' + copy(p.text,p.title,3) + '</section>').join('');
  for (const [id,key,label] of [['process-copy','workingStyle','How I work'],['values-copy','values','What I value'],['inspiration-copy','inspiration','What inspires me'],['next-copy','next','What comes next']]) find(id).innerHTML = copy(data.about[key],label,3);
  find('contact-intro').innerHTML = copy(data.contact.intro,'Contact introduction',2);
  find('email-link').textContent = data.profile.email;
  for (const id of ['email-link','send-email-link']) find(id).href = 'mailto:' + data.profile.email;
  for (const id of ['linkedin-link','contact-linkedin']) find(id).href = data.profile.linkedin;
  find('resume-link').href = data.profile.resume;
  find('resume-link').setAttribute('download','Sunny_Ryu_Resume.docx');

  function route(hash) {
    const segments = String(hash || 'home').replace(/^#/, '').split('/');
    const allowed = ['home','career','project','about','contact'];
    const view = allowed.includes(segments[0]) ? segments[0] : 'home';
    currentView = view;
    root.querySelectorAll('[data-view]').forEach(panel => {panel.hidden = panel.dataset.view !== view;});
    root.querySelectorAll('[data-nav]').forEach(link => {if (link.dataset.nav === view) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');});
    if (view === 'career') renderCareer();
    if (view === 'project') renderProject(segments[1]);
    if (!preview) {
      document.title = (view === 'home' ? '' : ({career:'Career',project:'Project',about:'About Me',contact:'Contact Me'})[view] + ' — ') + "Sunny Ryu — I'm Still in Progress.";
      document.dispatchEvent(new CustomEvent('sunnyviewchange',{detail:{view}}));
    }
  }
  root.addEventListener('click', event => {
    const chapter = event.target.closest('[data-career]');
    const role = event.target.closest('[data-role]');
    if (chapter) {selectedCareer = chapter.dataset.career; selectedRole = 0; renderCareer(); return;}
    if (role) {selectedRole = Number(role.dataset.role); renderCareer(); return;}
    if (event.target.closest('#more-reels')) {expandedReels = true; renderReels(); return;}
    const link = event.target.closest('a[href^="#"]');
    if (link && link.getAttribute('href') !== '#main') {
      const target = link.getAttribute('href').slice(1);
      if (preview) {event.preventDefault(); previewRoute = target; route(previewRoute);}
      else if (location.hash === '#' + target) {event.preventDefault(); route(target);}
      if (!preview) window.scrollTo({top:0,behavior:'instant'});
    }
  });
  if (!preview) window.addEventListener('hashchange',() => {if (location.hash === '#main') return;route(location.hash);window.scrollTo({top:0,behavior:'instant'});});
  window.SunnySite = {isHome:() => currentView === 'home'};
  route(preview ? previewRoute : location.hash);
})();
