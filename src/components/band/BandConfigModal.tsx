import React from 'react';
import './BandConfigModal.css';
import type { Instrument } from '../../state/gameStore';

type InstrumentVolumeControl = {
  instrument: Instrument;
  label: string;
  icon: string;
  value: number;
};

type BandConfigModalProps = {
  isVisible: boolean;
  isClosing: boolean;
  bandName: string;
  bandLogoUrl: string;
  isSfxEnabled: boolean;
  isMusicEnabled: boolean;
  iconConfig: string;
  iconFechar: string;
  iconAudioOn: string;
  iconExitBand: string;
  instrumentVolumeControls: InstrumentVolumeControl[];
  onClose: () => void;
  onToggleSfx: (enabled: boolean) => void;
  onToggleMusic: (enabled: boolean) => void;
  onChangeInstrumentVolume: (instrument: Instrument, value: number) => void;
  onExitBand: () => void;
};

const BandConfigModal: React.FC<BandConfigModalProps> = ({
  isVisible,
  isClosing,
  bandName,
  bandLogoUrl,
  isSfxEnabled,
  isMusicEnabled,
  iconConfig,
  iconFechar,
  iconAudioOn,
  iconExitBand,
  instrumentVolumeControls,
  onClose,
  onToggleSfx,
  onToggleMusic,
  onChangeInstrumentVolume,
  onExitBand,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <div className={`band-config-overlay${isClosing ? ' closing' : ' show'}`} aria-hidden="true" />
      <article className={`band-config-card${isClosing ? ' closing' : ' show'}`}>
        <header className="band-config-header">
          <h3>
            <img src={iconConfig} alt="" aria-hidden="true" className="band-config-title-icon" />
            <span>Configurações</span>
          </h3>
          <button
            type="button"
            className="band-config-close"
            onClick={onClose}
            data-click-sfx="close"
            aria-label="Fechar configurações"
          >
            <img src={iconFechar} alt="" aria-hidden="true" className="band-config-close-icon" />
          </button>
        </header>
        <div className="band-config-body">
          <img src={bandLogoUrl} alt={`Logo ${bandName}`} className="band-config-logo" />
          <strong className="band-config-name">{bandName}</strong>
          <div className="band-config-audio-title">
            <img src={iconAudioOn} alt="" aria-hidden="true" />
            <span>Áudio</span>
          </div>
          <label className="band-config-option">
            <input type="checkbox" checked={isSfxEnabled} onChange={(event) => onToggleSfx(event.target.checked)} />
            <span>Efeitos Sonoros</span>
          </label>
          <label className="band-config-option">
            <input type="checkbox" checked={isMusicEnabled} onChange={(event) => onToggleMusic(event.target.checked)} />
            <span>Música</span>
          </label>
          <div className="band-config-instrument-volumes">
            {instrumentVolumeControls.map((control) => {
              const sliderValue = Math.round(Math.max(0, Math.min(1, control.value)) * 100);
              return (
                <label className="band-config-volume-column" key={control.instrument}>
                  <img src={control.icon} alt="" aria-hidden="true" className="band-config-volume-icon" />
                  <span className="band-config-volume-label">{control.label}</span>
                  <input
                    className="band-config-volume-slider-vertical"
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={sliderValue}
                    onInput={(event) => onChangeInstrumentVolume(control.instrument, Number((event.target as HTMLInputElement).value) / 100)}
                    onChange={(event) => onChangeInstrumentVolume(control.instrument, Number(event.target.value) / 100)}
                    disabled={!isMusicEnabled}
                  />
                  <strong className="band-config-volume-value">{sliderValue}%</strong>
                </label>
              );
            })}
          </div>
          <button
            type="button"
            className="band-config-exit"
            onClick={onExitBand}
            data-click-sfx="close"
          >
            <img src={iconExitBand} alt="" aria-hidden="true" className="band-config-exit-icon" />
            <span>Sair da banda</span>
          </button>
        </div>
      </article>
    </>
  );
};

export default BandConfigModal;
