import React, { useEffect, useRef, useState } from 'react';
import BootScene from './game/scenes/BootScene';
import BandHub from './components/BandHub';
import BandGame from './components/BandGame';
import useGameLoop from './hooks/useGameLoop';
import { useGameStore } from './state/gameStore';
import { setupGlobalUiClickSound } from './utils/clickAudio';
import { disposeThemeMusic, pauseThemeMusic, playThemeMusic, setupThemeMusicUnlock } from './utils/themeAudio';

const App: React.FC = () => {
    const [currentScene, setCurrentScene] = useState<'boot' | 'menu' | 'game'>('boot');
    const isLoaded = useGameStore((state) => state.isLoaded);
    const activeBandId = useGameStore((state) => state.activeBandId);
    const isMusicEnabled = useGameStore((state) => state.audioSettings.musicEnabled);
    const setMusicEnabled = useGameStore((state) => state.setMusicEnabled);
    const sceneRef = useRef(currentScene);
    const musicEnabledRef = useRef(isMusicEnabled);

    useEffect(() => {
        sceneRef.current = currentScene;
    }, [currentScene]);

    useEffect(() => {
        musicEnabledRef.current = isMusicEnabled;
    }, [isMusicEnabled]);

    useEffect(() => {
        if (isLoaded) {
            setCurrentScene('menu');
        }
    }, [isLoaded]);

    useGameLoop();

    useEffect(() => {
        const cleanup = setupGlobalUiClickSound();
        return cleanup;
    }, []);

    useEffect(() => {
        const shouldPlayTheme = currentScene === 'menu' && isMusicEnabled;

        if (shouldPlayTheme) {
            playThemeMusic();
            const cleanupUnlock = setupThemeMusicUnlock(() => sceneRef.current === 'menu' && musicEnabledRef.current);
            return cleanupUnlock;
        }

        if (!isMusicEnabled || currentScene === 'boot') {
            pauseThemeMusic();
        }
    }, [currentScene, isMusicEnabled]);

    useEffect(() => {
        const resumeThemeIfNeeded = () => {
            if (!isMusicEnabled) {
                pauseThemeMusic();
                return;
            }

            if (currentScene !== 'menu') {
                return;
            }

            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                return;
            }

            playThemeMusic();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                resumeThemeIfNeeded();
            }
        };

        const handlePageShow = () => {
            resumeThemeIfNeeded();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, [currentScene, isMusicEnabled]);

    useEffect(() => {
        const enforceThemeByScene = () => {
            const shouldPlayTheme = sceneRef.current === 'menu' && musicEnabledRef.current;

            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
                return;
            }

            if (shouldPlayTheme) {
                playThemeMusic();
                return;
            }

            if (!musicEnabledRef.current) {
                pauseThemeMusic();
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                enforceThemeByScene();
            }
        };

        const handlePageShow = () => {
            enforceThemeByScene();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    useEffect(() => {
        return () => {
            disposeThemeMusic();
        };
    }, []);

    const handleToggleMusic = () => {
        setMusicEnabled(!isMusicEnabled);
    };

    const renderScene = () => {
        switch (currentScene) {
            case 'boot':
                return <BootScene onLoadComplete={() => setCurrentScene('menu')} />;
            case 'menu':
                return (
                    <BandHub
                        onStartGame={() => setCurrentScene('game')}
                        isMusicEnabled={isMusicEnabled}
                        onToggleMusic={handleToggleMusic}
                    />
                );
            case 'game':
                return <BandGame onBackToMenu={() => setCurrentScene('menu')} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        if (currentScene === 'game' && !activeBandId) {
            setCurrentScene('menu');
        }
    }, [activeBandId, currentScene]);

    return (
        <div className="game-container">
            {renderScene()}
        </div>
    );
};

export default App;