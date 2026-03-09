import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './Stage3DScene.css';

type StagePerformerInstrument = 'drums' | 'guitar' | 'bass' | 'keys';

type StageMusicianSprite = {
  instrument: StagePerformerInstrument;
  id: number;
  portraitSrc: string;
};

type Stage3DSceneProps = {
  textureUrl: string;
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string | null;
  isMusicPlaying: boolean;
  activeMusicians: StageMusicianSprite[];
  activeMusiciansSignature?: string;
  isCameraMotionEnabled: boolean;
};

const baseCameraPosition = new THREE.Vector3(0, 5.25, 14.45);
const baseLookAtPosition = new THREE.Vector3(0, 0.76, 0.42);
const stageVerticalOffset = -1.22;

const performerPositions: Record<StagePerformerInstrument, THREE.Vector3> = {
  drums: new THREE.Vector3(0.95, 0.9 + stageVerticalOffset, -0.66),
  guitar: new THREE.Vector3(-2.7, 1 + stageVerticalOffset, 0.42),
  bass: new THREE.Vector3(2.7, 1 + stageVerticalOffset, 1.06),
  keys: new THREE.Vector3(-0.72, 1 + stageVerticalOffset, 2.6),
};

const performerSpriteScale: Record<StagePerformerInstrument, [number, number]> = {
  drums: [2.1, 3.1],
  guitar: [2.05, 3],
  bass: [2.05, 3],
  keys: [2.2, 3.15],
};

const performerShadowScale: Record<StagePerformerInstrument, [number, number]> = {
  drums: [1.9, 0.66],
  guitar: [1.72, 0.58],
  bass: [1.72, 0.58],
  keys: [1.98, 0.7],
};

const performerSpriteBaseY = 0.11 + stageVerticalOffset;

type CameraShot = {
  type: 'general' | 'focus' | 'sweep';
  instrument: StagePerformerInstrument | null;
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  duration: number;
};

const generalShot: CameraShot = {
  type: 'general',
  instrument: null,
  pos: new THREE.Vector3(0, 4.95, 14.8),
  look: new THREE.Vector3(0, 0.35, 0.06),
  fov: 67,
  duration: 1.6,
};

const sweepShotLeft: CameraShot = {
  type: 'sweep',
  instrument: null,
  pos: new THREE.Vector3(-5.7, 4.38, 9.8),
  look: new THREE.Vector3(0, 0.4, 0.12),
  fov: 62,
  duration: 8,
};

const sweepShotRight: CameraShot = {
  type: 'sweep',
  instrument: null,
  pos: new THREE.Vector3(5.7, 4.38, 9.8),
  look: new THREE.Vector3(0, 0.4, 0.12),
  fov: 62,
  duration: 8,
};

const focusShotByInstrument: Record<StagePerformerInstrument, CameraShot> = {
  guitar: {
    type: 'focus',
    instrument: 'guitar',
    pos: new THREE.Vector3(-2.5, 1.2, 3.95),
    look: new THREE.Vector3(-2.6, 2.08, -0.2),
    fov: 50,
    duration: 5,
  },
  bass: {
    type: 'focus',
    instrument: 'bass',
    pos: new THREE.Vector3(2.5, 1.2, 3.95),
    look: new THREE.Vector3(2.6, 2.08, -0.2),
    fov: 50,
    duration: 5,
  },
  drums: {
    type: 'focus',
    instrument: 'drums',
    pos: new THREE.Vector3(0.9, 1.82, 3.08),
    look: new THREE.Vector3(0.95, 2.22, -0.9),
    fov: 49,
    duration: 5,
  },
  keys: {
    type: 'focus',
    instrument: 'keys',
    pos: new THREE.Vector3(-0.82, 1.1, 3.46),
    look: new THREE.Vector3(-0.96, 2.1, 1.74),
    fov: 49,
    duration: 5,
  },
};

