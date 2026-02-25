import { useMemo } from 'react';
import palcosData from '../locals/palcos.json';
import musicsData from '../locals/musics.json';
import musicosData from '../locals/musicos.json';
import { instrumentLabels, instrumentById, instrumentIconById, instrumentNameById, instrumentPlaybackOrder, instrumentConfigOrder, instrumentIconByInstrument, stageMapPositionById, getRarity } from '../constants/bandGame';
import type { Band, Instrument } from '../state/gameStore';
import type { HireFilter, MusicData, MusicianData, StageData, StagePerformerInstrument } from '../types/bandGame';
import { resolveMusicStreamAsset, resolveMusicianFaceAsset, resolveMusicianPortraitAsset, resolveStageAnimatedAsset, resolveStageAsset, resolveStageMapBadgeAsset } from '../utils/assetResolvers';
import { iconBaixoVazio, iconBateriaVazio, iconGuitarraVazia, iconTecladoVazio, iconTodos } from '../assets/bandGameAssets';

export type UseBandGameComputedParams = {
  bands: Band[];
  activeBandId: string | null;
  currentStageId: number;
  hireFilter: HireFilter;
  instrumentVolumes: Record<Instrument, number>;
  activeBandSelectorInstrument: Instrument | null;
  selectedMusicianDetails: MusicianData | null;
};

