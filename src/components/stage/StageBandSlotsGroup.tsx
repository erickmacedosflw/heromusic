import React from 'react';

export type StageBandSlot = {
  id: 'guitar' | 'bass' | 'drums' | 'keys';
  instrumentLabel: string;
  instrumentIcon: string;
  musicianFace: string | null;
  hasMusician: boolean;
  rarityClass: 'bronze' | 'silver' | 'gold' | null;
};

type StageBandSlotsGroupProps = {
  slots: StageBandSlot[];
  emptyMusicianIcon?: string;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

const StageBandSlotsGroup: React.FC<StageBandSlotsGroupProps> = ({
  slots,
  emptyMusicianIcon,
  className,
  onClick,
  ariaLabel = 'Músicos da banda',
}) => {
  const mergedClassName = `stage-map-preview-band${className ? ` ${className}` : ''}`;

  const content = (
    <>
      {slots.map((slot) => (
        <div key={slot.id} className="stage-map-preview-band-slot">
          <span className="stage-map-preview-band-label">
            <img src={slot.instrumentIcon} alt="" aria-hidden="true" />
            <strong>{slot.instrumentLabel}</strong>
          </span>
          <div className={`stage-map-preview-band-card${slot.rarityClass ? ` rarity-${slot.rarityClass}` : ''}`}>
            {slot.hasMusician && slot.musicianFace ? (
              <img src={slot.musicianFace} alt={slot.instrumentLabel} className="stage-map-preview-band-face" />
            ) : (
              <div className="stage-map-preview-band-empty" aria-label={`${slot.instrumentLabel} vazio`}>
                {emptyMusicianIcon ? <img src={emptyMusicianIcon} alt="" aria-hidden="true" /> : null}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={mergedClassName}
        aria-label={ariaLabel}
        onClick={onClick}
        data-click-sfx="open"
      >
        {content}
      </button>
    );
  }

  return (
    <div className={mergedClassName} aria-label={ariaLabel}>
      {content}
    </div>
  );
};

export default StageBandSlotsGroup;
