import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaPlusCircle, FaCheckCircle } from 'react-icons/fa';
import { useGameStore } from '../state/gameStore';
import palcosData from '../locals/palcos.json';

const gameLogo = new URL('../rsc/images/logo.png', import.meta.url).href;
const sofiaFullBody = new URL('../rsc/images/facesets/Sofia_FullBody.png', import.meta.url).href;
const sofiaPortrait = new URL('../rsc/images/facesets/Sofia_ZoomFace.png', import.meta.url).href;
const studioBackground = new URL('../rsc/images/backgrounds/gravadora.jpg', import.meta.url).href;
const menuBackground = new URL('../rsc/images/backgrounds/menu.jpg', import.meta.url).href;
const iconAudioOn = new URL('../rsc/images/icons/Icone_Audio_Ligado.png', import.meta.url).href;
const iconAudioOff = new URL('../rsc/images/icons/Icone_Audio_Desligado.png', import.meta.url).href;
const iconMoneyWhite = new URL('../rsc/images/icons/Icone_dinheiro.png', import.meta.url).href;
const iconFameWhite = new URL('../rsc/images/icons/fama_borda_branca.png', import.meta.url).href;
const iconFansWhite = new URL('../rsc/images/icons/Fans_borda_branca.png', import.meta.url).href;

const bandLogoFileNames = [
  'logo_1.png',
  'logo_2.png',
  'logo_3.png',
  'logo_4.png',
  'logo_5.png',
  'logo_6.png',
  'logo_7.png',
  'logo_8.png',
  'logo_9.png',
  'logo_10.png',
  'logo_11.png',
  'logo_12.png',
  'logo_13.png',
  'logo_14.png',
  'logo_15.png',
  'logo_16.png',
  'logo_17.png',
  'logo_18.png',
  'logo_19.png',
  'logo_20.png',
  'logo_21.png',
  'logo_22.png',
  'logo_23.png',
  'logo_24.png',
  'logo_25.png',
  'logo_26.png',
  'logo_27.png',
  'logo_28.png',
  'logo_29.png',
  'logo_30.png',
  'logo_31.png',
  'logo_32.png',
  'logo_33.png',
  'logo_34.png',
  'logo_35.png',
  'logo_36.png',
];

const logoAssetMap = import.meta.glob('../rsc/images/logos_banda/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const stageImageAssetMap = import.meta.glob('../rsc/images/palcos/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const logoOptions = bandLogoFileNames.map((fileName) => ({
  id: fileName,
  url: logoAssetMap[`../rsc/images/logos_banda/${fileName}`],
}));

type StageData = {
  IDPalco: number;
  Palco: string;
  Asset: string;
};

const stages = palcosData.palcos as StageData[];
const integerFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 0,
});

const formatInteger = (value: number) => integerFormatter.format(Math.max(0, Math.floor(value)));
const formatMoney = (value: number) => `R$ ${formatInteger(value)}`;
const appBuildVersion = __APP_BUILD_VERSION__;

const resolveStageAsset = (assetPath: string) => {
  if (!assetPath || !assetPath.startsWith('src/')) {
    return menuBackground;
  }

  const viteAssetPath = `../${assetPath.replace(/^src\//, '')}`;
  return stageImageAssetMap[viteAssetPath] ?? menuBackground;
};

type BandHubProps = {
  onStartGame: () => void;
  isMusicEnabled: boolean;
  onToggleMusic: () => void;
};

type SofiaGuideProps = {
  text: string;
  showPortrait?: boolean;
};

const SofiaGuide: React.FC<SofiaGuideProps> = ({ text, showPortrait = true }) => (
  <motion.aside
    className={`sofia-guide ${showPortrait ? '' : 'no-portrait'}`.trim()}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    {showPortrait ? <img src={sofiaPortrait} alt="Sofia portrait" className="sofia-guide-portrait" /> : null}
    <div className="speech-bubble">
      <div className="speech-bubble-head">
        <h3>Sofia</h3>
        <span className="npc-role">Produtora da Hero Music</span>
      </div>
      <p key={text} className="typewriter-text">
        {text}
      </p>
    </div>
  </motion.aside>
);

