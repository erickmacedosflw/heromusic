import React from 'react';

type MenuSceneProps = {
    onStartGame: () => void;
};

const MenuScene: React.FC<MenuSceneProps> = ({ onStartGame }) => {
    return React.createElement(
        'section',
        { className: 'menu-scene' },
        React.createElement('h2', null, 'MenuScene placeholder'),
        React.createElement('button', { type: 'button', onClick: onStartGame }, 'Start')
    );
};

export default MenuScene;