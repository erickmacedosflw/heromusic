import React from 'react';

type GameSceneProps = {
    onBackToMenu: () => void;
};

class GameScene extends React.Component<GameSceneProps> {
    render() {
        return React.createElement(
            'section',
            { className: 'game-scene' },
            React.createElement('h2', null, 'GameScene placeholder'),
            React.createElement('button', { type: 'button', onClick: this.props.onBackToMenu }, 'Back')
        );
    }
}

export default GameScene;