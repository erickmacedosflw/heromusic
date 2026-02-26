import React, { useEffect, useRef, useState } from 'react';
import type { Instrument } from '../../state/gameStore';
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
  portrait: string | null;
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
  isDetailOpen: boolean;
  selectorMusicians: SelectorMusician[];
  selectedMusicianId: number | null;
  instrumentLabels: Record<Instrument, string>;
  iconFechar: string;
  iconMusicoVazio: string;
  onOpenInstrument: (instrument: Instrument) => void;
  onCloseSelector: () => void;
  onSelectEmpty: (instrument: Instrument) => void;
  onOpenMusicianDetail: (musician: SelectorMusician) => void;
};

const BandInstrumentSelector: React.FC<BandInstrumentSelectorProps> = ({
  bandInstrumentColumns,
  activeInstrument,
  isDetailOpen,
  selectorMusicians,
  selectedMusicianId,
  instrumentLabels,
  iconFechar,
  iconMusicoVazio,
  onOpenInstrument,
  onCloseSelector,
  onSelectEmpty,
  onOpenMusicianDetail,
}) => {
  const SELECTOR_CLOSE_MS = 190;
  const [isSelectorClosing, setIsSelectorClosing] = useState(false);
  const selectorCloseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeInstrument) {
      setIsSelectorClosing(false);
    }
  }, [activeInstrument]);

  useEffect(() => {
    return () => {
      if (selectorCloseTimeoutRef.current) {
        window.clearTimeout(selectorCloseTimeoutRef.current);
        selectorCloseTimeoutRef.current = null;
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
      selectorCloseTimeoutRef.current = null;
    }, SELECTOR_CLOSE_MS);
  };

  const instrumentRoleByKey: Record<Instrument, string> = {
    guitar: 'guitarrista',
    bass: 'baixista',
    drums: 'baterista',
    keys: 'tecladista',
  };

  const activeColumn = activeInstrument
    ? bandInstrumentColumns.find((column) => column.id === activeInstrument)
    : null;
  const activeInstrumentIcon = activeColumn?.icon ?? iconMusicoVazio;
  const activeInstrumentRole = activeInstrument ? instrumentRoleByKey[activeInstrument] : 'músico';

  const handleOpenInstrument = (instrument: Instrument, musicianId: number | null) => {
    onOpenInstrument(instrument);
    if (musicianId !== null && musicianId !== undefined) {
      const detailMusician = selectorMusicians.find((item) => item.id === musicianId);
      if (detailMusician) {
        onOpenMusicianDetail(detailMusician);
      }
    }
  };

  return (
    <>
    <div className={`band-slot-columns${activeInstrument ? ' selector-open' : ''}${isDetailOpen ? ' detail-open' : ''}`}>
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
            onClick={() => handleOpenInstrument(column.id, column.musicianId)}
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
        <div className="band-selector-overlay">
          <div className={`band-selector-panel${isSelectorClosing ? ' closing' : ''}${isDetailOpen ? ' detail-open' : ''}`}>
            <div className="band-selector-head">
              <strong className="band-selector-title">
                <img src={activeInstrumentIcon} alt="" aria-hidden="true" className="band-selector-title-icon" />
                <span>Selecionar {activeInstrumentRole}</span>
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
                data-click-sfx="cancel"
                onClick={() => runSelectorCloseAnimation(() => onSelectEmpty(activeInstrument))}
              >
                <div className="band-selector-face-empty">
                  <img src={iconMusicoVazio} alt="" aria-hidden="true" />
                </div>
                <span className="band-selector-name">Vazio</span>
              </button>
              {selectorMusicians.map((musician) => (
                <button
                  key={musician.id}
                  type="button"
                  className={`band-selector-item rarity-${musician.rarityClass}${selectedMusicianId === musician.id ? ' selected' : ''}`}
                  onClick={() => onOpenMusicianDetail(musician)}
                >
                  {musician.face ? (
                    <img src={musician.face} alt="" className="band-selector-face" />
                  ) : (
                    <div className="band-selector-face-empty">
                      <img src={iconMusicoVazio} alt="" aria-hidden="true" />
                    </div>
                  )}
                  <span className="band-selector-name">{musician.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default BandInstrumentSelector;
