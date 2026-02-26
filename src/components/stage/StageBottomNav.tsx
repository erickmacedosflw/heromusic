import React from 'react';
import './StageBottomNav.css';

type StageBottomNavProps = {
  variant?: 'bottom' | 'side';
  isHiding?: boolean;
  isBandManagementScreenVisible: boolean;
  availableToHireCount: number;
  className?: string;
  navBand: string;
  navHire: string;
  navStore: string;
  navStage: string;
  navSongs: string;
  onOpenBandManagementScreen: () => void;
  onOpenMusiciansScreen: () => void;
  onCycleStage: () => void;
};

const StageBottomNav: React.FC<StageBottomNavProps> = ({
  variant = 'bottom',
  isHiding = false,
  isBandManagementScreenVisible,
  availableToHireCount,
  className = '',
  navBand,
  navHire,
  navStore,
  navStage,
  navSongs,
  onOpenBandManagementScreen,
  onOpenMusiciansScreen,
  onCycleStage,
}) => {
  const resolvedClassName = !isHiding && className ? ` ${className}` : '';

  return (
    <div className={`game-bottom-nav${variant === 'side' ? ' game-side-nav' : ''}${isHiding ? ' is-hiding' : ''}${resolvedClassName}`}>
      {variant !== 'side' ? (
        <button
          type="button"
          className={`bottom-item${isBandManagementScreenVisible ? ' active' : ''}`}
          onClick={onOpenBandManagementScreen}
        >
          <img src={navBand} alt="Banda" className="bottom-item-icon" />
          <span className={variant === 'side' ? 'bottom-item-label-side' : ''}>Banda</span>
        </button>
      ) : null}
      <button type="button" className={`bottom-item${availableToHireCount > 0 ? ' has-badge' : ''}`} onClick={onOpenMusiciansScreen}>
        {availableToHireCount > 0 ? (
          <span className="bottom-item-badge bottom-item-badge-green">{availableToHireCount > 99 ? '99+' : availableToHireCount}</span>
        ) : null}
        <img src={navHire} alt="Músicos" className="bottom-item-icon" />
        <span className={variant === 'side' ? 'bottom-item-label-side' : ''}>Músicos</span>
      </button>
      <button type="button" className="bottom-item">
        <img src={navStore} alt="Loja" className="bottom-item-icon" />
        <span className={variant === 'side' ? 'bottom-item-label-side' : ''}>Loja</span>
      </button>
      <button type="button" className="bottom-item" onClick={onCycleStage}>
        <img src={navStage} alt="Palco" className="bottom-item-icon" />
        <span className={variant === 'side' ? 'bottom-item-label-side' : ''}>Palco</span>
      </button>
      <button type="button" className="bottom-item">
        <img src={navSongs} alt="Músicas" className="bottom-item-icon" />
        <span className={variant === 'side' ? 'bottom-item-label-side' : ''}>Músicas</span>
      </button>
    </div>
  );
};

export default StageBottomNav;
