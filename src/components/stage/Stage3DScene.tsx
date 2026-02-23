import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import './Stage3DScene.css';

type StagePerformerInstrument = 'drums' | 'guitar' | 'bass' | 'keys';

type Stage3DSceneProps = {
  textureUrl: string;
  isMusicPlaying: boolean;
  activeInstruments: StagePerformerInstrument[];
  onCameraFrame?: (frame: {
    yawDeg: number;
    shiftX: number;
    shiftY: number;
    zoom: number;
    focusInstrument: StagePerformerInstrument | null;
    depthBlur: number;
  }) => void;
  onShadowFrame?: (shadow: { offsetX: number; offsetY: number; blur: number; opacity: number; floorDepth: number }) => void;
};

const baseCameraPosition = new THREE.Vector3(0, 4.85, 10.9);
const baseLookAtPosition = new THREE.Vector3(0, 0.72, 0.45);

const performerPositions: Record<StagePerformerInstrument, THREE.Vector3> = {
  drums: new THREE.Vector3(0, 0.9, 0.4),
  guitar: new THREE.Vector3(-2.5, 1, 1.5),
  bass: new THREE.Vector3(2.5, 1, 1.5),
  keys: new THREE.Vector3(0, 1, 2.5),
};

type CameraShot = {
  instrument: StagePerformerInstrument | null;
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
  duration: number;
};

const generalShot: CameraShot = {
  instrument: null,
  pos: new THREE.Vector3(0, 4.15, 8.35),
  look: new THREE.Vector3(0, 1.05, -0.1),
  fov: 58,
  duration: 1.6,
};

const focusShotByInstrument: Record<StagePerformerInstrument, CameraShot> = {
  guitar: {
    instrument: 'guitar',
    pos: new THREE.Vector3(-2.2, 2.32, 2.55),
    look: new THREE.Vector3(-2.08, 1.12, -0.78),
    fov: 24,
    duration: 2.85,
  },
  bass: {
    instrument: 'bass',
    pos: new THREE.Vector3(2.2, 2.32, 2.55),
    look: new THREE.Vector3(2.08, 1.12, -0.78),
    fov: 24,
    duration: 2.85,
  },
  drums: {
    instrument: 'drums',
    pos: new THREE.Vector3(0, 3.05, 2.18),
    look: new THREE.Vector3(0, 1.2, -1.7),
    fov: 22,
    duration: 2.95,
  },
  keys: {
    instrument: 'keys',
    pos: new THREE.Vector3(0, 2.06, 2.1),
    look: new THREE.Vector3(0, 1.15, 0.88),
    fov: 23,
    duration: 2.8,
  },
};

const buildShotQueue = (activeInstruments: StagePerformerInstrument[]) => {
  const sequenceOrder: StagePerformerInstrument[] = ['guitar', 'drums', 'bass', 'keys'];
  const queue: CameraShot[] = [];

  sequenceOrder.forEach((instrument) => {
    if (!activeInstruments.includes(instrument)) {
      return;
    }

    queue.push(focusShotByInstrument[instrument]);
    queue.push(generalShot);
  });

  return queue.length ? queue : [generalShot];
};

