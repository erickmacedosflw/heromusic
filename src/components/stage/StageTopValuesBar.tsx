import React from 'react';
import './StageTopValuesBar.css';

type StageTopValuesBarProps = {
  configIcon: string;
  availableBandCoins: number;
  fans: number;
  fameStars: number;
  iconMoneyBlack: string;
  iconFansBlack: string;
  iconFameBlack: string;
  onOpenBandConfig: () => void;
  formatCurrency: (value: number) => string;
  formatNumber: (value: number) => string;
  famePulseTick: number;
  topMoneyRef: React.RefObject<HTMLDivElement | null>;
  topFansRef: React.RefObject<HTMLDivElement | null>;
  topFameRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  isConfigOpen?: boolean;
};

const StageTopValuesBar: React.FC<StageTopValuesBarProps> = ({
  configIcon,
  availableBandCoins,
  fans,
  fameStars,
  iconMoneyBlack,
  iconFansBlack,
  iconFameBlack,
  onOpenBandConfig,
  formatCurrency,
  formatNumber,
  famePulseTick,
  topMoneyRef,
  topFansRef,
  topFameRef,
  className = '',
  isConfigOpen = false,
}) => {
  return (
    <div className={`stage-top-values${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className={`band-config-trigger${isConfigOpen ? ' is-open' : ''}`}
        onClick={onOpenBandConfig}
        aria-label="Abrir configurações da banda"
      >
        <img src={configIcon} alt="Configurações" className="band-config-trigger-logo" />
      </button>
      <div className="top-pill top-pill-money" ref={topMoneyRef}>
        <img src={iconMoneyBlack} alt="Dinheiro" className="top-pill-icon" />
        <strong className="top-pill-value">{formatCurrency(availableBandCoins)}</strong>
      </div>
      <div className="top-pill top-pill-fans" ref={topFansRef}>
        <img src={iconFansBlack} alt="Fãs" className="top-pill-icon" />
        <strong className="top-pill-value">{formatNumber(fans)}</strong>
      </div>
      <div className="top-pill top-pill-fame" ref={topFameRef}>
        <img src={iconFameBlack} alt="Fama" className="top-pill-icon" />
        <strong key={famePulseTick} className="top-pill-value fame-pop">{formatNumber(fameStars)}</strong>
      </div>
    </div>
  );
};

export default StageTopValuesBar;
