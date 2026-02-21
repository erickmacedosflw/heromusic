export type GameObject = {
    id: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    velocity: { x: number; y: number };
};

export type GameState = {
    score: number;
    health: number;
    level: number;
    isGameOver: boolean;
};

export type InputState = {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    space: boolean;
};

export interface Scene {
    preload(): void;
    create(): void;
    update(deltaTime: number): void;
}

export interface GameEvent {
    type: string;
    payload: any;
}