import React, { useEffect, useState } from 'react';
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
            const cleanupUnlock = setupThemeMusicUnlock();
            return cleanupUnlock;
        }

        pauseThemeMusic();
    }, [currentScene, isMusicEnabled]);

    useEffect(() => {
        const resumeThemeIfNeeded = () => {
            if (currentScene !== 'menu' || !isMusicEnabled) {
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