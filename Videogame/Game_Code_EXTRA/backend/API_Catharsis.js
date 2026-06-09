import express    from "express";
import cors       from "cors";
import dotenv     from "dotenv";
import * as db    from "./query_catharsis.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ status: "Catharsis API online" }));

//Authentification of the users
app.post("/auth/register", async (req, res) => {
  try {
    const { name, lastname, password, age, gender } = req.body;

    if (!name || !lastname || !password) {
      return res.status(400).json({ error: "name, lastname and password are required." });
    }

    const user_ID   = await db.createUser({ name, lastname, password, age, gender });
    const player_ID = await db.createPlayer(user_ID);

    res.status(201).json({ user_ID, player_ID });
  } catch (err) {
    if (err.sqlState === "45000") {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "Registration failed." });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { lastname, password } = req.body;

    if (!lastname || !password) {
      return res.status(400).json({ error: "lastname and password are required." });
    }

    const [user] = await db.getUserByCredentials(lastname, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

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
    const { user_ID } = req.params;

    const [user] = await db.getUserById(user_ID);
    if (!user) return res.status(404).json({ error: "User not found." });

    const [player] = await db.getPlayerByUserId(user_ID);

    res.json({ user, player: player ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch user." });
  }
});

//Runs
app.post("/runs", async (req, res) => {
  try {
    const { player_ID } = req.body;
    if (!player_ID) return res.status(400).json({ error: "player_ID is required." });

    const run_ID = await db.createRun(player_ID);
    res.status(201).json({ run_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start run." });
  }
});

app.patch("/runs/:run_ID/finish", async (req, res) => {
  try {
    const { run_ID }    = req.params;
    const { run_result } = req.body;

    if (!["Win", "Loss"].includes(run_result)) {
      return res.status(400).json({ error: 'run_result must be "Win" or "Loss".' });
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
    const { run_ID } = req.params;
    const [summary]  = await db.getRunResumen(run_ID);
    if (!summary) return res.status(404).json({ error: "Run not found." });
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch summary." });
  }
});


app.get("/users/:user_ID/history", async (req, res) => {
  try {
    const { user_ID } = req.params;
    const history     = await db.getHistorialByUser(user_ID);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch history." });
  }
});

// Combat
app.post("/combats", async (req, res) => {
  try {
    const { run_ID, enemy_name, enemy_lvl } = req.body;

    if (!run_ID || !enemy_name || enemy_lvl === undefined) {
      return res.status(400).json({ error: "run_ID, enemy_name and enemy_lvl are required." });
    }

    const [enemy] = await db.getEnemyByName(enemy_name);
    if (!enemy) {
      return res.status(404).json({ error: `Enemy "${enemy_name}" not found in DB.` });
    }

    const combat_ID = await db.createCombat(run_ID, enemy.enemy_ID, enemy_lvl);
    res.status(201).json({ combat_ID, enemy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create combat." });
  }
});

app.get("/combats/run/:run_ID", async (req, res) => {
  try {
    const { run_ID } = req.params;
    const combats    = await db.getCombatsByRun(run_ID);
    res.json(combats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch combats." });
  }
});


app.post("/combats/:combat_ID/stats", async (req, res) => {
  try {
    const { combat_ID } = req.params;
    const { dmg_done, dmg_receive, hp_recovered, cards_used } = req.body;

    const combat_stats_ID = await db.saveCombatStats(combat_ID, {
      dmg_done:     dmg_done     ?? 0,
      dmg_receive:  dmg_receive  ?? 0,
      hp_recovered: hp_recovered ?? 0,
      cards_used:   cards_used   ?? 0,
    });

    res.status(201).json({ combat_stats_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save combat stats." });
  }
});

app.get("/combats/:combat_ID/stats", async (req, res) => {
  try {
    const { combat_ID } = req.params;
    const [stats]       = await db.getStatsByCombat(combat_ID);
    if (!stats) return res.status(404).json({ error: "Stats not found." });
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch stats." });
  }
});

// Cards
app.get("/cards", async (_req, res) => {
  try {
    const cards = await db.getAllCards();
    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch cards." });
  }
});

app.post("/runs/:run_ID/cards", async (req, res) => {
  try {
    const { run_ID }               = req.params;
    const { card_name, combat_ID } = req.body;

    if (!card_name || !combat_ID) {
      return res.status(400).json({ error: "card_name and combat_ID are required." });
    }

    const [card] = await db.getCardByName(card_name);
    if (!card) return res.status(404).json({ error: `Card "${card_name}" not found in DB.` });

    await db.addRunCard(card.card_ID, run_ID, combat_ID);
    res.status(201).json({ message: "Card recorded." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not record card." });
  }
});

app.get("/runs/:run_ID/cards", async (req, res) => {
  try {
    const { run_ID } = req.params;
    const cards      = await db.getCardsByRun(run_ID);
    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch run cards." });
  }
});

//Enemy catalog
app.get("/enemies", async (_req, res) => {
  try {
    const enemies = await db.getAllEnemies();
    res.json(enemies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch enemies." });
  }
});

//Player stats
app.patch("/players/:player_ID", async (req, res) => {
  try {
    const { player_ID }  = req.params;
    const { hp, energy } = req.body;

    if (hp === undefined || energy === undefined) {
      return res.status(400).json({ error: "hp and energy are required." });
    }

    await db.updatePlayerStats(player_ID, hp, energy);
    res.json({ message: "Player stats updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update player." });
  }
});

app.listen(PORT, () => {
  console.log(`Catharsis API running on http://localhost:${PORT}`);
});
