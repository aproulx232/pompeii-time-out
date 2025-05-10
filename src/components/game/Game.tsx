import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
        // Load game assets here
    }

    create() {
        // Create game objects here
        this.add.text(400, 300, 'Welcome to Phaser!', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }

    update() {
        // Game loop logic here
    }
}

const Game: React.FC = () => {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (gameRef.current) return;

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            backgroundColor: '#2d2d2d',
            scene: MainScene,
            parent: 'game-container',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 300 },
                    debug: false
                }
            }
        };

        gameRef.current = new Phaser.Game(config);

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div 
            id="game-container" 
            style={{ 
                width: '100%', 
                height: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
            }}
        />
    );
};

export default Game; 