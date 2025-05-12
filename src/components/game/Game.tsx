import React, { useEffect, useRef, useState } from 'react';
import './Game.css';

interface GameState {
    pastConsole: string[];
    presentConsole: string[];
    currentLocation: string;
    inventory: string[];
    hasDiscoveredAncientConsole: boolean;
    hasOpenedVase: boolean;
    timePortalActive: boolean;
    unlockedLocations: string[];
    convincedResidents: string[];
    isMapOpen: boolean;
    questProgress: {
        foundVolcanicEvidence: boolean;
        foundHistoricalMap: boolean;
        foundProphecy: boolean;
        unlockedTemple: boolean;
        unlockedVilla: boolean;
        unlockedHarbor: boolean;
    };
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
        description: 'Open an item from your inventory or a door'
    },
    {
        command: 'talk [person]',
        description: 'Speak with a person in your location (past only)'
    },
    {
        command: 'status',
        description: 'Check your current quest progress'
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
            'As a volcanologist studying the site, you believe you may have found a way to warn the ancient residents.',
            'Type "look" to examine your surroundings.'
        ],
        currentLocation: 'main_square',
        inventory: [],
        hasDiscoveredAncientConsole: false,
        hasOpenedVase: false,
        timePortalActive: false,
        unlockedLocations: ['main_square'],
        convincedResidents: [],
        isMapOpen: false,
        questProgress: {
            foundVolcanicEvidence: false,
            foundHistoricalMap: false,
            foundProphecy: false,
            unlockedTemple: false,
            unlockedVilla: false,
            unlockedHarbor: false
        }
    });

    const [input, setInput] = useState('');
    const pastConsoleRef = useRef<HTMLDivElement>(null);
    const presentConsoleRef = useRef<HTMLDivElement>(null);

    const locations = {
        main_square: {
            past: 'The Forum of Pompeii is alive with merchants, citizens, and Roman soldiers. The air is filled with the sounds of commerce and daily life. A city official stands near the entrance to the Temple of Jupiter.',
            present: 'The Forum is now an archaeological site. You can see the remains of columns and buildings, preserved in time. A peculiar ancient vase catches your attention.',
            items: {
                past: ['ancient_coin', 'scroll'],
                present: ['ancient_vase', 'tourist_map']
            },
            exits: {
                north: 'temple',
                east: 'villa',
                south: 'harbor'
            },
            npcs: {
                past: ['city_official']
            },
            locked: false
        },
        temple: {
            past: 'The Temple of Jupiter stands tall, with priests performing their daily rituals. The smell of incense fills the air. A large wooden door appears to lead to a secret chamber.',
            present: 'The temple ruins show the grandeur of Roman architecture. Some columns still stand, while others lie in pieces. There appears to be a sealed chamber that archaeologists haven\'t opened yet.',
            items: {
                past: ['incense', 'ceremonial_key'],
                present: ['broken_column_fragment', 'geological_survey']
            },
            exits: {
                south: 'main_square'
            },
            npcs: {
                past: ['high_priest']
            },
            locked: true
        },
        villa: {
            past: 'A wealthy Roman\'s villa with elaborate frescoes depicting Mount Vesuvius. The owner seems to be an important senator who has influence in the city.',
            present: 'This excavated villa is famous for its well-preserved frescoes. One fresco seems to show Mount Vesuvius before the eruption, looking very different from today.',
            items: {
                past: ['senator\'s_seal', 'villa_key'],
                present: ['volcanic_rock_sample', 'ancient_scroll_case']
            },
            exits: {
                west: 'main_square'
            },
            npcs: {
                past: ['senator']
            },
            locked: true
        },
        harbor: {
            past: 'The bustling harbor of Pompeii, with ships coming and going. Sailors and merchants from across the Mediterranean gather here.',
            present: 'Archaeological excavations have revealed the ancient harbor structures. The sea is now much further away due to changes in the coastline following the eruption.',
            items: {
                past: ['sailor\'s_chart', 'harbor_master\'s_log'],
                present: ['modern_seismic_report', 'historical_accounts']
            },
            exits: {
                north: 'main_square'
            },
            npcs: {
                past: ['harbor_master', 'foreign_merchant']
            },
            locked: true
        }
    };

    // NPC dialogue and quest hints
    const npcDialogues = {
        city_official: {
            greeting: 'Greetings citizen. I oversee the affairs of Pompeii. Strange things have been happening lately...',
            convinced: 'You speak of a mountain that spews fire? I\'ve heard tales of such things from foreign lands, but never here. Show me proof and I might listen.',
            convinced_with_evidence: 'These documents and that strange rock... they cannot be dismissed. I will speak with the council about preparing evacuations, but I need the approval of the high priest and senator as well.'
        },
        high_priest: {
            greeting: 'The gods watch over Pompeii. What brings you to the temple?',
            convinced: 'You speak of doom and destruction? Such prophecies are not to be taken lightly. Our sacred texts mention signs before disasters. If you find such signs, bring them to me.',
            convinced_with_evidence: 'The tremors, the sulfurous waters, the dying plants around the mountain - these are indeed the signs mentioned in our oldest prophecies. I will support the evacuation order.'
        },
        senator: {
            greeting: 'I have little time for common folk. State your business quickly.',
            convinced: 'An eruption? Preposterous! My family has lived in the shadow of that mountain for generations. Nothing has ever happened.',
            convinced_with_evidence: 'These records from other lands... the scientific documents... I cannot ignore such evidence. My family and investments must be protected. I will support the evacuation.'
        },
        harbor_master: {
            greeting: 'Welcome to the harbor of Pompeii. All ships must be registered and pay the proper fees.',
            convinced: 'Evacuate the entire city? That would require every ship in the harbor and more. I couldn\'t authorize such a thing without proper approval.',
            convinced_with_evidence: 'With these official seals and orders, I can begin arranging ships for evacuation. I\'ll need time to gather enough vessels for everyone.'
        }
    };

    // Evidence needed to convince each NPC
    const requiredEvidence = {
        city_official: ['volcanic_rock_sample', 'historical_accounts'],
        high_priest: ['geological_survey', 'ancient_scroll_case'],
        senator: ['modern_seismic_report', 'senator\'s_seal'],
        harbor_master: ['city_official', 'high_priest', 'senator'] // Requires convincing the others first
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
            
            // List exits
            const availableExits = Object.entries(location.exits)
                .filter(([_, destination]) => {
                    const destLocation = locations[destination as keyof typeof locations];
                    return !destLocation.locked || newState.unlockedLocations.includes(destination);
                })
                .map(([direction, _]) => direction);
            
            if (availableExits.length > 0) {
                console.push(`Exits: ${availableExits.join(', ')}`);
            } else {
                console.push('There are no obvious exits.');
            }
            
            // List items
            const visibleItems = location.items[timePeriod];
            if (visibleItems && visibleItems.length > 0) {
                console.push(`You can see: ${visibleItems.join(', ')}`);
            }
            
            // List NPCs for past time period
            if (timePeriod === 'past' && location.npcs && location.npcs.past.length > 0) {
                console.push(`People here: ${location.npcs.past.join(', ')}`);
            }
        } else if (cmd.startsWith('take')) {
            const item = cmd.split(' ').slice(1).join(' '); // Get all words after 'take'
            const location = locations[gameState.currentLocation as keyof typeof locations];
            
            if (isVaseCommand(item) && location.items[timePeriod].includes('ancient_vase')) {
                newState.inventory.push('ancient_vase');
                console.push(`> ${command}`);
                console.push('You carefully pick up the ancient vase. It feels strangely warm to the touch.');
            } else if (location.items[timePeriod].includes(item)) {
                newState.inventory.push(item);
                location.items[timePeriod] = location.items[timePeriod].filter(i => i !== item);
                console.push(`> ${command}`);
                console.push(`You picked up the ${item}`);
                
                // Track quest progress based on special items
                if (item === 'volcanic_rock_sample' || item === 'modern_seismic_report') {
                    newState.questProgress.foundVolcanicEvidence = true;
                    if (timePeriod === 'present') {
                        console.push('This evidence might help convince people in the past about the volcanic threat.');
                    }
                }
                if (item === 'historical_accounts' || item === 'ancient_scroll_case') {
                    newState.questProgress.foundHistoricalMap = true;
                    if (timePeriod === 'present') {
                        console.push('These historical records might help people in the past understand the danger.');
                    }
                }
                if (item === 'ceremonial_key') {
                    console.push('This key looks like it might unlock an important chamber in the temple.');
                }
                if (item === 'villa_key') {
                    console.push('This key appears to grant access to the senator\'s private villa.');
                }
            } else {
                console.push(`> ${command}`);
                console.push("You don't see that item here.");
            }
        } else if (cmd.startsWith('open')) {
            const item = cmd.split(' ').slice(1).join(' '); // Get all words after 'open'
            
            if (item === 'tourist_map' || item === 'map') {
                if (newState.inventory.includes('tourist_map')) {
                    newState.isMapOpen = !newState.isMapOpen;
                    console.push(`> ${command}`);
                    if (newState.isMapOpen) {
                        console.push('You open the tourist map, showing the layout of ancient Pompeii.');
                    } else {
                        console.push('You fold the map and put it away.');
                    }
                } else {
                    console.push(`> ${command}`);
                    console.push("You don't have a map to open. Try finding a tourist map first.");
                }
            } else if (isVaseCommand(item) && newState.inventory.includes('ancient_vase') && !newState.hasOpenedVase) {
                newState.hasOpenedVase = true;
                newState.hasDiscoveredAncientConsole = true;
                newState.timePortalActive = true;
                newState.pastConsole = [
                    'As you open the ancient vase, a strange sensation washes over you...',
                    'Suddenly, you find yourself connected to the consciousness of Marcus, a citizen of ancient Pompeii.',
                    'Through this mystical connection, you can now perceive both time periods simultaneously.',
                    'Marcus is unaware of your presence, but you can see through his eyes and experience his world.',
                    'Type "look" to see what Marcus sees in ancient Pompeii.',
                    'You now share an inventory with Marcus - items you collect in either time period can be used in both.',
                    'Your mission: Find evidence of the coming eruption and convince key people to evacuate the city.',
                    'You\'ll also need Marcus to unlock doors in the past that will give you access to new areas in the present.'
                ];
                console.push(`> ${command}`);
                console.push('As you open the vase, a brilliant light emanates from within. You feel a strange connection forming...');
            } else if (cmd === 'open door' || cmd === 'open chamber') {
                if (timePeriod === 'past' && gameState.currentLocation === 'temple' && newState.inventory.includes('ceremonial_key')) {
                    console.push(`> ${command}`);
                    console.push('You use the ceremonial key to unlock the temple chamber. Inside, you find ancient scrolls and a stone tablet with what appears to be a prophecy about a mountain that "breathes fire and stone".');
                    newState.questProgress.unlockedTemple = true;
                    newState.unlockedLocations.push('temple');
                    console.push('This action seems to have affected the present timeline as well.');
                } else if (timePeriod === 'past' && gameState.currentLocation === 'villa' && newState.inventory.includes('villa_key')) {
                    console.push(`> ${command}`);
                    console.push('You unlock the private chambers of the villa. Inside, you find valuable documents and personal correspondences of the senator.');
                    newState.questProgress.unlockedVilla = true;
                    newState.unlockedLocations.push('villa');
                    console.push('This action seems to have affected the present timeline as well.');
                } else {
                    console.push(`> ${command}`);
                    console.push("It's locked or you don't have the right key.");
                }
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
            const inventoryList = newState.inventory.length ? newState.inventory.join(', ') : 'empty';
            
            if (timePeriod === 'past') {
                console.push(`Marcus is carrying: ${inventoryList}`);
            } else {
                console.push(`Your inventory: ${inventoryList}`);
            }
            
            if (newState.timePortalActive) {
                console.push("(Items in your inventory are accessible in both time periods)");
            }
        } else if (cmd.startsWith('go')) {
            const direction = cmd.split(' ')[1];
            const currentLocation = locations[gameState.currentLocation as keyof typeof locations];
            
            if (currentLocation.exits && currentLocation.exits[direction as keyof typeof currentLocation.exits]) {
                const nextLocation = currentLocation.exits[direction as keyof typeof currentLocation.exits] as string;
                const nextLocationData = locations[nextLocation as keyof typeof locations];
                
                if (!nextLocationData.locked || newState.unlockedLocations.includes(nextLocation)) {
                    newState.currentLocation = nextLocation;
                    console.push(`> ${command}`);
                    console.push(`You go ${direction}.`);
                    
                    // Show the new location description
                    console.push(nextLocationData[timePeriod]);
                } else {
                    console.push(`> ${command}`);
                    if (timePeriod === 'present') {
                        console.push("This area is inaccessible in the present. Perhaps Marcus can unlock it in the past?");
                    } else {
                        console.push("You can't go that way. It seems to be locked or blocked.");
                    }
                }
            } else {
                console.push(`> ${command}`);
                console.push(`You can't go ${direction} from here.`);
            }
        } else if (cmd.startsWith('talk')) {
            if (timePeriod !== 'past') {
                console.push(`> ${command}`);
                console.push("There's no one here to talk to in the present time.");
                return;
            }
            
            const npcName = cmd.split(' ').slice(1).join('_').toLowerCase();
            const currentLocation = locations[gameState.currentLocation as keyof typeof locations];
            
            if (currentLocation.npcs && currentLocation.npcs.past.includes(npcName)) {
                console.push(`> ${command}`);
                const npc = npcDialogues[npcName as keyof typeof npcDialogues];
                
                // Check if already convinced
                if (newState.convincedResidents.includes(npcName)) {
                    console.push(`${npcName.replace('_', ' ')}: "I'm already convinced of the danger. We must prepare to evacuate."`);
                    return;
                }
                
                // Check if player has the evidence to convince this NPC
                const evidence = requiredEvidence[npcName as keyof typeof requiredEvidence];
                let hasAllEvidence = true;
                
                if (Array.isArray(evidence)) {
                    for (const item of evidence) {
                        if (!newState.inventory.includes(item) && !newState.convincedResidents.includes(item)) {
                            hasAllEvidence = false;
                            break;
                        }
                    }
                }
                
                if (hasAllEvidence) {
                    console.push(`${npcName.replace('_', ' ')}: "${npc.convinced_with_evidence}"`);
                    newState.convincedResidents.push(npcName);
                    
                    // Check if this completes a quest objective
                    if (newState.convincedResidents.includes('city_official') && 
                        newState.convincedResidents.includes('high_priest') && 
                        newState.convincedResidents.includes('senator')) {
                        console.push('You have convinced the key city leaders! Now you should speak with the harbor master to arrange the evacuation.');
                    }
                    
                    if (npcName === 'harbor_master' && 
                        newState.convincedResidents.includes('city_official') && 
                        newState.convincedResidents.includes('high_priest') && 
                        newState.convincedResidents.includes('senator')) {
                        console.push('The harbor master agrees to arrange ships for evacuation! The people of Pompeii will be saved from the coming disaster.');
                        console.push('Congratulations! You have completed the main quest and saved the people of Pompeii from the eruption of Mount Vesuvius.');
                    }
                } else {
                    if (npcName === 'harbor_master' && 
                        (!newState.convincedResidents.includes('city_official') || 
                         !newState.convincedResidents.includes('high_priest') || 
                         !newState.convincedResidents.includes('senator'))) {
                        console.push(`${npcName.replace('_', ' ')}: "I cannot arrange an evacuation without approval from the city official, high priest, and senator. Convince them first."`);
                    } else {
                        console.push(`${npcName.replace('_', ' ')}: "${npc.greeting}"`);
                        console.push(`${npcName.replace('_', ' ')}: "${npc.convinced}"`);
                    }
                }
            } else {
                console.push(`> ${command}`);
                console.push("There's no one by that name here.");
            }
        } else if (cmd === 'status') {
            console.push(`> ${command}`);
            console.push('--- QUEST STATUS ---');
            
            if (!newState.timePortalActive) {
                console.push('You need to find and open the ancient vase to begin your mission.');
            } else {
                // Evidence collection
                console.push('Evidence collected:');
                if (newState.questProgress.foundVolcanicEvidence) {
                    console.push('✓ Volcanic evidence (can help prove the danger)');
                } else {
                    console.push('✗ Still need to find volcanic evidence');
                }
                
                if (newState.questProgress.foundHistoricalMap) {
                    console.push('✓ Historical records (can help convince skeptics)');
                } else {
                    console.push('✗ Still need to find historical records');
                }
                
                // Unlocked areas
                console.push('\nAreas unlocked by Marcus:');
                if (newState.unlockedLocations.includes('temple')) {
                    console.push('✓ Temple chamber unlocked');
                } else {
                    console.push('✗ Temple chamber still locked');
                }
                
                if (newState.unlockedLocations.includes('villa')) {
                    console.push('✓ Senator\'s villa unlocked');
                } else {
                    console.push('✗ Senator\'s villa still locked');
                }
                
                if (newState.unlockedLocations.includes('harbor')) {
                    console.push('✓ Harbor office unlocked');
                } else {
                    console.push('✗ Harbor office still locked');
                }
                
                // People convinced
                console.push('\nPeople convinced:');
                if (newState.convincedResidents.includes('city_official')) {
                    console.push('✓ City Official convinced');
                } else {
                    console.push('✗ Need to convince the City Official');
                }
                
                if (newState.convincedResidents.includes('high_priest')) {
                    console.push('✓ High Priest convinced');
                } else {
                    console.push('✗ Need to convince the High Priest');
                }
                
                if (newState.convincedResidents.includes('senator')) {
                    console.push('✓ Senator convinced');
                } else {
                    console.push('✗ Need to convince the Senator');
                }
                
                if (newState.convincedResidents.includes('harbor_master')) {
                    console.push('✓ Harbor Master convinced - EVACUATION UNDERWAY!');
                } else {
                    console.push('✗ Need to convince the Harbor Master to arrange evacuation');
                }
            }
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

    // Add map display component
    const MapDisplay = () => {
        const locationPositions = {
            main_square: { x: 50, y: 50 },
            temple: { x: 50, y: 20 },
            villa: { x: 80, y: 50 },
            harbor: { x: 50, y: 80 }
        };
        
        return (
            <div className="map-container">
                <h3>Map of Pompeii</h3>
                <div className="map">
                    {Object.entries(locationPositions).map(([location, pos]) => {
                        const isCurrentLocation = gameState.currentLocation === location;
                        const isUnlocked = gameState.unlockedLocations.includes(location) || location === 'main_square';
                        
                        return (
                            <div 
                                key={location}
                                className={`map-location ${isCurrentLocation ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'}`}
                                style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`
                                }}
                            >
                                <div className="location-name">{location.replace('_', ' ')}</div>
                            </div>
                        );
                    })}
                    
                    {/* Draw paths between locations */}
                    <div className="map-path north" style={{ top: '35%', left: '50%', height: '15%' }}></div>
                    <div className="map-path east" style={{ top: '50%', left: '65%', width: '15%' }}></div>
                    <div className="map-path south" style={{ top: '65%', left: '50%', height: '15%' }}></div>
                </div>
                <div className="map-legend">
                    <div><span className="legend-current"></span> Current Location</div>
                    <div><span className="legend-unlocked"></span> Unlocked</div>
                    <div><span className="legend-locked"></span> Locked</div>
                </div>
            </div>
        );
    };

    return (
        <div className="game-container">
            <div className="console-container">
                <div className="consoles-row">
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
                </div>
                
                <div className="game-panels">
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
                    
                    {gameState.isMapOpen && <MapDisplay />}
                </div>
            </div>
        </div>
    );
};

export default Game;