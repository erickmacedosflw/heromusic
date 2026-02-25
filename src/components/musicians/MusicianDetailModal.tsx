import React from 'react';

type MusicianData = {
  ID: number;
  Instrumentista: string;
  Instrumento: number;
  Asset_Face: string;
  Asset_Portrait?: string;
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
  selectedMusicianPortrait?: string | null;
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
  displayMode?: 'card' | 'hero-stage';
};

const MusicianDetailModal: React.FC<MusicianDetailModalProps> = ({
  musician,
  selectedMusicianFace,
  selectedMusicianPortrait,
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
  displayMode = 'card',
}) => {
  const [displayMusician, setDisplayMusician] = React.useState<MusicianData | null>(musician);
  const [isContentLeaving, setIsContentLeaving] = React.useState(false);
  const [isContentEntering, setIsContentEntering] = React.useState(false);

  React.useEffect(() => {
    if (!musician) {
      setDisplayMusician(null);
      setIsContentLeaving(false);
      setIsContentEntering(false);
      return;
    }

    if (!displayMusician || displayMusician.ID === musician.ID) {
      setDisplayMusician(musician);
      return;
    }

    setIsContentLeaving(true);

    const switchTimer = window.setTimeout(() => {
      setDisplayMusician(musician);
      setIsContentLeaving(false);
      setIsContentEntering(true);
    }, 130);

    const settleTimer = window.setTimeout(() => {
      setIsContentEntering(false);
    }, 340);

    return () => {
      window.clearTimeout(switchTimer);
      window.clearTimeout(settleTimer);
    };
  }, [musician, displayMusician]);

  const currentMusician = displayMusician;

  if (!currentMusician) {
    return null;
  }

  const rarityLabel = selectedMusicianRarityClass === 'gold'
    ? 'Ouro'
    : selectedMusicianRarityClass === 'silver'
      ? 'Prata'
      : 'Bronze';

  const displayPortrait = selectedMusicianPortrait ?? selectedMusicianFace;
  const transitionClass = `musician-detail-transition${isContentLeaving ? ' leaving' : ''}${isContentEntering ? ' entering' : ''}`;

  return (
    <article
      className={`musician-detail-card${selectedMusicianRarityClass ? ` rarity-${selectedMusicianRarityClass}` : ''}${isClosing ? ' closing' : ' show'}${isStoryOpen ? ' story-open' : ''}${displayMode === 'hero-stage' ? ' hero-stage' : ''}${customAction ? ' has-custom-action' : ''}`}
    >
      {displayMode !== 'hero-stage' ? (
        <button
          type="button"
          className="musician-detail-close"
          onClick={onCloseDetails}
          data-click-sfx="close"
          aria-label="Fechar detalhes do músico"
        >
          <img src={iconFechar} alt="" aria-hidden="true" className="musicians-close-icon" />
        </button>
      ) : null}
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
          <p>{currentMusician.Historia}</p>
        </div>
      ) : displayMode === 'hero-stage' ? (
        <>
          <header className={`musician-hero-header ${transitionClass}`}>
            <strong>{currentMusician.Instrumentista}</strong>
          </header>

          <div className={`musician-hero-scene ${transitionClass}`}>
            <span className="musician-hero-stat stat-hype">
              <span className="musician-attr-stat-head">
                <img src={iconFameWhite} alt="" aria-hidden="true" />
                <span>Hype</span>
              </span>
              <strong>+{formatNumber(currentMusician.Hype)}</strong>
            </span>
            <span className="musician-hero-stat stat-fans">
              <span className="musician-attr-stat-head">
                <img src={iconFansWhite} alt="" aria-hidden="true" />
                <span>Público</span>
              </span>
              <strong>+{formatNumber(currentMusician.Fans)}</strong>
            </span>
            <span className="musician-hero-stat stat-performance">
              <span className="musician-attr-stat-head">
                <img src={iconRhythmWhite} alt="" aria-hidden="true" />
                <span>Perf.</span>
              </span>
              <strong>{formatPerformancePercent(currentMusician.Apresentacao)}</strong>
            </span>
            <span className="musician-hero-stat stat-cache">
              <span className="musician-attr-stat-head">
                <img src={iconCost} alt="" aria-hidden="true" />
                <span>Cachê</span>
              </span>
              <strong>- R$ {formatNumber(currentMusician.Cache).replace(/,00$/, '')}</strong>
            </span>

            <div className="musician-hero-floor" aria-hidden="true" />
            <div className="musician-hero-shadow" aria-hidden="true" />
            <div className={`musician-hero-portrait${currentMusician.Instrumento === 3 ? ' is-drummer' : ''}`} aria-hidden="true">
              {displayPortrait ? (
                <img src={displayPortrait} alt="" className="musician-hero-portrait-image" />
              ) : (
                <div className="musician-hero-portrait-fallback">{selectedMusicianInitials}</div>
              )}
            </div>

            <div className="musician-hero-cta-stack">
              <span className="musician-hero-instrument-badge">
                <img
                  src={selectedInstrumentIcon}
                  alt=""
                  aria-hidden="true"
                  className="musician-instrument-mini"
                />
                <span>{instrumentNameById[currentMusician.Instrumento] ?? 'Instrumento'}</span>
              </span>
              {customAction ? (
                <button
                  type="button"
                  className={`musician-hero-hire-btn${customAction.variant === 'remove' ? ' is-remove' : ' is-select'}`}
                  disabled={customAction.disabled}
                  data-click-sfx={customAction.variant === 'remove' ? 'cancel' : 'confirm'}
                  onClick={customAction.onClick}
                >
                  <span>{customAction.label}</span>
                </button>
              ) : !isSelectedMusicianHired && canHireSelectedMusician ? (
                <button
                  type="button"
                  className="musician-hero-hire-btn"
                  onClick={onHireSelected}
                >
                  <img src={iconMoneyWhite} alt="" aria-hidden="true" />
                  <span>R$ {formatNumber(selectedMusicianPrice)}</span>
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`musician-detail-body ${transitionClass}`}>
            <div className="musician-detail-photo" aria-hidden="true">
              {selectedMusicianFace ? (
                <img src={selectedMusicianFace} alt="" className="musician-detail-face" />
              ) : (
                selectedMusicianInitials
              )}
            </div>
            <div className="musician-detail-side">
              <header className="musician-detail-header">
                <strong>{currentMusician.Instrumentista}</strong>
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
                  <span>{instrumentNameById[currentMusician.Instrumento] ?? 'Instrumento'}</span>
                </span>
                <span className={`musician-rarity ${selectedMusicianRarityClass ?? 'bronze'}`}>
                  {rarityLabel}
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
          <div className={`musician-attr-grid ${transitionClass}`}>
            <span className="musician-attr-stat">
              <span className="musician-attr-stat-head">
                <img src={iconFameWhite} alt="" aria-hidden="true" />
                <span>Hype</span>
              </span>
              <strong>+{formatNumber(currentMusician.Hype)}</strong>
            </span>
            <span className="musician-attr-stat">
              <span className="musician-attr-stat-head">
                <img src={iconFansWhite} alt="" aria-hidden="true" />
                <span>Público</span>
              </span>
              <strong>+{formatNumber(currentMusician.Fans)}</strong>
            </span>
            <span className="musician-attr-stat">
              <span className="musician-attr-stat-head">
                <img src={iconRhythmWhite} alt="" aria-hidden="true" />
                <span>Perf.</span>
              </span>
              <strong>{formatPerformancePercent(currentMusician.Apresentacao)}</strong>
            </span>
            <span className="musician-attr-stat">
              <span className="musician-attr-stat-head">
                <img src={iconCost} alt="" aria-hidden="true" />
                <span>Cachê</span>
              </span>
              <strong>- R$ {formatNumber(currentMusician.Cache).replace(/,00$/, '')}</strong>
            </span>
          </div>
        </>
      )}
      {customAction && displayMode !== 'hero-stage' ? (
        <button
          type="button"
          className={`musician-detail-hire-btn${customAction.variant === 'remove' ? ' is-remove' : ' is-select'}`}
          disabled={customAction.disabled}
          data-click-sfx={customAction.variant === 'remove' ? 'cancel' : 'confirm'}
          onClick={customAction.onClick}
        >
          <span>{customAction.label}</span>
        </button>
      ) : !isSelectedMusicianHired && displayMode !== 'hero-stage' ? (
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
