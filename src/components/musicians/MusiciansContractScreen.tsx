import React from 'react';
import MusicianDetailModal from './MusicianDetailModal';
import type { Instrument } from '../../state/gameStore';
import './MusiciansContractScreen.css';

type HireFilter = 'all' | Instrument;

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

type MusicianListItem = {
  musician: MusicianData;
  rarityClass: 'bronze' | 'silver' | 'gold';
  rarityLabel: string;
  instrumentIcon: string;
  isMusicianHired: boolean;
  isLockedByCoins: boolean;
  musicianFaceSrc: string | null;
  initials: string;
};

type FilterOption = {
  id: HireFilter;
  label: string;
  icon: string;
};

type MusiciansContractScreenProps = {
  isVisible: boolean;
  isClosing: boolean;
  backgroundAudicao: string;
  portraitContratante: string;
  iconFechar: string;
  iconBloqueado: string;
  iconDisponivel: string;
  selectedInstrumentIcon: string;
  iconMoneyWhite: string;
  iconFameWhite: string;
  iconFansWhite: string;
  iconRhythmWhite: string;
  iconCost: string;
  selectedMusicianDetails: MusicianData | null;
  selectedMusicianFace: string | null;
  selectedMusicianPortrait: string | null;
  selectedMusicianInitials: string;
  selectedMusicianRarityClass: 'bronze' | 'silver' | 'gold' | null;
  isClosingMusicianDetails: boolean;
  isMusicianStoryOpen: boolean;
  isSelectedMusicianHired: boolean;
  isSelectedMusicianLockedByCoins: boolean;
  canHireSelectedMusician: boolean;
  selectedMusicianPrice: number;
  hireFilter: HireFilter;
  filterOptions: FilterOption[];
  listedMusicianItems: MusicianListItem[];
  formatNumber: (value: number) => string;
  formatPerformancePercent: (value: number) => string;
  instrumentNameById: Record<number, string>;
  onCloseScreen: () => void;
  onCloseDetails: () => void;
  onToggleStory: () => void;
  onChangeFilter: (filter: HireFilter) => void;
  onOpenMusicianDetails: (musician: MusicianData) => void;
  onHireSelected: () => void;
};

