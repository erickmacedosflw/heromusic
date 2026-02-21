import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Instrument = 'guitar' | 'drums' | 'bass' | 'keys';
export type OnboardingStep = 'welcome' | 'logo' | 'name' | 'final';
export type HitQuality = 'perfect' | 'good' | 'miss';

type MusicianSlot = {
  hired: boolean;
  musicianId: number | null;
  skillLevel: number;
  instrumentLevel: number;
};

export type Band = {
  id: string;
  name: string;
  logoUrl: string;
  createdAt: number;
  coins: number;
  fans: number;
  reputation: number;
  fameStars: number;
  musicians: Record<Instrument, MusicianSlot>;
  unlockedMusicianIds: number[];
  autoplayUnlocked: boolean;
};

type CreationState = {
  isCreating: boolean;
  step: OnboardingStep;
  selectedLogoUrl: string | null;
  draftName: string;
};

type AudioSettings = {
  musicEnabled: boolean;
  sfxEnabled: boolean;
};

interface GameState {
  isLoaded: boolean;
  bands: Band[];
  activeBandId: string | null;
  currentStageId: number;
  creation: CreationState;
  audioSettings: AudioSettings;
  showPerformance: boolean;
  score: number;
  combo: number;
  lastHit: HitQuality | null;
  setLoaded: (isLoaded: boolean) => void;
  startBandCreation: () => void;
  cancelBandCreation: () => void;
  setCreationStep: (step: OnboardingStep) => void;
  setCreationLogo: (logoUrl: string) => void;
  setCreationName: (name: string) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  createBandFromDraft: () => void;
  selectBand: (bandId: string) => void;
  setCurrentStage: (stageId: number) => void;
  deleteBand: (bandId: string) => void;
  openPerformance: () => void;
  closePerformance: () => void;
  tapBeat: (quality: HitQuality, bonus: number) => void;
  applyShowRewards: (fansGain: number, fameGain: number, coinsGain: number) => void;
  addFameStars: (stars: number) => void;
  hireMusician: (instrument: Instrument, hireCost?: number, musicianId?: number | null) => void;
  setBandMusicianSelection: (instrument: Instrument, musicianId: number | null) => void;
  upgradeInstrument: (instrument: Instrument) => void;
}

const getDefaultMusicians = (): Record<Instrument, MusicianSlot> => ({
  guitar: { hired: false, musicianId: null, skillLevel: 1, instrumentLevel: 1 },
  drums: { hired: false, musicianId: null, skillLevel: 1, instrumentLevel: 1 },
  bass: { hired: false, musicianId: null, skillLevel: 1, instrumentLevel: 1 },
  keys: { hired: false, musicianId: null, skillLevel: 1, instrumentLevel: 1 },
});

const getDefaultCreation = (): CreationState => ({
  isCreating: false,
  step: 'welcome',
  selectedLogoUrl: null,
  draftName: '',
});

const getDefaultAudioSettings = (): AudioSettings => ({
  musicEnabled: true,
  sfxEnabled: true,
});

