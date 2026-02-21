import React, { useEffect, useRef, useState } from 'react';
import type { Instrument } from '../../state/gameStore';
import MusicianDetailModal from '../musicians/MusicianDetailModal';
import './BandInstrumentSelector.css';

type BandInstrumentColumn = {
  id: Instrument;
  label: string;
  icon: string;
  emptyInstrumentIcon: string;
  musicianId: number | null;
  musicianFirstName: string;
  musicianFace: string | null;
  hasMusician: boolean;
  rarityClass: 'bronze' | 'silver' | 'gold' | null;
};

type SelectorMusician = {
  id: number;
  name: string;
  firstName: string;
  face: string | null;
  rarityClass: 'bronze' | 'silver' | 'gold';
  rarityLabel: string;
  hype: number;
  fans: number;
  performance: number;
  cache: number;
};

type BandInstrumentSelectorProps = {
  bandInstrumentColumns: BandInstrumentColumn[];
  activeInstrument: Instrument | null;
  selectorMusicians: SelectorMusician[];
  selectedMusicianId: number | null;
  instrumentLabels: Record<Instrument, string>;
  iconFechar: string;
  iconBloqueado: string;
  iconDisponivel: string;
  iconMusicoVazio: string;
  iconMoneyWhite: string;
  iconFameWhite: string;
  iconFansWhite: string;
  iconRhythmWhite: string;
  iconCost: string;
  onOpenInstrument: (instrument: Instrument) => void;
  onCloseSelector: () => void;
  onSelectEmpty: (instrument: Instrument) => void;
  onSelectMusician: (instrument: Instrument, musicianId: number) => void;
};

