/* Mixed-media hero reel. Public YouTube clips are embedded, never downloaded or re-uploaded. */
(() => {
  'use strict';
  const root = document.getElementById('sunny-brand');
  const profile = window.SUNNY_CONTENT?.profile;
  const toggle = root?.querySelector('#video-toggle');
  const box = root?.querySelector('.hero-video-box');
  const hero = root?.querySelector('.hero');
  const link = root?.querySelector('#hero-video-link');
  const fallbackVideoId = profile?.backgroundVideoId;
  if (!root || !profile || !toggle || !box || !hero || !link) return;
  if (!/^https?:$/.test(location.protocol)) return; // File preview uses the poster.

  const rawReel = Array.isArray(profile.backgroundReel) ? profile.backgroundReel : [];
  const reel = rawReel.length ? rawReel : fallbackVideoId ? [{kind:'video',videoId:fallbackVideoId,startSeconds:0,duration:30}] : [];
  if (!reel.length) return;

  const imageBox = document.createElement('div');
  imageBox.className = 'hero-reel-image';
  imageBox.setAttribute('aria-hidden','true');
  const imageEl = document.createElement('img');
  imageEl.alt = '';
  imageEl.decoding = 'async';
  imageBox.appendChild(imageEl);
  box.insertAdjacentElement('afterend',imageBox);

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let player;
  let ready = false;
  let userPaused = motion.matches;
  let currentIndex = 0;
  let reelTimer = 0;
  let changeLock = false;

  const current = () => reel[currentIndex];
  const local = value => value && typeof value === 'object' ? (value[root.dataset.language] ?? value.en ?? '') : (value ?? '');
  const homeVisible = () => window.SunnySite?.isHome() && !document.hidden;
  const videoLabel = key => window.SunnySite?.t(key) || (key === 'pauseBackground' ? 'Pause background' : 'Play background');
  const durationMs = item => Math.max(2, Number(item?.duration) || (item?.kind === 'image' ? 6 : 10)) * 1000;

  function clearReelTimer() {
    if (reelTimer) window.clearTimeout(reelTimer);
    reelTimer = 0;
  }

  function updateToggle() {
    toggle.textContent = userPaused ? videoLabel('playBackground') : videoLabel('pauseBackground');
    hero.classList.toggle('reel-paused', userPaused || !homeVisible());
  }

  function updateLink(item) {
    const language = root.dataset.language === 'ko' ? 'ko' : 'en';
    link.textContent = language === 'ko' ? '현재 프로젝트 보기 ↗' : 'View current project ↗';
    link.href = item.projectId ? '#project/' + encodeURIComponent(item.projectId) : '#project';
    link.removeAttribute('target');
    link.setAttribute('aria-label',(local(item.title) || (language === 'ko' ? '현재 프로젝트' : 'Current project')) + (language === 'ko' ? ' 보기' : ' — view project'));
  }

  function fitVideo() {
    const rect = hero.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || !ready) return;
    const width = Math.max(rect.width, rect.height * 16 / 9);
    const height = width * 9 / 16;
    const iframe = player.getIframe();
    iframe.style.width = Math.ceil(width) + 'px';
    iframe.style.height = Math.ceil(height) + 'px';
  }

  function scheduleNext(item) {
    clearReelTimer();
    if (!homeVisible() || userPaused) return;
    reelTimer = window.setTimeout(next, durationMs(item));
  }

  function showImage(item) {
    clearReelTimer();
    if (ready) player.pauseVideo();
    hero.classList.remove('video-playing','image-playing');
    imageEl.src = item.src;
    imageBox.style.setProperty('--reel-duration',durationMs(item) + 'ms');
    void imageEl.offsetWidth;
    hero.classList.add('image-playing');
    scheduleNext(item);
  }

  function showVideo(item) {
    clearReelTimer();
    hero.classList.remove('image-playing');
    if (!ready) return;
    const start = Math.max(0, Number(item.startSeconds) || 0);
    const duration = Math.max(2, Number(item.duration) || 10);
    player.mute();
    player.setVolume(0);
    player.loadVideoById({
      videoId:item.videoId,
      startSeconds:start,
      endSeconds:start + duration,
      suggestedQuality:'hd1080'
    });
    if (!homeVisible() || userPaused) player.pauseVideo();
  }

  function showCurrent() {
    const item = current();
    if (!item) return;
    updateLink(item);
    if (item.kind === 'image' && item.src) showImage(item);
    else if (item.videoId) showVideo(item);
    else next();
  }

  function next() {
    if (changeLock) return;
    changeLock = true;
    clearReelTimer();
    currentIndex = (currentIndex + 1) % reel.length;
    showCurrent();
    window.setTimeout(() => {changeLock = false;},250);
  }

  function syncPlayback() {
    clearReelTimer();
    updateToggle();
    const item = current();
    if (!item) return;
    if (!homeVisible() || userPaused) {
      if (ready && item.kind !== 'image') player.pauseVideo();
      return;
    }
    if (item.kind === 'image') scheduleNext(item);
    else if (ready) {
      player.mute();
      player.setVolume(0);
      player.playVideo();
    }
  }

  window.onYouTubeIframeAPIReady = () => {
    const firstVideo = reel.find(item => item.videoId)?.videoId || fallbackVideoId;
    player = new YT.Player('hero-player', {
      host:'https://www.youtube.com',
      videoId:firstVideo,
      playerVars:{autoplay:0,controls:0,playsinline:1,rel:0,fs:0,disablekb:1,origin:location.origin},
      events:{
        onReady(event) {
          ready = true;
          event.target.mute();
          event.target.setVolume(0);
          const iframe = event.target.getIframe();
          iframe.setAttribute('title',window.SunnySite?.t('backgroundFilm') || 'Muted portfolio background reel');
          iframe.setAttribute('aria-hidden','true');
          iframe.setAttribute('tabindex','-1');
          iframe.setAttribute('allow','autoplay; encrypted-media');
          iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
          toggle.hidden = false;
          updateToggle();
          fitVideo();
          showCurrent();
        },
        onStateChange(event) {
          const item = current();
          if (!item || item.kind === 'image') return;
          if (event.data === YT.PlayerState.PLAYING) {
            event.target.mute();
            hero.classList.add('video-playing');
            if (!homeVisible() || userPaused) event.target.pauseVideo();
            else scheduleNext(item);
          }
          if (event.data === YT.PlayerState.ENDED && homeVisible() && !userPaused) next();
        },
        onAutoplayBlocked() {
          userPaused = true;
          updateToggle();
        },
        onError() {
          hero.classList.remove('video-playing');
          window.setTimeout(next,600);
        }
      }
    });
  };

  toggle.addEventListener('click',() => {
    if (!ready) return;
    userPaused = !userPaused;
    syncPlayback();
  });
  document.addEventListener('sunnyviewchange',() => {fitVideo();syncPlayback();});
  document.addEventListener('visibilitychange',syncPlayback);
  document.addEventListener('sunnylanguagechange',() => {
    updateLink(current());
    updateToggle();
    if (ready) player.getIframe().setAttribute('title',window.SunnySite.t('backgroundFilm'));
  });
  motion.addEventListener('change',event => {userPaused = event.matches;syncPlayback();});
  new ResizeObserver(fitVideo).observe(hero);

  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  document.head.appendChild(script);
})();
