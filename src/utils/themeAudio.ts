import { Howl, Howler } from 'howler';

type ThemeVariant = 'menu' | 'map';

const menuThemeMusicSrc = new URL('../rsc/audios/Musica_Tema.mp3', import.meta.url).href;
const mapThemeMusicSrc = new URL('../rsc/musics/Music_background_mapa.mp3', import.meta.url).href;
const THEME_VARIANTS: ThemeVariant[] = ['menu', 'map'];
const THEME_TARGET_VOLUME = 0.25;
const THEME_FADE_IN_MS = 900;
const THEME_FADE_OUT_MS = 520;
const THEME_REVERB_WET = 0.2;
const THEME_REVERB_DRY = 0.8;
const pauseTimeouts: Partial<Record<ThemeVariant, number>> = {};
let activeTheme: ThemeVariant | null = null;
let themeReverbReady = false;
let themeDryGain: GainNode | null = null;
let themeWetGain: GainNode | null = null;
let themeConvolver: ConvolverNode | null = null;
const isIOSDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/i.test(navigator.userAgent);
const shouldUseHtml5ThemeAudio = isIOSDevice;

const themeHowls: Record<ThemeVariant, Howl> = {
  menu: new Howl({
    src: [menuThemeMusicSrc],
    preload: true,
    loop: true,
    volume: 0,
    html5: shouldUseHtml5ThemeAudio,
    pool: 1,
  }),
  map: new Howl({
    src: [mapThemeMusicSrc],
    preload: true,
    loop: true,
    volume: 0,
    html5: shouldUseHtml5ThemeAudio,
    pool: 1,
  }),
};

const clearPauseTimeout = (variant: ThemeVariant) => {
  const timeoutId = pauseTimeouts[variant];
  if (typeof window !== 'undefined' && timeoutId) {
    window.clearTimeout(timeoutId);
    pauseTimeouts[variant] = undefined;
  }
};

const createImpulseResponse = (audioContext: AudioContext, durationSec: number, decay: number) => {
  const sampleRate = audioContext.sampleRate;
  const length = Math.max(1, Math.floor(sampleRate * durationSec));
  const impulse = audioContext.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const channelData = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      const time = index / length;
      const envelope = Math.pow(1 - time, decay);
      channelData[index] = (Math.random() * 2 - 1) * envelope;
    }
  }

  return impulse;
};

const ensureThemeReverb = () => {
  if (themeReverbReady || typeof window === 'undefined') {
    return;
  }

  const context = Howler.ctx;
  const masterGain = Howler.masterGain;
  if (!context || !masterGain) {
    return;
  }

  const dryGain = context.createGain();
  dryGain.gain.value = THEME_REVERB_DRY;
  const wetGain = context.createGain();
  wetGain.gain.value = THEME_REVERB_WET;
  const convolver = context.createConvolver();
  convolver.buffer = createImpulseResponse(context, 1.35, 2.2);

  dryGain.connect(masterGain);
  wetGain.connect(convolver);
  convolver.connect(masterGain);

  themeDryGain = dryGain;
  themeWetGain = wetGain;
  themeConvolver = convolver;
  themeReverbReady = true;
};

const applyThemeReverbRouting = (howl: Howl) => {
  if (shouldUseHtml5ThemeAudio) {
    return;
  }

  ensureThemeReverb();
  if (!themeReverbReady || !themeDryGain || !themeWetGain || !themeConvolver) {
    return;
  }

  const internalHowl = howl as unknown as {
    _sounds?: Array<{ _node?: { disconnect?: () => void; connect?: (node: AudioNode) => void } }>;
  };
  const sounds = internalHowl._sounds ?? [];

  sounds.forEach((sound) => {
    const node = sound._node;
    if (!node || typeof node.disconnect !== 'function' || typeof node.connect !== 'function') {
      return;
    }

    try {
      node.disconnect();
      node.connect(themeDryGain);
      node.connect(themeWetGain);
    } catch {
      node.connect(Howler.masterGain);
    }
  });
};

const ensureThemeAudioReady = () => {
  if (typeof window === 'undefined') {
    return;
  }

  Howler.autoSuspend = false;
  void Howler.ctx?.resume();
};

export const playThemeMusic = (variant: ThemeVariant = 'menu') => {
  if (typeof window === 'undefined') {
    return;
  }

  ensureThemeAudioReady();
  clearPauseTimeout(variant);

  THEME_VARIANTS.forEach((candidate) => {
    if (candidate !== variant) {
      pauseThemeMusic(candidate);
    }
  });

  const targetHowl = themeHowls[variant];

  const playNow = () => {
    if (!targetHowl.playing()) {
      targetHowl.volume(0);
      targetHowl.play();
    }

    applyThemeReverbRouting(targetHowl);

    const currentVolume = Number(targetHowl.volume()) || 0;
    if (currentVolume >= THEME_TARGET_VOLUME) {
      targetHowl.volume(THEME_TARGET_VOLUME);
      activeTheme = variant;
      return;
    }

    targetHowl.fade(currentVolume, THEME_TARGET_VOLUME, THEME_FADE_IN_MS);
    activeTheme = variant;
  };

  const context = Howler.ctx;
  if (context && context.state !== 'running') {
    void context.resume().then(playNow).catch(playNow);
    return;
  }

  playNow();
};

export const pauseThemeMusic = (variant?: ThemeVariant) => {
  if (typeof window === 'undefined') {
    return;
  }

  const targets = variant ? [variant] : THEME_VARIANTS;

  targets.forEach((target) => {
    clearPauseTimeout(target);

    const targetHowl = themeHowls[target];
    if (!targetHowl.playing()) {
      targetHowl.volume(0);
      if (activeTheme === target) {
        activeTheme = null;
      }
      return;
    }

    const currentVolume = Number(targetHowl.volume()) || 0;
    targetHowl.fade(currentVolume, 0, THEME_FADE_OUT_MS);
    pauseTimeouts[target] = window.setTimeout(() => {
      targetHowl.pause();
      targetHowl.volume(0);
      if (activeTheme === target) {
        activeTheme = null;
      }
      pauseTimeouts[target] = undefined;
    }, THEME_FADE_OUT_MS + 40);
  });
};

export const setupThemeMusicUnlock = (canPlayTheme?: () => boolean, variant: ThemeVariant = 'menu') => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const unlockAndPlay = () => {
    if (canPlayTheme && !canPlayTheme()) {
      pauseThemeMusic(variant);
      return;
    }

    playThemeMusic(variant);
  };

  window.addEventListener('pointerdown', unlockAndPlay, { once: true });
  window.addEventListener('keydown', unlockAndPlay, { once: true });

  return () => {
    window.removeEventListener('pointerdown', unlockAndPlay);
    window.removeEventListener('keydown', unlockAndPlay);
  };
};

export const disposeThemeMusic = () => {
  if (typeof window !== 'undefined') {
    THEME_VARIANTS.forEach(clearPauseTimeout);
  }

  THEME_VARIANTS.forEach((variant) => {
    const targetHowl = themeHowls[variant];
    targetHowl.stop();
    targetHowl.unload();
  });

  themeConvolver?.disconnect();
  themeWetGain?.disconnect();
  themeDryGain?.disconnect();
  themeConvolver = null;
  themeWetGain = null;
  themeDryGain = null;
  themeReverbReady = false;
  activeTheme = null;
};
