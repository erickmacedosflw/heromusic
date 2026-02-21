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
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`musicians-contract-screen${isClosing ? ' closing' : ''}`} style={{ backgroundImage: `url(${backgroundAudicao})` }}>
      <div className="musicians-contract-content">
        <div className="musicians-top-hero">
          <div className="musicians-contract-overlay" />
          <div className="musicians-contract-header">
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

          <div className="musicians-hero-slot">
            <img
              src={portraitContratante}
              alt="Contratante"
              className={`musicians-contractor-portrait${selectedMusicianDetails && !isClosingMusicianDetails ? ' hide' : ' show'}`}
            />
            <MusicianDetailModal
              musician={selectedMusicianDetails}
              selectedMusicianFace={selectedMusicianFace}
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
              onCloseDetails={onCloseDetails}
              onToggleStory={onToggleStory}
              onHireSelected={onHireSelected}
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

          <div className="musicians-list-grid">
            {listedMusicianItems.map((item) => (
              <article
                key={item.musician.ID}
                className={`musician-contract-card rarity-${item.rarityClass}${item.isMusicianHired ? ' is-hired' : ' is-available'}`}
                data-click-sfx="open"
                onClick={() => onOpenMusicianDetails(item.musician)}
              >
                {!item.isMusicianHired ? (
                  <img
                    src={item.isLockedByCoins ? iconBloqueado : iconDisponivel}
                    alt={item.isLockedByCoins ? 'Bloqueado' : 'Disponível'}
                    className="musician-card-status-icon"
                  />
                ) : null}
                <div className="musician-card-top">
                  <div className="musician-avatar-column">
                    {item.musicianFaceSrc ? (
                      <img src={item.musicianFaceSrc} alt="" className="musician-avatar-face" />
                    ) : (
                      <div className="musician-avatar-fallback" aria-hidden="true">
                        {item.initials}
                      </div>
                    )}
                  </div>
                  <div className="musician-main-meta">
                    <strong>{item.musician.Instrumentista}</strong>
                    <div className="musician-meta-badges">
                      <img src={item.instrumentIcon} alt="" aria-hidden="true" className="musician-instrument-mini" />
                      <span className={`musician-rarity ${item.rarityClass}`}>{item.rarityLabel}</span>
                    </div>
                    {item.isMusicianHired ? <span className="musician-status-badge musician-status-under">Contratado</span> : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusiciansContractScreen;