const BandInstrumentSelector: React.FC<BandInstrumentSelectorProps> = ({
  bandInstrumentColumns,
  activeInstrument,
  selectorMusicians,
  selectedMusicianId,
  instrumentLabels,
  iconFechar,
  iconBloqueado,
  iconDisponivel,
  iconMusicoVazio,
  iconMoneyWhite,
  iconFameWhite,
  iconFansWhite,
  iconRhythmWhite,
  iconCost,
  onOpenInstrument,
  onCloseSelector,
  onSelectEmpty,
  onSelectMusician,
}) => {
  const SELECTOR_CLOSE_MS = 190;
  const DETAIL_CLOSE_MS = 180;
  const [isSelectorClosing, setIsSelectorClosing] = useState(false);
  const [selectedMusicianDetail, setSelectedMusicianDetail] = useState<SelectorMusician | null>(null);
  const [isDetailClosing, setIsDetailClosing] = useState(false);
  const selectorCloseTimeoutRef = useRef<number | null>(null);
  const detailCloseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeInstrument) {
      setIsSelectorClosing(false);
      setSelectedMusicianDetail(null);
    }
  }, [activeInstrument]);

  useEffect(() => {
    return () => {
      if (selectorCloseTimeoutRef.current) {
        window.clearTimeout(selectorCloseTimeoutRef.current);
        selectorCloseTimeoutRef.current = null;
      }
      if (detailCloseTimeoutRef.current) {
        window.clearTimeout(detailCloseTimeoutRef.current);
        detailCloseTimeoutRef.current = null;
      }
    };
  }, []);

  const runSelectorCloseAnimation = (onClosed: () => void) => {
    if (selectorCloseTimeoutRef.current) {
      window.clearTimeout(selectorCloseTimeoutRef.current);
      selectorCloseTimeoutRef.current = null;
    }

    setIsSelectorClosing(true);
    selectorCloseTimeoutRef.current = window.setTimeout(() => {
      onClosed();
      setIsSelectorClosing(false);
      setSelectedMusicianDetail(null);
      setIsDetailClosing(false);
      selectorCloseTimeoutRef.current = null;
    }, SELECTOR_CLOSE_MS);
  };

  const runSelectorAndDetailCloseAnimation = (onClosed: () => void) => {
    if (selectorCloseTimeoutRef.current) {
      window.clearTimeout(selectorCloseTimeoutRef.current);
      selectorCloseTimeoutRef.current = null;
    }
    if (detailCloseTimeoutRef.current) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }

    setSelectedMusicianDetail(null);
    setIsDetailClosing(false);
    setIsSelectorClosing(true);

    selectorCloseTimeoutRef.current = window.setTimeout(() => {
      onClosed();
      setIsSelectorClosing(false);
      selectorCloseTimeoutRef.current = null;
    }, SELECTOR_CLOSE_MS);
  };

  const openMusicianDetail = (musician: SelectorMusician) => {
    if (detailCloseTimeoutRef.current) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }
    setIsDetailClosing(false);
    setSelectedMusicianDetail(musician);
  };

  const closeMusicianDetail = () => {
    if (!selectedMusicianDetail) {
      return;
    }

    if (detailCloseTimeoutRef.current) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }

    setIsDetailClosing(true);
    detailCloseTimeoutRef.current = window.setTimeout(() => {
      setSelectedMusicianDetail(null);
      setIsDetailClosing(false);
      detailCloseTimeoutRef.current = null;
    }, DETAIL_CLOSE_MS);
  };

  const formatNumber = (value: number) => value.toLocaleString('pt-BR');
  const formatPerformancePercent = (value: number) => {
    const normalized = value <= 10 ? value * 10 : value;
    const clamped = Math.max(0, Math.min(100, normalized));
    return `+${Math.round(clamped)}%`;
  };

  const instrumentIdByKey: Record<Instrument, number> = {
    guitar: 1,
    bass: 2,
    drums: 3,
    keys: 4,
  };

  const instrumentNameById: Record<number, string> = {
    1: instrumentLabels.guitar,
    2: instrumentLabels.bass,
    3: instrumentLabels.drums,
    4: instrumentLabels.keys,
  };

  const activeColumn = activeInstrument
    ? bandInstrumentColumns.find((column) => column.id === activeInstrument)
    : null;
  const activeInstrumentIcon = activeColumn?.icon ?? iconMusicoVazio;

  return (
    <>
    <div className={`band-slot-columns${activeInstrument ? ' selector-open' : ''}`}>
      {bandInstrumentColumns.map((column) => (
        <div
          key={column.id}
          className={`band-slot-column${activeInstrument === column.id ? ' active' : ''}${activeInstrument && activeInstrument !== column.id ? ' dimmed' : ''}`}
        >
          <div className="band-slot-header">
            <img src={column.icon} alt={column.label} />
            <span>{column.label}</span>
          </div>

          <button
            type="button"
            className={`band-slot-musician-card${column.rarityClass ? ` rarity-${column.rarityClass}` : ''}`}
            onClick={() => onOpenInstrument(column.id)}
          >
            <div
              key={`${column.id}-${column.musicianId ?? 'empty'}`}
              className="band-slot-musician-swap"
            >
              {column.hasMusician ? (
                <div className="band-slot-musician-info">
                  {column.musicianFace ? (
                    <img src={column.musicianFace} alt="" className="band-slot-musician-face" />
                  ) : null}
                  <span className="band-slot-musician-name">{column.musicianFirstName}</span>
                </div>
              ) : (
                <img src={iconMusicoVazio} alt="Músico vazio" className="band-slot-empty-icon" />
              )}
            </div>
          </button>

          <button type="button" className="band-slot-instrument-card">
            <img src={column.emptyInstrumentIcon} alt={`Instrumento ${column.label}`} className="band-slot-empty-icon" />
          </button>
        </div>
      ))}
    </div>

      {activeInstrument ? (
        <div className={`band-selector-panel${isSelectorClosing ? ' closing' : ''}`}>
        <div className="band-selector-head">
          <strong className="band-selector-title">
            <img src={activeInstrumentIcon} alt="" aria-hidden="true" className="band-selector-title-icon" />
            <span>Selecionar músico</span>
          </strong>
          <span className="band-selector-instrument-label">{instrumentLabels[activeInstrument]}</span>
          <button
            type="button"
            className="band-selector-close"
            onClick={() => runSelectorCloseAnimation(onCloseSelector)}
            data-click-sfx="close"
            aria-label="Fechar seletor de músicos"
          >
            <img src={iconFechar} alt="" aria-hidden="true" className="musicians-close-icon" />
          </button>
        </div>
        <div className="band-selector-gallery">
          <button
            type="button"
            className={`band-selector-item empty${selectedMusicianId === null ? ' selected' : ''}`}
            onClick={() => runSelectorCloseAnimation(() => onSelectEmpty(activeInstrument))}
          >
            <div className="band-selector-face-empty">
              <img src={iconMusicoVazio} alt="" aria-hidden="true" />
            </div>
            <span className="band-selector-name band-selector-name-badge">Vazio</span>
          </button>
          {selectorMusicians.map((musician) => (
            <button
              key={musician.id}
              type="button"
              className={`band-selector-item rarity-${musician.rarityClass}${selectedMusicianId === musician.id ? ' selected' : ''}`}
              onClick={() => openMusicianDetail(musician)}
            >
              {musician.face ? (
                <img src={musician.face} alt="" className="band-selector-face" />
              ) : (
                <div className="band-selector-face-empty">
                  <img src={iconMusicoVazio} alt="" aria-hidden="true" />
                </div>
              )}
              <span className="band-selector-name band-selector-name-badge">{musician.firstName}</span>
            </button>
          ))}
        </div>

        {selectedMusicianDetail ? (
          <MusicianDetailModal
            musician={{
              ID: selectedMusicianDetail.id,
              Instrumentista: selectedMusicianDetail.name,
              Instrumento: instrumentIdByKey[activeInstrument],
              Asset_Face: '',
              Asset: '',
              Hype: selectedMusicianDetail.hype,
              Fans: selectedMusicianDetail.fans,
              Apresentacao: selectedMusicianDetail.performance,
              Sexo: '',
              Custo: 0,
              Cache: selectedMusicianDetail.cache,
              Nivel: selectedMusicianDetail.rarityClass === 'gold' ? 3 : selectedMusicianDetail.rarityClass === 'silver' ? 2 : 1,
              ID_Instrumento: instrumentIdByKey[activeInstrument],
              Contratado: selectedMusicianId === selectedMusicianDetail.id,
              Historia: '',
            }}
            selectedMusicianFace={selectedMusicianDetail.face}
            selectedMusicianInitials={selectedMusicianDetail.firstName.slice(0, 2).toUpperCase()}
            selectedMusicianRarityClass={selectedMusicianDetail.rarityClass}
            selectedInstrumentIcon={activeInstrumentIcon}
            isClosing={isDetailClosing}
            isStoryOpen={false}
            isSelectedMusicianHired={selectedMusicianId === selectedMusicianDetail.id}
            isSelectedMusicianLockedByCoins={false}
            canHireSelectedMusician={true}
            selectedMusicianPrice={0}
            iconFechar={iconFechar}
            iconBloqueado={iconBloqueado}
            iconDisponivel={iconDisponivel}
            iconMoneyWhite={iconMoneyWhite}
            iconFameWhite={iconFameWhite}
            iconFansWhite={iconFansWhite}
            iconRhythmWhite={iconRhythmWhite}
            iconCost={iconCost}
            formatNumber={formatNumber}
            formatPerformancePercent={formatPerformancePercent}
            instrumentNameById={instrumentNameById}
            showStoryToggle={false}
            customAction={selectedMusicianId === selectedMusicianDetail.id
              ? {
                label: 'Remover músico',
                variant: 'remove',
                onClick: () => runSelectorAndDetailCloseAnimation(() => onSelectEmpty(activeInstrument)),
              }
              : {
                label: 'Selecionar músico',
                variant: 'select',
                onClick: () => runSelectorAndDetailCloseAnimation(() => onSelectMusician(activeInstrument, selectedMusicianDetail.id)),
              }}
            onCloseDetails={closeMusicianDetail}
            onToggleStory={() => undefined}
            onHireSelected={() => undefined}
          />
        ) : null}
        </div>
      ) : null}
    </>
  );
};

export default BandInstrumentSelector;