const buildShotQueue = (activeInstruments: StagePerformerInstrument[], cycle: number) => {
  const sequenceOrder: StagePerformerInstrument[] = ['guitar', 'drums', 'bass', 'keys'];
  const availableOrder = sequenceOrder.filter((instrument) => activeInstruments.includes(instrument));
  if (!availableOrder.length) {
    return [generalShot];
  }

  const rotateBy = cycle % availableOrder.length;
  const rotatedOrder = [...availableOrder.slice(rotateBy), ...availableOrder.slice(0, rotateBy)];
  const focusOrder = cycle % 2 === 0 ? rotatedOrder : [...rotatedOrder].reverse();
  const sweepStart = cycle % 2 === 0 ? sweepShotLeft : sweepShotRight;
  const sweepEnd = cycle % 2 === 0 ? sweepShotRight : sweepShotLeft;

  const queue: CameraShot[] = [sweepStart];
  focusOrder.forEach((instrument, index) => {
    queue.push(focusShotByInstrument[instrument]);
    if ((index + 1) % 2 === 0) {
      queue.push(generalShot);
    }
  });
  queue.push(sweepEnd);
  queue.push(generalShot);

  return queue;
};

const Stage3DScene: React.FC<Stage3DSceneProps> = ({
  textureUrl,
  backgroundImageUrl,
  backgroundVideoUrl,
  isMusicPlaying,
  activeMusicians,
  activeMusiciansSignature,
  isCameraMotionEnabled,
}) => {
  const isMobile = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMusicPlayingRef = useRef(isMusicPlaying);
  const activeMusiciansRef = useRef(activeMusicians);
  const isCameraMotionEnabledRef = useRef(isCameraMotionEnabled);

  const currentFocusedInstrumentRef = useRef<StagePerformerInstrument | null>(null);
  const shotQueueRef = useRef<CameraShot[]>([]);
  const shotIndexRef = useRef(0);
  const currentShotRef = useRef<CameraShot>(generalShot);
  const fromShotPosRef = useRef(baseCameraPosition.clone());
  const fromShotLookRef = useRef(baseLookAtPosition.clone());
  const fromShotFovRef = useRef(60);
  const currentLookRef = useRef(baseLookAtPosition.clone());
  const currentFovRef = useRef(60);
  const shotEndsAtRef = useRef(0);
  const shotStartedAtRef = useRef(0);
  const shotMoveDurationRef = useRef(1.15);
  const shotQueueCycleRef = useRef(0);
  const lastShadowFrameSentAtRef = useRef(0);
  const wasMusicPlayingRef = useRef(false);
  const randomMotionRefreshAtRef = useRef(0);
  const randomPosOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const randomPosOffsetTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const randomLookOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const randomLookOffsetTargetRef = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    isMusicPlayingRef.current = isMusicPlaying;
  }, [isMusicPlaying]);

  useEffect(() => {
    activeMusiciansRef.current = activeMusicians;
  }, [activeMusicians]);

  useEffect(() => {
    isCameraMotionEnabledRef.current = isCameraMotionEnabled;
  }, [isCameraMotionEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      premultipliedAlpha: false,
      powerPreference: isMobile ? 'low-power' : 'high-performance',
    });
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.background = 'transparent';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = null;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.copy(baseCameraPosition);

    const textureLoader = new THREE.TextureLoader();
    let sceneBackgroundTexture: THREE.Texture | null = null;
    let sceneBackgroundVideoElement: HTMLVideoElement | null = null;
    let hasActiveVideoBackground = false;
    const backgroundGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    });
    const backgroundPlane = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    backgroundPlane.position.set(0, 12.8, -44);
    backgroundPlane.renderOrder = -20;
    scene.add(backgroundPlane);
    const backgroundBaseY = 9.1;
    const backgroundParallaxCurrent = new THREE.Vector2(0, 0);
    const backgroundParallaxTarget = new THREE.Vector2(0, 0);
    const backgroundParallaxLimits = new THREE.Vector2(0, 0);
    const backgroundLayoutState = {
      aspect: 0,
      distance: 0,
      fov: 0,
      textureAspect: 0,
    };

    const getBackgroundAspect = () => {
      const bgMap = backgroundMaterial.map;
      if (!bgMap) {
        return 16 / 9;
      }

      const source = bgMap.image as {
        videoWidth?: number;
        videoHeight?: number;
        width?: number;
        height?: number;
      } | null;

      const width = source?.videoWidth ?? source?.width ?? 0;
      const height = source?.videoHeight ?? source?.height ?? 0;
      if (!width || !height) {
        return 16 / 9;
      }

      return width / height;
    };

    const syncBackgroundPlanePosition = () => {
      backgroundPlane.position.x = backgroundParallaxCurrent.x;
      backgroundPlane.position.y = backgroundBaseY + backgroundParallaxCurrent.y;
    };

    const updateBackgroundPlaneScale = (force = false) => {
      const fitScale = 4;
      const distance = Math.abs(camera.position.z - backgroundPlane.position.z);
      const textureAspect = getBackgroundAspect();

      if (
        !force
        && Math.abs(backgroundLayoutState.aspect - camera.aspect) < 0.001
        && Math.abs(backgroundLayoutState.distance - distance) < 0.08
        && Math.abs(backgroundLayoutState.fov - camera.fov) < 0.08
        && Math.abs(backgroundLayoutState.textureAspect - textureAspect) < 0.001
      ) {
        syncBackgroundPlanePosition();
        return;
      }

      backgroundLayoutState.aspect = camera.aspect;
      backgroundLayoutState.distance = distance;
      backgroundLayoutState.fov = camera.fov;
      backgroundLayoutState.textureAspect = textureAspect;

      const frustumHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * distance;
      const frustumWidth = frustumHeight * camera.aspect;
      let planeHeight = frustumHeight * fitScale;
      let planeWidth = planeHeight * textureAspect;
      if (planeWidth > frustumWidth * fitScale) {
        planeWidth = frustumWidth * fitScale;
        planeHeight = planeWidth / textureAspect;
      }

      const maxOffsetX = Math.max(0, (planeWidth - frustumWidth) * 0.5);
      const maxOffsetY = Math.max(0, (planeHeight - frustumHeight) * 0.5);
      backgroundParallaxLimits.set(maxOffsetX * 0.92, maxOffsetY * 0.92);
      backgroundParallaxCurrent.x = THREE.MathUtils.clamp(
        backgroundParallaxCurrent.x,
        -backgroundParallaxLimits.x,
        backgroundParallaxLimits.x
      );
      backgroundParallaxCurrent.y = THREE.MathUtils.clamp(
        backgroundParallaxCurrent.y,
        -backgroundParallaxLimits.y,
        backgroundParallaxLimits.y
      );

      syncBackgroundPlanePosition();
      backgroundPlane.scale.set(planeWidth, planeHeight, 1);
    };

    const applySceneBackground = () => {
      if (backgroundImageUrl) {
        const bgTexture = textureLoader.load(backgroundImageUrl);
        bgTexture.colorSpace = THREE.SRGBColorSpace;
        sceneBackgroundTexture = bgTexture;
        backgroundMaterial.map = bgTexture;
        backgroundMaterial.needsUpdate = true;
      }

      if (backgroundVideoUrl) {
        const video = document.createElement('video');
        video.src = backgroundVideoUrl;
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = 'auto';

        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.colorSpace = THREE.SRGBColorSpace;
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        videoTexture.generateMipmaps = false;

        sceneBackgroundVideoElement = video;
        const activateVideoTexture = () => {
          if (!sceneBackgroundVideoElement || sceneBackgroundVideoElement.readyState < 2) {
            return;
          }
          if (sceneBackgroundTexture && sceneBackgroundTexture !== videoTexture) {
            sceneBackgroundTexture.dispose();
          }
          hasActiveVideoBackground = true;
          sceneBackgroundTexture = videoTexture;
          backgroundMaterial.map = videoTexture;
          backgroundMaterial.needsUpdate = true;
          updateBackgroundPlaneScale(true);
        };

        video.addEventListener('loadeddata', activateVideoTexture, { once: true });
        video.addEventListener('canplay', activateVideoTexture, { once: true });

        void video.play().catch(() => undefined);
      }
    };

    applySceneBackground();

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.02);
    scene.add(ambientLight);

    const frontKeyLight = new THREE.SpotLight(0xfff3de, 2.42, 40, Math.PI * 0.24, 0.32, 1.05);
    frontKeyLight.position.set(0, 7.1, 9.3);
    frontKeyLight.castShadow = !isMobile;
    frontKeyLight.shadow.mapSize.width = isMobile ? 512 : 1024;
    frontKeyLight.shadow.mapSize.height = isMobile ? 512 : 1024;
    frontKeyLight.shadow.bias = -0.00015;
    frontKeyLight.shadow.radius = isMobile ? 1.5 : 4;
    scene.add(frontKeyLight);
    scene.add(frontKeyLight.target);

    const fillLight = new THREE.DirectionalLight(0x93b7ff, 0.72);
    fillLight.position.set(4.5, 5.5, -3.5);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(0, 6.4, -8);
    scene.add(backLight);

    const hemiLight = new THREE.HemisphereLight(0xe6efff, 0x7a5f4a, 0.62);
    scene.add(hemiLight);

    const floorTexture = new THREE.TextureLoader().load(textureUrl);
    floorTexture.colorSpace = THREE.SRGBColorSpace;
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(8, 8);
    floorTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), isMobile ? 4 : 8);

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.86,
      metalness: 0.08,
    });

    const floorGeometry = new THREE.PlaneGeometry(19, 19, 1, 1);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2 + 0.055;
    floor.position.y = stageVerticalOffset;
    floor.receiveShadow = true;
    scene.add(floor);

    const frontEdgeGeometry = new THREE.BoxGeometry(19, 0.35, 0.85);
    const frontEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1b11,
      roughness: 0.9,
      metalness: 0,
    });
    const frontEdge = new THREE.Mesh(frontEdgeGeometry, frontEdgeMaterial);
    frontEdge.position.set(0, -0.16 + stageVerticalOffset, 8.7);
    frontEdge.receiveShadow = true;
    scene.add(frontEdge);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const shadowCtx = shadowCanvas.getContext('2d');
    if (shadowCtx) {
      const gradient = shadowCtx.createRadialGradient(128, 128, 8, 128, 128, 118);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
      gradient.addColorStop(0.62, 'rgba(0, 0, 0, 0.34)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      shadowCtx.fillStyle = gradient;
      shadowCtx.fillRect(0, 0, 256, 256);
    }

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
    const shadowGeometry = new THREE.PlaneGeometry(1, 1);

    const spriteTextureLoader = new THREE.TextureLoader();
    const musicianSprites: Array<{
      instrument: StagePerformerInstrument;
      sprite: THREE.Sprite;
      shadow: THREE.Mesh;
      texture: THREE.Texture;
      spriteMaterial: THREE.SpriteMaterial;
      shadowMaterial: THREE.MeshBasicMaterial;
      baseSpriteScale: [number, number];
      baseShadowOpacity: number;
    }> = [];

    activeMusiciansRef.current.forEach((musician) => {
      const basePosition = performerPositions[musician.instrument];
      if (!basePosition) {
        return;
      }

      const spriteTexture = spriteTextureLoader.load(musician.portraitSrc);
      spriteTexture.colorSpace = THREE.SRGBColorSpace;

      const spriteMaterial = new THREE.SpriteMaterial({
        map: spriteTexture,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      });

      const sprite = new THREE.Sprite(spriteMaterial);
      const [scaleX, scaleY] = performerSpriteScale[musician.instrument];
      sprite.scale.set(scaleX, scaleY, 1);
      sprite.center.set(0.5, 0.02);
      sprite.position.set(basePosition.x, performerSpriteBaseY, basePosition.z);
      sprite.renderOrder = 5;
      scene.add(sprite);

      const shadowMaterial = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.84,
        depthWrite: false,
        depthTest: false,
      });
      const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      const [shadowWidth, shadowHeight] = performerShadowScale[musician.instrument];
      shadow.scale.set(shadowWidth * 1.62, shadowHeight * 1.92, 1);
      shadow.rotation.x = floor.rotation.x;
      shadow.position.set(basePosition.x, 0.035 + stageVerticalOffset, basePosition.z - 0.2);
      shadow.userData.baseX = shadow.position.x;
      shadow.userData.baseZ = shadow.position.z;
      shadow.renderOrder = 3;
      scene.add(shadow);

      musicianSprites.push({
        instrument: musician.instrument,
        sprite,
        shadow,
        texture: spriteTexture,
        spriteMaterial,
        shadowMaterial,
        baseSpriteScale: [scaleX, scaleY],
        baseShadowOpacity: 0.84,
      });
    });

    const standInGeometry = new THREE.CapsuleGeometry(0.35, 1.2, 2, 8);
    const standInMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1e1e,
      transparent: true,
      opacity: 0.04,
      roughness: 1,
      metalness: 0,
    });

    const performerStandIns: THREE.Mesh[] = [];
    (Object.keys(performerPositions) as StagePerformerInstrument[]).forEach((instrument) => {
      const position = performerPositions[instrument];
      const standIn = new THREE.Mesh(standInGeometry, standInMaterial);
      standIn.position.set(position.x, 1 + stageVerticalOffset, position.z);
      standIn.castShadow = true;
      standIn.receiveShadow = false;
      performerStandIns.push(standIn);
      scene.add(standIn);
    });

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) {
        return;
      }

      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      updateBackgroundPlaneScale(true);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let animationFrameId = 0;
    const targetFps = isMobile ? 45 : 60;
    let lastFrameTime = 0;
    const cameraTarget = new THREE.Vector3();
    const lookAtTarget = new THREE.Vector3();
    const targetPos = new THREE.Vector3();
    const targetLook = new THREE.Vector3();
    const shotDirection = new THREE.Vector3();
    const focusAnchor = new THREE.Vector3();
    const frontLightTarget = frontKeyLight.position.clone();
    const frontLightAimTarget = frontKeyLight.target.position.clone();
    let lastLightUpdateAt = 0;

    const setFocusedInstrument = (instrument: StagePerformerInstrument | null) => {
      currentFocusedInstrumentRef.current = instrument;
    };

    const rebuildShotQueue = () => {
      shotQueueRef.current = buildShotQueue(
        activeMusiciansRef.current.map((item) => item.instrument),
        shotQueueCycleRef.current
      );
      shotQueueCycleRef.current += 1;
      shotIndexRef.current = 0;
    };

    const applyNextShot = (elapsed: number, cameraObject: THREE.PerspectiveCamera) => {
      const activeQueue = shotQueueRef.current;
      if (!activeQueue.length) {
        shotQueueRef.current = [generalShot];
      }

      const queue = shotQueueRef.current;
      const nextIndex = shotIndexRef.current % queue.length;
      const nextShot = queue[nextIndex];
      shotIndexRef.current = (nextIndex + 1) % queue.length;

      fromShotPosRef.current.copy(cameraObject.position);
      fromShotLookRef.current.copy(currentLookRef.current);
      fromShotFovRef.current = currentFovRef.current;

      currentShotRef.current = nextShot;
      setFocusedInstrument(nextShot.instrument);

      shotStartedAtRef.current = elapsed;
      if (nextShot.type === 'sweep') {
        shotMoveDurationRef.current = 7.6;
      } else if (nextShot.type === 'focus') {
        shotMoveDurationRef.current = 3;
      } else {
        shotMoveDurationRef.current = 1.35;
      }
      shotEndsAtRef.current = elapsed + nextShot.duration;
    };

    const animate = () => {
      const now = performance.now();
      if (now - lastFrameTime < 1000 / targetFps) {
        animationFrameId = window.requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = now;
      const elapsed = clock.getElapsedTime();
      const playing = isMusicPlayingRef.current;

      if (elapsed - lastLightUpdateAt > (isMobile ? 0.08 : 0.05)) {
        lastLightUpdateAt = elapsed;
        frontLightTarget.set(
          Math.sin(elapsed * (playing ? 1.2 : 0.36)) * (playing ? 2.8 : 1.2),
          7 + Math.cos(elapsed * (playing ? 0.76 : 0.24)) * 0.45,
          9.1 + Math.sin(elapsed * (playing ? 0.54 : 0.18)) * 0.48
        );
        frontLightAimTarget.set(frontLightTarget.x * 0.18, 1.1, -1.6);
      }
      frontKeyLight.position.lerp(frontLightTarget, 0.18);
      frontKeyLight.target.position.lerp(frontLightAimTarget, 0.2);
      frontKeyLight.target.updateMatrixWorld();

      if (!isCameraMotionEnabledRef.current) {
        camera.position.copy(generalShot.pos);
        currentLookRef.current.copy(generalShot.look);
        camera.up.set(0, 1, 0);
        camera.lookAt(currentLookRef.current);
        camera.fov = generalShot.fov;
        camera.updateProjectionMatrix();
        backgroundParallaxTarget.set(0, 0);
        backgroundParallaxCurrent.set(0, 0);
        updateBackgroundPlaneScale();
        renderer.render(scene, camera);
        animationFrameId = window.requestAnimationFrame(animate);
        wasMusicPlayingRef.current = playing;
        return;
      }

      if (!playing) {
        if (wasMusicPlayingRef.current || currentShotRef.current.instrument !== null) {
          fromShotPosRef.current.copy(camera.position);
          fromShotLookRef.current.copy(currentLookRef.current);
          fromShotFovRef.current = currentFovRef.current;
          currentShotRef.current = generalShot;
          setFocusedInstrument(null);
          shotStartedAtRef.current = elapsed;
          shotMoveDurationRef.current = 1.2;
          shotEndsAtRef.current = elapsed + 1.2;
          rebuildShotQueue();
        }
      } else if (!shotEndsAtRef.current || elapsed >= shotEndsAtRef.current) {
        if (!shotQueueRef.current.length || shotIndexRef.current === 0) {
          rebuildShotQueue();
        }
        applyNextShot(elapsed, camera);
      }

      const shot = currentShotRef.current;
      const shotElapsed = Math.max(0, elapsed - shotStartedAtRef.current);
      const moveDuration = Math.max(0.1, shotMoveDurationRef.current);
      const moveProgress = Math.min(1, shotElapsed / moveDuration);
      const easeProgress = moveProgress * moveProgress * (3 - 2 * moveProgress);
      const isCloseShot = Boolean(shot.instrument);

      if (playing && elapsed >= randomMotionRefreshAtRef.current) {
        const nextWindow = isCloseShot
          ? 1.6 + Math.random() * 1.8
          : 2.4 + Math.random() * 2.6;
        randomMotionRefreshAtRef.current = elapsed + nextWindow;

        randomPosOffsetTargetRef.current.set(
          (Math.random() - 0.5) * (isCloseShot ? 0.2 : 0.4),
          (Math.random() - 0.5) * (isCloseShot ? 0.08 : 0.16),
          (Math.random() - 0.5) * (isCloseShot ? 0.18 : 0.34)
        );

        randomLookOffsetTargetRef.current.set(
          (Math.random() - 0.5) * (isCloseShot ? 0.12 : 0.24),
          (Math.random() - 0.5) * (isCloseShot ? 0.05 : 0.1),
          (Math.random() - 0.5) * (isCloseShot ? 0.1 : 0.16)
        );

      }

      if (!playing || !isCloseShot) {
        randomPosOffsetTargetRef.current.set(0, 0, 0);
        randomLookOffsetTargetRef.current.set(0, 0, 0);
      }

      randomPosOffsetRef.current.lerp(randomPosOffsetTargetRef.current, isCloseShot ? 0.055 : 0.04);
      randomLookOffsetRef.current.lerp(randomLookOffsetTargetRef.current, isCloseShot ? 0.065 : 0.05);

      const handAmount = isCloseShot ? 0.024 : 0.015;

      targetPos.set(
        shot.pos.x,
        shot.pos.y,
        shot.pos.z
      );
      const focusPosition = shot.instrument ? performerPositions[shot.instrument] : null;
      const hasFocusAnchor = Boolean(isCloseShot && focusPosition);

      if (focusPosition) {
        focusAnchor.set(
          focusPosition.x,
          focusPosition.y + 1.42,
          focusPosition.z + 0.04
        );
      }

      if (hasFocusAnchor) {
        const shotDistanceToPortrait = Math.max(5.2, Math.min(6.7, shot.pos.distanceTo(focusAnchor)));
        const closeDistance = shotDistanceToPortrait;
        shotDirection.subVectors(shot.pos, focusAnchor);
        if (shotDirection.lengthSq() < 0.0001) {
          shotDirection.set(0, 0.24, 1);
        }
        shotDirection.normalize();
        targetPos.copy(focusAnchor).addScaledVector(shotDirection, closeDistance);
        targetPos.y -= 0.72;
      }

      targetPos.x += Math.sin(elapsed * (isCloseShot ? 0.92 : 0.52)) * handAmount
        + Math.sin(elapsed * 0.16) * (isCloseShot ? 0.12 : 0.16)
        + (isCloseShot ? Math.sin(elapsed * 1.48) * 0.022 : 0)
        + randomPosOffsetRef.current.x;
      targetPos.y += Math.cos(elapsed * (isCloseShot ? 0.72 : 0.46)) * handAmount
        + Math.cos(elapsed * 0.14) * (isCloseShot ? 0.06 : 0.07)
        + randomPosOffsetRef.current.y;
      targetPos.z += Math.sin(elapsed * (isCloseShot ? 0.62 : 0.4)) * handAmount
        + Math.sin(elapsed * 0.11) * (isCloseShot ? 0.09 : 0.14)
        + (isCloseShot ? Math.cos(elapsed * 1.22) * 0.018 : 0)
        + randomPosOffsetRef.current.z;

      const sideSway = Math.sin(elapsed * 0.42) * (isCloseShot ? 0.035 : 0.11);
      const frontBackSway = Math.cos(elapsed * 0.31) * (isCloseShot ? 0.018 : 0.05);
      targetPos.x += sideSway;
      targetPos.z += frontBackSway;

      if (!playing) {
        const idleSwayX = Math.sin(elapsed * 0.24) * 0.06 + Math.sin(elapsed * 0.11) * 0.03;
        const idleSwayY = Math.cos(elapsed * 0.2) * 0.028;
        const idleSwayZ = Math.sin(elapsed * 0.18) * 0.04;
        targetPos.x += idleSwayX;
        targetPos.y += idleSwayY;
        targetPos.z += idleSwayZ;
      }

      targetLook.set(
        (hasFocusAnchor ? focusAnchor.x : shot.look.x)
          + Math.sin(elapsed * 0.62) * (isCloseShot ? 0.009 : 0.005)
          + Math.sin(elapsed * 0.42) * (isCloseShot ? 0.01 : 0.03)
          + randomLookOffsetRef.current.x,
        (hasFocusAnchor ? focusAnchor.y - 0.2 : shot.look.y)
          + Math.cos(elapsed * 0.41) * (isCloseShot ? 0.007 : 0.003)
          + randomLookOffsetRef.current.y,
        (hasFocusAnchor ? focusAnchor.z : shot.look.z) + randomLookOffsetRef.current.z
      );

      if (!playing) {
        targetLook.x += Math.sin(elapsed * 0.24) * 0.012;
        targetLook.y += Math.cos(elapsed * 0.2) * 0.009;
      }

      targetLook.y += isCloseShot ? -0.14 : 0.3;

      cameraTarget.lerpVectors(fromShotPosRef.current, targetPos, easeProgress);
      lookAtTarget.lerpVectors(fromShotLookRef.current, targetLook, easeProgress);

      camera.position.copy(cameraTarget);
      currentLookRef.current.copy(lookAtTarget);
      camera.up.set(0, 1, 0);
      camera.lookAt(currentLookRef.current);

      const sweepZoomBreath = shot.type === 'sweep'
        ? Math.sin(elapsed * 0.34) * 0.9
        : 0;
      const targetFov = fromShotFovRef.current + ((shot.fov + sweepZoomBreath) - fromShotFovRef.current) * easeProgress;
      currentFovRef.current += (targetFov - currentFovRef.current) * 0.12;
      camera.fov = currentFovRef.current;
      camera.updateProjectionMatrix();

      backgroundParallaxTarget.set(
        (camera.position.x - baseCameraPosition.x) * 0.2
          + (currentLookRef.current.x - baseLookAtPosition.x) * 0.12,
        (camera.position.y - baseCameraPosition.y) * 0.28
          + (currentLookRef.current.y - baseLookAtPosition.y) * 0.08
      );
      backgroundParallaxTarget.x = THREE.MathUtils.clamp(
        backgroundParallaxTarget.x,
        -backgroundParallaxLimits.x,
        backgroundParallaxLimits.x
      );
      backgroundParallaxTarget.y = THREE.MathUtils.clamp(
        backgroundParallaxTarget.y,
        -backgroundParallaxLimits.y,
        backgroundParallaxLimits.y
      );
      backgroundParallaxCurrent.lerp(backgroundParallaxTarget, 0.12);
      updateBackgroundPlaneScale();

      musicianSprites.forEach((entry) => {
        const isFocused = shot.instrument === entry.instrument;
        const scaleTarget = isCloseShot
          ? isFocused
            ? 1
            : 0.95
          : 1;
        const opacityTarget = isCloseShot
          ? isFocused
            ? 1
            : 0.78
          : 0.96;
        const tintTarget = isCloseShot
          ? isFocused
            ? 1
            : 0.82
          : 0.98;
        const spriteYTarget = performerSpriteBaseY;

        entry.sprite.scale.x += (entry.baseSpriteScale[0] * scaleTarget - entry.sprite.scale.x) * 0.16;
        entry.sprite.scale.y += (entry.baseSpriteScale[1] * scaleTarget - entry.sprite.scale.y) * 0.16;
        entry.sprite.position.y += (spriteYTarget - entry.sprite.position.y) * 0.18;
        entry.spriteMaterial.opacity += (opacityTarget - entry.spriteMaterial.opacity) * 0.18;
        entry.spriteMaterial.color.setScalar(tintTarget);
      });

      if (elapsed - lastShadowFrameSentAtRef.current > 0.06) {
        lastShadowFrameSentAtRef.current = elapsed;
        const shadowDrift = frontKeyLight.position.x / 3.4;
        musicianSprites.forEach(({ instrument, shadow, shadowMaterial, baseShadowOpacity }) => {
          const baseShadowX = (shadow.userData.baseX as number) ?? shadow.position.x;
          const baseShadowZ = (shadow.userData.baseZ as number) ?? shadow.position.z;
          shadow.position.x = baseShadowX;
          shadow.position.z = baseShadowZ;
          const isFocused = shot.instrument === instrument;
          const shadowOpacityTarget = isCloseShot
            ? isFocused
              ? 0.7
              : 0.54
            : baseShadowOpacity;
          shadowMaterial.opacity = shadowOpacityTarget + Math.abs(shadowDrift) * 0.08;
        });
      }

      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(animate);
      wasMusicPlayingRef.current = playing;
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      floorGeometry.dispose();
      floorMaterial.dispose();
      floorTexture.dispose();
      backgroundGeometry.dispose();
      backgroundMaterial.dispose();
      scene.remove(backgroundPlane);
      standInGeometry.dispose();
      standInMaterial.dispose();
      frontEdgeGeometry.dispose();
      frontEdgeMaterial.dispose();
      shadowGeometry.dispose();
      shadowTexture.dispose();
      performerStandIns.forEach((standIn) => {
        scene.remove(standIn);
      });
      musicianSprites.forEach(({ sprite, shadow, texture, spriteMaterial, shadowMaterial }) => {
        scene.remove(sprite);
        scene.remove(shadow);
        texture.dispose();
        spriteMaterial.dispose();
        shadowMaterial.dispose();
      });

      setFocusedInstrument(null);
      currentShotRef.current = generalShot;

      if (sceneBackgroundVideoElement) {
        sceneBackgroundVideoElement.pause();
        sceneBackgroundVideoElement.src = '';
        sceneBackgroundVideoElement.load();
      }
      if (sceneBackgroundTexture) {
        sceneBackgroundTexture.dispose();
      }

      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [textureUrl, backgroundImageUrl, backgroundVideoUrl, activeMusiciansSignature]);

  return <div className="stage-3d-layer" ref={containerRef} aria-hidden="true" />;
};

export default Stage3DScene;
