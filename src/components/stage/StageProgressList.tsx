import React from 'react';
import './StageProgressList.css';

type StageProgressListProps = {
  iconFameWhite: string;
  iconFansWhite: string;
  famePct: number;
  fameValue: number;
  fameTarget: number;
  lotacaoPct: number;
  lotacaoValue: number;
  lotacaoTarget: number;
  formatNumber: (value: number) => string;
  fameTrackRef: React.RefObject<HTMLDivElement | null>;
  crowdTrackRef: React.RefObject<HTMLDivElement | null>;
};

const StageProgressList: React.FC<StageProgressListProps> = ({
  iconFameWhite,
  iconFansWhite,
  famePct,
  fameValue,
  fameTarget,
  lotacaoPct,
  lotacaoValue,
  lotacaoTarget,
  formatNumber,
  fameTrackRef,
  crowdTrackRef,
}) => {
  return (
    <div className="stage-progress-list">
      <div className="stage-progress-item fame-track" ref={fameTrackRef}>
        <img src={iconFameWhite} alt="Fama" className="progress-icon" />
        <div className="progress-bar-shell">
          <span className="progress-fill" style={{ width: `${famePct}%` }} />
          <div className="progress-text">
            <span>Fama</span>
            <strong>{formatNumber(fameValue)} / {formatNumber(fameTarget)}</strong>
          </div>
        </div>
      </div>

      <div className="stage-progress-item crowd-track" ref={crowdTrackRef}>
        <img src={iconFansWhite} alt="Fãs" className="progress-icon" />
        <div className="progress-bar-shell">
          <span className="progress-fill" style={{ width: `${lotacaoPct}%` }} />
          <div className="progress-text">
            <span>Público / Lotação</span>
            <strong>{formatNumber(lotacaoValue)} / {formatNumber(lotacaoTarget)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageProgressList;
