import React from 'react';
import type { Instrument } from '../../state/gameStore';
import BandInstrumentSelector from './BandInstrumentSelector';
import MusicianDetailModal from '../musicians/MusicianDetailModal';
import StageVenueCacheCard from '../stage/StageVenueCacheCard';
import './BandManagementScreen.css';

type BandMenuView = 'band' | 'specials' | 'analysis';

type BandInstrumentColumn = {
  id: Instrument;
  label: string;
  icon: string;
  emptyInstrumentIcon: string;
  musicianId: number | null;
  musicianName: string;
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

type BandManagementScreenProps = {
  isVisible: boolean;
  isClosing: boolean;
  backgroundBackstage: string;
  iconFechar: string;
  iconBloqueado: string;
  iconDisponivel: string;
  iconMoneyWhite: string;
  iconFameWhite: string;
  iconFansWhite: string;
  iconRhythmWhite: string;
  iconCost: string;
  iconGainWhite: string;
  iconCostWhite: string;
  bandHypeValue: number;
  bandFansValue: number;
  bandPerformanceValue: number;
  bandCostValue: number;
  venueContext?: { name: string; maxRevenue: number } | null;
  formatNumber: (value: number) => string;
  formatPerformancePercent: (value: number) => string;
  formatCurrency: (value: number) => string;
  bandMenuView: BandMenuView;
  bandMenuOptions: Array<{ id: BandMenuView; label: string; icon: string }>;
  onChangeBandMenuView: (view: BandMenuView) => void;
  activeBandSelectorInstrument: Instrument | null;
  bandInstrumentColumns: BandInstrumentColumn[];
  selectorMusicians: SelectorMusician[];
  selectedSelectorMusicianId: number | null;
  instrumentLabels: Record<Instrument, string>;
  iconMusicoVazio: string;
  onOpenInstrument: (instrument: Instrument) => void;
  onCloseSelector: () => void;
  onSelectEmpty: (instrument: Instrument) => void;
  onSelectMusician: (instrument: Instrument, musicianId: number) => void;
  onCloseScreen: () => void;
};

const BandManagementScreen: React.FC<BandManagementScreenProps> = ({
  isVisible,
  isClosing,
  backgroundBackstage,
  iconFechar,
  iconBloqueado,
  iconDisponivel,
  iconMoneyWhite,
  iconFameWhite,
  iconFansWhite,
  iconRhythmWhite,
  iconCost,
  iconGainWhite,
  iconCostWhite,
  bandHypeValue,
  bandFansValue,
  bandPerformanceValue,
  bandCostValue,
  venueContext = null,
  formatNumber,
  formatPerformancePercent,
  formatCurrency,
  bandMenuView,
  bandMenuOptions,
  onChangeBandMenuView,
  activeBandSelectorInstrument,
  bandInstrumentColumns,
  selectorMusicians,
  selectedSelectorMusicianId,
  instrumentLabels,
  iconMusicoVazio,
  onOpenInstrument,
  onCloseSelector,
  onSelectEmpty,
  onSelectMusician,
  onCloseScreen,
}) => {
  const DETAIL_CLOSE_MS = 180;
  const [selectedSelectorDetail, setSelectedSelectorDetail] = React.useState<SelectorMusician | null>(null);
  const [isDetailClosing, setIsDetailClosing] = React.useState(false);
  const detailCloseTimeoutRef = React.useRef<number | null>(null);

  const isSelectorDetailOpen = Boolean(selectedSelectorDetail);

  const instrumentIdByKey: Record<Instrument, number> = {
    guitar: 1,
    bass: 2,
    drums: 3,
    keys: 4,
  };

  const instrumentRoleByKey: Record<Instrument, string> = {
    guitar: 'guitarrista',
    bass: 'baixista',
    drums: 'baterista',
    keys: 'tecladista',
  };

  const instrumentNameById: Record<number, string> = {
    1: instrumentLabels.guitar,
    2: instrumentLabels.bass,
    3: instrumentLabels.drums,
    4: instrumentLabels.keys,
  };

  const activeBandColumn = activeBandSelectorInstrument
    ? bandInstrumentColumns.find((column) => column.id === activeBandSelectorInstrument)
    : null;

  const activeInstrumentIcon = activeBandColumn?.icon ?? iconMusicoVazio;
  const activeInstrumentRole = activeBandSelectorInstrument ? instrumentRoleByKey[activeBandSelectorInstrument] : 'músico';

  React.useEffect(() => {
    if (!activeBandSelectorInstrument || selectedSelectorDetail) {
      return;
    }

    const currentMusicianId = activeBandColumn?.musicianId;
    if (currentMusicianId === null || currentMusicianId === undefined) {
      return;
    }

    const currentMusician = selectorMusicians.find((item) => item.id === currentMusicianId);
    if (currentMusician) {
      openSelectorDetail(currentMusician);
    }
  }, [activeBandSelectorInstrument, activeBandColumn, selectorMusicians, selectedSelectorDetail]);

  const openSelectorDetail = (musician: SelectorMusician) => {
    if (detailCloseTimeoutRef.current) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }

    setIsDetailClosing(false);
    setSelectedSelectorDetail(musician);
  };

  const closeSelectorDetail = () => {
    if (!selectedSelectorDetail) {
      return;
    }

    if (detailCloseTimeoutRef.current) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }

    setIsDetailClosing(true);
    detailCloseTimeoutRef.current = window.setTimeout(() => {
      setSelectedSelectorDetail(null);
      setIsDetailClosing(false);
      detailCloseTimeoutRef.current = null;
    }, DETAIL_CLOSE_MS);
  };

  const closeSelectorAndDetail = (action: () => void) => {
    if (detailCloseTimeoutRef.current) {
      window.clearTimeout(detailCloseTimeoutRef.current);
      detailCloseTimeoutRef.current = null;
    }

    setSelectedSelectorDetail(null);
    setIsDetailClosing(false);
    action();
    onCloseSelector();
  };

  React.useEffect(() => {
    if (!activeBandSelectorInstrument) {
      setSelectedSelectorDetail(null);
      setIsDetailClosing(false);
    }
  }, [activeBandSelectorInstrument]);

  React.useEffect(() => {
    return () => {
      if (detailCloseTimeoutRef.current) {
        window.clearTimeout(detailCloseTimeoutRef.current);
        detailCloseTimeoutRef.current = null;
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`band-management-screen${isClosing ? ' closing' : ''}`}
      style={{ backgroundImage: `url(${backgroundBackstage})` }}
    >
      <div className={`band-management-content${isSelectorDetailOpen ? ' detail-open' : ''}`}>
        <div className="band-management-top-hero">
          <div className="musicians-contract-overlay" />
          <div className={`band-management-header${isSelectorDetailOpen ? ' hidden' : ''}`}>
            <h2>Banda</h2>
            <p>Gerencie os músicos da sua banda</p>
            {!isSelectorDetailOpen ? (
              <button
                type="button"
                className="musicians-close-btn"
                onClick={onCloseScreen}
                data-click-sfx="close"
                aria-label="Fechar tela da banda"
              >
                <img src={iconFechar} alt="" aria-hidden="true" className="musicians-close-icon" />
              </button>
            ) : null}
          </div>

          {venueContext && !isSelectorDetailOpen ? (
            <div className="band-management-venue-cache-wrap">
              <StageVenueCacheCard
                maxRevenue={Math.max(0, venueContext.maxRevenue)}
                bandTotalCache={bandCostValue}
                iconGainWhite={iconGainWhite}
                iconCostWhite={iconCostWhite}
                className="band-management-venue-cache-card"
                showCenterGainBadge
                hideSideValues
              />
            </div>
          ) : null}

          {activeBandSelectorInstrument && selectedSelectorDetail ? (
            <MusicianDetailModal
              musician={{
                ID: selectedSelectorDetail.id,
                Instrumentista: selectedSelectorDetail.name,
                Instrumento: instrumentIdByKey[activeBandSelectorInstrument],
                Asset_Face: '',
                Asset: '',
                Hype: selectedSelectorDetail.hype,
                Fans: selectedSelectorDetail.fans,
                Apresentacao: selectedSelectorDetail.performance,
                Sexo: '',
                Custo: 0,
                Cache: selectedSelectorDetail.cache,
                Nivel: selectedSelectorDetail.rarityClass === 'gold' ? 3 : selectedSelectorDetail.rarityClass === 'silver' ? 2 : 1,
                ID_Instrumento: instrumentIdByKey[activeBandSelectorInstrument],
                Contratado: selectedSelectorMusicianId === selectedSelectorDetail.id,
                Historia: '',
              }}
              selectedMusicianFace={selectedSelectorDetail.face}
              selectedMusicianPortrait={selectedSelectorDetail.portrait}
              selectedMusicianInitials={selectedSelectorDetail.firstName.slice(0, 2).toUpperCase()}
              selectedMusicianRarityClass={selectedSelectorDetail.rarityClass}
              selectedInstrumentIcon={activeInstrumentIcon}
              isClosing={isDetailClosing}
              isStoryOpen={false}
              isSelectedMusicianHired={selectedSelectorMusicianId === selectedSelectorDetail.id}
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
              hideCloseButton
              displayMode="hero-stage"
              showStoryToggle={false}
              customAction={selectedSelectorMusicianId === selectedSelectorDetail.id
                ? {
                  label: `Remover ${activeInstrumentRole}`,
                  variant: 'remove',
                  onClick: () => closeSelectorAndDetail(() => onSelectEmpty(activeBandSelectorInstrument)),
                }
                : {
                  label: `Selecionar ${activeInstrumentRole}`,
                  variant: 'select',
                  onClick: () => closeSelectorAndDetail(() => onSelectMusician(activeBandSelectorInstrument, selectedSelectorDetail.id)),
                }}
              onCloseDetails={closeSelectorDetail}
              onToggleStory={() => undefined}
              onHireSelected={() => undefined}
            />
          ) : null}
        </div>

        <div className={`band-management-bottom-panel${isSelectorDetailOpen ? ' detail-open' : ''}`}>
          <div className="band-management-placeholder">
            <div className="band-menu-nav">
              {bandMenuOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`band-menu-tab${bandMenuView === option.id ? ' active' : ''}`}
                  onClick={() => onChangeBandMenuView(option.id)}
                >
                  <img src={option.icon} alt={option.label} />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            {bandMenuView === 'band' ? (
              <>
                <div className="band-gains-row">
                  <span className="band-gain-item">
                    <img src={iconFameWhite} alt="Hype" />
                    <span>Hype</span>
                    <strong>+{formatNumber(bandHypeValue)}</strong>
                  </span>
                  <span className="band-gain-item">
                    <img src={iconFansWhite} alt="Público" />
                    <span>Fãs</span>
                    <strong>+{formatNumber(bandFansValue)}</strong>
                  </span>
                  <span className="band-gain-item">
                    <img src={iconRhythmWhite} alt="Performance" />
                    <span>Perfor.</span>
                    <strong>{formatPerformancePercent(bandPerformanceValue)}</strong>
                  </span>
                  <span className="band-gain-item">
                    <img src={iconCost} alt="Cachê" />
                    <span>Cachê</span>
                    <strong>-{formatCurrency(bandCostValue)}</strong>
                  </span>
                </div>

                <BandInstrumentSelector
                  bandInstrumentColumns={bandInstrumentColumns}
                  activeInstrument={activeBandSelectorInstrument}
                  isDetailOpen={isSelectorDetailOpen}
                  selectorMusicians={selectorMusicians}
                  selectedMusicianId={selectedSelectorMusicianId}
                  instrumentLabels={instrumentLabels}
                  iconFechar={iconFechar}
                  iconMusicoVazio={iconMusicoVazio}
                  onOpenInstrument={onOpenInstrument}
                  onCloseSelector={onCloseSelector}
                  onSelectEmpty={onSelectEmpty}
                  onOpenMusicianDetail={openSelectorDetail}
                />
              </>
            ) : (
              <div className="band-menu-empty-view">
                <strong>{bandMenuView === 'specials' ? 'Especiais' : 'Análise'}</strong>
                <span>Conteúdo desta seção será adicionado nas próximas etapas.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BandManagementScreen;
