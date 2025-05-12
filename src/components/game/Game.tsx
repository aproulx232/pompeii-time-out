import React, { useEffect, useRef, useState } from 'react';
import './Game.css';

interface GameState {
    pastConsole: string[];
    presentConsole: string[];
    currentLocation: string;
    inventory: string[];
    hasDiscoveredAncientConsole: boolean;
    hasOpenedVase: boolean;
}

const commands = [
    {
        command: 'look',
        description: 'Examine your current location'
    },
    {
        command: 'take [item]',
        description: 'Pick up an item from your current location'
    },
    {
        command: 'inventory',
        description: 'Check what items you are carrying'
    },
    {
        command: 'go [direction]',
        description: 'Move to a different location (north, south, east, west)'
    },
    {
        command: 'help',
        description: 'Show this list of commands'
    },
    {
        command: 'open [item]',
        description: 'Open an item from your inventory'
    }
];

// Vase name variations
const vaseNames = [
    'ancient_vase',
    'vase',
    'ancient vase',
    'old vase',
    'roman vase',
    'pompeii vase',
    'ceramic vase',
    'antique vase',
    'mysterious vase',
    'strange vase'
];

const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>({
        pastConsole: [],
        presentConsole: [
            'You stand in the ruins of Pompeii, the ancient city preserved by the eruption of Mount Vesuvius.',
            'The air is still, and the stone streets tell stories of a civilization frozen in time.',
            'Type "look" to examine your surroundings.'
        ],
        currentLocation: 'main_square',
        inventory: [],
        hasDiscoveredAncientConsole: false,
        hasOpenedVase: false
    });

    const [input, setInput] = useState('');
    const pastConsoleRef = useRef<HTMLDivElement>(null);
    const presentConsoleRef = useRef<HTMLDivElement>(null);

    const locations = {
        main_square: {
            past: 'The Forum of Pompeii is alive with merchants, citizens, and Roman soldiers. The air is filled with the sounds of commerce and daily life.',
            present: 'The Forum is now an archaeological site. You can see the remains of columns and buildings, preserved in time. A peculiar ancient vase catches your attention.',
            items: {
                past: ['ancient_coin', 'market_basket'],
                present: ['ancient_vase', 'tourist_map']
            }
        },
        temple: {
            past: 'The Temple of Jupiter stands tall, with priests performing their daily rituals. The smell of incense fills the air.',
            present: 'The temple ruins show the grandeur of Roman architecture. Some columns still stand, while others lie in pieces.',
            items: {
                past: ['incense', 'ceremonial_vessel'],
                present: ['broken_column_fragment', 'guidebook']
            }
        }
    };

    const isVaseCommand = (item: string): boolean => {
        return vaseNames.some(vaseName => 
            item.toLowerCase().includes(vaseName.toLowerCase())
        );
    };

    const handleCommand = (command: string, timePeriod: 'past' | 'present') => {
        const newState = { ...gameState };
        const console = timePeriod === 'past' ? newState.pastConsole : newState.presentConsole;
        
        // Process commands
        const cmd = command.toLowerCase().trim();
        
        if (cmd === 'help') {
            console.push(`> ${command}`);
            console.push('Available commands:');
            commands.forEach(cmd => {
                console.push(`${cmd.command} - ${cmd.description}`);
            });
        } else if (cmd.startsWith('look')) {
            const location = locations[gameState.currentLocation as keyof typeof locations];
            console.push(`> ${command}`);
            console.push(location[timePeriod]);
        } else if (cmd.startsWith('take')) {
            const item = cmd.split(' ').slice(1).join(' '); // Get all words after 'take'
            const location = locations[gameState.currentLocation as keyof typeof locations];
            
            if (isVaseCommand(item) && location.items[timePeriod].includes('ancient_vase')) {
                newState.inventory.push('ancient_vase');
                console.push(`> ${command}`);
                console.push('You carefully pick up the ancient vase. It feels strangely warm to the touch.');
            } else if (location.items[timePeriod].includes(item)) {
                newState.inventory.push(item);
                console.push(`> ${command}`);
                console.push(`You picked up the ${item}`);
            } else {
                console.push(`> ${command}`);
                console.push("You don't see that item here.");
            }
        } else if (cmd.startsWith('open')) {
            const item = cmd.split(' ').slice(1).join(' '); // Get all words after 'open'
            
            if (isVaseCommand(item) && newState.inventory.includes('ancient_vase') && !newState.hasOpenedVase) {
                newState.hasOpenedVase = true;
                newState.hasDiscoveredAncientConsole = true;
                newState.pastConsole = [
                    'As you open the ancient vase, a strange sensation washes over you...',
                    'Suddenly, you find yourself connected to the consciousness of Marcus, a citizen of ancient Pompeii.',
                    'Through this mystical connection, you can now perceive both time periods simultaneously.',
                    'Marcus is unaware of your presence, but you can see through his eyes and experience his world.',
                    'Type "look" to see what Marcus sees in ancient Pompeii.'
                ];
                console.push(`> ${command}`);
                console.push('As you open the vase, a brilliant light emanates from within. You feel a strange connection forming...');
            } else if (isVaseCommand(item) && !newState.inventory.includes('ancient_vase')) {
                console.push(`> ${command}`);
                console.push("You need to take the vase first before you can open it.");
            } else if (isVaseCommand(item) && newState.hasOpenedVase) {
                console.push(`> ${command}`);
                console.push("The vase is already open, and its magic has been released.");
            } else {
                console.push(`> ${command}`);
                console.push("You can't open that.");
            }
        } else if (cmd === 'inventory') {
            console.push(`> ${command}`);
            console.push('Your inventory: ' + (newState.inventory.length ? newState.inventory.join(', ') : 'empty'));
        } else if (cmd.startsWith('go')) {
            const direction = cmd.split(' ')[1];
            console.push(`> ${command}`);
            console.push(`You can't go ${direction} from here.`);
        } else {
            console.push(`> ${command}`);
            console.push("I don't understand that command. Type 'help' for a list of commands.");
        }

        setGameState(newState);
    };

    const handleSubmit = (e: React.FormEvent, timePeriod: 'past' | 'present') => {
        e.preventDefault();
        if (input.trim()) {
            handleCommand(input, timePeriod);
            setInput('');
        }
    };

    useEffect(() => {
        if (pastConsoleRef.current) {
            pastConsoleRef.current.scrollTop = pastConsoleRef.current.scrollHeight;
        }
        if (presentConsoleRef.current) {
            presentConsoleRef.current.scrollTop = presentConsoleRef.current.scrollHeight;
        }
    }, [gameState]);

    return (
        <div className="game-container">
            <div className="console-container">
                <div className="console present-console">
                    <h2>Pompeii</h2>
                    <div className="console-output" ref={presentConsoleRef}>
                        {gameState.presentConsole.map((line, i) => (
                            <div key={i} className="console-line">{line}</div>
                        ))}
                    </div>
                    <form onSubmit={(e) => handleSubmit(e, 'present')}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter command..."
                        />
                    </form>
                </div>
                {gameState.hasDiscoveredAncientConsole && (
                    <div className="console past-console">
                        <h2>Ancient Pompeii (79 AD)</h2>
                        <div className="console-output" ref={pastConsoleRef}>
                            {gameState.pastConsole.map((line, i) => (
                                <div key={i} className="console-line">{line}</div>
                            ))}
                        </div>
                        <form onSubmit={(e) => handleSubmit(e, 'past')}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter command..."
                            />
                        </form>
                    </div>
                )}
                <div className="commands-panel">
                    <h3>Available Commands</h3>
                    <ul className="command-list">
                        {commands.map((cmd, index) => (
                            <li key={index}>
                                <div className="command">{cmd.command}</div>
                                <div className="description">{cmd.description}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Game; 