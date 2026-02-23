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

const baseCameraPosition = new THREE.Vector3(0, 4.85, 10.7);
const baseLookAtPosition = new THREE.Vector3(0, 0.72, 0.45);

const performerPositions: Record<StagePerformerInstrument, THREE.Vector3> = {
  drums: new THREE.Vector3(0, 0.9, 0.4),
  guitar: new THREE.Vector3(-2.5, 1, 1.5),
  bass: new THREE.Vector3(2.5, 1, 1.5),
  keys: new THREE.Vector3(0, 1, 2.5),
};

const shuffleInstruments = (items: StagePerformerInstrument[]) => {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const temp = cloned[index];
    cloned[index] = cloned[randomIndex];
    cloned[randomIndex] = temp;
  }

  return cloned;
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
  const isCinematicModeRef = useRef(false);
  const sequenceOrderRef = useRef<StagePerformerInstrument[]>([]);
  const sequenceIndexRef = useRef(0);
  const shotEndsAtRef = useRef(0);
  const shotStartedAtRef = useRef(0);
  const shotDurationRef = useRef(0);
  const isWideShotRef = useRef(true);
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
    scene.fog = new THREE.Fog(0x050505, 8, 22);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.copy(baseCameraPosition);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const frontKeyLight = new THREE.SpotLight(0xfff3de, 1.65, 38, Math.PI * 0.22, 0.36, 1.2);
    frontKeyLight.position.set(0, 7.1, 9.3);
    frontKeyLight.castShadow = true;
    frontKeyLight.shadow.mapSize.width = 1024;
    frontKeyLight.shadow.mapSize.height = 1024;
    frontKeyLight.shadow.bias = -0.00015;
    frontKeyLight.shadow.radius = 4;
    scene.add(frontKeyLight);
    scene.add(frontKeyLight.target);

    const fillLight = new THREE.DirectionalLight(0x93b7ff, 0.35);
    fillLight.position.set(4.5, 5.5, -3.5);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.2);
    backLight.position.set(0, 6.4, -8);
    scene.add(backLight);

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
      aperture: 0.00006,
      maxblur: 0.003,
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

    const setCinematicMode = (isCinematic: boolean) => {
      isCinematicModeRef.current = isCinematic;
    };

    const nextFocusInstrument = (elapsed: number) => {
      const playableInstruments = activeInstrumentsRef.current;
      if (!playableInstruments.length) {
        setFocusedInstrument(null);
        setCinematicMode(false);
        sequenceOrderRef.current = [];
        sequenceIndexRef.current = 0;
        isWideShotRef.current = true;
        shotStartedAtRef.current = elapsed;
        shotDurationRef.current = 2;
        shotEndsAtRef.current = elapsed + shotDurationRef.current;
        return;
      }

      if (!sequenceOrderRef.current.length || sequenceIndexRef.current >= sequenceOrderRef.current.length) {
        sequenceOrderRef.current = shuffleInstruments(playableInstruments);
        sequenceIndexRef.current = 0;
        isWideShotRef.current = true;
        setFocusedInstrument(null);
        setCinematicMode(false);
        shotStartedAtRef.current = elapsed;
        shotDurationRef.current = 1.9;
        shotEndsAtRef.current = elapsed + shotDurationRef.current;
        return;
      }

      const nextInstrument = sequenceOrderRef.current[sequenceIndexRef.current];
      sequenceIndexRef.current += 1;
      isWideShotRef.current = false;
      setFocusedInstrument(nextInstrument);
      setCinematicMode(true);
      shotStartedAtRef.current = elapsed;
      shotDurationRef.current = 3.05;
      shotEndsAtRef.current = elapsed + shotDurationRef.current;
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
        setFocusedInstrument(null);
        setCinematicMode(false);
        isWideShotRef.current = true;
        sequenceOrderRef.current = [];
        sequenceIndexRef.current = 0;
        shotEndsAtRef.current = 0;
        shotStartedAtRef.current = 0;
        shotDurationRef.current = 0;
      } else if (!shotEndsAtRef.current || elapsed >= shotEndsAtRef.current) {
        nextFocusInstrument(elapsed);
      }

      const defaultSwaySpeed = playing ? 0.58 : 0.2;
      const defaultSwayX = playing ? 0.4 : 0.24;
      const defaultSwayZ = playing ? 0.22 : 0.12;

      if (playing && isCinematicModeRef.current && currentFocusedInstrumentRef.current) {
        const focusInstrument = currentFocusedInstrumentRef.current;
        const focusPosition = performerPositions[focusInstrument];
        const widePose = new THREE.Vector3(
          Math.sin(elapsed * defaultSwaySpeed) * defaultSwayX,
          4.9 + Math.sin(elapsed * (defaultSwaySpeed * 0.56)) * 0.16,
          10.45 + Math.cos(elapsed * (defaultSwaySpeed * 0.44)) * defaultSwayZ
        );
        const closePose = new THREE.Vector3(
          focusPosition.x * 0.58 + Math.sin(elapsed * 1.32) * 0.025,
          2.52 + Math.sin(elapsed * 1.1) * 0.02,
          3.46 + Math.cos(elapsed * 1.25) * 0.03
        );

        const shotDuration = Math.max(0.01, shotDurationRef.current || 3.05);
        const shotElapsed = Math.max(0, elapsed - shotStartedAtRef.current);
        const shotProgress = Math.min(1, shotElapsed / shotDuration);
        const easeProgress = shotProgress * shotProgress * (3 - 2 * shotProgress);

        cameraTarget.lerpVectors(widePose, closePose, easeProgress);
        lookAtTarget.set(
          focusPosition.x * 0.18,
          1.16 + Math.sin(elapsed * 0.9) * 0.01,
          focusPosition.z - 0.34
        );
      } else {
        cameraTarget.set(
          Math.sin(elapsed * defaultSwaySpeed) * defaultSwayX,
          4.9 + Math.sin(elapsed * (defaultSwaySpeed * 0.56)) * (playing ? 0.16 : 0.07),
          10.45 + Math.cos(elapsed * (defaultSwaySpeed * 0.44)) * defaultSwayZ
        );
        lookAtTarget.copy(baseLookAtPosition);
      }

      camera.position.lerp(cameraTarget, playing ? 0.08 : 0.045);
      camera.lookAt(lookAtTarget);

      const focusDistance = Math.max(1.6, Math.min(14, camera.position.distanceTo(lookAtTarget)));
      const cinematicIntensity = playing && isCinematicModeRef.current && currentFocusedInstrumentRef.current ? 1 : 0;
      bokehPass.materialBokeh.uniforms.focus.value = focusDistance;
      bokehPass.materialBokeh.uniforms.aperture.value = 0.00005 + cinematicIntensity * 0.0002;
      bokehPass.materialBokeh.uniforms.maxblur.value = 0.003 + cinematicIntensity * 0.014;

      if (elapsed - lastCameraFrameSentAtRef.current > 0.06) {
        lastCameraFrameSentAtRef.current = elapsed;
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const yawDeg = THREE.MathUtils.radToDeg(Math.atan2(cameraDirection.x, cameraDirection.z));
        const zoomDistance = Math.max(4.8, Math.min(11.2, camera.position.distanceTo(lookAtTarget)));
        const normalizedZoom = 1 - (zoomDistance - 4.8) / (11.2 - 4.8);
        const focusInstrument = playing && isCinematicModeRef.current ? currentFocusedInstrumentRef.current : null;
        const depthBlur = focusInstrument ? 1.8 + normalizedZoom * 2.2 : 0;

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
        const isFocusMoment = Boolean(playing && isCinematicModeRef.current && currentFocusedInstrumentRef.current);
        onShadowFrameRef.current?.({
          offsetX: -11 - shadowDrift * 16,
          offsetY: isFocusMoment ? -24 : -16,
          blur: isFocusMoment ? 4.2 : 3.2,
          opacity: isFocusMoment ? 0.42 : 0.34,
          floorDepth: isFocusMoment ? 1 : 0.75,
        });
      }

      composer.render();
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
      setCinematicMode(false);

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
