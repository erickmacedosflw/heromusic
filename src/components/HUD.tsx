import React from 'react';
import { useGameStore } from '../state/gameStore';

const HUD: React.FC = () => {
    const score = useGameStore((state) => state.score);
    const combo = useGameStore((state) => state.combo);
    const lastHit = useGameStore((state) => state.lastHit);
    const activeBandId = useGameStore((state) => state.activeBandId);
    const bands = useGameStore((state) => state.bands);
    const activeBand = bands.find((band) => band.id === activeBandId) ?? null;

    return (
        <div className="hud">
            <div className="hud-item">Score: {score}</div>
            <div className="hud-item">Combo: {combo}</div>
            <div className="hud-item">Hit: {lastHit ?? '-'}</div>
            <div className="hud-item">Coins: {activeBand?.coins ?? 0}</div>
            <div className="hud-item">Fans: {activeBand?.fans ?? 0}</div>
        </div>
    );
};

export default HUD;