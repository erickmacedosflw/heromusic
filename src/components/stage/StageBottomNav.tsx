import React from 'react';
import './StageBottomNav.css';

type StageBottomNavProps = {
  isBandManagementScreenVisible: boolean;
  availableToHireCount: number;
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
  isBandManagementScreenVisible,
  availableToHireCount,
  navBand,
  navHire,
  navStore,
  navStage,
  navSongs,
  onOpenBandManagementScreen,
  onOpenMusiciansScreen,
  onCycleStage,
}) => {
  return (
    <div className="game-bottom-nav">
      <button
        type="button"
        className={`bottom-item${isBandManagementScreenVisible ? ' active' : ''}`}
        onClick={onOpenBandManagementScreen}
      >
        <img src={navBand} alt="Banda" className="bottom-item-icon" />
        <span>Banda</span>
      </button>
      <button type="button" className={`bottom-item${availableToHireCount > 0 ? ' has-badge' : ''}`} onClick={onOpenMusiciansScreen}>
        {availableToHireCount > 0 ? (
          <span className="bottom-item-badge bottom-item-badge-green">{availableToHireCount > 99 ? '99+' : availableToHireCount}</span>
        ) : null}
        <img src={navHire} alt="Músicos" className="bottom-item-icon" />
        <span>Músicos</span>
      </button>
      <button type="button" className="bottom-item">
        <img src={navStore} alt="Loja" className="bottom-item-icon" />
        <span>Loja</span>
      </button>
      <button type="button" className="bottom-item" onClick={onCycleStage}>
        <img src={navStage} alt="Palco" className="bottom-item-icon" />
        <span>Palco</span>
      </button>
      <button type="button" className="bottom-item">
        <img src={navSongs} alt="Músicas" className="bottom-item-icon" />
        <span>Músicas</span>
      </button>
    </div>
  );
};

export default StageBottomNav;
