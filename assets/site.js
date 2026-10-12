/* Paired EN/KO copy lives in content.js. English is the default language. */
(() => {
  'use strict';
  const root = document.getElementById('sunny-brand');
  const data = window.SUNNY_CONTENT;
  if (!root || !data) return;
  const preview = !!window.SUNNY_PREVIEW;
  let language = !preview && new URLSearchParams(location.search).get('lang') === 'ko' ? 'ko' : data.defaultLanguage;
  let selectedCareer = 'ea';
  let selectedRole = 0;
  let currentView = 'home';
  let currentProject = '';
  let expandedReels = false;
  const chapterOpen = {};
  const find = id => root.querySelector('#' + id);
  const local = value => value && typeof value === 'object' && !Array.isArray(value) ? (value[language] ?? value.en ?? '') : (value ?? '');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const ui = key => data.ui[language][key] ?? data.ui.en[key] ?? key;
  const inline = value => escape(local(value)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const label = key => escape(ui(key)).replace(/\n/g, '<br>');
  const slot = (name, lines = 3) => '<div class="copy-slot" aria-label="' + escape(name + ': ' + ui('notAdded')) + '">' + '<span aria-hidden="true"></span>'.repeat(lines) + '</div>';
  const copy = (value, name, lines = 3) => {
    const resolved = local(value);
    if (Array.isArray(resolved)) return resolved.length ? '<ul class="story-bullets">' + resolved.map(v => '<li>' + inline(v) + '</li>').join('') + '</ul>' : slot(name, lines);
    return resolved ? '<p>' + inline(resolved) + '</p>' : slot(name, lines);
  };
  const tags = values => {
    const list = local(values);
    return Array.isArray(list) && list.length ? '<div class="tag-row">' + list.map(v => '<span>' + inline(v) + '</span>').join('') + '</div>' : '';
  };
  const image = (src, alt) => '<img src="' + escape(src) + '" alt="' + escape(local(alt)) + '" loading="lazy">';
  function rememberChapter() {
    const detail = root.querySelector('#career-story');
    const role = data.careers.find(c => c.id === selectedCareer)?.roles[selectedRole];
    if (detail && role) chapterOpen[selectedCareer + '/' + role.id] = detail.open;
  }
  function renderShell() {
    root.dataset.language = language;
    root.setAttribute('lang', language);
    document.documentElement.setAttribute('lang', language);
    root.querySelectorAll('[data-i18n]').forEach(el => {el.innerHTML = label(el.getAttribute('data-i18n'));});
    root.querySelectorAll('[data-i18n-aria]').forEach(el => {el.setAttribute('aria-label',ui(el.getAttribute('data-i18n-aria')));});
    root.querySelectorAll('[data-language-switch]').forEach(el => {el.setAttribute('aria-pressed',String(el.dataset.languageSwitch === language));});
    find('home-heading').innerHTML = escape(data.profile.name) + '<span>.</span>';
    root.querySelector('.brand-message').innerHTML = escape(data.profile.brandMessage).replace('in Progress.','<span>in Progress.</span>');
    find('profile-focus').innerHTML = inline(data.profile.focus);
    find('profile-statement').innerHTML = copy(data.profile.statement,ui('perspective'),2);
    find('profile-mission').innerHTML = copy(data.profile.mission,ui('mission'),3);
    find('profile-location').textContent = local(data.profile.location);
    find('hero-poster').src = data.profile.backgroundPoster;
    find('hero-video-link').href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(data.profile.backgroundVideoId);
    find('profile-keywords').innerHTML = data.profile.keywords.map(v => '<span>' + inline(v) + '</span>').join('');
    find('home-journey-intro').textContent = local(data.profile.journeyIntro);
    find('journey-intro').textContent = local(data.profile.journeyIntro);
    find('project-intro').innerHTML = slot(ui('projectIntro'),2);
    find('about-heading-intro').innerHTML = slot(ui('aboutIntro'),2);
    renderProjectCards();
    renderReels();
    find('about-intro').innerHTML = copy(data.about.intro,ui('myStory'),5);
    find('about-image').src = data.about.image;
    find('about-image').alt = local(data.about.imageAlt);
    find('philosophy-grid').innerHTML = data.about.philosophy.map((p,i) => '<section class="philosophy-item"><span>' + String(i+1).padStart(2,'0') + '</span><h2>' + inline(p.title) + '</h2>' + copy(p.text,local(p.title),3) + '</section>').join('');
    for (const [id,key,name] of [['process-copy','workingStyle','howWork'],['values-copy','values','values'],['inspiration-copy','inspiration','inspiration'],['next-copy','next','next']]) find(id).innerHTML = copy(data.about[key],ui(name),3);
    find('contact-intro').innerHTML = copy(data.contact.intro,ui('navContact'),2);
    find('email-link').textContent = data.profile.email;
    for (const id of ['email-link','send-email-link']) find(id).href = 'mailto:' + data.profile.email;
    for (const id of ['linkedin-link','contact-linkedin']) find(id).href = data.profile.linkedin;
    find('resume-link').href = data.profile.resume;
    find('resume-link').setAttribute('download','Sunny_Ryu_Resume.docx');
  }
  function renderCareer() {
    const career = data.careers.find(c => c.id === selectedCareer) || data.careers[0];
    selectedCareer = career.id;
    const role = career.roles[selectedRole] || career.roles[0];
    const openKey = career.id + '/' + role.id;
    find('career-nav').innerHTML = data.careers.map(c => '<button type="button" class="chapter-button cursor-interaction" data-career="' + escape(c.id) + '" aria-controls="career-detail" aria-pressed="' + (c.id === career.id) + '"><span>' + inline(c.years) + '</span><strong>' + escape(c.company) + '</strong></button>').join('');
    const roleTabs = career.roles.length > 1 ? '<div class="role-tabs" aria-label="' + escape(ui('roleNav')) + '">' + career.roles.map((r,i) => '<button type="button" class="cursor-interaction" data-role="' + i + '" aria-pressed="' + (r === role) + '" aria-controls="career-role">' + inline(r.shortTitle || r.title) + '</button>').join('') + '</div><p class="overlap-note">' + inline(career.overlapNote) + '</p>' : '';
    const fields = [['challenge','challenge'],['approach','approach'],['impact','impact'],['insight','insight']];
    const visual = career.image ? '<figure class="career-visual">' + image(career.image,career.imageAlt) + '<figcaption>' + inline(career.imageCaption) + '</figcaption></figure>' : '<div class="chapter-art"><strong>' + escape(career.company) + '</strong><span>' + inline(career.years) + '</span></div>';
    const ids = role.projects || career.projects;
    const related = ids.length ? '<div class="related-work"><p class="small-label">' + label('relatedWork') + '</p><div class="related-links">' + ids.map(id => {
      const p = data.projects.find(p => p.id === id);
      return p ? '<a class="cursor-interaction" href="#project/' + escape(id) + '">' + inline(p.title) + '<span aria-hidden="true">↗</span></a>' : '';
    }).join('') + '</div></div>' : '';
    const highlights = role.highlights.length ? '<div class="career-highlights">' + role.highlights.map(h => '<div><p class="highlight-value">' + escape(h.value) + '</p><p class="highlight-label">' + inline(h.label) + '</p></div>').join('') + '</div>' : '';
    const history = role.history ? '<ul class="role-history">' + local(role.history).map(v => '<li>' + inline(v) + '</li>').join('') + '</ul>' : '<p class="role-period">' + inline(role.period) + '</p>';
    find('career-detail').innerHTML = '<div class="chapter-top"><h2>' + escape(career.company) + '</h2><span>' + inline(career.period) + '</span></div>' + (local(career.summary) ? '<p class="company-summary">' + inline(career.summary) + '</p>' : '') + roleTabs + '<div id="career-role"><h3 class="role-title">' + inline(role.title) + '</h3>' + history + '<h3 class="chapter-headline">' + inline(role.headline) + '</h3><p class="role-summary">' + inline(role.summary) + '</p>' + tags(role.keywords) + highlights + '<details class="career-story" id="career-story"' + (chapterOpen[openKey] ? ' open' : '') + '><summary class="cursor-interaction">' + label('chapterDetails') + '<span aria-hidden="true">+</span></summary><div class="story-grid">' + fields.map(([name,key]) => '<section class="story-step ' + (key === 'impact' ? 'impact-step' : key === 'insight' ? 'lesson-step' : '') + '"><h4>' + label(name) + '</h4>' + copy(role[key],ui(name),2) + '</section>').join('') + '</div></details></div>' + visual + related;
    root.querySelector('#career-story').addEventListener('toggle',event => {chapterOpen[openKey] = event.currentTarget.open;});
  }
  function reelCard(reel) {
    return '<a class="reel-card cursor-interaction" href="' + escape(reel.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escape(local(reel.title) + ', ' + ui('youtubeOpen')) + '">' + image(reel.image,ui('campaignThumb')) + '<div class="reel-meta"><span>' + inline(reel.title) + '</span><span aria-hidden="true">↗</span></div></a>';
  }
  function renderReels() {
    find('reel-grid').innerHTML = data.reels.slice(0,expandedReels ? data.reels.length : 6).map(reelCard).join('');
    find('more-reels').hidden = expandedReels || data.reels.length <= 6;
  }
  function renderProjectCards() {
    find('project-grid').innerHTML = data.projects.map(p => '<a class="project-card cursor-interaction" href="#project/' + escape(p.id) + '"><div class="image-wrap">' + image(p.image,p.imageAlt) + '</div><div class="card-copy"><p class="project-number">' + escape(p.number + ' / ' + p.brand) + '</p><h2>' + inline(p.title) + '</h2>' + copy(p.summary,ui('projectSummary'),2) + '<p class="card-period">' + escape(p.period) + ' / ' + inline(p.category) + '</p><span class="card-link">' + label('projectExplore') + '</span></div></a>').join('');
  }
  function renderProject(id) {
    const p = data.projects.find(p => p.id === id);
    find('project-overview').hidden = !!p;
    find('project-detail').hidden = !p;
    root.querySelector('[data-view="project"]').setAttribute('aria-labelledby',p ? 'project-case-heading' : 'project-heading');
    if (!p) return;
    const metrics = p.metrics.length ? '<div class="case-metrics">' + p.metrics.map(m => '<div class="case-metric"><p class="metric-value">' + inline(m.value) + '</p><p class="metric-label">' + inline(m.label) + '</p><p class="metric-note">' + inline(m.note) + '</p></div>').join('') + '</div>' : slot(ui('results'),3);
    const linked = p.reelIds.map(id => data.reels.find(r => r.id === id)).filter(Boolean);
    const gallery = p.gallery.length ? '<div class="case-gallery">' + p.gallery.map(src => image(src,ui('supportImage'))).join('') + '</div>' : '';
    const next = data.projects[(data.projects.indexOf(p)+1)%data.projects.length];
    find('project-detail').innerHTML = '<a class="back-link cursor-interaction" href="#project">' + label('allProjects') + '</a><p class="eyebrow">' + escape(p.number + ' / ' + p.brand + ' / ' + p.period) + '</p><h1 class="case-title" id="project-case-heading">' + inline(p.title) + '</h1>' + copy(p.subtitle,ui('projectIntro'),2) + tags(p.keywords) + '<figure class="case-hero">' + image(p.image,p.imageAlt) + '</figure><div class="case-columns"><div><section class="case-section"><h3>' + label('context') + '</h3>' + copy(p.context,ui('context')) + '</section><section class="case-section"><h3>' + label('myRole') + '</h3>' + copy(p.role,ui('myRole')) + '</section></div><div><section class="case-section"><h3>' + label('decisions') + '</h3>' + copy(p.actions,ui('decisions')) + '</section><section class="case-section"><h3>' + label('projectImpact') + '</h3>' + metrics + copy(p.outcome,ui('outcome')) + '</section></div></div><div class="case-insight"><p class="eyebrow">' + label('lesson') + '</p>' + copy(p.insight,ui('insight'),2) + '</div>' + gallery + (p.video ? '<a class="action action-light cursor-interaction" href="' + escape(p.video) + '" target="_blank" rel="noopener noreferrer">' + inline(p.videoLabel) + ' ↗</a>' : '') + (linked.length ? '<h2 class="case-reels">' + label('reelHeading') + '</h2><div class="reel-grid">' + linked.map(reelCard).join('') + '</div>' : '') + '<div class="case-footer"><a class="cursor-interaction" href="#career">' + label('backCareer') + '</a><a class="cursor-interaction" href="#project/' + escape(next.id) + '">' + label('nextProject') + '</a></div>';
  }
  function updateTitle() {
    const name = {career:'navCareer',project:'navProject',about:'navAbout',contact:'navContact'}[currentView];
    document.title = (name ? ui(name) + ' — ' : '') + "Sunny Ryu — I'm Still in Progress.";
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = local(data.profile.statement);
  }
  function renderCurrent() {
    root.querySelectorAll('[data-view]').forEach(panel => {panel.hidden = panel.dataset.view !== currentView;});
    root.querySelectorAll('[data-nav]').forEach(link => {if (link.dataset.nav === currentView) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');});
    if (currentView === 'career') renderCareer();
    if (currentView === 'project') renderProject(currentProject);
    updateTitle();
  }
  function route(hash) {
    const [page,id] = String(hash || 'home').replace(/^#/,'').split('/');
    currentView = ['home','career','project','about','contact'].includes(page) ? page : 'home';
    currentProject = currentView === 'project' ? (id || '') : '';
    renderCurrent();
    if (!preview) document.dispatchEvent(new CustomEvent('sunnyviewchange',{detail:{view:currentView}}));
  }
  function setLanguage(next) {
    if (!['en','ko'].includes(next) || next === language) return;
    rememberChapter();
    language = next;
    renderShell();
    renderCurrent();
    if (!preview) {
      const url = new URL(location.href);
      if (language === 'ko') url.searchParams.set('lang','ko'); else url.searchParams.delete('lang');
      try {history.replaceState(null,'',url.href);} catch {}
      document.dispatchEvent(new CustomEvent('sunnylanguagechange',{detail:{language}}));
    }
  }
  root.addEventListener('click',event => {
    const languageButton = event.target.closest('[data-language-switch]');
    if (languageButton) {setLanguage(languageButton.dataset.languageSwitch);return;}
    const chapter = event.target.closest('[data-career]');
    const role = event.target.closest('[data-role]');
    if (chapter) {rememberChapter();selectedCareer=chapter.dataset.career;selectedRole=0;renderCareer();return;}
    if (role) {rememberChapter();selectedRole=Number(role.dataset.role);renderCareer();return;}
    if (event.target.closest('#more-reels')) {expandedReels=true;renderReels();return;}
    const link=event.target.closest('a[href^="#"]');
    if (link && link.getAttribute('href') !== '#main') {
      const target=link.getAttribute('href');
      if (preview) {event.preventDefault();rememberChapter();route(target);}
      else if (location.hash === target) {event.preventDefault();route(target);}
      if (!preview) window.scrollTo({top:0,behavior:'instant'});
    }
  });
  if (!preview) window.addEventListener('hashchange',() => {
    if (location.hash === '#main') return;
    rememberChapter();route(location.hash);window.scrollTo({top:0,behavior:'instant'});
  });
  window.SunnySite={isHome:()=>currentView==='home',t:ui,getLanguage:()=>language,getState:()=>({language,view:currentView,project:currentProject,career:selectedCareer,role:selectedRole})};
  renderShell();
  route(preview ? 'home' : location.hash);
})();