const BandHub: React.FC<BandHubProps> = ({ onStartGame, isMusicEnabled, onToggleMusic }) => {
  const bands = useGameStore((state) => state.bands);
  const creation = useGameStore((state) => state.creation);
  const activeBandId = useGameStore((state) => state.activeBandId);
  const currentStageId = useGameStore((state) => state.currentStageId);
  const startBandCreation = useGameStore((state) => state.startBandCreation);
  const cancelBandCreation = useGameStore((state) => state.cancelBandCreation);
  const setCreationStep = useGameStore((state) => state.setCreationStep);
  const setCreationLogo = useGameStore((state) => state.setCreationLogo);
  const setCreationName = useGameStore((state) => state.setCreationName);
  const createBandFromDraft = useGameStore((state) => state.createBandFromDraft);
  const selectBand = useGameStore((state) => state.selectBand);

  const currentStage = useMemo(() => {
    return stages.find((stage) => stage.IDPalco === currentStageId) ?? null;
  }, [currentStageId]);

  const currentStageBackground = useMemo(() => {
    return resolveStageAsset(currentStage?.Asset ?? '');
  }, [currentStage]);

  const currentStageName = currentStage?.Palco ?? 'Local atual';

  const handleCreateBand = () => {
    const hasLogo = Boolean(creation.selectedLogoUrl);
    const hasName = creation.draftName.trim().length > 0;

    if (!hasLogo || !hasName) {
      return;
    }

    createBandFromDraft();
    onStartGame();
  };

  const handleOpenBand = (bandId: string) => {
    selectBand(bandId);
    onStartGame();
  };

  const renderAudioToggle = () => (
    <button
      type="button"
      className="menu-audio-toggle"
      onClick={onToggleMusic}
      aria-label={isMusicEnabled ? 'Desativar áudio do jogo' : 'Ativar áudio do jogo'}
    >
      <img src={isMusicEnabled ? iconAudioOn : iconAudioOff} alt="" aria-hidden="true" />
    </button>
  );

  if (!creation.isCreating) {
    return (
      <section className="onboarding-screen menu-scene menu-clean" style={{ backgroundImage: `url(${menuBackground})` }}>
        {renderAudioToggle()}
        <span className="menu-build-version" aria-label={`Versão do jogo ${appBuildVersion}`}>
          v {appBuildVersion}
        </span>
        <motion.div className="backdrop menu-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} />
        <div className="menu-shell">
          <motion.header
            className="menu-header"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img className="hero-logo" src={gameLogo} alt="Hero Music" />
          </motion.header>

          <div className="menu-toolbar">
            {bands.length > 0 ? (
              <motion.button className="primary-btn menu-new-band-btn" type="button" onClick={startBandCreation} whileTap={{ scale: 0.97 }}>
                <FaPlusCircle /> Nova Banda
              </motion.button>
            ) : null}
          </div>

          <div className="band-grid enhanced-grid menu-band-grid">
            {bands.length === 0 ? (
              <div className="menu-empty-action">
                <button className="primary-btn menu-create-btn menu-new-band-btn" type="button" onClick={startBandCreation}>
                  <FaPlusCircle /> Nova Banda
                </button>
              </div>
            ) : (
              bands.map((band) => (
                <motion.button
                  key={band.id}
                  type="button"
                  className={`band-card menu-band-card modern-band-card ${band.id === activeBandId ? 'is-active' : ''}`}
                  whileHover={{ y: -2, scale: 1.005 }}
                  whileTap={{ scale: 0.992 }}
                  transition={{ type: 'spring', stiffness: 230, damping: 24, mass: 0.75 }}
                  onClick={() => handleOpenBand(band.id)}
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.88)), url(${currentStageBackground})`,
                  }}
                >
                  <div className="band-card-top">
                    <img src={band.logoUrl} alt={`Logo ${band.name}`} className="band-logo" />
                    <div className="band-meta">
                      <h3>{band.name}</h3>
                      <p className="band-stage-name">{currentStageName}</p>
                      <p className="band-stage-hint">Toque para entrar no show</p>
                    </div>
                  </div>
                  <div className="band-stats-row">
                    <div className="band-stat-item">
                      <img src={iconMoneyWhite} alt="Dinheiro" />
                      <span>{formatMoney(band.coins)}</span>
                    </div>
                    <div className="band-stat-item">
                      <img src={iconFansWhite} alt="Fãs" />
                      <span>{formatInteger(band.fans)}</span>
                    </div>
                    <div className="band-stat-item">
                      <img src={iconFameWhite} alt="Fama" />
                      <span>{formatInteger(band.reputation)}</span>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>
      </section>
    );
  }

  if (creation.step === 'welcome') {
    return (
      <section className="onboarding-screen welcome-screen" style={{ backgroundImage: `url(${studioBackground})` }}>
        {renderAudioToggle()}
        <motion.div
          className="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        />
        <div className="onboarding-layout">
          <motion.img
            src={sofiaFullBody}
            alt="Sofia"
            className="sofia-full"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="speech-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.45 }}
          >
            <SofiaGuide
              text="Bem-vindo ao Hero Music! Primeiro vamos escolher a logo da sua banda e depois o nome."
              showPortrait={false}
            />
            <div className="onboarding-actions small-actions">
              <button className="secondary-btn small-btn" type="button" onClick={cancelBandCreation} data-click-sfx="close">
                Voltar
              </button>
              <motion.button
                className="primary-btn small-btn"
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setCreationStep('logo')}
              >
                Começar
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (creation.step === 'logo') {
    return (
      <section className="onboarding-screen creation-screen" style={{ backgroundImage: `url(${studioBackground})` }}>
        {renderAudioToggle()}
        <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
        <div className="onboarding-layout">
          <div className="creation-content">
            <div className="setup-panel compact-panel">
              <h2>Escolha a logo da sua banda</h2>
              <p>Toque para selecionar.</p>

              <div className="logo-gallery-scroll">
                <div className="logo-grid compact-logo-grid">
                  {logoOptions.map((logo) => {
                    const selected = creation.selectedLogoUrl === logo.url;

                    return (
                      <motion.button
                        key={logo.id}
                        type="button"
                        className={`logo-choice ${selected ? 'selected' : ''}`}
                        onClick={() => setCreationLogo(logo.url)}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={logo.url} alt={`Logo ${logo.id}`} />
                        {selected && <FaCheckCircle className="selected-icon" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <motion.div className="speech-card bottom-speech" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <SofiaGuide text="Escolha a logo que representa melhor o estilo da sua banda." />
            <div className="onboarding-actions small-actions">
              <button className="secondary-btn small-btn" type="button" onClick={() => setCreationStep('welcome')} data-click-sfx="close">
                Voltar
              </button>
              <button
                className="primary-btn small-btn"
                type="button"
                onClick={() => setCreationStep('name')}
                disabled={!creation.selectedLogoUrl}
              >
                Continuar
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (creation.step === 'final') {
    return (
      <section className="onboarding-screen" style={{ backgroundImage: `url(${studioBackground})` }}>
        {renderAudioToggle()}
        <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} />
        <div className="onboarding-layout">
          <motion.img
            src={sofiaFullBody}
            alt="Sofia"
            className="sofia-full"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div className="speech-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {creation.selectedLogoUrl ? (
              <div className="band-preview-card band-preview-center final-preview">
                <img src={creation.selectedLogoUrl} alt="Logo da banda" />
                <div>
                  <span>Nova banda</span>
                  <strong>{creation.draftName.trim() || 'Sua nova banda'}</strong>
                </div>
              </div>
            ) : null}

            <SofiaGuide
              text={`Perfeito! A banda ${creation.draftName.trim() || 'nova banda'} está pronta. Boa sorte no primeiro show!`}
              showPortrait={false}
            />

            <div className="onboarding-actions small-actions">
              <button className="secondary-btn small-btn" type="button" onClick={() => setCreationStep('name')} data-click-sfx="close">
                Voltar
              </button>
              <button
                className="primary-btn small-btn"
                type="button"
                disabled={!creation.selectedLogoUrl || creation.draftName.trim().length === 0}
                onClick={handleCreateBand}
              >
                Iniciar Banda
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="onboarding-screen creation-screen" style={{ backgroundImage: `url(${studioBackground})` }}>
      {renderAudioToggle()}
      <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} />
      <div className="onboarding-layout">
        <div className="creation-content">
          <div className="setup-panel compact-panel name-panel">
            <h2>Agora dê um nome para sua banda</h2>
            <p>A prévia abaixo atualiza em tempo real.</p>

            {creation.selectedLogoUrl ? (
              <div className="band-preview-card compact-preview band-preview-center">
                <img src={creation.selectedLogoUrl} alt="Logo escolhida" />
                <div>
                  <span>Prévia da banda</span>
                  <strong>{creation.draftName.trim() || 'Sua nova banda'}</strong>
                </div>
              </div>
            ) : (
              <div className="selected-logo-preview compact-preview">
                <span>Escolha uma logo na etapa anterior para ver a prévia completa.</span>
              </div>
            )}

            <label htmlFor="band-name" className="input-label">
              Nome da banda
            </label>
            <input
              id="band-name"
              className="name-input"
              maxLength={28}
              value={creation.draftName}
              onChange={(event) => setCreationName(event.target.value)}
              placeholder="Ex: Midnight Echo"
            />
          </div>
        </div>

        <motion.div className="speech-card bottom-speech" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <SofiaGuide text="Perfeito! Agora digite o nome da banda. A prévia já mostra nome com logo." />
          <div className="onboarding-actions small-actions">
            <button className="secondary-btn small-btn" type="button" onClick={() => setCreationStep('logo')} data-click-sfx="close">
              Voltar
            </button>
            <button
              className="primary-btn small-btn"
              type="button"
              disabled={!creation.selectedLogoUrl || creation.draftName.trim().length === 0}
              onClick={() => setCreationStep('final')}
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BandHub;
