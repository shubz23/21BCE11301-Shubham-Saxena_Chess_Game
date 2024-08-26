# Knight's Arena

A chess-inspired game where strategy meets real-time action.
```HitWicket Software Engineer assignment```

## 🛡️ Project Overview
Knight's Arena is a thrilling turn-based game, drawing inspiration from chess, designed with a server-client architecture. Utilizing WebSocket for real-time communication, the game pits two players against each other on a compact 5x5 grid, with each player controlling characters that have unique movement abilities.

## 🗂️ Directory Structure

![Screenshot 2024-08-26 at 10 43 01 PM](https://github.com/user-attachments/assets/16bf7f2f-0d5d-40fb-aa44-f88941d6df89)

### Client Directory

**index.html:** Defines the structure of the game board and user interface.
**style.css:** Provides the aesthetic style of the game board and pieces.
**client.js:** Handles game logic, including piece movement and interactions.

### Server Directory
**server.js:** Establishes the server using Express and manages WebSocket communication for real-time game updates.

## 📜 Game Rules

1. **Piece Movement:**
   - **Pawn (P1, P2, P3):** Moves one block in any direction (L, R, F, B).
   - **Hero1 (H1):** Moves exactly two blocks in any straight direction (L, R, F, B) and captures opponent pieces.
   - **Hero2 (H2):** Moves exactly two blocks diagonally (FL, FR, BL, BR) and captures opponent pieces.

2. **Player Interaction:**
   - Players will take turns selecting a piece and move it using the following commands:
     - **F** (Forward)
     - **L** (Left)
     - **B** (Backward)
     - **R** (Right)
     - **FL** (Forward-Left)
     - **FR** (Forward-Right)
     - **BL** (Backward-Left)
     - **BR** (Backward-Right)
   - Each move will be executed, and the board will be updated accordingly.

3. **Turn Exchange:**
   - Players will alternate turns, with one turn per player.

4. **Board Updates and Captures:**
   - The board will be updated after each valid move.
   - Captures will be handled if an opponent's piece is in the path of a Hero piece's movement.

5. **Move History:**
   - A move history will be maintained and displayed during the game. (e.g., "Player A moved P1 Forward").

## 💻 Technologies Used
**Frontend:** HTML, CSS, JavaScript
**Backend:** Node.js with Express
**Communication:** WebSockets

![Screenshot 2024-08-26 at 10 55 22 PM](https://github.com/user-attachments/assets/060fd9b8-ca97-4d87-8be9-70281c6be40f)


## 🚀 Setup and Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/shubz23/21BCE11301-Shubham-Saxena_Chess_Game
   ```

2. **Navigate to the Project Directory:**

    ```bash
    cd <project-directory>
    ```
3. **Install Dependencies:**

   ```bash
   npm install
   ```

4. **Start the Server:**

   ```bash
   node Server/server.js
   ```
The server will start and listen on port 8081 by default. You can access it at http://localhost:8081.

##  🔐 Invalid Moves

The game enforces valid moves. If you attempt an invalid move, you'll need to choose again. Here are some examples of invalid moves: 
*Selecting an opponent's character. 
*Moving a character outside the grid boundaries.
*Making a move that violates your character's movement pattern (e.g., Pawn moving diagonally). 
*Attacking a friendly character.

##  🔒 Dependencies

Express: Web server framework.
ws: WebSocket library for real-time communication.
