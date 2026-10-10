/* The original YouTube clip is embedded, never downloaded or re-uploaded. */
(() => {
  'use strict';
  const root = document.getElementById('sunny-brand');
  const videoId = window.SUNNY_CONTENT?.profile.backgroundVideoId;
  const toggle = root?.querySelector('#video-toggle');
  const box = root?.querySelector('.hero-video-box');
  const hero = root?.querySelector('.hero');
  if (!root || !videoId || !toggle || !box || !hero) return;
  if (!/^https?:$/.test(location.protocol)) return; // File preview uses the poster.
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let player;
  let ready = false;
  let userPaused = motion.matches;
  let failed = false;
  const homeVisible = () => window.SunnySite?.isHome() && !document.hidden;
  function fitVideo() {
    const rect = hero.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || !ready) return;
    const width = Math.max(rect.width, rect.height * 16 / 9);
    const height = width * 9 / 16;
    const iframe = player.getIframe();
    iframe.style.width = Math.ceil(width) + 'px';
    iframe.style.height = Math.ceil(height) + 'px';
  }
  function syncPlayback() {
    if (!ready || failed) return;
    player.mute();
    player.setVolume(0);
    if (homeVisible() && !userPaused) player.playVideo();
    else player.pauseVideo();
  }
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('hero-player', {
      host:'https://www.youtube.com',videoId,
      playerVars:{autoplay:0,controls:0,playsinline:1,loop:1,playlist:videoId,rel:0,fs:0,disablekb:1,origin:location.origin},
      events:{
        onReady(event){
          ready = true;
          event.target.mute();
          event.target.setVolume(0);
          const iframe = event.target.getIframe();
          iframe.setAttribute('title','Muted portfolio background film');
          iframe.setAttribute('aria-hidden','true');
          iframe.setAttribute('tabindex','-1');
          iframe.setAttribute('allow','autoplay; encrypted-media');
          iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
          toggle.hidden = false;
          toggle.textContent = userPaused ? 'Play background' : 'Pause background';
          fitVideo();syncPlayback();
        },
        onStateChange(event){
          if (event.data === YT.PlayerState.PLAYING) {
            event.target.mute();hero.classList.add('video-playing');
            toggle.textContent = 'Pause background';
            if (!homeVisible() || userPaused) event.target.pauseVideo();
          }
          if (event.data === YT.PlayerState.PAUSED) toggle.textContent = 'Play background';
          if (event.data === YT.PlayerState.ENDED && homeVisible() && !userPaused) {event.target.mute();event.target.seekTo(0,true);event.target.playVideo();}
        },
        onAutoplayBlocked(){userPaused = true;toggle.textContent = 'Play background';},
        onError(){failed = true;hero.classList.remove('video-playing');toggle.hidden = true;}
      }
    });
  };
  toggle.addEventListener('click',() => {if (!ready || failed) return;userPaused = !userPaused;syncPlayback();toggle.textContent = userPaused ? 'Play background' : 'Pause background';});
  document.addEventListener('sunnyviewchange',() => {fitVideo();syncPlayback();});
  document.addEventListener('visibilitychange',syncPlayback);
  motion.addEventListener('change',event => {userPaused = event.matches;syncPlayback();});
  new ResizeObserver(fitVideo).observe(hero);
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  document.head.appendChild(script);
})();
