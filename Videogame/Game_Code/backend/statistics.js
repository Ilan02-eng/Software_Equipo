import express from "express";
import cors from "cors";
import mysql from "mysql2";

// Create the Express application
const app = express();

// Enable CORS to allow requests from other origins
app.use(cors());

// Create a MySQL connection pool
const pool = mysql
  .createPool({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "Bosco7878..",
    database: "catharsis",
  })
  .promise();

// Helper function to execute SQL queries
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Handle MySQL pool errors
pool.on("error", (err) => {
  console.error("MySQL pool error:", err.message);
});

app.get("/api/stats", async (req, res) => {
  try {
    // Get all players that have at least one run
    const players = await query(`
      SELECT DISTINCT u.user_ID, u.name
      FROM Username u
      INNER JOIN Player p ON u.user_ID   = p.user_ID
      INNER JOIN Run    r ON p.player_ID = r.player_ID
      ORDER BY u.name
    `);

    // Return an empty array if there are no players with runs
    if (players.length === 0) {
      return res.json([]);
    }

    // Store the final statistics grouped by player
    const result = [];

    for (const player of players) {
      // Get all runs and accumulated combat statistics for each player
      const rows = await query(
        `
        SELECT
          r.run_ID,
          r.run_result,
          COALESCE(SUM(cs.dmg_done),    0) AS dmg_done,
          COALESCE(SUM(cs.dmg_receive), 0) AS dmg_receive,
          COALESCE(SUM(cs.hp_recovered),0) AS hp_recovered,
          COALESCE(SUM(cs.cards_used),  0) AS cards_used,
          COUNT(c.combat_ID)               AS combates
        FROM Run r
        INNER JOIN Player       pl ON r.player_ID  = pl.player_ID
        INNER JOIN Username     u  ON pl.user_ID   = u.user_ID
        LEFT  JOIN Combat       c  ON r.run_ID     = c.run_ID
        LEFT  JOIN Combat_Stats cs ON c.combat_ID  = cs.combat_ID
        WHERE u.user_ID = ?
        GROUP BY r.run_ID, r.run_result
        ORDER BY r.run_ID ASC
      `,
        [player.user_ID],
      );

      // Format database results for the frontend
      const runs = rows.map((r) => ({
        dmgDone: r.dmg_done,
        dmgRecv: r.dmg_receive,
        time: r.combates * 60, // Estimate time based on number of combats
        cards: r.cards_used,
        heal: r.hp_recovered,
        complete: r.run_result === "Win",
      }));

      // Only add players that have at least one run
      if (runs.length > 0) {
        result.push({ name: player.name, runs });
      }
    }

    // Send the formatted statistics as JSON
    res.json(result);
  } catch (err) {
    console.error("Error in /api/stats:", err.message);

    // Handle specific MySQL connection or configuration errors
    if (err.code === "ER_ACCESS_DENIED_ERROR") {
      return res.status(500).json({
        error:
          "Incorrect MySQL credentials. Check user/password in statistics.js",
      });
    }

    if (err.code === "ECONNREFUSED") {
      return res.status(500).json({
        error: "Could not connect to MySQL. Is the server running?",
      });
    }

    if (err.code === "ER_BAD_DB_ERROR") {
      return res.status(500).json({
        error:
          'The database "catharsis" does not exist. Run the SQL script first.',
      });
    }

    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint to verify that the server is running
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Start the server on port 3001
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Stats: http://localhost:${PORT}/api/stats`);
});