const MusiciansContractScreen: React.FC<MusiciansContractScreenProps> = ({
  isVisible,
  isClosing,
  backgroundAudicao,
  portraitContratante,
  iconFechar,
  iconBloqueado,
  iconDisponivel,
  selectedInstrumentIcon,
  iconMoneyWhite,
  iconFameWhite,
  iconFansWhite,
  iconRhythmWhite,
  iconCost,
  selectedMusicianDetails,
  selectedMusicianFace,
  selectedMusicianPortrait,
  selectedMusicianInitials,
  selectedMusicianRarityClass,
  isClosingMusicianDetails,
  isMusicianStoryOpen,
  isSelectedMusicianHired,
  isSelectedMusicianLockedByCoins,
  canHireSelectedMusician,
  selectedMusicianPrice,
  hireFilter,
  filterOptions,
  listedMusicianItems,
  formatNumber,
  formatPerformancePercent,
  instrumentNameById,
  onCloseScreen,
  onCloseDetails,
  onToggleStory,
  onChangeFilter,
  onOpenMusicianDetails,
  onHireSelected,
}) => {
  const [collapsedGroups, setCollapsedGroups] = React.useState({
    hired: false,
    available: false,
  });

  if (!isVisible) {
    return null;
  }

  const hiredMusicianItems = listedMusicianItems.filter((item) => item.isMusicianHired);
  const availableMusicianItems = listedMusicianItems.filter((item) => !item.isMusicianHired);

  const toggleGroup = (group: 'hired' | 'available') => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const renderMusicianCard = (item: MusicianListItem) => (
    <article
      key={item.musician.ID}
      className={`musician-contract-card rarity-${item.rarityClass}${item.isMusicianHired ? ' is-hired' : ' is-available'}${!item.isMusicianHired ? (item.isLockedByCoins ? ' is-locked-by-coins' : ' is-available-to-buy') : ''}`}
      data-click-sfx="open"
      onClick={() => onOpenMusicianDetails(item.musician)}
    >
      <div className="musician-card-top">
        <div className="musician-avatar-column">
          {item.musicianFaceSrc ? (
            <img src={item.musicianFaceSrc} alt="" className="musician-avatar-face" />
          ) : (
            <div className="musician-avatar-fallback" aria-hidden="true">
              {item.initials}
            </div>
          )}
          {!item.isMusicianHired ? (
            <img
              src={item.isLockedByCoins ? iconBloqueado : iconDisponivel}
              alt={item.isLockedByCoins ? 'Bloqueado' : 'Disponível'}
              className={`musician-card-status-icon ${item.isLockedByCoins ? 'locked' : 'available'}`}
            />
          ) : null}
        </div>
        <div className="musician-main-meta">
          <strong>{item.musician.Instrumentista}</strong>
          <div className="musician-meta-badges">
            <span className="musician-card-instrument-badge">
              <img src={item.instrumentIcon} alt="" aria-hidden="true" className="musician-instrument-mini" />
              <span>{instrumentNameById[item.musician.Instrumento] ?? 'Instrumento'}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );

  return (
    <div className={`musicians-contract-screen${isClosing ? ' closing' : ''}`} style={{ backgroundImage: `url(${backgroundAudicao})` }}>
      <div className="musicians-contract-content">
        <div className="musicians-top-hero">
          <div className="musicians-contract-overlay" />
          <div className={`musicians-contract-header${selectedMusicianDetails ? ' hidden' : ''}`}>
            <h2>Músicos</h2>
            <p>Contrate novos talentos para sua banda</p>
            {!selectedMusicianDetails ? (
              <button
                type="button"
                className="musicians-close-btn"
                onClick={onCloseScreen}
                data-click-sfx="close"
                aria-label="Fechar tela de músicos"
              >
                <img src={iconFechar} alt="" aria-hidden="true" className="musicians-close-icon" />
              </button>
            ) : null}
          </div>

          <MusicianDetailModal
            musician={selectedMusicianDetails}
            selectedMusicianFace={selectedMusicianFace}
            selectedMusicianPortrait={selectedMusicianPortrait}
            selectedMusicianInitials={selectedMusicianInitials}
            selectedMusicianRarityClass={selectedMusicianRarityClass}
            selectedInstrumentIcon={selectedInstrumentIcon}
            isClosing={isClosingMusicianDetails}
            isStoryOpen={isMusicianStoryOpen}
            isSelectedMusicianHired={isSelectedMusicianHired}
            isSelectedMusicianLockedByCoins={isSelectedMusicianLockedByCoins}
            canHireSelectedMusician={canHireSelectedMusician}
            selectedMusicianPrice={selectedMusicianPrice}
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
            displayMode="hero-stage"
            onCloseDetails={onCloseDetails}
            onToggleStory={onToggleStory}
            onHireSelected={onHireSelected}
          />

          <div className="musicians-hero-slot">
            <img
              src={portraitContratante}
              alt="Contratante"
              className={`musicians-contractor-portrait${selectedMusicianDetails && !isClosingMusicianDetails ? ' hide' : ' show'}`}
            />
          </div>
        </div>

        <div className="musicians-bottom-panel">
          <div className="musicians-filter-row">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`musicians-filter-btn${hireFilter === option.id ? ' active' : ''}`}
                onClick={() => onChangeFilter(option.id)}
              >
                <img src={option.icon} alt={option.label} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="musicians-list-groups">
            {hiredMusicianItems.length > 0 ? (
              <section className="musicians-list-group">
                <button
                  type="button"
                  className="musicians-group-toggle"
                  onClick={() => toggleGroup('hired')}
                  aria-expanded={!collapsedGroups.hired}
                >
                  <span className="musicians-group-title-wrap">
                    <h3>Contratados</h3>
                    <span className="musicians-group-count">{hiredMusicianItems.length}</span>
                  </span>
                  <span className="musicians-group-arrow" aria-hidden="true">
                    {collapsedGroups.hired ? '▸' : '▾'}
                  </span>
                </button>
                {!collapsedGroups.hired ? <div className="musicians-list-grid">{hiredMusicianItems.map(renderMusicianCard)}</div> : null}
              </section>
            ) : null}

            {availableMusicianItems.length > 0 ? (
              <section className="musicians-list-group">
                <button
                  type="button"
                  className="musicians-group-toggle"
                  onClick={() => toggleGroup('available')}
                  aria-expanded={!collapsedGroups.available}
                >
                  <span className="musicians-group-title-wrap">
                    <h3>A contratar</h3>
                    <span className="musicians-group-count">{availableMusicianItems.length}</span>
                  </span>
                  <span className="musicians-group-arrow" aria-hidden="true">
                    {collapsedGroups.available ? '▸' : '▾'}
                  </span>
                </button>
                {!collapsedGroups.available ? (
                  <div className="musicians-list-grid">{availableMusicianItems.map(renderMusicianCard)}</div>
                ) : null}
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusiciansContractScreen;