const Stage3DScene: React.FC<Stage3DSceneProps> = ({
  textureUrl,
  isMusicPlaying,
  activeInstruments,
  onCameraFrame,
  onShadowFrame,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMusicPlayingRef = useRef(isMusicPlaying);
  const activeInstrumentsRef = useRef(activeInstruments);
  const onCameraFrameRef = useRef(onCameraFrame);
  const onShadowFrameRef = useRef(onShadowFrame);

  const currentFocusedInstrumentRef = useRef<StagePerformerInstrument | null>(null);
  const shotQueueRef = useRef<CameraShot[]>([]);
  const shotIndexRef = useRef(0);
  const currentShotRef = useRef<CameraShot>(generalShot);
  const fromShotPosRef = useRef(baseCameraPosition.clone());
  const fromShotLookRef = useRef(baseLookAtPosition.clone());
  const fromShotFovRef = useRef(58);
  const currentLookRef = useRef(baseLookAtPosition.clone());
  const currentFovRef = useRef(58);
  const shotEndsAtRef = useRef(0);
  const shotStartedAtRef = useRef(0);
  const shotMoveDurationRef = useRef(1.15);
  const lastShadowFrameSentAtRef = useRef(0);
  const lastCameraFrameSentAtRef = useRef(0);

  useEffect(() => {
    isMusicPlayingRef.current = isMusicPlaying;
  }, [isMusicPlaying]);

  useEffect(() => {
    activeInstrumentsRef.current = activeInstruments;
  }, [activeInstruments]);

  useEffect(() => {
    onCameraFrameRef.current = onCameraFrame;
  }, [onCameraFrame]);

  useEffect(() => {
    onShadowFrameRef.current = onShadowFrame;
  }, [onShadowFrame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x2a2a2a, 12, 40);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.copy(baseCameraPosition);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.78);
    scene.add(ambientLight);

    const frontKeyLight = new THREE.SpotLight(0xfff3de, 2.15, 40, Math.PI * 0.24, 0.32, 1.05);
    frontKeyLight.position.set(0, 7.1, 9.3);
    frontKeyLight.castShadow = true;
    frontKeyLight.shadow.mapSize.width = 1024;
    frontKeyLight.shadow.mapSize.height = 1024;
    frontKeyLight.shadow.bias = -0.00015;
    frontKeyLight.shadow.radius = 4;
    scene.add(frontKeyLight);
    scene.add(frontKeyLight.target);

    const fillLight = new THREE.DirectionalLight(0x93b7ff, 0.52);
    fillLight.position.set(4.5, 5.5, -3.5);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.34);
    backLight.position.set(0, 6.4, -8);
    scene.add(backLight);

    const hemiLight = new THREE.HemisphereLight(0xd7e7ff, 0x6a4f3d, 0.45);
    scene.add(hemiLight);

    const floorTexture = new THREE.TextureLoader().load(textureUrl);
    floorTexture.colorSpace = THREE.SRGBColorSpace;
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(8, 8);
    floorTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.86,
      metalness: 0.08,
    });

    const floorGeometry = new THREE.PlaneGeometry(19, 19, 1, 1);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2 + 0.055;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const frontEdgeGeometry = new THREE.BoxGeometry(19, 0.35, 0.85);
    const frontEdgeMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1b11,
      roughness: 0.9,
      metalness: 0,
    });
    const frontEdge = new THREE.Mesh(frontEdgeGeometry, frontEdgeMaterial);
    frontEdge.position.set(0, -0.16, 8.7);
    frontEdge.receiveShadow = true;
    scene.add(frontEdge);

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
      standIn.position.set(position.x, 1, position.z);
      standIn.castShadow = true;
      standIn.receiveShadow = false;
      performerStandIns.push(standIn);
      scene.add(standIn);
    });

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bokehPass = new BokehPass(scene, camera, {
      focus: 8,
      aperture: 0.00003,
      maxblur: 0.0015,
    });
    composer.addPass(bokehPass);

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) {
        return;
      }

      renderer.setSize(clientWidth, clientHeight, false);
      composer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    let animationFrameId = 0;
    const cameraTarget = new THREE.Vector3();
    const lookAtTarget = new THREE.Vector3();

    const setFocusedInstrument = (instrument: StagePerformerInstrument | null) => {
      currentFocusedInstrumentRef.current = instrument;
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
      shotMoveDurationRef.current = nextShot.instrument ? 1.22 : 1.05;
      shotEndsAtRef.current = elapsed + nextShot.duration;
    };

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const playing = isMusicPlayingRef.current;

      frontKeyLight.position.x = Math.sin(elapsed * (playing ? 1.2 : 0.36)) * (playing ? 2.8 : 1.2);
      frontKeyLight.position.y = 7 + Math.cos(elapsed * (playing ? 0.76 : 0.24)) * 0.45;
      frontKeyLight.position.z = 9.1 + Math.sin(elapsed * (playing ? 0.54 : 0.18)) * 0.48;
      frontKeyLight.target.position.set(frontKeyLight.position.x * 0.18, 1.1, -1.6);
      frontKeyLight.target.updateMatrixWorld();

      if (!playing) {
        shotQueueRef.current = [generalShot];
        shotIndexRef.current = 0;
        currentShotRef.current = generalShot;
        setFocusedInstrument(null);
        fromShotPosRef.current.copy(camera.position);
        fromShotLookRef.current.copy(currentLookRef.current);
        fromShotFovRef.current = camera.fov;
        shotStartedAtRef.current = elapsed;
        shotMoveDurationRef.current = 0.9;
        shotEndsAtRef.current = elapsed + 0.9;
      } else if (!shotEndsAtRef.current || elapsed >= shotEndsAtRef.current) {
        shotQueueRef.current = buildShotQueue(activeInstrumentsRef.current);
        applyNextShot(elapsed, camera);
      }

      const shot = currentShotRef.current;
      const shotElapsed = Math.max(0, elapsed - shotStartedAtRef.current);
      const moveDuration = Math.max(0.1, shotMoveDurationRef.current);
      const moveProgress = Math.min(1, shotElapsed / moveDuration);
      const easeProgress = moveProgress * moveProgress * (3 - 2 * moveProgress);
      const isCloseShot = Boolean(shot.instrument);
      const handAmount = isCloseShot ? 0.015 : 0.006;

      const targetPos = new THREE.Vector3(
        shot.pos.x + Math.sin(elapsed * (isCloseShot ? 1.1 : 0.55)) * handAmount,
        shot.pos.y + Math.cos(elapsed * (isCloseShot ? 0.95 : 0.5)) * handAmount,
        shot.pos.z + Math.sin(elapsed * (isCloseShot ? 0.9 : 0.45)) * handAmount
      );
      const targetLook = new THREE.Vector3(
        shot.look.x + Math.sin(elapsed * 0.62) * (isCloseShot ? 0.01 : 0.004),
        shot.look.y,
        shot.look.z
      );

      cameraTarget.lerpVectors(fromShotPosRef.current, targetPos, easeProgress);
      lookAtTarget.lerpVectors(fromShotLookRef.current, targetLook, easeProgress);

      camera.position.copy(cameraTarget);
      currentLookRef.current.copy(lookAtTarget);
      camera.lookAt(currentLookRef.current);

      const targetFov = fromShotFovRef.current + (shot.fov - fromShotFovRef.current) * easeProgress;
      currentFovRef.current += (targetFov - currentFovRef.current) * 0.18;
      camera.fov = currentFovRef.current;
      camera.updateProjectionMatrix();

      const focusDistance = Math.max(1.05, Math.min(14, camera.position.distanceTo(currentLookRef.current)));
      const cinematicIntensity = playing && Boolean(currentShotRef.current.instrument) ? 1 : 0;
      bokehPass.materialBokeh.uniforms.focus.value = focusDistance;
      bokehPass.materialBokeh.uniforms.aperture.value = 0.000025 + cinematicIntensity * 0.000055;
      bokehPass.materialBokeh.uniforms.maxblur.value = 0.0013 + cinematicIntensity * 0.0036;

      if (elapsed - lastCameraFrameSentAtRef.current > 0.06) {
        lastCameraFrameSentAtRef.current = elapsed;
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const yawDeg = THREE.MathUtils.radToDeg(Math.atan2(cameraDirection.x, cameraDirection.z));
        const zoomDistance = Math.max(2.1, Math.min(11.5, camera.position.distanceTo(currentLookRef.current)));
        const normalizedZoom = 1 - (zoomDistance - 2.1) / (11.5 - 2.1);
        const focusInstrument = playing ? currentFocusedInstrumentRef.current : null;
        const depthBlur = focusInstrument ? 0.45 + normalizedZoom * 0.95 : 0;

        onCameraFrameRef.current?.({
          yawDeg,
          shiftX: (camera.position.x / 3.2) * 30,
          shiftY: (5.2 - camera.position.y) * 18,
          zoom: Math.max(0, Math.min(1, normalizedZoom)),
          focusInstrument,
          depthBlur,
        });
      }

      if (elapsed - lastShadowFrameSentAtRef.current > 0.08) {
        lastShadowFrameSentAtRef.current = elapsed;
        const shadowDrift = frontKeyLight.position.x / 2.9;
        const isFocusMoment = Boolean(playing && currentShotRef.current.instrument);
        onShadowFrameRef.current?.({
          offsetX: -11 - shadowDrift * 16,
          offsetY: isFocusMoment ? -24 : -16,
          blur: isFocusMoment ? 4.2 : 3.2,
          opacity: isFocusMoment ? 0.42 : 0.34,
          floorDepth: isFocusMoment ? 1 : 0.75,
        });
      }

      if (cinematicIntensity > 0.01) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      floorGeometry.dispose();
      floorMaterial.dispose();
      floorTexture.dispose();
      standInGeometry.dispose();
      standInMaterial.dispose();
      frontEdgeGeometry.dispose();
      frontEdgeMaterial.dispose();
      performerStandIns.forEach((standIn) => {
        scene.remove(standIn);
      });

      setFocusedInstrument(null);
      currentShotRef.current = generalShot;

      composer.dispose();

      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [textureUrl]);

  return <div className="stage-3d-layer" ref={containerRef} aria-hidden="true" />;
};

export default Stage3DScene;
