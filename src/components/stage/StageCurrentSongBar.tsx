import React from 'react';
import './StageCurrentSongBar.css';

type StageCurrentSongBarProps = {
  iconFansWhite: string;
  iconMusicWhite: string;
  fansGainBarPct: number;
  fansGainRate: number;
  fansStepFlash: boolean;
  songProgressPct: number;
  currentSongName: string;
  wrapperRef?: React.RefObject<HTMLDivElement | null>;
  fansTrackRef?: React.RefObject<HTMLDivElement | null>;
};

const StageCurrentSongBar: React.FC<StageCurrentSongBarProps> = ({
  iconFansWhite,
  iconMusicWhite,
  fansGainBarPct,
  fansGainRate,
  fansStepFlash,
  songProgressPct,
  currentSongName,
  wrapperRef,
  fansTrackRef,
}) => {
  return (
    <div className="stage-current-song" ref={wrapperRef}>
      <div className="stage-progress-item song-track">
        <img src={iconMusicWhite} alt="Música" className="progress-icon" />
        <div className="progress-bar-shell">
          <span className="progress-fill" style={{ width: `${songProgressPct}%` }} />
          <div className="progress-text song-progress-text">
            <strong>{currentSongName}</strong>
          </div>
        </div>
      </div>
      <div className="stage-progress-item fans-gain-track" ref={fansTrackRef}>
        <img src={iconFansWhite} alt="Ganho de fãs" className="progress-icon" />
        <div className="progress-bar-shell">
          <span className="progress-fill" style={{ width: `${fansGainBarPct}%` }} />
          <div className="progress-text fans-gain-text">
            <strong>{Math.round(fansGainRate * 100)}%</strong>
          </div>
          <span className={`fans-gain-step-burst${fansStepFlash ? ' show' : ''}`}>+5%</span>
        </div>
      </div>
    </div>
  );
};

export default StageCurrentSongBar;
