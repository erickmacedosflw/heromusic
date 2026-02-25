import { Howl, Howler } from 'howler';
import { useGameStore } from '../state/gameStore';

type ClickSoundType = 'open' | 'close' | 'default' | 'confirm' | 'cancel';

const clickInSrc = new URL('../rsc/audios/Clique_in.mp3', import.meta.url).href;
const clickOutSrc = new URL('../rsc/audios/Clique_Out.mp3', import.meta.url).href;
const clickConfirmSrc = new URL('../rsc/audios/Clique_confirm.mp3', import.meta.url).href;
const clickCancelSrc = new URL('../rsc/audios/Clique_cancelar.mp3', import.meta.url).href;

const interactiveSelector = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'label',
  '[role="button"]',
  '[role="menuitem"]',
  '[data-click-interactive="true"]',
].join(',');

const getClickType = (value?: string): ClickSoundType => {
  if (value === 'confirm') {
    return 'confirm';
  }

  if (value === 'cancel') {
    return 'cancel';
  }

  if (value === 'close') {
    return 'close';
  }

  if (value === 'open') {
    return 'open';
  }

  return 'default';
};

const clickInHowl = new Howl({
  src: [clickInSrc],
  preload: true,
  volume: 1,
  html5: false,
  pool: 1,
});

const clickOutHowl = new Howl({
  src: [clickOutSrc],
  preload: true,
  volume: 1,
  html5: false,
  pool: 1,
});

const clickConfirmHowl = new Howl({
  src: [clickConfirmSrc],
  preload: true,
  volume: 1,
  html5: false,
  pool: 1,
});

const clickCancelHowl = new Howl({
  src: [clickCancelSrc],
  preload: true,
  volume: 1,
  html5: false,
  pool: 1,
});

let activeHowl: Howl | null = null;
let activeSoundId: number | null = null;

const ensureClickAudioReady = () => {
  if (typeof window === 'undefined') {
    return;
  }

  Howler.autoSuspend = false;
  void Howler.ctx?.resume();
};

const stopCurrentClick = () => {
  if (!activeHowl || activeSoundId === null) {
    return;
  }

  activeHowl.stop(activeSoundId);
  activeHowl = null;
  activeSoundId = null;
};

export const playUiClickSound = (type: ClickSoundType = 'default') => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!useGameStore.getState().audioSettings.sfxEnabled) {
    return;
  }

  ensureClickAudioReady();
  const playNow = () => {
    stopCurrentClick();

    const howl = type === 'close'
      ? clickOutHowl
      : type === 'confirm'
        ? clickConfirmHowl
        : type === 'cancel'
          ? clickCancelHowl
          : clickInHowl;
    const nextId = howl.play();

    if (typeof nextId === 'number') {
      activeHowl = howl;
      activeSoundId = nextId;
      howl.once('end', (id) => {
        if (id === activeSoundId) {
          activeHowl = null;
          activeSoundId = null;
        }
      }, nextId);
    }
  };

  const context = Howler.ctx;
  if (context && context.state !== 'running') {
    void context.resume().then(playNow).catch(playNow);
    return;
  }

  playNow();
};

let globalClickCleanup: (() => void) | null = null;

export const setupGlobalUiClickSound = () => {
  if (typeof document === 'undefined') {
    return () => undefined;
  }

  if (globalClickCleanup) {
    return globalClickCleanup;
  }

  void ensureClickAudioReady();

  const handleGlobalPointerDown = (event: PointerEvent) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest('[data-click-sfx-ignore="true"]')) {
      return;
    }

    const explicitSoundElement = target.closest<HTMLElement>('[data-click-sfx]');
    if (explicitSoundElement) {
      playUiClickSound(getClickType(explicitSoundElement.dataset.clickSfx));
      return;
    }

    const isInsideStageScreen = Boolean(target.closest('.stage-screen'));
    const isInteractiveTarget = Boolean(target.closest(interactiveSelector));

    if (isInsideStageScreen && !isInteractiveTarget) {
      return;
    }

    if (!isInteractiveTarget) {
      return;
    }

    playUiClickSound('default');
  };

  document.addEventListener('pointerdown', handleGlobalPointerDown, true);

  globalClickCleanup = () => {
    document.removeEventListener('pointerdown', handleGlobalPointerDown, true);
    stopCurrentClick();
    globalClickCleanup = null;
  };

  return globalClickCleanup;
};
