import React from 'react';
import './StageMapModal.css';
import iconFechar from '../../rsc/images/icons/Icone_fechar.png';

type StageMapEntry = {
  id: number;
  name: string;
  badgeUrl: string;
  bannerUrl: string | null;
  backgroundUrl: string | null;
  ticketPrice: number;
  capacity: number;
  maxRevenue: number;
  x: number;
  y: number;
};

type StageMapModalProps = {
  isVisible: boolean;
  mapImageUrl: string;
  iconFansWhite: string;
  iconIngressoWhite: string;
  iconValorCacheTotal: string;
  stages: StageMapEntry[];
  currentStageId: number;
  isEmbedded?: boolean;
  introImageUrl?: string;
  bandName?: string;
  bandLogoUrl?: string;
  introPlayId?: number;
  resetViewToken?: number;
  onIntroVisibilityChange?: (isVisible: boolean) => void;
  onPreviewStageBannerChange?: (bannerUrl: string | null) => void;
  onStageTransitionStart?: () => void;
  onClose: () => void;
  onSelectStage: (stageId: number) => void;
};
const STAGE_SELECT_TRANSITION_MS = 1800;
const STAGE_MAP_CLOSE_FADE_MS = 620;
const STAGE_BLACKOUT_START_PROGRESS = 0.68;
const STAGE_SELECT_ZOOM_MULTIPLIER = 1.75;
const STAGE_SELECT_FINAL_BLACK_HOLD_MS = 120;
const STAGE_PREVIEW_EXIT_MS = 260;
const TOUCH_SCROLL_DAMPING = 0.52;

