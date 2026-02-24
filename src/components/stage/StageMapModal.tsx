import React from 'react';
import './StageMapModal.css';

type StageMapEntry = {
  id: number;
  name: string;
  badgeUrl: string;
  x: number;
  y: number;
};

type StageMapModalProps = {
  isVisible: boolean;
  mapImageUrl: string;
  stages: StageMapEntry[];
  currentStageId: number;
  onClose: () => void;
  onSelectStage: (stageId: number) => void;
};

const StageMapModal: React.FC<StageMapModalProps> = ({
  isVisible,
  mapImageUrl,
  stages,
  currentStageId,
  onClose,
  onSelectStage,
}) => {
  const mapImageRef = React.useRef<HTMLImageElement | null>(null);
  const mapScrollRef = React.useRef<HTMLDivElement | null>(null);
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  const [mapScale, setMapScale] = React.useState(1);
  const pinchStartDistanceRef = React.useRef<number | null>(null);
  const pinchStartScaleRef = React.useRef(1);
  const [shouldRender, setShouldRender] = React.useState(isVisible);
  const [isClosing, setIsClosing] = React.useState(false);

  const minScale = React.useMemo(() => {
    if (imageSize.height <= 0 || !mapScrollRef.current) {
      return 0.2;
    }

    const containerHeight = mapScrollRef.current.clientHeight;
    if (!containerHeight) {
      return 0.2;
    }

    return Math.min(1, Math.max(0.2, containerHeight / imageSize.height));
  }, [imageSize]);

  React.useEffect(() => {
    setMapScale((current) => Math.max(minScale, Math.min(4, current)));
  }, [minScale]);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) {
      return null;
    }

    const first = touches[0];
    const second = touches[1];
    const dx = second.clientX - first.clientX;
    const dy = second.clientY - first.clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const distance = getTouchDistance(event.touches);
    if (!distance) {
      return;
    }

    pinchStartDistanceRef.current = distance;
    pinchStartScaleRef.current = mapScale;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const distance = getTouchDistance(event.touches);
    const startDistance = pinchStartDistanceRef.current;
    if (!distance || !startDistance) {
      return;
    }

    event.preventDefault();
    const pinchRatio = distance / startDistance;
    const nextScale = pinchStartScaleRef.current * pinchRatio;
    setMapScale(Math.max(minScale, Math.min(4, nextScale)));
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length < 2) {
      pinchStartDistanceRef.current = null;
      return;
    }

    const distance = getTouchDistance(event.touches);
    if (!distance) {
      return;
    }

    pinchStartDistanceRef.current = distance;
    pinchStartScaleRef.current = mapScale;
  };

  React.useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }

    if (!shouldRender) {
      return;
    }

    setIsClosing(true);
    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
    }, 220);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isVisible, shouldRender]);
  const markersToRender = stages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    badgeUrl: stage.badgeUrl,
    x: imageSize.width > 0 ? ((stage.x / 100) * imageSize.width) * mapScale : 0,
    y: imageSize.height > 0 ? ((stage.y / 100) * imageSize.height) * mapScale : 0,
  }));

  if (!shouldRender) {
    return null;
  }

  return (
    <aside className={`stage-map-modal${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" aria-label="Mapa da cidade">
      <button type="button" className="stage-map-backdrop" onClick={onClose} aria-label="Fechar mapa" />
      <div className="stage-map-card">
        <button type="button" className="stage-map-close" onClick={onClose} aria-label="Fechar mapa">
          Fechar mapa
        </button>

        <div
          ref={mapScrollRef}
          className="stage-map-scroll"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div
            className="stage-map-world"
            style={{
              width: imageSize.width > 0 ? `${Math.round(imageSize.width * mapScale)}px` : 'max-content',
              height: imageSize.height > 0 ? `${Math.round(imageSize.height * mapScale)}px` : 'auto',
            }}
          >
            <img
              ref={mapImageRef}
              src={mapImageUrl}
              alt="Mapa da cidade"
              className="stage-map-image"
              style={{
                width: imageSize.width > 0 ? `${Math.round(imageSize.width * mapScale)}px` : 'auto',
                height: imageSize.height > 0 ? `${Math.round(imageSize.height * mapScale)}px` : 'auto',
              }}
              onLoad={(event) => {
                const image = event.currentTarget;
                setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
                setMapScale(1);
              }}
            />
          {markersToRender.map((stage) => {
            const isActive = stage.id === currentStageId;
            return (
              <button
                key={stage.id}
                type="button"
                className={`stage-map-point${isActive ? ' is-active' : ''}`}
                style={{ left: `${stage.x}px`, top: `${stage.y}px` }}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectStage(stage.id);
                  onClose();
                }}
                title={stage.name}
                aria-label={`Ir para ${stage.name}`}
              >
                <img src={stage.badgeUrl} alt={stage.name} />
                <span>{stage.name}</span>
              </button>
            );
          })}
          </div>
        </div>
        </div>
    </aside>
  );
};

export default StageMapModal;
