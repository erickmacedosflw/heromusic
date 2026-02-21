import React from 'react';
import './StageVisualEffectsLayer.css';

type TapEffect = {
  id: number;
  x: number;
  y: number;
};

type RewardParticle = {
  id: number;
  kind: 'fans' | 'money' | 'fame';
  x: number;
  y: number;
  dx: number;
  dy: number;
  delay: number;
  duration: number;
};

type RewardFloatText = {
  id: number;
  kind: 'fans' | 'money' | 'fame';
  value: number;
  x: number;
  y: number;
};

type StageVisualEffectsLayerProps = {
  tapEffects: TapEffect[];
  rewardParticles: RewardParticle[];
  rewardTexts: RewardFloatText[];
  iconFansWhite: string;
  iconMoneyWhite: string;
  iconFameWhite: string;
  formatNumber: (value: number) => string;
};

const StageVisualEffectsLayer: React.FC<StageVisualEffectsLayerProps> = ({
  tapEffects,
  rewardParticles,
  rewardTexts,
  iconFansWhite,
  iconMoneyWhite,
  iconFameWhite,
  formatNumber,
}) => {
  const getRewardIcon = (kind: RewardParticle['kind']) => {
    if (kind === 'fans') {
      return iconFansWhite;
    }

    if (kind === 'fame') {
      return iconFameWhite;
    }

    return iconMoneyWhite;
  };

  return (
    <>
      <div className="rhythm-tap-layer" aria-hidden="true">
        {tapEffects.map((effect) => (
          <span key={effect.id} className="rhythm-tap-pulse" style={{ left: effect.x, top: effect.y }} />
        ))}
      </div>
      <div className="reward-fly-layer" aria-hidden="true">
        {rewardParticles.map((particle) => (
          <img
            key={particle.id}
            src={getRewardIcon(particle.kind)}
            alt=""
            className={`reward-fly-icon ${particle.kind}`}
            style={{
              left: particle.x,
              top: particle.y,
              ['--dx' as string]: `${particle.dx}px`,
              ['--dy' as string]: `${particle.dy}px`,
              ['--delay' as string]: `${particle.delay}ms`,
              ['--duration' as string]: `${particle.duration}ms`,
            }}
          />
        ))}
        {rewardTexts.map((entry) => (
          <span
            key={entry.id}
            className={`reward-rise-text ${entry.kind}`}
            style={{ left: entry.x, top: entry.y }}
          >
            +{formatNumber(entry.value)}
          </span>
        ))}
      </div>
    </>
  );
};

export default StageVisualEffectsLayer;
