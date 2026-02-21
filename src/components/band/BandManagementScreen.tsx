import React from 'react';
import type { Instrument } from '../../state/gameStore';
import BandInstrumentSelector from './BandInstrumentSelector';
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
  bandHypeValue: number;
  bandFansValue: number;
  bandPerformanceValue: number;
  bandCostValue: number;
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
  bandHypeValue,
  bandFansValue,
  bandPerformanceValue,
  bandCostValue,
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
  if (!isVisible) {
    return null;
  }

  return (
    <div className={`band-management-screen${isClosing ? ' closing' : ''}`} style={{ backgroundImage: `url(${backgroundBackstage})` }}>
      <div className="band-management-content">
        <div className="band-management-top-hero">
          <div className="musicians-contract-overlay" />
          <div className="band-management-header">
            <h2>Banda</h2>
            <p>Gerencie os músicos da sua banda</p>
            <button
              type="button"
              className="musicians-close-btn"
              onClick={onCloseScreen}
              data-click-sfx="close"
              aria-label="Fechar tela da banda"
            >
              <img src={iconFechar} alt="" aria-hidden="true" className="musicians-close-icon" />
            </button>
          </div>
        </div>

        <div className="band-management-bottom-panel">
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
                  selectorMusicians={selectorMusicians}
                  selectedMusicianId={selectedSelectorMusicianId}
                  instrumentLabels={instrumentLabels}
                  iconFechar={iconFechar}
                  iconBloqueado={iconBloqueado}
                  iconDisponivel={iconDisponivel}
                  iconMusicoVazio={iconMusicoVazio}
                  iconMoneyWhite={iconMoneyWhite}
                  iconFameWhite={iconFameWhite}
                  iconFansWhite={iconFansWhite}
                  iconRhythmWhite={iconRhythmWhite}
                  iconCost={iconCost}
                  onOpenInstrument={onOpenInstrument}
                  onCloseSelector={onCloseSelector}
                  onSelectEmpty={onSelectEmpty}
                  onSelectMusician={onSelectMusician}
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
