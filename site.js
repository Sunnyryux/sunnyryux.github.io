/* Buildless bilingual portfolio. Project links are shareable hash routes. */
(() => {
  'use strict';
  const root = document.getElementById('sunny-brand');
  const data = window.SUNNY_CONTENT;
  if (!root || !data) return;
  const preview = !!window.SUNNY_PREVIEW;
  let language = new URLSearchParams(location.search).get('lang') === 'ko' ? 'ko' : data.defaultLanguage;
  let selectedCareer = 'ea', selectedRole = 0, currentView = 'home', currentProject = '';
  let returnContext = null, lastRoute = '', modalTrigger = null;
  let earlierWorkOpen = false, behindMoreOpen = false;
  const chapterOpen = {}, groupOpen = {};
  const find = id => root.querySelector('#' + id);
  const local = value => value && typeof value === 'object' && !Array.isArray(value) ? (value[language] ?? value.en ?? '') : (value ?? '');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const englishHeadingKeys = new Set(['navCareer','navProject','navAbout','heroEyebrow','perspective','mission','homeJourney','homeNext','careerEyebrow','careerHeading','projectEyebrow','projectHeading','featuredWork','programmesHeading','aboutEyebrow','aboutHeading','myStory','howWork','values','inspiration','next','challenge','approach','impact','insight','relatedWork','relatedStories','context','decisions','projectImpact','lesson','projectMedia','collectionHeading','additionalWork','kingWork','references','behindHeading','behindEyebrow']);
  const ui = key => (englishHeadingKeys.has(key) ? data.ui.en[key] : data.ui[language][key]) ?? data.ui.en[key] ?? key;
  const inline = value => escape(local(value)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const heading = value => escape(value && typeof value === 'object' && !Array.isArray(value) ? value.en ?? local(value) : value);
  const label = key => escape(ui(key)).replace(/\n/g, '<br>');
  const has = value => Array.isArray(local(value)) ? local(value).length > 0 : !!local(value);
  const copy = value => Array.isArray(local(value)) ? '<ul class="story-bullets">' + local(value).map(v => '<li>' + inline(v) + '</li>').join('') + '</ul>' : has(value) ? '<p>' + inline(value) + '</p>' : '';
  const tags = values => has(values) ? '<div class="tag-row">' + local(values).map(v => '<span>' + inline(v) + '</span>').join('') + '</div>' : '';
  const image = (src, alt, extra = '') => src ? '<img src="' + escape(src) + '" alt="' + escape(local(alt)) + '" loading="lazy" decoding="async" ' + extra + '>' : '';
  const projectById = id => data.projects.find(p => p.id === (data.projectAliases?.[id] || id));
  const projectHref = id => '#project/' + encodeURIComponent(id);
  const currentHash = () => currentView === 'career' ? '#career/' + selectedCareer + '/' + (data.careers.find(c => c.id === selectedCareer)?.roles[selectedRole]?.id || '') : currentView === 'project' && currentProject ? projectHref(currentProject) : '#' + currentView;
  function remember() {
    const story = find('career-story');
    const role = data.careers.find(c => c.id === selectedCareer)?.roles[selectedRole];
    if (story && role) chapterOpen[selectedCareer + '/' + role.id] = story.open;
    root.querySelectorAll('[data-programme]').forEach(el => {groupOpen[el.dataset.programme] = el.open;});
    if(find('earlier-work')) earlierWorkOpen=!!find('earlier-work').open;
    if(find('behind-more')) behindMoreOpen=!!find('behind-more').open;
  }
  const snapshot = () => ({hash:currentHash(), scroll:window.scrollY || 0, career:selectedCareer, role:selectedRole});
  function persistSnapshot() {
    if (preview) return;
    try {history.replaceState({...history.state, sunnySnapshot:snapshot(), sunnyReturn:returnContext}, '', location.href);} catch {}
  }
  function scrollTo(y = 0) {window.scrollTo({top:y, behavior:'instant'});}
  function afterRender(callback) {if (window.requestAnimationFrame) window.requestAnimationFrame(callback); else callback();}
  function navigate(hash, restore = null) {
    remember();
    const old = snapshot();
    const opensCase = /^#project\/.+/.test(hash);
    const origin = opensCase ? (currentView === 'project' && currentProject ? returnContext : old) : null;
    if (!preview) {
      persistSnapshot();
      const url = new URL(location.href); url.hash = hash;
      history.pushState({sunnyReturn:origin, sunnySnapshot:restore || null}, '', url.href);
    }
    returnContext = origin;
    if (restore) {selectedCareer=restore.career || selectedCareer;selectedRole=restore.role ?? selectedRole;}
    route(hash);
    afterRender(() => {scrollTo(restore?.scroll || 0);if (!restore) focusHeading();});
  }
  function focusHeading() {
    const heading = root.querySelector('[data-view="' + currentView + '"] ' + (currentProject ? '#project-case-heading' : 'h1'));
    if (heading) {heading.setAttribute('tabindex','-1');heading.focus?.({preventScroll:true});}
  }
  function renderShell() {
    root.dataset.language=language;root.setAttribute('lang',language);document.documentElement.setAttribute('lang',language);
    root.querySelectorAll('[data-i18n]').forEach(el => {el.innerHTML=label(el.getAttribute('data-i18n'));});
    root.querySelectorAll('[data-i18n-aria]').forEach(el => {el.setAttribute('aria-label',ui(el.getAttribute('data-i18n-aria')));});
    root.querySelectorAll('[data-language-switch]').forEach(el => {el.setAttribute('aria-pressed',String(el.dataset.languageSwitch===language));});
    find('home-heading').innerHTML=escape(data.profile.name)+'<span>.</span>';
    root.querySelector('.brand-message').innerHTML=escape(data.profile.brandMessage.toUpperCase()).replace(/\bPROGRESS\b([.!?]?)/,'<span class="brand-progress">$&</span>');
    find('profile-focus').innerHTML=inline(data.profile.focus).replace(/\n/g,'<br>');
    find('profile-statement').innerHTML=copy(data.profile.statement);
    find('profile-mission').innerHTML=copy(data.profile.mission);
    find('profile-location').textContent=local(data.profile.location);
    find('hero-poster').src=data.profile.backgroundPoster;
    find('hero-video-link').href='https://www.youtube.com/watch?v='+encodeURIComponent(data.profile.backgroundVideoId);
    find('profile-keywords').innerHTML=data.profile.keywords.map(v=>'<span>'+inline(v)+'</span>').join('');
    find('home-journey-intro').textContent=local(data.profile.journeyIntro);
    find('journey-intro').textContent=local(data.profile.journeyIntro);
    find('project-intro').innerHTML=copy(data.projectIntroduction);
    find('project-scale').innerHTML=(data.projectScale||[]).map(m=>'<li><strong>'+inline(m.value)+'</strong> <span>'+inline(m.label)+'</span></li>').join('');
    renderProjectCards();renderProgrammes();
    find('about-intro').innerHTML=local(data.about.intro).split(/\n\s*\n/).filter(Boolean).map(p=>'<p>'+inline(p)+'</p>').join('');
    find('about-image').src=data.about.image;find('about-image').alt=local(data.about.imageAlt);
    find('philosophy-grid').innerHTML=data.about.philosophy.map((p,i)=>'<section class="philosophy-item"><span>'+String(i+1).padStart(2,'0')+'</span><h2>'+heading(p.title)+'</h2>'+copy(p.text)+'</section>').join('');
    for (const key of ['values','inspiration','next']) find(key+'-copy').innerHTML=copy(data.about[key]);
    find('send-email-link').href='mailto:'+data.profile.email;
    for (const id of ['linkedin-link','footer-linkedin']) find(id).href=data.profile.linkedin;
    renderBehindGallery();
  }
  function thumbCard(p) {
    return '<a class="related-card cursor-interaction" href="'+projectHref(p.id)+'">'+(p.image ? '<div class="related-image">'+image(p.image,p.imageAlt)+'</div>' : '')+'<span class="related-card-title">'+heading(p.title)+'</span><span class="related-card-period">'+escape(p.period)+'<span aria-hidden="true">↗</span></span></a>';
  }
  function renderCareer() {
    const career=data.careers.find(c=>c.id===selectedCareer)||data.careers[0];selectedCareer=career.id;
    const role=career.roles[selectedRole]||career.roles[0];selectedRole=career.roles.indexOf(role);
    const key=career.id+'/'+role.id;
    find('career-nav').innerHTML=data.careers.map(c=>'<button type="button" class="chapter-button" data-career="'+escape(c.id)+'" aria-controls="career-detail" aria-pressed="'+(c.id===career.id)+'"><span>'+inline(c.years)+'</span><strong>'+escape(c.company)+'</strong></button>').join('');
    const tabs=career.roles.length>1 ? '<div class="role-tabs" aria-label="'+escape(ui('roleNav'))+'">'+career.roles.map((r,i)=>'<button type="button" data-role="'+i+'" aria-pressed="'+(r===role)+'" aria-controls="career-role">'+heading(r.shortTitle||r.title)+'</button>').join('')+'</div><p class="overlap-note">'+inline(career.overlapNote)+'</p>' : '';
    const projects=(role.projects||career.projects||[]).map(projectById).filter(Boolean);
    const illustrated=projects.filter(p=>p.image), textProjects=projects.filter(p=>!p.image);
    const related=projects.length ? '<section class="related-work"><p class="small-label">'+label('relatedWork')+'</p>'+(illustrated.length?'<div class="career-projects">'+illustrated.map(thumbCard).join('')+'</div>':'')+(textProjects.length?'<div class="related-text-projects">'+textProjects.map(thumbCard).join('')+'</div>':'')+'</section>' : '';
    const highlights=(role.highlights||[]).length ? '<div class="career-highlights">'+role.highlights.map(h=>'<div><p class="highlight-value">'+escape(h.value)+'</p><p class="highlight-label">'+inline(h.label)+'</p></div>').join('')+'</div>' : '';
    const fields=[['challenge','challenge'],['approach','approach'],['impact','impact'],['insight','insight']];
    const historyCopy=role.history ? '<ul class="role-history">'+local(role.history).map(v=>'<li>'+inline(v)+'</li>').join('')+'</ul>' : '<p class="role-period">'+inline(role.period)+'</p>';
    find('career-detail').innerHTML='<div class="chapter-top"><h2>'+escape(career.company)+'</h2><span>'+inline(career.period)+'</span></div>'+(has(career.summary)?'<p class="company-summary">'+inline(career.summary)+'</p>':'')+tabs+'<div id="career-role"><h3 class="role-title">'+heading(role.title)+'</h3>'+historyCopy+'<h3 class="chapter-headline">'+heading(role.headline)+'</h3><p class="role-summary">'+inline(role.summary)+'</p>'+tags(role.keywords)+highlights+'<details class="career-story" id="career-story"'+(chapterOpen[key]?' open':'')+'><summary>'+label('chapterDetails')+'<span aria-hidden="true">+</span></summary><div class="story-grid">'+fields.filter(([,field])=>has(role[field])).map(([name,field])=>'<section class="story-step '+(field==='impact'?'impact-step':field==='insight'?'lesson-step':'')+'"><h4>'+label(name)+'</h4>'+copy(role[field])+'</section>').join('')+'</div></details></div>'+related;
    find('career-story').addEventListener('toggle',e=>{chapterOpen[key]=e.currentTarget.open;});
  }
  function renderProjectCards() {
    find('project-grid').innerHTML=data.featuredProjectIds.map((id,i)=>{
      const p=projectById(id);const parts=local(p.summary).split(' → ');
      return '<a class="project-card" href="'+projectHref(id)+'"><div class="image-wrap'+(p.posterContain?' artwork-poster':'')+'">'+image(p.image,p.imageAlt)+(p.media[0]?.kind==='video'?'<span class="poster-badge">▶ '+label('filmBadge')+'</span>':'')+'<span class="case-index">'+String(i+1).padStart(2,'0')+'</span></div><div class="card-copy"><p class="project-number">'+inline(p.category)+' / '+escape(p.period)+'</p><h2>'+heading(p.title)+'</h2>'+cardMetric(p)+'<p class="card-decision">'+escape(parts[0])+'</p>'+(parts[1]?'<p class="card-result"><span aria-hidden="true">↳</span> '+escape(parts[1])+'</p>':'')+'<span class="card-link">'+label('projectExplore')+'</span></div></a>';
    }).join('');
  }
  function cardMetric(p,compact=false) {
    const m=p.metrics?.[0];
    return m?'<p class="card-metric'+(compact?' compact-metric':'')+'"><strong>'+inline(m.value)+'</strong><span>'+inline(m.label)+'</span></p>':'';
  }
  function projectRow(p) {
    return '<a class="programme-project'+(!p.image?' text-project':'')+'" href="'+projectHref(p.id)+'">'+(p.image?'<div class="programme-project-image">'+image(p.image,p.imageAlt)+'</div>':'')+'<div><p class="programme-period">'+escape(p.period)+'</p><h4>'+heading(p.title)+'</h4>'+cardMetric(p,true)+'<p>'+inline(p.summary)+'</p></div><span class="row-arrow" aria-hidden="true">↗</span></a>';
  }
  function renderProgrammes() {
    const renderGroup=(g,i)=>{
      const projects=g.projectIds.map(projectById).filter(Boolean);const cover=projects.find(p=>p.image);
      return '<details class="programme-group" data-programme="'+escape(g.id)+'"'+(groupOpen[g.id]?' open':'')+'><summary><span class="programme-index">'+String(i+1).padStart(2,'0')+'</span>'+(cover?'<div class="programme-thumb">'+image(cover.image,cover.imageAlt)+'</div>':'')+'<div class="programme-title"><h3>'+heading(g.title)+'</h3><span>'+escape(g.period)+'</span></div><span class="programme-plus" aria-hidden="true">+</span></summary><div class="programme-items">'+projects.map(projectRow).join('')+'</div></details>';
    };
    const football=data.projectGroups.filter(g=>g.company!=='king');
    const earlier=data.projectGroups.filter(g=>g.company==='king');
    find('programme-list').innerHTML=football.map(renderGroup).join('')+(earlier.length?'<details class="earlier-work" id="earlier-work"'+(earlierWorkOpen?' open':'')+'><summary><span>'+label('kingWork')+'</span><span aria-hidden="true">+</span></summary><div>'+earlier.map((g,i)=>renderGroup(g,football.length+i)).join('')+'</div></details>':'');
    find('additional-work').innerHTML=data.additionalProjectIds?.length ? '<section class="additional-work"><p class="small-label">'+label('additionalWork')+'</p>'+data.additionalProjectIds.map(projectById).filter(Boolean).map(projectRow).join('')+'</section>' : '';
  }
  function renderBehindGallery() {
    const selectedIds=data.aboutGalleryIds||[];
    const photos=(data.about.gallery||[]).filter(p=>!selectedIds.length||selectedIds.includes(p.id));
    const tile=p=>'<figure class="behind-moment"><button type="button" class="behind-photo" data-about-photo="'+escape(p.id)+'" aria-label="'+escape(ui('viewImage')+': '+local(p.alt))+'">'+image(p.src,p.alt,'width="'+Number(p.width)+'" height="'+Number(p.height)+'"')+'</button><figcaption>'+inline(p.caption)+'</figcaption></figure>';
    find('behind-work').hidden=!photos.length;
    find('behind-gallery').innerHTML='<div class="behind-grid">'+photos.slice(0,6).map(tile).join('')+'</div>'+(photos.length>6?'<details class="behind-more" id="behind-more"'+(behindMoreOpen?' open':'')+'><summary><span>'+label('moreMoments')+' <span class="moment-count">'+(photos.length-6)+'</span></span><span aria-hidden="true">+</span></summary><div class="behind-grid">'+photos.slice(6).map(tile).join('')+'</div></details>':'');
  }
  function mediaMarkup(m,index,pid,large=false) {
    const key=escape(pid+':'+index);
    if (m.kind==='video') return '<figure class="project-media '+(large?'main-media':'')+'"><button type="button" class="film-poster" data-film="'+key+'" aria-label="'+escape(ui('playFilmLabel')+': '+local(m.caption))+'">'+image(m.poster,m.caption)+'<span class="film-play"><span aria-hidden="true">▶</span> '+label('playFilm')+'</span></button><figcaption>'+inline(m.caption)+' <a href="'+escape(m.url)+'" target="_blank" rel="noopener noreferrer">YouTube ↗</a></figcaption></figure>';
    return '<figure class="project-media '+(large?'main-media ':'')+(m.nativeAspect?'uploaded-photo':'')+'"><button type="button" class="image-poster'+(m.contain?' contain':'')+'" data-photo="'+key+'" aria-label="'+escape(ui('viewImage')+': '+local(m.alt))+'">'+image(m.src,m.alt)+'</button><figcaption>'+inline(m.caption)+(m.source?' <a href="'+escape(m.source)+'" target="_blank" rel="noopener noreferrer">'+(language==='ko'?'출처':'Source')+' ↗</a>':'')+'</figcaption></figure>';
  }
  function caseNav(p,bottom=false) {
    const ids=data.projects.map(p=>p.id);const i=ids.indexOf(p.id);const next=projectById(ids[(i+1)%ids.length]);const previous=projectById(ids[(i-1+ids.length)%ids.length]);
    const origin=returnContext?.hash || '#project';
    const backLabel=origin.startsWith('#career')?'backCareer':origin==='#project'?'allProjects':'backOrigin';
    return '<nav class="'+(bottom?'case-footer':'case-toolbar')+'" aria-label="'+escape(ui('projectNav'))+'"><button type="button" class="case-back" data-case-back>'+label(backLabel)+'</button>'+(origin!=='#project'?'<a href="#project">'+label('allProjects')+'</a>':'')+'<div class="case-adjacent"><a href="'+projectHref(previous.id)+'" aria-label="'+escape((language==='ko'?'이전 프로젝트: ':'Previous project: ')+local(previous.title))+'">←</a><a href="'+projectHref(next.id)+'" aria-label="'+escape((language==='ko'?'다음 프로젝트: ':'Next project: ')+local(next.title))+'">'+label('nextProject')+'</a></div></nav>';
  }
  function collectionMarkup() {
    return '<section class="kit-collection"><p class="eyebrow">'+label('collectionHeading')+'</p><p class="collection-intro">'+label('collectionIntro')+'</p><div class="kit-grid">'+data.kitCollection.map(k=>'<article class="kit-item'+(!k.image&&!k.video?' kit-text':'')+'">'+(k.image?'<button type="button" class="image-poster contain" data-kit="'+escape(k.id)+'" aria-label="'+escape(ui('viewImage')+': '+local(k.title))+'">'+image(k.image,k.title)+'</button>':k.video?'<button type="button" class="film-poster" data-kit-film="'+escape(k.id)+'" aria-label="'+escape(ui('playFilmLabel')+': '+local(k.title))+'">'+image(k.video.poster,k.title)+'<span class="film-play">▶ '+label('playFilm')+'</span></button>':'')+'<p class="programme-period">'+escape(k.period)+'</p><h3>'+heading(k.title)+'</h3>'+copy(k.summary)+'</article>').join('')+'</div></section>';
  }
  function renderProject(id) {
    const p=projectById(id);
    currentProject=p?.id || '';
    find('project-overview').hidden=!!p;find('project-detail').hidden=!p;
    root.querySelector('[data-view="project"]').setAttribute('aria-labelledby',p?'project-case-heading':'project-heading');
    if (!p) return;
    const metrics=(p.metrics||[]).length ? '<div class="case-metrics">'+p.metrics.map(m=>'<div class="case-metric"><p class="metric-value">'+inline(m.value)+'</p><p class="metric-label">'+inline(m.label)+'</p></div>').join('')+'</div>' : '';
    const section=(name,value)=>has(value)?'<section class="case-section"><h2>'+label(name)+'</h2>'+copy(value)+'</section>':'';
    const related=(p.related?.length?p.related:data.featuredProjectIds.filter(x=>x!==p.id)).slice(0,3).map(projectById).filter(Boolean);
    find('project-detail').innerHTML=caseNav(p)+'<header class="case-heading"><p class="eyebrow">'+escape(p.brand)+' / '+escape(p.period)+'</p><h1 class="case-title" id="project-case-heading">'+heading(p.title)+'</h1><p class="case-summary">'+inline(p.summary)+'</p></header>'+(p.media.length?mediaMarkup(p.media[0],0,p.id,true):'')+'<div class="case-columns"><div>'+section('context',p.context)+section('decisions',p.actions)+'</div><div><section class="case-section"><h2>'+label('projectImpact')+'</h2>'+metrics+copy(p.outcome)+'</section>'+(has(p.insight)?'<section class="case-insight"><p class="eyebrow">'+label('lesson')+'</p>'+copy(p.insight)+'</section>':'')+'</div></div>'+(p.media.length>1?'<section class="case-media-gallery '+(p.photoGallery?'upload-gallery':'')+'"><p class="small-label">'+label('projectMedia')+'</p><div class="media-grid">'+p.media.slice(1).map((m,i)=>mediaMarkup(m,i+1,p.id)).join('')+'</div></section>':'')+(p.id==='cultural-kits'?collectionMarkup():'')+((p.references||[]).length?'<section class="case-references"><h2>'+label('references')+'</h2><div>'+p.references.map(r=>'<a class="action action-outline" href="'+escape(r.url)+'" target="_blank" rel="noopener noreferrer">'+inline(r.label)+' ↗</a>').join('')+'</div></section>':'')+(related.length?'<section class="related-stories"><h2>'+label('relatedStories')+'</h2><div class="career-projects">'+related.map(thumbCard).join('')+'</div></section>':'')+caseNav(p,true);
  }
  function updateTitle() {
    const p=currentView==='project'?projectById(currentProject):null;
    const name=p?p.title.en:({career:ui('navCareer'),project:ui('navProject'),about:ui('navAbout')}[currentView] || '');
    document.title=(name?name+' — ':'')+'Sunny Ryu — Football Business, Marketing & Partnerships';
    const desc=document.querySelector('meta[name="description"]');if(desc)desc.content=p?local(p.summary):local(data.profile.statement);
  }
  function renderCurrent() {
    root.querySelectorAll('[data-view]').forEach(p=>{p.hidden=p.dataset.view!==currentView;});
    root.querySelectorAll('[data-nav]').forEach(a=>{if(a.dataset.nav===currentView)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(currentView==='career')renderCareer();if(currentView==='project')renderProject(currentProject);updateTitle();
  }
  function route(hash) {
    closeMedia(false);
    const [page,id,roleId]=String(hash||'home').replace(/^#/,'').split('/').map(s=>{try{return decodeURIComponent(s);}catch{return s;}});
    const target=page==='contact'?'about':page;
    currentView=['home','career','project','about'].includes(target)?target:'home';
    currentProject=currentView==='project'?(id||''):'';
    if(currentView==='career' && id) {
      const career=data.careers.find(c=>c.id===id);if(career){selectedCareer=id;selectedRole=Math.max(0,career.roles.findIndex(r=>r.id===roleId));}
    }
    renderCurrent();lastRoute=location.href;
    if(!preview)document.dispatchEvent(new CustomEvent('sunnyviewchange',{detail:{view:currentView}}));
  }
  function setLanguage(next) {
    if(!['en','ko'].includes(next)||next===language)return;
    remember();const y=window.scrollY||0;closeMedia(false);language=next;renderShell();renderCurrent();
    if(!preview){const url=new URL(location.href);if(language==='ko')url.searchParams.set('lang','ko');else url.searchParams.delete('lang');history.replaceState(history.state,'',url.href);lastRoute=location.href;document.dispatchEvent(new CustomEvent('sunnylanguagechange',{detail:{language}}));}
    afterRender(()=>scrollTo(y));
  }
  function closeMedia(restoreFocus=true) {
    const dialog=find('media-dialog');if(!dialog)return;
    find('media-content').innerHTML='';find('media-link').innerHTML='';document.body.style.overflow='';
    if(dialog.open){if(dialog.close)dialog.close();else dialog.removeAttribute('open');}
    if(restoreFocus && modalTrigger?.isConnected)modalTrigger.focus?.({preventScroll:true});
    modalTrigger=null;
  }
  function showMedia(m,title,trigger) {
    const dialog=find('media-dialog');modalTrigger=trigger;find('media-title').textContent=local(title);
    find('media-close').setAttribute('aria-label',ui(m.kind==='video'?'closeFilm':'closeImage'));
    if(m.kind==='video') {
      const url=m.provider==='facebook' ? 'https://www.facebook.com/plugins/video.php?href='+encodeURIComponent(m.url)+'&show_text=false&autoplay=true' : 'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(m.videoId)+'?autoplay=1&rel=0&playsinline=1';
      find('media-content').innerHTML='<div class="film-frame"><iframe src="'+url+'" title="'+escape(local(title))+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>';
      find('media-link').innerHTML='<a href="'+escape(m.url)+'" target="_blank" rel="noopener noreferrer">'+(m.provider==='facebook'?(language==='ko'?'Facebook에서 보기 ↗':'Open on Facebook ↗'):label('videoFallback'))+'</a>';
    } else find('media-content').innerHTML=image(m.src,title,'class="modal-image"');
    document.body.style.overflow='hidden';if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');find('media-close').focus?.();
  }
  find('media-dialog').addEventListener('close',()=>{find('media-content').innerHTML='';document.body.style.overflow='';if(modalTrigger?.isConnected)modalTrigger.focus?.();modalTrigger=null;});
  find('media-dialog').addEventListener('cancel',()=>{closeMedia();});
  root.addEventListener('error',event=>{if(event.target.tagName==='IMG'){event.target.classList.add('image-unavailable');event.target.setAttribute('alt',event.target.alt||ui('supportImage'));}},true);
  root.addEventListener('click',event=>{
    const lang=event.target.closest('[data-language-switch]');if(lang){setLanguage(lang.dataset.languageSwitch);return;}
    const chapter=event.target.closest('[data-career]'), role=event.target.closest('[data-role]');
    if(chapter || role) {
      remember();if(chapter){selectedCareer=chapter.dataset.career;selectedRole=0;}if(role)selectedRole=Number(role.dataset.role);
      renderCareer();if(!preview){const url=new URL(location.href);url.hash=currentHash();history.replaceState({...history.state,sunnySnapshot:snapshot()},'',url.href);lastRoute=location.href;}return;
    }
    const back=event.target.closest('[data-case-back]');if(back){const context=returnContext;navigate(context?.hash||'#project',context);return;}
    const aboutPhoto=event.target.closest('[data-about-photo]');
    if(aboutPhoto){const p=data.about.gallery?.find(item=>item.id===aboutPhoto.dataset.aboutPhoto);if(p)showMedia({kind:'image',src:p.src},p.caption,aboutPhoto);return;}
    const film=event.target.closest('[data-film]'), photo=event.target.closest('[data-photo]');
    if(film || photo){const key=(film||photo).dataset[film?'film':'photo'];const split=key.lastIndexOf(':');const p=projectById(key.slice(0,split));const m=p?.media[Number(key.slice(split+1))];if(m)showMedia(m,m.caption||p.title,film||photo);return;}
    const kit=event.target.closest('[data-kit]'), kitFilm=event.target.closest('[data-kit-film]');
    if(kit||kitFilm){const k=data.kitCollection.find(k=>k.id===(kit?.dataset.kit||kitFilm.dataset.kitFilm));if(k)showMedia(kitFilm?k.video:{kind:'image',src:k.image},k.title,kit||kitFilm);return;}
    if(event.target.closest('#media-close')){closeMedia();return;}
    if(event.target===find('media-dialog')){closeMedia();return;}
    const a=event.target.closest('a[href^="#"]');
    if(a && a.getAttribute('href')!=='#main' && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && (event.button===undefined||event.button===0)){event.preventDefault();navigate(a.getAttribute('href'));}
  });
  function restoreHistory() {
    remember();const state=history.state;returnContext=state?.sunnyReturn||null;
    const snap=state?.sunnySnapshot;if(snap){selectedCareer=snap.career||selectedCareer;selectedRole=snap.role??selectedRole;}
    const desired=new URLSearchParams(location.search).get('lang')==='ko'?'ko':data.defaultLanguage;
    if(desired!==language){language=desired;renderShell();document.dispatchEvent(new CustomEvent('sunnylanguagechange',{detail:{language}}));}
    route(location.hash);afterRender(()=>scrollTo(snap?.scroll||0));
  }
  if(!preview){history.scrollRestoration='manual';window.addEventListener('popstate',restoreHistory);window.addEventListener('hashchange',()=>{if(location.hash!=='#main' && location.href!==lastRoute)restoreHistory();});window.addEventListener('pagehide',persistSnapshot);}
  window.SunnySite={isHome:()=>currentView==='home',t:ui,getLanguage:()=>language,getState:()=>({language,view:currentView,project:currentProject,career:selectedCareer,role:selectedRole}),navigate};
  renderShell();returnContext=history.state?.sunnyReturn||null;route(preview?'home':location.hash);
})();
