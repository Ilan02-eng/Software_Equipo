import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as db from "./query_catharsis.js";

// Load environment variables from the .env file
dotenv.config();

// Create the Express application
const app = express();
const PORT = process.env.PORT ?? 3000;

// Enable CORS and JSON request parsing
app.use(cors());
app.use(express.json());

// Basic health check route
app.get("/", (_req, res) => res.json({ status: "Catharsis API online" }));

// User authentication routes
app.post("/auth/register", async (req, res) => {
  try {
    // Get user data from the request body
    const { username, name, lastname, password, age, gender } = req.body;

    // Validate required fields
    if (!username || !name || !lastname || !password) {
      return res
        .status(400)
        .json({ error: "username, name, lastname and password are required." });
    }

    // Create a new user and its related player profile
    const user_ID = await db.createUser({
      username,
      name,
      lastname,
      password,
      age,
      gender,
    });
    const player_ID = await db.createPlayer(user_ID);

    res.status(201).json({ user_ID, player_ID });
  } catch (err) {
    // Handle database validation errors
    if (err.sqlState === "45000") {
      return res.status(400).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    // Get login credentials
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required." });
    }

    // Search for a user with the given credentials
    const [user] = await db.getUserByCredentials(username, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Get the player profile linked to the user
    const [player] = await db.getPlayerByUserId(user.user_ID);
    if (!player) {
      return res.status(404).json({ error: "Player record not found." });
    }

    res.json({ user, player });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed." });
  }
});

app.get("/users/:user_ID", async (req, res) => {
  try {
    // Get user ID from the URL parameters
    const { user_ID } = req.params;

    // Fetch user information
    const [user] = await db.getUserById(user_ID);
    if (!user) return res.status(404).json({ error: "User not found." });

    // Fetch related player information
    const [player] = await db.getPlayerByUserId(user_ID);

    res.json({ user, player: player ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch user." });
  }
});

// Run routes
app.post("/runs", async (req, res) => {
  try {
    // Start a new run for a specific player
    const { player_ID } = req.body;
    if (!player_ID)
      return res.status(400).json({ error: "player_ID is required." });

    const run_ID = await db.createRun(player_ID);
    res.status(201).json({ run_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start run." });
  }
});

app.patch("/runs/:run_ID/finish", async (req, res) => {
  try {
    // Finish a run with either a Win or Loss result
    const { run_ID } = req.params;
    const { run_result } = req.body;

    if (!["Win", "Loss"].includes(run_result)) {
      return res
        .status(400)
        .json({ error: 'run_result must be "Win" or "Loss".' });
    }

    await db.finishRun(run_ID, run_result);
    res.json({ message: `Run ${run_ID} finished as ${run_result}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not finish run." });
  }
});

app.get("/runs/player/:player_ID", async (req, res) => {
  try {
    // Get all runs created by a specific player
    const { player_ID } = req.params;
    const runs = await db.getRunsByPlayer(player_ID);

    res.json(runs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch runs." });
  }
});

app.get("/runs/:run_ID/summary", async (req, res) => {
  try {
    // Get a summary of a specific run
    const { run_ID } = req.params;
    const [summary] = await db.getRunResumen(run_ID);

    if (!summary) return res.status(404).json({ error: "Run not found." });

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch summary." });
  }
});

app.get("/users/:user_ID/history", async (req, res) => {
  try {
    // Get the full game history of a specific user
    const { user_ID } = req.params;
    const history = await db.getHistorialByUser(user_ID);

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch history." });
  }
});

// Combat routes
app.post("/combats", async (req, res) => {
  try {
    // Create a new combat for a run
    const { run_ID, enemy_name, enemy_lvl } = req.body;

    if (!run_ID || !enemy_name || enemy_lvl === undefined) {
      return res
        .status(400)
        .json({ error: "run_ID, enemy_name and enemy_lvl are required." });
    }

    // Search the enemy in the database before creating the combat
    const [enemy] = await db.getEnemyByName(enemy_name);
    if (!enemy) {
      return res
        .status(404)
        .json({ error: `Enemy "${enemy_name}" not found in DB.` });
    }

    const combat_ID = await db.createCombat(run_ID, enemy.enemy_ID, enemy_lvl);
    res.status(201).json({ combat_ID, enemy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create combat." });
  }
});
