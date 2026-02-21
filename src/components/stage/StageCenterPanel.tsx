import React from 'react';
import './StageCenterPanel.css';

type StageCenterPanelProps = {
  iconFameWhite: string;
  iconFansWhite: string;
  iconRhythmWhite: string;
  iconCost: string;
  iconIngresso: string;
  iconValorCacheTotal: string;
  iconCache: string;
  bandHypeValue: number;
  bandFansValue: number;
  bandPerformanceValue: number;
  selectedStageName: string;
  stageTicketPrice: number;
  lotacaoTotalValue: number;
  costSharePct: number;
  gainSharePct: number;
  gainValue: number;
  metronomeTick: boolean;
  beatHitFeedback: boolean;
  isMusicPlaying: boolean;
  metronomeBeatMs: number;
  rhythmBonus: number;
  bonusFlash: boolean;
  rhythmMeter: number;
  rhythmTone: string;
  bandCostValue: number;
  formatNumber: (value: number) => string;
  formatPerformancePercent: (value: number) => string;
  formatCurrency: (value: number) => string;
  gainMeterRef: React.RefObject<HTMLDivElement | null>;
  wrapperRef?: React.RefObject<HTMLDivElement | null>;
};

const StageCenterPanel: React.FC<StageCenterPanelProps> = ({
  iconFameWhite,
  iconFansWhite,
  iconRhythmWhite,
  iconCost,
  iconIngresso,
  iconValorCacheTotal,
  iconCache,
  bandHypeValue,
  bandFansValue,
  bandPerformanceValue,
  selectedStageName,
  stageTicketPrice,
  lotacaoTotalValue,
  costSharePct,
  gainSharePct,
  gainValue,
  metronomeTick,
  beatHitFeedback,
  isMusicPlaying,
  metronomeBeatMs,
  rhythmBonus,
  bonusFlash,
  rhythmMeter,
  rhythmTone,
  bandCostValue,
  formatNumber,
  formatPerformancePercent,
  formatCurrency,
  gainMeterRef,
  wrapperRef,
}) => {
  return (
    <div className="stage-center-panel" ref={wrapperRef}>
      <div className="mini-kpis">
        <div className="kpi-box">
          <img src={iconFameWhite} alt="Fama" className="kpi-main-icon" />
          <div className="kpi-texts">
            <span className="kpi-name">Hype</span>
            <strong>+{formatNumber(bandHypeValue)}</strong>
          </div>
        </div>
        <div className="kpi-box">
          <img src={iconFansWhite} alt="Fãs" className="kpi-main-icon" />
          <div className="kpi-texts">
            <span className="kpi-name">Fãs</span>
            <strong>+{formatNumber(bandFansValue)}</strong>
          </div>
        </div>
        <div className="kpi-box">
          <img src={iconRhythmWhite} alt="Performance" className="kpi-main-icon" />
          <div className="kpi-texts">
            <span className="kpi-name">Perfor.</span>
            <strong>{formatPerformancePercent(bandPerformanceValue)}</strong>
          </div>
        </div>
        <div className="kpi-box kpi-box-cache">
          <img src={iconCost} alt="Cachê" className="kpi-main-icon" />
          <div className="kpi-texts">
            <span className="kpi-name">Cachê</span>
            <strong>{formatCurrency(bandCostValue)}</strong>
          </div>
        </div>
      </div>

      <div className="venue-card">
        <h3>{selectedStageName}</h3>
        <div className="venue-meta">
          <span><img src={iconIngresso} alt="Ingresso" className="venue-meta-icon" /> R$ {formatCurrency(stageTicketPrice)}</span>
          <span><img src={iconValorCacheTotal} alt="Valor máximo de ganho" className="venue-meta-icon" /> R$ {formatCurrency(lotacaoTotalValue)}</span>
        </div>
      </div>

      <div className="cost-gain-meter" aria-label="Barra lateral de custo versus ganho" ref={gainMeterRef}>
        <img src={iconCost} alt="Custo" className="cost-gain-icon" />
        <div className="cost-gain-core">
          <div className="cost-gain-track">
            <span className="cost-gain-fill-cost" style={{ height: `${costSharePct}%` }} />
            <span className="cost-gain-fill-gain" style={{ height: `${gainSharePct}%` }} />
          </div>
          <div className="cost-gain-value" style={{ top: `${costSharePct}%` }}>{formatCurrency(gainValue)}</div>
        </div>
        <img src={iconCache} alt="Ganho" className="cost-gain-icon" />
      </div>

      <div className="rhythm-side-meter" aria-label="Barra lateral de ritmo">
        <div className={`rhythm-metronome${metronomeTick ? ' tick' : ''}${beatHitFeedback ? ' hit' : ''}`}>
          <span className={`rhythm-metronome-arm${isMusicPlaying ? ' active' : ''}`} style={{ animationDuration: `${metronomeBeatMs}ms` }} />
        </div>
        <div className={`beat-hit-badge${beatHitFeedback ? ' show' : ''}`}>ACERTOU!</div>
        <div className={`rhythm-bonus-tag${rhythmBonus > 1 ? ' active' : ''}${bonusFlash ? ' flash' : ''}`}>
          {rhythmBonus > 1 ? `Bônus x${rhythmBonus.toFixed(1)}` : 'Sem bônus'}
        </div>
        <div className="rhythm-side-track">
          <span className="rhythm-side-fill" style={{ height: `${rhythmMeter}%`, background: rhythmTone }} />
        </div>
        <img src={iconRhythmWhite} alt="Ritmo" className="rhythm-side-icon" />
      </div>
    </div>
  );
};

export default StageCenterPanel;
