import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { BootScene } from './scenes/BootScene';

class GameEngine {
    private currentScene: any;

    constructor() {
        this.currentScene = new BootScene(this);
    }

    public start() {
        this.gameLoop();
    }

    private gameLoop = () => {
        this.update();
        this.render();
        requestAnimationFrame(this.gameLoop);
    };

    private update() {
        if (this.currentScene) {
            this.currentScene.update();
        }
    }

    private render() {
        if (this.currentScene) {
            this.currentScene.render();
        }
    }

    public changeScene(scene: string) {
        switch (scene) {
            case 'menu':
                this.currentScene = new MenuScene(this);
                break;
            case 'game':
                this.currentScene = new GameScene(this);
                break;
            default:
                this.currentScene = new BootScene(this);
                break;
        }
    }
}

export default GameEngine;