const getBandUnlockedMusicianIds = (band: Band) => {
  const persistedIds = band.unlockedMusicianIds ?? [];
  const equippedIds = Object.values(band.musicians)
    .map((slot) => slot.musicianId)
    .filter((id): id is number => id !== null);

  return Array.from(new Set([...persistedIds, ...equippedIds]));
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      isLoaded: false,
      bands: [],
      activeBandId: null,
      currentStageId: 1,
      creation: getDefaultCreation(),
      audioSettings: getDefaultAudioSettings(),
      showPerformance: false,
      score: 0,
      combo: 0,
      lastHit: null,
      setLoaded: (isLoaded) => set({ isLoaded }),
      startBandCreation: () =>
        set({
          creation: {
            isCreating: true,
            step: 'welcome',
            selectedLogoUrl: null,
            draftName: '',
          },
        }),
      cancelBandCreation: () => set({ creation: getDefaultCreation() }),
      setCreationStep: (step) =>
        set((state) => ({
          creation: {
            ...state.creation,
            isCreating: true,
            step,
          },
        })),
      setCreationLogo: (logoUrl) =>
        set((state) => ({
          creation: {
            ...state.creation,
            selectedLogoUrl: logoUrl,
          },
        })),
      setCreationName: (name) =>
        set((state) => ({
          creation: {
            ...state.creation,
            draftName: name,
          },
        })),
      setMusicEnabled: (enabled) =>
        set((state) => ({
          audioSettings: {
            ...state.audioSettings,
            musicEnabled: enabled,
          },
        })),
      setSfxEnabled: (enabled) =>
        set((state) => ({
          audioSettings: {
            ...state.audioSettings,
            sfxEnabled: enabled,
          },
        })),
      createBandFromDraft: () => {
        const { creation } = get();
        const trimmedName = creation.draftName.trim();

        if (!trimmedName || !creation.selectedLogoUrl) {
          return;
        }

        const band: Band = {
          id: `band-${Date.now()}`,
          name: trimmedName,
          logoUrl: creation.selectedLogoUrl,
          createdAt: Date.now(),
          coins: 2000,
          fans: 0,
          reputation: 0,
          fameStars: 0,
          musicians: getDefaultMusicians(),
          unlockedMusicianIds: [],
          autoplayUnlocked: false,
        };

        set((state) => ({
          bands: [...state.bands, band],
          activeBandId: band.id,
          currentStageId: 1,
          creation: getDefaultCreation(),
          showPerformance: false,
          score: 0,
          combo: 0,
          lastHit: null,
        }));
      },
      selectBand: (bandId) => set({ activeBandId: bandId, showPerformance: false }),
      setCurrentStage: (stageId) =>
        set({
          currentStageId: stageId,
        }),
      deleteBand: (bandId) =>
        set((state) => {
          const nextBands = state.bands.filter((band) => band.id !== bandId);
          const nextActiveBandId =
            state.activeBandId === bandId ? nextBands[0]?.id ?? null : state.activeBandId;

          return {
            bands: nextBands,
            activeBandId: nextActiveBandId,
            showPerformance: false,
          };
        }),
      openPerformance: () => set({ showPerformance: true, score: 0, combo: 0, lastHit: null }),
      closePerformance: () => set({ showPerformance: false }),
      tapBeat: (quality, bonus) =>
        set((state) => {
          if (!state.activeBandId) {
            return state;
          }

          const activeBand = state.bands.find((band) => band.id === state.activeBandId);
          if (!activeBand) {
            return state;
          }

          const activeMusicianCount = Object.values(activeBand.musicians).filter(
            (slot) => slot.hired
          ).length;

          const scoreByQuality: Record<HitQuality, number> = {
            perfect: 12,
            good: 6,
            miss: 0,
          };
          const fansByQuality: Record<HitQuality, number> = {
            perfect: 3,
            good: 1,
            miss: 0,
          };

          const nextCombo = quality === 'miss' ? 0 : state.combo + 1;
          const bandMultiplier = Math.max(1, activeMusicianCount);
          const scoreGain = (scoreByQuality[quality] + bonus) * bandMultiplier;
          const fanGain = fansByQuality[quality] * bandMultiplier;
          const coinGain = quality === 'miss' ? 0 : 2 + activeMusicianCount;

          const updatedBands = state.bands.map((band) => {
            if (band.id !== state.activeBandId) {
              return band;
            }

            return {
              ...band,
              fans: band.fans + fanGain,
              coins: band.coins + coinGain,
              reputation: band.reputation + (quality === 'perfect' ? 2 : quality === 'good' ? 1 : 0),
              autoplayUnlocked: band.autoplayUnlocked || band.fans >= 300,
            };
          });

          return {
            bands: updatedBands,
            score: state.score + scoreGain,
            combo: nextCombo,
            lastHit: quality,
          };
        }),
      applyShowRewards: (fansGain, fameGain, coinsGain) =>
        set((state) => {
          if (!state.activeBandId) {
            return state;
          }

          const updatedBands = state.bands.map((band) => {
            if (band.id !== state.activeBandId) {
              return band;
            }

            return {
              ...band,
              fans: band.fans + Math.max(0, fansGain),
              reputation: band.reputation + Math.max(0, fameGain),
              coins: band.coins + Math.max(0, coinsGain),
            };
          });

          return { bands: updatedBands };
        }),
      addFameStars: (stars) =>
        set((state) => {
          if (!state.activeBandId) {
            return state;
          }

          const starsToAdd = Math.max(0, Math.floor(stars));
          if (starsToAdd <= 0) {
            return state;
          }

          const updatedBands = state.bands.map((band) => {
            if (band.id !== state.activeBandId) {
              return band;
            }

            return {
              ...band,
              fameStars: Math.max(0, Math.floor(band.fameStars ?? 0)) + starsToAdd,
            };
          });

          return { bands: updatedBands };
        }),
      hireMusician: (instrument, hireCostOverride, musicianId) =>
        set((state) => {
          if (!state.activeBandId) {
            return state;
          }

          const hireCost = Math.max(0, Math.floor(hireCostOverride ?? 120));

          const updatedBands = state.bands.map((band) => {
            if (band.id !== state.activeBandId) {
              return band;
            }

            const slot = band.musicians[instrument];
            const unlockedMusicianIds = getBandUnlockedMusicianIds(band);
            const incomingMusicianId = musicianId ?? slot.musicianId ?? null;
            const isSameMusicianAlreadyHired = slot.hired && slot.musicianId === incomingMusicianId;

            if (isSameMusicianAlreadyHired) {
              return band;
            }

            if (incomingMusicianId === null) {
              return band;
            }

            if (unlockedMusicianIds.includes(incomingMusicianId)) {
              return band;
            }

            if (band.coins < hireCost) {
              return band;
            }

            return {
              ...band,
              coins: band.coins - hireCost,
              unlockedMusicianIds: [...unlockedMusicianIds, incomingMusicianId],
              musicians: {
                ...band.musicians,
                [instrument]: {
                  ...slot,
                  hired: true,
                  musicianId: incomingMusicianId,
                },
              },
            };
          });

          return { bands: updatedBands };
        }),
      setBandMusicianSelection: (instrument, musicianId) =>
        set((state) => {
          if (!state.activeBandId) {
            return state;
          }

          const updatedBands = state.bands.map((band) => {
            if (band.id !== state.activeBandId) {
              return band;
            }

            const slot = band.musicians[instrument];
            const unlockedMusicianIds = getBandUnlockedMusicianIds(band);
            const nextMusicianId = musicianId ?? null;

            if (nextMusicianId !== null && !unlockedMusicianIds.includes(nextMusicianId)) {
              return band;
            }

            if (slot.musicianId === nextMusicianId && slot.hired === (nextMusicianId !== null)) {
              return band;
            }

            return {
              ...band,
              unlockedMusicianIds,
              musicians: {
                ...band.musicians,
                [instrument]: {
                  ...slot,
                  hired: nextMusicianId !== null,
                  musicianId: nextMusicianId,
                },
              },
            };
          });

          return { bands: updatedBands };
        }),
      upgradeInstrument: (instrument) =>
        set((state) => {
          if (!state.activeBandId) {
            return state;
          }

          const updatedBands = state.bands.map((band) => {
            if (band.id !== state.activeBandId) {
              return band;
            }

            const slot = band.musicians[instrument];
            const upgradeCost = 60 + slot.instrumentLevel * 40;

            if (!slot.hired || band.coins < upgradeCost) {
              return band;
            }

            return {
              ...band,
              coins: band.coins - upgradeCost,
              musicians: {
                ...band.musicians,
                [instrument]: {
                  ...slot,
                  instrumentLevel: slot.instrumentLevel + 1,
                  skillLevel: slot.skillLevel + 1,
                },
              },
            };
          });

          return { bands: updatedBands };
        }),
    }),
    {
      name: 'hero-music-save-v1',
      version: 2,
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState as GameState;
        }

        const state = persistedState as {
          bands?: Array<Band & { fameStars?: number }>;
        };

        if (!Array.isArray(state.bands)) {
          return persistedState as GameState;
        }

        return {
          ...state,
          bands: state.bands.map((band) => ({
            ...band,
            fameStars: Math.max(0, Math.floor(band.fameStars ?? 0)),
          })),
        } as GameState;
      },
      partialize: (state) => ({
        bands: state.bands.map((band) => ({
          ...band,
          fameStars: Math.max(0, Math.floor(band.fameStars ?? 0)),
        })),
        activeBandId: state.activeBandId,
        currentStageId: state.currentStageId,
        audioSettings: state.audioSettings,
      }),
    }
  )
);