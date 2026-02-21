import React from 'react';

type MusicianData = {
  ID: number;
  Instrumentista: string;
  Instrumento: number;
  Asset_Face: string;
  Asset: string;
  Asset_Char?: string;
  Hype: number;
  Fans: number;
  Apresentacao: number;
  Sexo: string;
  Custo: number;
  Cache: number;
  Nivel: number;
  ID_Instrumento: number;
  Contratado: boolean;
  Historia: string;
};

type MusicianDetailModalProps = {
  musician: MusicianData | null;
  selectedMusicianFace: string | null;
  selectedMusicianInitials: string;
  selectedMusicianRarityClass: 'bronze' | 'silver' | 'gold' | null;
  selectedInstrumentIcon: string;
  isClosing: boolean;
  isStoryOpen: boolean;
  isSelectedMusicianHired: boolean;
  isSelectedMusicianLockedByCoins: boolean;
  canHireSelectedMusician: boolean;
  selectedMusicianPrice: number;
  iconFechar: string;
  iconBloqueado: string;
  iconDisponivel: string;
  iconMoneyWhite: string;
  iconFameWhite: string;
  iconFansWhite: string;
  iconRhythmWhite: string;
  iconCost: string;
  formatNumber: (value: number) => string;
  formatPerformancePercent: (value: number) => string;
  instrumentNameById: Record<number, string>;
  showStoryToggle?: boolean;
  customAction?: {
    label: string;
    onClick: () => void;
    variant?: 'select' | 'remove';
    disabled?: boolean;
  };
  onCloseDetails: () => void;
  onToggleStory: () => void;
  onHireSelected: () => void;
};

const MusicianDetailModal: React.FC<MusicianDetailModalProps> = ({
  musician,
  selectedMusicianFace,
  selectedMusicianInitials,
  selectedMusicianRarityClass,
  selectedInstrumentIcon,
  isClosing,
  isStoryOpen,
  isSelectedMusicianHired,
  isSelectedMusicianLockedByCoins,
  canHireSelectedMusician,
  selectedMusicianPrice,
  iconFechar,
  iconBloqueado,
  iconDisponivel,
  iconMoneyWhite,
  iconFameWhite,
  iconFansWhite,
  iconRhythmWhite,
  iconCost,
  formatNumber,
  formatPerformancePercent,
  instrumentNameById,
  showStoryToggle = true,
  customAction,
  onCloseDetails,
  onToggleStory,
  onHireSelected,
}) => {
  if (!musician) {
    return null;
  }

  return (
    <article
      className={`musician-detail-card${selectedMusicianRarityClass ? ` rarity-${selectedMusicianRarityClass}` : ''}${isClosing ? ' closing' : ' show'}${isStoryOpen ? ' story-open' : ''}`}
    >
      <button
        type="button"
        className="musician-detail-close"
        onClick={onCloseDetails}
        data-click-sfx="close"
        aria-label="Fechar detalhes do músico"
      >
        <img src={iconFechar} alt="" aria-hidden="true" className="musicians-close-icon" />
      </button>
      {showStoryToggle ? (
        <button
          type="button"
          className="musician-detail-info-btn"
          onClick={onToggleStory}
          data-click-sfx-ignore="true"
          aria-label="Mostrar detalhes da história do músico"
        >
          <span className="musician-info-icon" aria-hidden="true">i</span>
        </button>
      ) : null}
      {isStoryOpen ? (
        <div className="musician-detail-story">
          <p>{musician.Historia}</p>
        </div>
      ) : (
        <>
          <div className="musician-detail-body">
            <div className="musician-detail-photo" aria-hidden="true">
              {selectedMusicianFace ? (
                <img src={selectedMusicianFace} alt="" className="musician-detail-face" />
              ) : (
                selectedMusicianInitials
              )}
            </div>
            <div className="musician-detail-side">
              <header className="musician-detail-header">
                <strong>{musician.Instrumentista}</strong>
                <span>Músico disponível</span>
              </header>
              <div className="musician-detail-badges">
                <span className="musician-detail-instrument">
                  <img
                    src={selectedInstrumentIcon}
                    alt=""
                    aria-hidden="true"
                    className="musician-instrument-mini"
                  />
                  <span>{instrumentNameById[musician.Instrumento] ?? 'Instrumento'}</span>
                </span>
                <span className={`musician-rarity ${selectedMusicianRarityClass ?? 'bronze'}`}>
                  {selectedMusicianRarityClass === 'gold' ? 'Ouro' : selectedMusicianRarityClass === 'silver' ? 'Prata' : 'Bronze'}
                </span>
                {isSelectedMusicianHired ? <span className="musician-status-badge">Contratado</span> : null}
                {!isSelectedMusicianHired ? (
                  <span className={`musician-detail-availability${isSelectedMusicianLockedByCoins ? ' locked' : ' available'}`}>
                    <img
                      src={isSelectedMusicianLockedByCoins ? iconBloqueado : iconDisponivel}
                      alt={isSelectedMusicianLockedByCoins ? 'Bloqueado' : 'Disponível'}
                      className="musician-detail-availability-icon"
                    />
                    <span>{isSelectedMusicianLockedByCoins ? 'Bloqueado' : 'Disponível'}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <div className="musician-attr-grid">
            <span className="musician-attr-stat">
              <span className="musician-attr-stat-head">
                <img src={iconFameWhite} alt="" aria-hidden="true" />
                <span>Hype</span>
              </span>
              <strong>+{formatNumber(musician.Hype)}</strong>
            </span>
            <span className="musician-attr-stat">
              <span className="musician-attr-stat-head">
                <img src={iconFansWhite} alt="" aria-hidden="true" />
                <span>Público</span>
              </span>
              <strong>+{formatNumber(musician.Fans)}</strong>
            </span>
            <span className="musician-attr-stat">
              <span className="musician-attr-stat-head">
                <img src={iconRhythmWhite} alt="" aria-hidden="true" />
                <span>Perf.</span>
              </span>
              <strong>{formatPerformancePercent(musician.Apresentacao)}</strong>
            </span>
            <span className="musician-attr-stat">
              <span className="musician-attr-stat-head">
                <img src={iconCost} alt="" aria-hidden="true" />
                <span>Cachê</span>
              </span>
              <strong>- R$ {formatNumber(musician.Cache).replace(/,00$/, '')}</strong>
            </span>
          </div>
        </>
      )}
      {customAction ? (
        <button
          type="button"
          className={`musician-detail-hire-btn${customAction.variant === 'remove' ? ' is-remove' : ' is-select'}`}
          disabled={customAction.disabled}
          onClick={customAction.onClick}
        >
          <span>{customAction.label}</span>
        </button>
      ) : !isSelectedMusicianHired ? (
        <button
          type="button"
          className="musician-detail-hire-btn"
          disabled={!canHireSelectedMusician}
          onClick={onHireSelected}
        >
          <img src={iconMoneyWhite} alt="" aria-hidden="true" />
          <span>R$ {formatNumber(selectedMusicianPrice)}</span>
        </button>
      ) : null}
    </article>
  );
};

export default MusicianDetailModal;
