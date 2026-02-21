import React from 'react';
import './BandConfigModal.css';

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
  onClose: () => void;
  onToggleSfx: (enabled: boolean) => void;
  onToggleMusic: (enabled: boolean) => void;
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
  onClose,
  onToggleSfx,
  onToggleMusic,
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