const StageMapModal: React.FC<StageMapModalProps> = ({
  isVisible,
  mapImageUrl,
  iconFansWhite,
  iconIngressoWhite,
  iconValorCacheTotal,
  stages,
  currentStageId,
  isEmbedded = false,
  introImageUrl,
  bandName,
  bandLogoUrl,
  introPlayId,
  resetViewToken,
  onIntroVisibilityChange,
  onPreviewStageBannerChange,
  onStageTransitionStart,
  onClose,
  onSelectStage,
}) => {
  const initialScaleMultiplier = 1.4;
  const mapImageRef = React.useRef<HTMLImageElement | null>(null);
  const mapScrollRef = React.useRef<HTMLDivElement | null>(null);
  const hasInitializedOpenViewRef = React.useRef(false);
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  const [mapScale, setMapScale] = React.useState(1);
  const mapScaleRef = React.useRef(1);
  const pinchStartDistanceRef = React.useRef<number | null>(null);
  const pinchStartScaleRef = React.useRef(1);
  const touchPanLastPointRef = React.useRef<{ x: number; y: number } | null>(null);
  const [shouldRender, setShouldRender] = React.useState(isVisible);
  const [isClosing, setIsClosing] = React.useState(false);
  const [isStageTransitioning, setIsStageTransitioning] = React.useState(false);
  const [transitionOverlayOpacity, setTransitionOverlayOpacity] = React.useState(0);
  const [previewStage, setPreviewStage] = React.useState<StageMapEntry | null>(null);
  const [isPreviewClosing, setIsPreviewClosing] = React.useState(false);
  const previewCloseTimeoutRef = React.useRef<number | null>(null);
  const transitionFrameRef = React.useRef<number | null>(null);
  const transitionTimeoutRef = React.useRef<number | null>(null);
  const introHoldTimeoutRef = React.useRef<number | null>(null);
  const introHideTimeoutRef = React.useRef<number | null>(null);
  const lastIntroPlayIdRef = React.useRef<number | null>(null);
  const [introPhase, setIntroPhase] = React.useState<'hidden' | 'show' | 'leaving'>(() =>
    isVisible && introImageUrl && introPlayId && introPlayId > 0 ? 'show' : 'hidden',
  );

  const getClampedScrollPosition = React.useCallback((
    scrollContainer: HTMLDivElement,
    left: number,
    top: number,
    scale = mapScaleRef.current,
  ) => {
    const renderedWidth = imageSize.width > 0 ? imageSize.width * scale : scrollContainer.scrollWidth;
    const renderedHeight = imageSize.height > 0 ? imageSize.height * scale : scrollContainer.scrollHeight;
    const maxScrollLeft = Math.max(0, renderedWidth - scrollContainer.clientWidth);
    const maxScrollTop = Math.max(0, renderedHeight - scrollContainer.clientHeight);

    return {
      left: Math.max(0, Math.min(maxScrollLeft, left)),
      top: Math.max(0, Math.min(maxScrollTop, top)),
    };
  }, [imageSize]);

  React.useEffect(() => {
    mapScaleRef.current = mapScale;
  }, [mapScale]);

  React.useEffect(() => {
    if (!isVisible) {
      if (previewCloseTimeoutRef.current !== null) {
        window.clearTimeout(previewCloseTimeoutRef.current);
        previewCloseTimeoutRef.current = null;
      }
      setPreviewStage(null);
      setIsPreviewClosing(false);
    }
  }, [isVisible]);

  React.useEffect(() => {
    onPreviewStageBannerChange?.(previewStage?.backgroundUrl ?? null);
  }, [previewStage, onPreviewStageBannerChange]);

  const closePreviewWithAnimation = React.useCallback(
    (afterClose?: () => void) => {
      if (!previewStage) {
        return;
      }

      if (previewCloseTimeoutRef.current !== null) {
        window.clearTimeout(previewCloseTimeoutRef.current);
        previewCloseTimeoutRef.current = null;
      }

      setIsPreviewClosing(true);
      previewCloseTimeoutRef.current = window.setTimeout(() => {
        previewCloseTimeoutRef.current = null;
        setPreviewStage(null);
        setIsPreviewClosing(false);
        afterClose?.();
      }, STAGE_PREVIEW_EXIT_MS);
    },
    [previewStage]
  );

  const minScale = React.useMemo(() => {
    if (imageSize.height <= 0 || imageSize.width <= 0 || !mapScrollRef.current) {
      return 0.2;
    }

    const containerWidth = mapScrollRef.current.clientWidth;
    const containerHeight = mapScrollRef.current.clientHeight;
    if (!containerWidth || !containerHeight) {
      return 0.2;
    }

    const fitHeightScale = containerHeight / imageSize.height;
    const fitWidthScale = containerWidth / imageSize.width;
    const coverScale = Math.max(fitHeightScale, fitWidthScale);

    return Math.max(0.2, coverScale);
  }, [imageSize]);

  React.useLayoutEffect(() => {
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
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      touchPanLastPointRef.current = { x: touch.clientX, y: touch.clientY };
    }

    const distance = getTouchDistance(event.touches);
    if (!distance) {
      return;
    }

    pinchStartDistanceRef.current = distance;
    pinchStartScaleRef.current = mapScale;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const scrollContainer = mapScrollRef.current;
    if (event.touches.length === 1 && pinchStartDistanceRef.current === null && scrollContainer) {
      const touch = event.touches[0];
      const previousTouch = touchPanLastPointRef.current;
      if (previousTouch) {
        const deltaX = (touch.clientX - previousTouch.x) * TOUCH_SCROLL_DAMPING;
        const deltaY = (touch.clientY - previousTouch.y) * TOUCH_SCROLL_DAMPING;

        const targetLeft = scrollContainer.scrollLeft - deltaX;
        const targetTop = scrollContainer.scrollTop - deltaY;
        const clampedPosition = getClampedScrollPosition(scrollContainer, targetLeft, targetTop);

        if (event.cancelable) {
          event.preventDefault();
        }
        scrollContainer.scrollLeft = clampedPosition.left;
        scrollContainer.scrollTop = clampedPosition.top;
      }

      touchPanLastPointRef.current = { x: touch.clientX, y: touch.clientY };
      return;
    }

    const distance = getTouchDistance(event.touches);
    const startDistance = pinchStartDistanceRef.current;
    if (!distance || !startDistance) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
    const pinchRatio = distance / startDistance;
    const nextScale = pinchStartScaleRef.current * pinchRatio;
    setMapScale(Math.max(minScale, Math.min(4, nextScale)));
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 0) {
      touchPanLastPointRef.current = null;
    }

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
      setIsStageTransitioning(false);
      setTransitionOverlayOpacity(0);
      hasInitializedOpenViewRef.current = false;
      return;
    }

    if (!shouldRender) {
      return;
    }

    setIsClosing(true);
    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
    }, STAGE_MAP_CLOSE_FADE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isVisible, shouldRender]);

  React.useEffect(() => {
    const clearIntroTimers = () => {
      if (introHoldTimeoutRef.current !== null) {
        window.clearTimeout(introHoldTimeoutRef.current);
        introHoldTimeoutRef.current = null;
      }
      if (introHideTimeoutRef.current !== null) {
        window.clearTimeout(introHideTimeoutRef.current);
        introHideTimeoutRef.current = null;
      }
    };

    if (
      isVisible &&
      introImageUrl &&
      introPlayId &&
      introPlayId > 0 &&
      introPlayId !== lastIntroPlayIdRef.current
    ) {
      lastIntroPlayIdRef.current = introPlayId;
      clearIntroTimers();
      setIntroPhase('show');
      introHoldTimeoutRef.current = window.setTimeout(() => {
        setIntroPhase('leaving');
        introHideTimeoutRef.current = window.setTimeout(() => {
          setIntroPhase('hidden');
        }, 1000); // out animation
      }, 2000); // steady hold after 1s in
    } else {
      clearIntroTimers();
      setIntroPhase('hidden');
    }
  }, [isVisible, introImageUrl, introPlayId]);

  React.useEffect(() => {
    onIntroVisibilityChange?.(introPhase !== 'hidden');
  }, [introPhase, onIntroVisibilityChange]);

  React.useEffect(() => {
    if (!isVisible || imageSize.width <= 0 || imageSize.height <= 0 || !mapScrollRef.current) {
      return;
    }

    hasInitializedOpenViewRef.current = false;

    const scrollContainer = mapScrollRef.current;
    const defaultScale = Math.max(minScale, Math.min(4, minScale * initialScaleMultiplier));
    setMapScale(defaultScale);

    const renderedWidth = imageSize.width * defaultScale;
    const renderedHeight = imageSize.height * defaultScale;
    const defaultLeft = Math.max(0, (renderedWidth - scrollContainer.clientWidth) / 2);
    const defaultTop = Math.max(0, (renderedHeight - scrollContainer.clientHeight) / 2);
    const clampedPosition = getClampedScrollPosition(scrollContainer, defaultLeft, defaultTop, defaultScale);

    scrollContainer.scrollTo({
      left: clampedPosition.left,
      top: clampedPosition.top,
      behavior: 'auto',
    });
    touchPanLastPointRef.current = null;
    pinchStartDistanceRef.current = null;
    pinchStartScaleRef.current = defaultScale;
  }, [resetViewToken, isVisible, imageSize, minScale, getClampedScrollPosition]);

  React.useEffect(() => {
    return () => {
      if (transitionFrameRef.current !== null) {
        window.cancelAnimationFrame(transitionFrameRef.current);
      }
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      if (previewCloseTimeoutRef.current !== null) {
        window.clearTimeout(previewCloseTimeoutRef.current);
      }
      if (introHoldTimeoutRef.current !== null) {
        window.clearTimeout(introHoldTimeoutRef.current);
      }
      if (introHideTimeoutRef.current !== null) {
        window.clearTimeout(introHideTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (
      !isVisible ||
      !shouldRender ||
      hasInitializedOpenViewRef.current ||
      imageSize.width <= 0 ||
      imageSize.height <= 0
    ) {
      return;
    }

    const scrollContainer = mapScrollRef.current;
    if (!scrollContainer) {
      return;
    }

    const defaultScale = Math.max(minScale, Math.min(4, minScale * initialScaleMultiplier));
    const targetScale = defaultScale;

    if (Math.abs(mapScale - targetScale) > 0.001) {
      setMapScale(targetScale);
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const renderedWidth = imageSize.width * mapScale;
      const renderedHeight = imageSize.height * mapScale;

      const defaultLeft = Math.max(0, (renderedWidth - scrollContainer.clientWidth) / 2);
      const defaultTop = Math.max(0, (renderedHeight - scrollContainer.clientHeight) / 2);
      const clampedPosition = getClampedScrollPosition(scrollContainer, defaultLeft, defaultTop);

      scrollContainer.scrollTo({
        left: clampedPosition.left,
        top: clampedPosition.top,
        behavior: 'auto',
      });
      hasInitializedOpenViewRef.current = true;
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isVisible, shouldRender, imageSize, minScale, mapScale, getClampedScrollPosition]);

  const handleMapScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (isStageTransitioning) {
      return;
    }

    const scrollContainer = event.currentTarget;
    const clampedPosition = getClampedScrollPosition(scrollContainer, scrollContainer.scrollLeft, scrollContainer.scrollTop);

    if (Math.abs(clampedPosition.left - scrollContainer.scrollLeft) > 0.5) {
      scrollContainer.scrollLeft = clampedPosition.left;
    }
    if (Math.abs(clampedPosition.top - scrollContainer.scrollTop) > 0.5) {
      scrollContainer.scrollTop = clampedPosition.top;
    }

  };

  const handleCloseModal = React.useCallback(() => {
    if (previewCloseTimeoutRef.current !== null) {
      window.clearTimeout(previewCloseTimeoutRef.current);
      previewCloseTimeoutRef.current = null;
    }
    setPreviewStage(null);
    setIsPreviewClosing(false);
    onClose();
  }, [onClose]);

  const handleSelectStageWithTransition = (stage: StageMapEntry) => {
    if (isStageTransitioning) {
      return;
    }

    const scrollContainer = mapScrollRef.current;
    if (!scrollContainer || imageSize.width <= 0 || imageSize.height <= 0) {
      onStageTransitionStart?.();
      setIsPreviewClosing(false);
      setPreviewStage(null);
      onSelectStage(stage.id);
      if (!isEmbedded) {
        onClose();
      }
      setIsStageTransitioning(false);
      setTransitionOverlayOpacity(0);
      return;
    }

    if (transitionFrameRef.current !== null) {
      window.cancelAnimationFrame(transitionFrameRef.current);
      transitionFrameRef.current = null;
    }
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    onStageTransitionStart?.();
    setIsStageTransitioning(true);
    setTransitionOverlayOpacity(0);

    const startScale = mapScale;
    const startLeft = scrollContainer.scrollLeft;
    const startTop = scrollContainer.scrollTop;
    const targetScale = Math.max(minScale, Math.min(4, Math.max(mapScale * STAGE_SELECT_ZOOM_MULTIPLIER, minScale * 2.05)));

    const targetPointX = (stage.x / 100) * imageSize.width * targetScale;
    const targetPointY = (stage.y / 100) * imageSize.height * targetScale;
    const requestedLeft = targetPointX - scrollContainer.clientWidth / 2;
    const requestedTop = targetPointY - scrollContainer.clientHeight / 2;
    const targetPosition = getClampedScrollPosition(scrollContainer, requestedLeft, requestedTop, targetScale);

    const animationStart = performance.now();
    const easeInOutCubic = (value: number) => (value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2);

    const animate = (now: number) => {
      const elapsed = now - animationStart;
      const progress = Math.min(1, elapsed / STAGE_SELECT_TRANSITION_MS);
      const easedProgress = easeInOutCubic(progress);
      const blackoutProgress = Math.max(0, (easedProgress - STAGE_BLACKOUT_START_PROGRESS) / (1 - STAGE_BLACKOUT_START_PROGRESS));

      const nextScale = startScale + (targetScale - startScale) * easedProgress;
      const nextLeft = startLeft + (targetPosition.left - startLeft) * easedProgress;
      const nextTop = startTop + (targetPosition.top - startTop) * easedProgress;
      const nextOverlayOpacity = Math.max(0, Math.min(1, blackoutProgress));

      mapScaleRef.current = nextScale;
      setMapScale(nextScale);
      setTransitionOverlayOpacity(nextOverlayOpacity);
      scrollContainer.scrollTo({
        left: nextLeft,
        top: nextTop,
        behavior: 'auto',
      });

      if (progress < 1) {
        transitionFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      transitionFrameRef.current = null;
      setTransitionOverlayOpacity(1);
      transitionTimeoutRef.current = window.setTimeout(() => {
        setPreviewStage(null);
        setIsPreviewClosing(false);
        onSelectStage(stage.id);
        if (!isEmbedded) {
          onClose();
        }
        setIsStageTransitioning(false);
        setTransitionOverlayOpacity(0);
      }, STAGE_SELECT_FINAL_BLACK_HOLD_MS);
    };

    transitionFrameRef.current = window.requestAnimationFrame(animate);
  };

  const markersToRender = stages.map((stage) => ({
    ...stage,
    renderX: imageSize.width > 0 ? ((stage.x / 100) * imageSize.width) * mapScale : 0,
    renderY: imageSize.height > 0 ? ((stage.y / 100) * imageSize.height) * mapScale : 0,
  }));

  if (!shouldRender) {
    return null;
  }

  return (
    <aside
      className={`stage-map-modal${introPhase !== 'hidden' ? ' has-intro' : ''}${isClosing ? ' is-closing' : ''}${isStageTransitioning ? ' is-stage-transitioning' : ''}${isEmbedded ? ' is-embedded' : ''}`}
      role={isEmbedded ? undefined : 'dialog'}
      aria-modal={isEmbedded ? undefined : true}
      aria-label="Mapa da cidade"
    >
      {!isEmbedded ? (
        <button type="button" className="stage-map-backdrop" onClick={handleCloseModal} aria-label="Fechar mapa" disabled={isStageTransitioning} />
      ) : null}
      <div className="stage-map-card">
        {introPhase !== 'hidden' && introImageUrl ? (
          <div className={`stage-map-intro${introPhase === 'leaving' ? ' leaving' : ''}`} style={{ backgroundImage: `url(${introImageUrl})` }} aria-hidden="true">
            <div className="stage-map-intro-scrim" />
            <div className={`stage-map-intro-card${introPhase === 'leaving' ? ' leaving' : ''}`}>
              {bandLogoUrl ? <img src={bandLogoUrl} alt="Logo da banda" className="stage-map-intro-logo" /> : null}
              {bandName ? <strong className="stage-map-intro-name">{bandName}</strong> : null}
            </div>
          </div>
        ) : null}
        {!isEmbedded ? (
          <button type="button" className="stage-map-close" onClick={handleCloseModal} aria-label="Fechar mapa" disabled={isStageTransitioning}>
            Fechar mapa
          </button>
        ) : null}
        <div className="stage-map-transition-overlay" style={{ opacity: transitionOverlayOpacity }} aria-hidden="true" />

        <div
          ref={mapScrollRef}
          className="stage-map-scroll"
          onScroll={handleMapScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div
            className="stage-map-world"
            style={{
              width: imageSize.width > 0 ? `${imageSize.width * mapScale}px` : 'max-content',
              height: imageSize.height > 0 ? `${imageSize.height * mapScale}px` : 'auto',
            }}
          >
            <img
              ref={mapImageRef}
              src={mapImageUrl}
              alt="Mapa da cidade"
              className="stage-map-image"
              style={{
                width: imageSize.width > 0 ? `${imageSize.width * mapScale}px` : 'auto',
                height: imageSize.height > 0 ? `${imageSize.height * mapScale}px` : 'auto',
              }}
              onLoad={(event) => {
                const image = event.currentTarget;
                setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
              }}
            />
          {markersToRender.map((marker) => {
            const isActive = marker.id === currentStageId;
            return (
              <button
                key={marker.id}
                type="button"
                className={`stage-map-point${isActive ? ' is-active' : ''}`}
                style={{ left: `${marker.renderX}px`, top: `${marker.renderY}px` }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (previewCloseTimeoutRef.current !== null) {
                    window.clearTimeout(previewCloseTimeoutRef.current);
                    previewCloseTimeoutRef.current = null;
                  }
                  setIsPreviewClosing(false);
                  setPreviewStage(marker);
                }}
                title={marker.name}
                aria-label={`Ir para ${marker.name}`}
                disabled={isStageTransitioning}
              >
                <img src={marker.badgeUrl} alt={marker.name} />
                <span>{marker.name}</span>
              </button>
            );
          })}
          </div>
        </div>
        {previewStage && !isStageTransitioning ? (
          <div className={`stage-map-preview${isStageTransitioning ? ' is-transitioning' : ''}${isPreviewClosing ? ' is-closing' : ''}`}>
            <div
              className="stage-map-preview-card"
              style={(previewStage.backgroundUrl ?? previewStage.bannerUrl)
                ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.35) 60%), url(${previewStage.backgroundUrl ?? previewStage.bannerUrl})` }
                : undefined}
            >
              <div className="stage-map-preview-top">
                <div className="stage-map-preview-identity">
                  {previewStage.badgeUrl ? (
                    <div className="stage-map-preview-badge" aria-hidden="true">
                      <img src={previewStage.badgeUrl} alt="" />
                    </div>
                  ) : null}
                  <div className="stage-map-preview-title">
                    <span>{previewStage.name}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="stage-map-preview-close"
                  onClick={() => closePreviewWithAnimation()}
                  aria-label="Fechar"
                  disabled={isStageTransitioning}
                >
                  <img src={iconFechar} alt="" aria-hidden="true" className="stage-map-preview-close-icon" />
                </button>
              </div>

              <div className="stage-map-preview-stats">
                <div className="stage-map-preview-stat">
                  <img src={iconFansWhite} alt="Público" className="stage-map-preview-stat-icon" />
                  <div>
                    <span>Lotação</span>
                    <strong>{previewStage.capacity.toLocaleString('pt-BR')}</strong>
                  </div>
                </div>
                <div className="stage-map-preview-stat">
                  <img src={iconIngressoWhite} alt="Ingresso" className="stage-map-preview-stat-icon" />
                  <div>
                    <span>Ingresso</span>
                    <strong>R$ {previewStage.ticketPrice.toLocaleString('pt-BR')}</strong>
                  </div>
                </div>
                <div className="stage-map-preview-stat">
                  <img src={iconValorCacheTotal} alt="Receita" className="stage-map-preview-stat-icon" />
                  <div>
                    <span>Receita máx.</span>
                    <strong>R$ {previewStage.maxRevenue.toLocaleString('pt-BR')}</strong>
                  </div>
                </div>
              </div>

              <div className="stage-map-preview-actions">
                <button
                  type="button"
                  className="stage-map-preview-go"
                  onClick={() => {
                    if (!previewStage || isStageTransitioning) return;
                    const stageToGo = previewStage;
                    closePreviewWithAnimation(() => handleSelectStageWithTransition(stageToGo));
                  }}
                  disabled={isStageTransitioning}
                  aria-label={`Ir para ${previewStage.name}`}
                  data-click-sfx="confirm"
                >
                  Ir para o palco
                </button>
              </div>
            </div>
          </div>
        ) : null}
        </div>
    </aside>
  );
};

export default StageMapModal;
