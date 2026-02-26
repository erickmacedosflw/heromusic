import React from 'react';
import './StageVenueCacheCard.css';

type StageVenueCacheCardProps = {
  maxRevenue: number;
  bandTotalCache: number;
  iconGainWhite: string;
  iconCostWhite: string;
  className?: string;
  showCenterGainBadge?: boolean;
  hideSideValues?: boolean;
};

const StageVenueCacheCard: React.FC<StageVenueCacheCardProps> = ({
  maxRevenue,
  bandTotalCache,
  iconGainWhite,
  iconCostWhite,
  className,
  showCenterGainBadge = false,
  hideSideValues = false,
}) => {
  const revenueValue = Math.max(0, maxRevenue);
  const cacheValue = Math.max(0, bandTotalCache);
  const gainValue = Math.max(0, revenueValue - cacheValue);
  const cacheRatio = revenueValue > 0 ? Math.min(1, cacheValue / revenueValue) : 0;
  const gainRatio = revenueValue > 0 ? Math.max(0, 1 - cacheRatio) : 0;
  const isCacheOverLimit = cacheValue > revenueValue;
  const formatCurrency = (value: number) => `R$ ${value.toLocaleString('pt-BR')}`;

  return (
    <div className={`stage-venue-cache-card${isCacheOverLimit ? ' is-over-limit' : ''}${className ? ` ${className}` : ''}`} aria-label="Indicador de cachê e lucro">
      {showCenterGainBadge ? (
        <div className="stage-venue-cache-center-gain" aria-label="Valor de ganho da banda">
          {formatCurrency(gainValue)}
        </div>
      ) : null}

      <div className="stage-venue-cache-barline">
        <img src={iconGainWhite} alt="Ganho" className="stage-venue-cache-side-icon" />
        <div className="stage-venue-cache-track" role="presentation">
          <span className="stage-venue-cache-fill gain" style={{ width: `${gainRatio * 100}%` }} />
          <span className="stage-venue-cache-fill cost" style={{ width: `${cacheRatio * 100}%` }} />
        </div>
        <img src={iconCostWhite} alt="Cachê" className="stage-venue-cache-side-icon" />
      </div>

      {!hideSideValues ? (
        <div className="stage-venue-cache-values">
          <strong className="gain">{formatCurrency(gainValue)}</strong>
          <strong className="cost">{formatCurrency(cacheValue)}</strong>
        </div>
      ) : null}
    </div>
  );
};

export default StageVenueCacheCard;
