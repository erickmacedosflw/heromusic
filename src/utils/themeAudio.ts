import { Howl, Howler } from 'howler';

const themeMusicSrc = new URL('../rsc/audios/Musica_Tema.mp3', import.meta.url).href;

const themeHowl = new Howl({
  src: [themeMusicSrc],
  preload: true,
  loop: true,
  volume: 0.45,
  html5: false,
  pool: 1,
});

const ensureThemeAudioReady = () => {
  if (typeof window === 'undefined') {
    return;
  }

  Howler.autoSuspend = false;
  void Howler.ctx?.resume();
};

export const playThemeMusic = () => {
  if (typeof window === 'undefined') {
    return;
  }

  ensureThemeAudioReady();

  const playNow = () => {
    if (!themeHowl.playing()) {
      themeHowl.play();
    }
  };

  const context = Howler.ctx;
  if (context && context.state !== 'running') {
    void context.resume().then(playNow).catch(playNow);
    return;
  }

  playNow();
};

export const pauseThemeMusic = () => {
  if (themeHowl.playing()) {
    themeHowl.pause();
  }
};

export const setupThemeMusicUnlock = () => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const unlockAndPlay = () => {
    playThemeMusic();
  };

  window.addEventListener('pointerdown', unlockAndPlay, { once: true });
  window.addEventListener('keydown', unlockAndPlay, { once: true });

  return () => {
    window.removeEventListener('pointerdown', unlockAndPlay);
    window.removeEventListener('keydown', unlockAndPlay);
  };
};

export const disposeThemeMusic = () => {
  themeHowl.stop();
  themeHowl.unload();
};
