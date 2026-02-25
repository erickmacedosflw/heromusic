import { defaultStageBackground, navStage } from '../assets/bandGameAssets';

const stageImageAssetMap = import.meta.glob('../rsc/images/palcos/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const stageMapBadgeAssetMap = import.meta.glob('../rsc/images/maps/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const stageVideoAssetMap = import.meta.glob('../rsc/videos/palcos/*.{mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const musicStreamAssetMap = import.meta.glob('../rsc/musics/**/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const musicianFaceAssetMap = import.meta.glob('../rsc/images/facesets/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const musicianPortraitAssetMap = import.meta.glob('../rsc/images/portraits/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export const resolveStageAsset = (assetPath: string) => {
  if (!assetPath || !assetPath.startsWith('src/')) {
    return defaultStageBackground;
  }

  const viteAssetPath = `../${assetPath.replace(/^src\//, '')}`;
  return stageImageAssetMap[viteAssetPath] ?? defaultStageBackground;
};

export const resolveStageAnimatedAsset = (animatedPath: string) => {
  if (!animatedPath || !animatedPath.startsWith('src/')) {
    return null;
  }

  const viteAssetPath = `../${animatedPath.replace(/^src\//, '')}`;
  return stageVideoAssetMap[viteAssetPath] ?? null;
};

export const resolveStageMapBadgeAsset = (badgePath: string) => {
  if (!badgePath || !badgePath.startsWith('src/')) {
    return navStage;
  }

  const viteAssetPath = `../${badgePath.replace(/^src\//, '')}`;
  return stageMapBadgeAssetMap[viteAssetPath] ?? navStage;
};

export const resolveMusicStreamAsset = (streamPath: string) => {
  if (!streamPath || !streamPath.startsWith('src/')) {
    return null;
  }

  const viteAssetPath = `../${streamPath.replace(/^src\//, '')}`;
  return musicStreamAssetMap[viteAssetPath] ?? null;
};

export const resolveMusicianFaceAsset = (faceAsset: string) => {
  if (!faceAsset) {
    return null;
  }

  if (faceAsset.startsWith('src/')) {
    const viteAssetPath = `../${faceAsset.replace(/^src\//, '')}`;
    return musicianFaceAssetMap[viteAssetPath] ?? null;
  }

  const directFacePath = `../rsc/images/facesets/${faceAsset}`;
  if (musicianFaceAssetMap[directFacePath]) {
    return musicianFaceAssetMap[directFacePath];
  }

  const legacyFaceMatch = faceAsset.match(/^Face_(\d+)$/i);
  if (legacyFaceMatch) {
    const parsedFaceNumber = Number.parseInt(legacyFaceMatch[1], 10);
    if (Number.isFinite(parsedFaceNumber) && parsedFaceNumber > 0) {
      const migratedFacePath = `../rsc/images/facesets/Faceset_${parsedFaceNumber}.png`;
      return musicianFaceAssetMap[migratedFacePath] ?? null;
    }
  }

  return null;
};

export const resolveMusicianPortraitAsset = (portraitAsset: string) => {
  if (!portraitAsset) {
    return null;
  }

  if (portraitAsset.startsWith('src/')) {
    const viteAssetPath = `../${portraitAsset.replace(/^src\//, '')}`;
    return musicianPortraitAssetMap[viteAssetPath] ?? null;
  }

  const directPortraitPath = `../rsc/images/portraits/${portraitAsset}`;
  return musicianPortraitAssetMap[directPortraitPath] ?? null;
};
