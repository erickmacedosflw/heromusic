import React, { useEffect } from 'react';
import { useGameStore } from '../../state/gameStore';

type BootSceneProps = {
    onLoadComplete: () => void;
};

const BootScene: React.FC<BootSceneProps> = ({ onLoadComplete }) => {
    const setLoaded = useGameStore((state) => state.setLoaded);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoaded(true);
            onLoadComplete();
        }, 400);

        return () => clearTimeout(timeout);
    }, [onLoadComplete, setLoaded]);

    return React.createElement('div', { className: 'boot-scene' }, 'Loading assets...');
};

export default BootScene;