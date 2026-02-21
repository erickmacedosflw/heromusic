import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { Instrument } from '../state/gameStore';

type ActiveScreen = 'band' | 'musicians';

type UseBandScreensStateOptions<TMusician> = {
  musiciansModalCloseMs: number;
  musicianDetailsCloseMs: number;
  bandModalCloseMs: number;
  bandConfigCloseMs: number;
  onStoryToggleSound?: (isOpening: boolean) => void;
};

const useBandScreensState = <TMusician,>({
  musiciansModalCloseMs,
  musicianDetailsCloseMs,
  bandModalCloseMs,
  bandConfigCloseMs,
  onStoryToggleSound,
}: UseBandScreensStateOptions<TMusician>) => {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('band');
  const [isClosingMusiciansScreen, setIsClosingMusiciansScreen] = useState(false);
  const [selectedMusicianDetails, setSelectedMusicianDetails] = useState<TMusician | null>(null);
  const [isMusicianStoryOpen, setIsMusicianStoryOpen] = useState(false);
  const [isClosingMusicianDetails, setIsClosingMusicianDetails] = useState(false);
  const [isBandConfigOpen, setIsBandConfigOpen] = useState(false);
  const [isClosingBandConfig, setIsClosingBandConfig] = useState(false);
  const [isBandManagementOpen, setIsBandManagementOpen] = useState(false);
  const [isClosingBandManagement, setIsClosingBandManagement] = useState(false);
  const [activeBandSelectorInstrument, setActiveBandSelectorInstrument] = useState<Instrument | null>(null);

  const musiciansCloseTimeoutRef = useRef<number | null>(null);
  const musicianDetailsCloseTimeoutRef = useRef<number | null>(null);
  const bandManagementCloseTimeoutRef = useRef<number | null>(null);
  const bandConfigCloseTimeoutRef = useRef<number | null>(null);

  const clearTimeoutRef = (timeoutRef: MutableRefObject<number | null>) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const openBandConfig = useCallback(() => {
    clearTimeoutRef(bandConfigCloseTimeoutRef);
    setIsClosingBandConfig(false);
    setIsBandConfigOpen(true);
  }, []);

  const closeBandConfig = useCallback(() => {
    if (!isBandConfigOpen) {
      return;
    }

    setIsClosingBandConfig(true);
    clearTimeoutRef(bandConfigCloseTimeoutRef);

    bandConfigCloseTimeoutRef.current = window.setTimeout(() => {
      setIsBandConfigOpen(false);
      setIsClosingBandConfig(false);
      bandConfigCloseTimeoutRef.current = null;
    }, bandConfigCloseMs);
  }, [bandConfigCloseMs, isBandConfigOpen]);

  const openBandManagementScreen = useCallback(() => {
    clearTimeoutRef(musiciansCloseTimeoutRef);
    clearTimeoutRef(bandManagementCloseTimeoutRef);
    clearTimeoutRef(bandConfigCloseTimeoutRef);

    setActiveScreen('band');
    setIsClosingMusiciansScreen(false);
    setIsBandConfigOpen(false);
    setIsClosingBandConfig(false);
    setIsClosingBandManagement(false);
    setActiveBandSelectorInstrument(null);
    setIsBandManagementOpen(true);
  }, []);

  const closeBandManagementScreen = useCallback(() => {
    if (!isBandManagementOpen) {
      return;
    }

    setIsClosingBandManagement(true);
    clearTimeoutRef(bandManagementCloseTimeoutRef);

    bandManagementCloseTimeoutRef.current = window.setTimeout(() => {
      setIsBandManagementOpen(false);
      setIsClosingBandManagement(false);
      setActiveBandSelectorInstrument(null);
      bandManagementCloseTimeoutRef.current = null;
    }, bandModalCloseMs);
  }, [bandModalCloseMs, isBandManagementOpen]);

  const openMusiciansScreen = useCallback(() => {
    clearTimeoutRef(bandManagementCloseTimeoutRef);
    clearTimeoutRef(musiciansCloseTimeoutRef);
    clearTimeoutRef(bandConfigCloseTimeoutRef);

    setIsBandManagementOpen(false);
    setIsClosingBandManagement(false);
    setIsClosingMusiciansScreen(false);
    setSelectedMusicianDetails(null);
    setIsMusicianStoryOpen(false);
    setIsClosingMusicianDetails(false);
    setActiveBandSelectorInstrument(null);
    setIsBandConfigOpen(false);
    setIsClosingBandConfig(false);
    setActiveScreen('musicians');
  }, []);

  const openMusicianDetails = useCallback((musician: TMusician) => {
    clearTimeoutRef(musicianDetailsCloseTimeoutRef);
    setIsClosingMusicianDetails(false);
    setSelectedMusicianDetails(musician);
    setIsMusicianStoryOpen(false);
  }, []);

  const closeMusicianDetails = useCallback(() => {
    if (!selectedMusicianDetails) {
      return;
    }

    setIsClosingMusicianDetails(true);
    clearTimeoutRef(musicianDetailsCloseTimeoutRef);

    musicianDetailsCloseTimeoutRef.current = window.setTimeout(() => {
      setSelectedMusicianDetails(null);
      setIsMusicianStoryOpen(false);
      setIsClosingMusicianDetails(false);
      musicianDetailsCloseTimeoutRef.current = null;
    }, musicianDetailsCloseMs);
  }, [musicianDetailsCloseMs, selectedMusicianDetails]);

  const closeMusiciansScreen = useCallback(() => {
    if (activeScreen !== 'musicians') {
      return;
    }

    setIsClosingMusiciansScreen(true);
    clearTimeoutRef(musiciansCloseTimeoutRef);

    musiciansCloseTimeoutRef.current = window.setTimeout(() => {
      setActiveScreen('band');
      setIsClosingMusiciansScreen(false);
      setSelectedMusicianDetails(null);
      setIsMusicianStoryOpen(false);
      setIsClosingMusicianDetails(false);
      musiciansCloseTimeoutRef.current = null;
    }, musiciansModalCloseMs);
  }, [activeScreen, musiciansModalCloseMs]);

  const toggleMusicianStory = useCallback(() => {
    setIsMusicianStoryOpen((current) => {
      const next = !current;
      if (onStoryToggleSound) {
        onStoryToggleSound(next);
      }
      return next;
    });
  }, [onStoryToggleSound]);

  useEffect(() => {
    return () => {
      clearTimeoutRef(musiciansCloseTimeoutRef);
      clearTimeoutRef(musicianDetailsCloseTimeoutRef);
      clearTimeoutRef(bandManagementCloseTimeoutRef);
      clearTimeoutRef(bandConfigCloseTimeoutRef);
    };
  }, []);

  return {
    activeScreen,
    isClosingMusiciansScreen,
    selectedMusicianDetails,
    isMusicianStoryOpen,
    isClosingMusicianDetails,
    isBandConfigOpen,
    isClosingBandConfig,
    isBandManagementOpen,
    isClosingBandManagement,
    activeBandSelectorInstrument,
    setActiveBandSelectorInstrument,
    setSelectedMusicianDetails,
    openBandConfig,
    closeBandConfig,
    openBandManagementScreen,
    closeBandManagementScreen,
    openMusiciansScreen,
    openMusicianDetails,
    closeMusicianDetails,
    closeMusiciansScreen,
    toggleMusicianStory,
  };
};

export default useBandScreensState;
