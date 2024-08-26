const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('Client'));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'index.html'));
});

// Initial game state
let initialGameState = {
    grid: [
        ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3']
    ],
    turn: 'A',
    winner: null,
    moves: []
};

let gameState = { ...initialGameState };

// Function to reset the game state
const resetGameState = () => {
    gameState = { ...initialGameState };
};

// Broadcast the game state to all connected clients
const broadcastGameState = () => {
    const stateMessage = JSON.stringify({ type: 'state', state: gameState });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(stateMessage);
        }
    });
    console.log('Broadcasted game state:', gameState);
};

// Check for a winner after each move
const checkForWinner = () => {
    const playerAHasCharacters = gameState.grid.flat().some(cell => cell && cell.startsWith('A-'));
    const playerBHasCharacters = gameState.grid.flat().some(cell => cell && cell.startsWith('B-'));

    if (!playerAHasCharacters) {
        gameState.winner = 'B';
    } else if (!playerBHasCharacters) {
        gameState.winner = 'A';
    }
};

// Handle client connection and messages
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ type: 'state', state: gameState }));

    ws.on('message', (message) => {
        console.log('Received message:', message);
        const data = JSON.parse(message);

        if (data.type === 'move') {
            const { player, character, direction } = data;

            if (gameState.turn !== player) {
                ws.send(JSON.stringify({ type: 'error', message: 'Not your turn!' }));
                console.log('Error: Not your turn!');
                return;
            }

            const [row, col] = findCharacterPosition(`${player}-${character}`);
            if (row === null || col === null) {
                ws.send(JSON.stringify({ type: 'error', message: 'Character not found!' }));
                console.log('Error: Character not found!');
                return;
            }

            let newRow = row;
            let newCol = col;

            try {
                switch (character) {
                    case 'P1':
                    case 'P2':
                    case 'P3':
                        // Pawn movement
                        switch (direction) {
                            case 'L': newCol = Math.max(0, col - 1); break;
                            case 'R': newCol = Math.min(4, col + 1); break;
                            case 'F': newRow = gameState.turn === 'A' ? Math.min(4, row + 1) : Math.max(0, row - 1); break;
                            case 'B': newRow = gameState.turn === 'A' ? Math.max(0, row - 1) : Math.min(4, row + 1); break;
                        }
                        break;
                    case 'H1':
                        // Hero1 movement
                        switch (direction) {
                            case 'L': newRow = row; newCol = Math.max(0, col - 2); break;
                            case 'R': newRow = row; newCol = Math.min(4, col + 2); break;
                            case 'F': newRow = gameState.turn === 'A' ? Math.min(4, row + 2) : Math.max(0, row - 2); newCol = col; break;
                            case 'B': newRow = gameState.turn === 'A' ? Math.max(0, row - 2) : Math.min(4, row + 2); newCol = col; break;
                        }
                        break;
                    case 'H2':
                        // Hero2 movement
                        switch (direction) {
                            case 'FL': newRow = gameState.turn === 'A' ? Math.min(4, row + 2) : Math.max(0, row - 2); newCol = Math.max(0, col - 2); break;
                            case 'FR': newRow = gameState.turn === 'A' ? Math.min(4, row + 2) : Math.max(0, row - 2); newCol = Math.min(4, col + 2); break;
                            case 'BL': newRow = gameState.turn === 'A' ? Math.max(0, row - 2) : Math.min(4, row + 2); newCol = Math.max(0, col - 2); break;
                            case 'BR': newRow = gameState.turn === 'A' ? Math.max(0, row - 2) : Math.min(4, row + 2); newCol = Math.min(4, col + 2); break;
                        }
                        break;
                }

                if (gameState.grid[newRow][newCol] && gameState.grid[newRow][newCol].startsWith(player)) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: `Invalid Move :Cannot move to cell occupied by your own piece! Cell value: ${gameState.grid[newRow][newCol]}`
                    }));
                    console.log(`Invalid Move :Cannot move to cell occupied by your own piece! Cell value: ${gameState.grid[newRow][newCol]}`);
                    return;
                }

                // Only Hero1 and Hero2 can capture
                if (character === 'H1' || character === 'H2') {
                    removeOpponentCharactersInPath(row, col, newRow, newCol, character);
                }

                // Move the character
                gameState.grid[row][col] = null;
                gameState.grid[newRow][newCol] = `${player}-${character}`;

                console.log('Updated game state:', gameState);

                checkForWinner();
                if (gameState.winner) {
                    broadcastGameState();
                    console.log('Game over. Winner:', gameState.winner);

                    // Optionally, automatically reset the game state after a delay
                    setTimeout(() => {
                        resetGameState();
                        broadcastGameState();
                    }, 5000); // 5 seconds delay before restarting
                    return;
                }

                gameState.turn = gameState.turn === 'A' ? 'B' : 'A';
                broadcastGameState();
            } catch (error) {
                ws.send(JSON.stringify({ type: 'error', message: 'Invalid move!' }));
                console.log('Error:', error.message);
            }
        } else if (data.type === 'restart') {
            // Handle game restart request
            resetGameState();
            broadcastGameState();
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Find the position of a character on the grid
const findCharacterPosition = (character) => {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (gameState.grid[i][j] === character) {
                return [i, j];
            }
        }
    }
    return [null, null];
};

// Remove opponent characters in the path of H1 or H2
const removeOpponentCharactersInPath = (row1, col1, row2, col2, character) => {
    // Only proceed if the character is H1 or H2
    if (character !== 'H1' && character !== 'H2') {
        return;
    }

    const directionRow = Math.sign(row2 - row1);
    const directionCol = Math.sign(col2 - col1);

    let currentRow = row1 + directionRow;
    let currentCol = col1 + directionCol;

    while (currentRow !== row2 || currentCol !== col2) {
        if (currentRow >= 0 && currentRow < 5 && currentCol >= 0 && currentCol < 5) {
            if (gameState.grid[currentRow][currentCol] && !gameState.grid[currentRow][currentCol].startsWith(character.charAt(0))) {
                // Remove the opponent's character
                gameState.grid[currentRow][currentCol] = null;
            }
        }
        currentRow += directionRow;
        currentCol += directionCol;
    }
};

server.listen(8081, () => {
    console.log('Server is listening on port 8081');
});
