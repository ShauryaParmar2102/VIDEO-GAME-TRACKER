const express = require("express");
const fs = require("fs");

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
//Any file in the Public folder can be accessed in browser
app.use(express.static("public")); 

// File storing games
const data_file = "games.json";

// Helper functions
const PlayedGames = () => {
    if (!fs.existsSync(data_file)) return []; // If file doesn't exist, return empty array
    const data = fs.readFileSync(data_file);
    return JSON.parse(data);
};

const writeGames = (games) => {
    fs.writeFileSync(data_file, JSON.stringify(games, null, 2));
};

// POST a new game
app.post("/games", (req, res) => {
    const { title, company, status, description } = req.body;

    if (!title || !company) {
        return res.status(400).json({ error: "Title and Company are required" });
    }

    const games = PlayedGames();

    // Check for duplicate
    const duplicate = games.find(
        g =>
            g.title.trim().toLowerCase() === title.trim().toLowerCase() &&
            g.company.trim().toLowerCase() === company.trim().toLowerCase()
    );

    if (duplicate) {
        return res.status(400).json({ error: "This game already exists" });
    }

    
    
    const newGame = {
        id: Date.now().toString(),
        title: title.trim(),
        company: company.trim(),
        status: status || "Unplayed",
        description: description || "",
        //gets current date and time
        date: new Date().toLocaleString() 
        // toLocaleString is what sets the timestamp
    };

    games.push(newGame);
    writeGames(games);

    res.status(201).json(newGame);
});

// GET all games (with optional status/search filter)
app.get("/games", (req, res) => {
    let games = PlayedGames();
    const { status, search } = req.query;

    if (status) {
        games = games.filter(g => g.status === status);
    }

    if (search) {
        const s = search.toLowerCase();
        games = games.filter(
            g =>
                g.title.toLowerCase().includes(s) ||
                g.company.toLowerCase().includes(s)
        );
    }

    res.json(games);
});

// GET a game by ID
app.get("/games/:id", (req, res) => {
    const games = PlayedGames();
    const game = games.find(g => g.id === req.params.id);

    if (!game) return res.status(404).json({ error: "Game not found" });

    res.json(game);
});




// DELETE a game by ID
app.delete("/games/:id", (req, res) => {
    let games = PlayedGames();
    const filtered = games.filter(g => g.id !== req.params.id);

    if (filtered.length === games.length) {
        return res.status(404).json({ error: "Game not found" });
    }

    writeGames(filtered);
    res.json({ message: "Game deleted" });
});

//Toggle Status of Game - Played/Unplayed
app.put("/games/:id/status", (req, res) => {
    let games = PlayedGames();

    const game = games.find(g => g.id === req.params.id);

    if(!game) {
        return res.status(404).json({ error: "Game not found" });
    }

    game.status = game.status === "Played" ? "Unplayed" : "Played";

        writeGames(games);
        res.json(game);
    });


// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});