export const useBandGameComputed = ({
  bands,
  activeBandId,
  currentStageId,
  hireFilter,
  instrumentVolumes,
  activeBandSelectorInstrument,
  selectedMusicianDetails,
}: UseBandGameComputedParams) => {
  const availableMusics = useMemo(() => musicsData.musicas as MusicData[], []);
  const musicians = useMemo(() => musicosData.musicos as MusicianData[], []);
  const stages = useMemo(() => palcosData.palcos as StageData[], []);

  const selectedMusic = useMemo(
    () => availableMusics.find((music) => music.id === 'blues_na_garagem') ?? availableMusics[0] ?? null,
    [availableMusics]
  );

  const activeBand = useMemo(
    () => bands.find((band) => band.id === activeBandId) ?? null,
    [bands, activeBandId]
  );

  const activeBandMusicians = useMemo(() => {
    if (!activeBand) {
      return [] as MusicianData[];
    }

    return Object.values(activeBand.musicians)
      .filter((slot) => slot.hired && slot.musicianId !== null)
      .map((slot) => musicians.find((musician) => musician.ID === slot.musicianId))
      .filter((musician): musician is MusicianData => musician !== undefined);
  }, [activeBand, musicians]);

  const bandHypeValue = useMemo(
    () => activeBandMusicians.reduce((total, musician) => total + musician.Hype, 0),
    [activeBandMusicians]
  );

  const bandFansValue = useMemo(
    () => activeBandMusicians.reduce((total, musician) => total + musician.Fans, 0),
    [activeBandMusicians]
  );

  const bandPerformanceValue = useMemo(
    () => activeBandMusicians.reduce((total, musician) => total + musician.Apresentacao, 0),
    [activeBandMusicians]
  );

  const bandCacheValue = useMemo(
    () => activeBandMusicians.reduce((total, musician) => total + musician.Cache, 0),
    [activeBandMusicians]
  );

  const selectedStage = useMemo(
    () => stages.find((stage) => stage.IDPalco === currentStageId) ?? stages.find((stage) => stage.IDPalco === 1) ?? stages[0],
    [currentStageId, stages]
  );

  const stageMapEntries = useMemo(
    () => stages.map((stage) => {
      const position = stageMapPositionById[stage.IDPalco] ?? { x: 50, y: 50 };
      return {
        id: stage.IDPalco,
        name: stage.Palco,
        badgeUrl: resolveStageMapBadgeAsset(stage.map_badge ?? ''),
        bannerUrl: resolveStageAsset(stage.asset_horizontal ?? stage.Asset ?? ''),
        backgroundUrl: resolveStageAsset(stage.Asset ?? stage.asset_horizontal ?? ''),
        ticketPrice: Math.max(0, stage.Ingresso),
        capacity: Math.max(0, stage.Lotacao),
        maxRevenue: Math.max(0, stage.Ingresso * stage.Lotacao),
        x: position.x,
        y: position.y,
      };
    }),
    [stages]
  );

  const stageBackground = useMemo(
    () => resolveStageAsset(selectedStage?.Asset ?? ''),
    [selectedStage]
  );

  const stage3DBackground = useMemo(
    () => resolveStageAsset(selectedStage?.asset_parallax ?? selectedStage?.asset_horizontal ?? selectedStage?.Asset ?? ''),
    [selectedStage]
  );

  const selectedStageBadge = useMemo(
    () => resolveStageMapBadgeAsset(selectedStage?.map_badge ?? ''),
    [selectedStage]
  );

  const stageAnimatedBackground = useMemo(
    () => (selectedStage?.asset_parallax || selectedStage?.asset_horizontal
      ? null
      : resolveStageAnimatedAsset(selectedStage?.animated ?? '')),
    [selectedStage]
  );

  const filteredMusicians = useMemo(() => {
    if (hireFilter === 'all') {
      return musicians;
    }

    return musicians.filter((musician) => instrumentById[musician.Instrumento] === hireFilter);
  }, [musicians, hireFilter]);

  const listedMusicians = useMemo(() => {
    return [...filteredMusicians].sort((left, right) => {
      const leftInstrument = instrumentById[left.Instrumento];
      const rightInstrument = instrumentById[right.Instrumento];
      const leftSlot = leftInstrument ? activeBand?.musicians[leftInstrument] : null;
      const rightSlot = rightInstrument ? activeBand?.musicians[rightInstrument] : null;
      const leftHired = Boolean(leftSlot?.hired && leftSlot.musicianId === left.ID);
      const rightHired = Boolean(rightSlot?.hired && rightSlot.musicianId === right.ID);

      if (leftHired === rightHired) {
        return left.ID - right.ID;
      }

      return leftHired ? -1 : 1;
    });
  }, [filteredMusicians, activeBand]);

  const availableBandCoins = activeBand?.coins ?? 0;
  const selectedMusicianPrice = selectedMusicianDetails?.Custo ?? 0;

  const selectedInstrument = selectedMusicianDetails
    ? instrumentById[selectedMusicianDetails.Instrumento]
    : null;

  const unlockedMusicianIdSet = useMemo(() => {
    if (!activeBand) {
      return new Set<number>();
    }

    const persistedIds = activeBand.unlockedMusicianIds ?? [];
    const equippedIds = Object.values(activeBand.musicians)
      .map((slot) => slot.musicianId)
      .filter((id): id is number => id !== null);

    return new Set<number>([...persistedIds, ...equippedIds]);
  }, [activeBand]);

  const isSelectedMusicianHired = Boolean(
    selectedMusicianDetails
      && unlockedMusicianIdSet.has(selectedMusicianDetails.ID)
  );

  const hasEnoughCoinsForSelected = selectedMusicianPrice > 0 && availableBandCoins >= selectedMusicianPrice;

  const canHireSelectedMusician = Boolean(
    selectedInstrument
      && activeBand
      && !isSelectedMusicianHired
      && hasEnoughCoinsForSelected
  );

  const isSelectedMusicianLockedByCoins = !isSelectedMusicianHired && !hasEnoughCoinsForSelected;

  const selectedMusicianRarityClass = selectedMusicianDetails
    ? getRarity(selectedMusicianDetails.Nivel).className
    : null;
  const selectedMusicianFace = selectedMusicianDetails
    ? resolveMusicianFaceAsset(selectedMusicianDetails.Asset_Face)
    : null;
  const selectedMusicianPortrait = selectedMusicianDetails
    ? resolveMusicianPortraitAsset(selectedMusicianDetails.Asset_Portrait ?? '')
    : null;
  const selectedMusicianInitials = selectedMusicianDetails
    ? selectedMusicianDetails.Instrumentista
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
    : '';
  const selectedMusicianInstrumentIcon = selectedMusicianDetails
    ? instrumentIconById[selectedMusicianDetails.Instrumento] ?? iconTodos
    : iconTodos;

  const listedMusicianItems = useMemo(() => {
    return listedMusicians.map((musician) => {
      const rarity = getRarity(musician.Nivel);
      const instrument = instrumentById[musician.Instrumento];
      const isMusicianHired = unlockedMusicianIdSet.has(musician.ID);
      const isLockedByCoins = !isMusicianHired && availableBandCoins < musician.Custo;
      const instrumentIcon = instrumentIconById[musician.Instrumento] ?? iconTodos;
      const initials = musician.Instrumentista
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

      return {
        musician,
        rarityClass: rarity.className,
        rarityLabel: rarity.label,
        instrumentIcon,
        isMusicianHired,
        isLockedByCoins,
        musicianFaceSrc: resolveMusicianFaceAsset(musician.Asset_Face),
        initials,
      };
    });
  }, [listedMusicians, availableBandCoins, unlockedMusicianIdSet]);

  const availableToHireCount = useMemo(() => {
    return musicians.filter((musician) => {
      if (unlockedMusicianIdSet.has(musician.ID)) {
        return false;
      }

      return availableBandCoins >= musician.Custo;
    }).length;
  }, [musicians, unlockedMusicianIdSet, availableBandCoins]);

  const selectedMusicStems = useMemo(() => {
    return {
      guitar: resolveMusicStreamAsset(selectedMusic?.eletricguitar ?? ''),
      bass: resolveMusicStreamAsset(selectedMusic?.bass ?? ''),
      drums: resolveMusicStreamAsset(selectedMusic?.drums ?? ''),
      keys: resolveMusicStreamAsset(selectedMusic?.keys ?? ''),
    } as Record<Instrument, string | null>;
  }, [selectedMusic]);

  const activeBandInstruments = useMemo(() => {
    if (!activeBand) {
      return [] as Instrument[];
    }

    return instrumentPlaybackOrder.filter((instrument) => {
      const slot = activeBand.musicians[instrument];
      return slot.hired && slot.musicianId !== null;
    });
  }, [
    activeBand?.musicians.guitar.hired,
    activeBand?.musicians.guitar.musicianId,
    activeBand?.musicians.bass.hired,
    activeBand?.musicians.bass.musicianId,
    activeBand?.musicians.drums.hired,
    activeBand?.musicians.drums.musicianId,
    activeBand?.musicians.keys.hired,
    activeBand?.musicians.keys.musicianId,
  ]);

  const instrumentVolumeControls = useMemo(() => {
    return instrumentConfigOrder.map((instrument) => ({
      instrument,
      label: instrumentLabels[instrument],
      icon: instrumentIconByInstrument[instrument],
      value: instrumentVolumes[instrument] ?? 1,
    }));
  }, [instrumentVolumes]);

  const guitarMusician = musicians.find((item) => item.ID === activeBand?.musicians.guitar.musicianId);
  const bassMusician = musicians.find((item) => item.ID === activeBand?.musicians.bass.musicianId);
  const drumsMusician = musicians.find((item) => item.ID === activeBand?.musicians.drums.musicianId);
  const keysMusician = musicians.find((item) => item.ID === activeBand?.musicians.keys.musicianId);

  const bandInstrumentColumns = [
    {
      id: 'guitar' as const,
      label: 'Guitarra',
      icon: instrumentIconByInstrument.guitar,
      emptyInstrumentIcon: iconGuitarraVazia,
      musicianId: guitarMusician?.ID ?? null,
      musicianName: guitarMusician?.Instrumentista ?? 'Selecionar',
      musicianFirstName: guitarMusician?.Instrumentista?.split(' ')[0] ?? 'Selecionar',
      musicianFace: resolveMusicianFaceAsset(guitarMusician?.Asset_Face ?? ''),
      hasMusician: Boolean(activeBand?.musicians.guitar.hired),
      rarityClass: activeBand?.musicians.guitar.hired
        ? getRarity(guitarMusician?.Nivel ?? 1).className
        : null,
    },
    {
      id: 'bass' as const,
      label: 'Baixo',
      icon: instrumentIconByInstrument.bass,
      emptyInstrumentIcon: iconBaixoVazio,
      musicianId: bassMusician?.ID ?? null,
      musicianName: bassMusician?.Instrumentista ?? 'Selecionar',
      musicianFirstName: bassMusician?.Instrumentista?.split(' ')[0] ?? 'Selecionar',
      musicianFace: resolveMusicianFaceAsset(bassMusician?.Asset_Face ?? ''),
      hasMusician: Boolean(activeBand?.musicians.bass.hired),
      rarityClass: activeBand?.musicians.bass.hired
        ? getRarity(bassMusician?.Nivel ?? 1).className
        : null,
    },
    {
      id: 'drums' as const,
      label: 'Bateria',
      icon: instrumentIconByInstrument.drums,
      emptyInstrumentIcon: iconBateriaVazio,
      musicianId: drumsMusician?.ID ?? null,
      musicianName: drumsMusician?.Instrumentista ?? 'Selecionar',
      musicianFirstName: drumsMusician?.Instrumentista?.split(' ')[0] ?? 'Selecionar',
      musicianFace: resolveMusicianFaceAsset(drumsMusician?.Asset_Face ?? ''),
      hasMusician: Boolean(activeBand?.musicians.drums.hired),
      rarityClass: activeBand?.musicians.drums.hired
        ? getRarity(drumsMusician?.Nivel ?? 1).className
        : null,
    },
    {
      id: 'keys' as const,
      label: 'Teclado',
      icon: instrumentIconByInstrument.keys,
      emptyInstrumentIcon: iconTecladoVazio,
      musicianId: keysMusician?.ID ?? null,
      musicianName: keysMusician?.Instrumentista ?? 'Selecionar',
      musicianFirstName: keysMusician?.Instrumentista?.split(' ')[0] ?? 'Selecionar',
      musicianFace: resolveMusicianFaceAsset(keysMusician?.Asset_Face ?? ''),
      hasMusician: Boolean(activeBand?.musicians.keys.hired),
      rarityClass: activeBand?.musicians.keys.hired
        ? getRarity(keysMusician?.Nivel ?? 1).className
        : null,
    },
  ];

  const selectorMusicians = useMemo(() => {
    if (!activeBandSelectorInstrument) {
      return [] as Array<{
        id: number;
        name: string;
        firstName: string;
        face: string | null;
        portrait: string | null;
        rarityClass: 'bronze' | 'silver' | 'gold';
        rarityLabel: string;
        hype: number;
        fans: number;
        performance: number;
        cache: number;
      }>;
    }

    return musicians
      .filter((musician) => instrumentById[musician.Instrumento] === activeBandSelectorInstrument)
      .filter((musician) => unlockedMusicianIdSet.has(musician.ID))
      .map((musician) => {
        const rarity = getRarity(musician.Nivel);
        return {
          id: musician.ID,
          name: musician.Instrumentista,
          firstName: musician.Instrumentista.split(' ')[0] ?? 'Músico',
          face: resolveMusicianFaceAsset(musician.Asset_Face),
          portrait: resolveMusicianPortraitAsset(musician.Asset_Portrait ?? ''),
          rarityClass: rarity.className,
          rarityLabel: rarity.label,
          hype: musician.Hype,
          fans: musician.Fans,
          performance: musician.Apresentacao,
          cache: musician.Cache,
        };
      });
  }, [activeBandSelectorInstrument, musicians, unlockedMusicianIdSet]);

  const selectedSelectorMusicianId = activeBandSelectorInstrument
    ? activeBand?.musicians[activeBandSelectorInstrument].musicianId ?? null
    : null;

  const stageBandPerformers = useMemo(() => {
    const performerEntries = [
      {
        instrument: 'drums' as const,
        musician: drumsMusician,
        isHired: Boolean(activeBand?.musicians.drums.hired),
      },
      {
        instrument: 'guitar' as const,
        musician: guitarMusician,
        isHired: Boolean(activeBand?.musicians.guitar.hired),
      },
      {
        instrument: 'bass' as const,
        musician: bassMusician,
        isHired: Boolean(activeBand?.musicians.bass.hired),
      },
      {
        instrument: 'keys' as const,
        musician: keysMusician,
        isHired: Boolean(activeBand?.musicians.keys.hired),
      },
    ];

    return performerEntries
      .map((entry) => {
        if (!entry.isHired || !entry.musician) {
          return null;
        }

        const portraitSrc = resolveMusicianPortraitAsset(entry.musician.Asset_Portrait ?? '');
        if (!portraitSrc) {
          return null;
        }

        return {
          instrument: entry.instrument,
          id: entry.musician.ID,
          name: entry.musician.Instrumentista,
          portraitSrc,
        };
      })
      .filter((entry): entry is { instrument: Instrument; id: number; name: string; portraitSrc: string } => Boolean(entry));
  }, [
    activeBand?.musicians.bass.hired,
    activeBand?.musicians.drums.hired,
    activeBand?.musicians.guitar.hired,
    activeBand?.musicians.keys.hired,
    bassMusician,
    drumsMusician,
    guitarMusician,
    keysMusician,
  ]);

  const stage3DActiveMusicians = useMemo(
    () => stageBandPerformers.map((performer) => ({
      instrument: performer.instrument as StagePerformerInstrument,
      id: performer.id,
      portraitSrc: performer.portraitSrc,
    })),
    [stageBandPerformers]
  );

  const stage3DActiveMusiciansSignature = useMemo(
    () => stage3DActiveMusicians
      .map((performer) => `${performer.instrument}:${performer.id}:${performer.portraitSrc}`)
      .join('|'),
    [stage3DActiveMusicians]
  );

  return {
    stages,
    availableMusics,
    musicians,
    selectedMusic,
    activeBand,
    activeBandMusicians,
    bandHypeValue,
    bandFansValue,
    bandPerformanceValue,
    bandCacheValue,
    selectedStage,
    stageMapEntries,
    stageBackground,
    stage3DBackground,
    selectedStageBadge,
    stageAnimatedBackground,
    filteredMusicians,
    listedMusicians,
    availableBandCoins,
    selectedInstrument,
    unlockedMusicianIdSet,
    isSelectedMusicianHired,
    hasEnoughCoinsForSelected,
    canHireSelectedMusician,
    isSelectedMusicianLockedByCoins,
    selectedMusicianRarityClass,
    selectedMusicianFace,
    selectedMusicianPortrait,
    selectedMusicianInitials,
    selectedMusicianInstrumentIcon,
    selectedMusicianPrice,
    listedMusicianItems,
    availableToHireCount,
    selectedMusicStems,
    activeBandInstruments,
    instrumentVolumeControls,
    bandInstrumentColumns,
    selectorMusicians,
    selectedSelectorMusicianId,
    stageBandPerformers,
    stage3DActiveMusicians,
    stage3DActiveMusiciansSignature,
  };
};
