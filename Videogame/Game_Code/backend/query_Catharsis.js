import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Create a MySQL connection pool for efficient database access
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "catharsis",
});

// Generic helper function to execute SQL queries
async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Find a user by username and password
export async function getUserByCredentials(username, password) {
  return query(
    "SELECT * FROM Username WHERE username = ? AND password = ? LIMIT 1",
    [username, password],
  );
}

// Find a user by their ID
export async function getUserById(user_ID) {
  return query("SELECT * FROM Username WHERE user_ID = ? LIMIT 1", [user_ID]);
}

// Create a new user record
export async function createUser({
  username,
  name,
  lastname,
  password,
  age,
  gender,
}) {
  const result = await pool.execute(
    "INSERT INTO Username (username, name, lastname, password, age, gender) VALUES (?, ?, ?, ?, ?, ?)",
    [username, name, lastname, password, age ?? null, gender ?? null],
  );

  return result[0].insertId;
}

// Retrieve the player profile associated with a user
export async function getPlayerByUserId(user_ID) {
  return query("SELECT * FROM Player WHERE user_ID = ? LIMIT 1", [user_ID]);
}

// Create default player statistics for a new user
export async function createPlayer(user_ID, hp = 100, energy = 150) {
  const result = await pool.execute(
    "INSERT INTO Player (user_ID, hp, energy) VALUES (?, ?, ?)",
    [user_ID, hp, energy],
  );

  return result[0].insertId;
}

// Update player's HP and energy values
export async function updatePlayerStats(player_ID, hp, energy) {
  return pool.execute(
    "UPDATE Player SET hp = ?, energy = ? WHERE player_ID = ?",
    [hp, energy, player_ID],
  );
}

// Create a new game run
export async function createRun(player_ID) {
  const result = await pool.execute(
    "INSERT INTO Run (player_ID, run_result, time) VALUES (?, NULL, NOW())",
    [player_ID],
  );

  return result[0].insertId;
}

// Mark a run as completed and save the result
export async function finishRun(run_ID, run_result) {
  return pool.execute(
    "UPDATE Run SET run_result = ?, time = NOW() WHERE run_ID = ?",
    [run_result, run_ID],
  );
}

// Retrieve all runs for a specific player
export async function getRunsByPlayer(player_ID) {
  return query("SELECT * FROM Run WHERE player_ID = ? ORDER BY time DESC", [
    player_ID,
  ]);
}

// Retrieve all enemies ordered by level
export async function getAllEnemies() {
  return query("SELECT * FROM Enemy ORDER BY enemy_lvl ASC");
}

// Find an enemy by name
export async function getEnemyByName(enemy_name) {
  return query("SELECT * FROM Enemy WHERE enemy_name = ? LIMIT 1", [
    enemy_name,
  ]);
}

// Retrieve the complete card catalog
export async function getAllCards() {
  return query("SELECT * FROM Cards ORDER BY type, cost ASC");
}

// Find a card by name
export async function getCardByName(name) {
  return query("SELECT * FROM Cards WHERE name = ? LIMIT 1", [name]);
}

// Register a new combat encounter
export async function createCombat(run_ID, enemy_ID, lvl) {
  const result = await pool.execute(
    "INSERT INTO Combat (run_ID, enemy_ID, lvl) VALUES (?, ?, ?)",
    [run_ID, enemy_ID, lvl],
  );

  return result[0].insertId;
}

// Retrieve all combats associated with a run
export async function getCombatsByRun(run_ID) {
  return query("SELECT * FROM Combat WHERE run_ID = ? ORDER BY combat_ID ASC", [
    run_ID,
  ]);
}

// Save combat statistics after a battle
export async function saveCombatStats(
  combat_ID,
  { dmg_done, dmg_receive, hp_recovered, cards_used },
) {
  const result = await pool.execute(
    `INSERT INTO Combat_Stats
     (combat_ID, dmg_done, dmg_receive, hp_recovered, cards_used)
     VALUES (?, ?, ?, ?, ?)`,
    [combat_ID, dmg_done, dmg_receive, hp_recovered, cards_used],
  );

  return result[0].insertId;
}

// Retrieve statistics for a specific combat
export async function getStatsByCombat(combat_ID) {
  return query("SELECT * FROM Combat_Stats WHERE combat_ID = ? LIMIT 1", [
    combat_ID,
  ]);
}

// Record a card used during a run
// If the card already exists, increase its quantity counter
export async function addRunCard(card_ID, run_ID, combat_ID, quant_limit = 1) {
  return pool.execute(
    `INSERT INTO Run_Cards (card_ID, run_ID, combat_ID, quant_limit)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quant_limit = quant_limit + 1`,
    [card_ID, run_ID, combat_ID, quant_limit],
  );
}

// Retrieve all cards used during a run
export async function getCardsByRun(run_ID) {
  return query("SELECT * FROM v_cartas_por_run WHERE run_ID = ?", [run_ID]);
}

// Retrieve a user's complete run history
export async function getHistorialByUser(user_ID) {
  return query("SELECT * FROM v_historial_runs WHERE user_ID = ?", [user_ID]);
}

// Retrieve a summarized view of a run
export async function getRunResumen(run_ID) {
  return query("SELECT * FROM v_runs_resumen WHERE run_ID = ?", [run_ID]);
}
