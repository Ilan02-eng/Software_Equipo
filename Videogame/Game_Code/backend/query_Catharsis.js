import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Bosco7878..",
  database: "catharsis"
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

//Finds a user
export async function getUserByCredentials(lastname, password) {
  return query(
    "SELECT * FROM Username WHERE lastname = ? AND password = ? LIMIT 1",
    [lastname, password]
  );
}

//Finds a user by id
export async function getUserById(user_ID) {
  return query("SELECT * FROM Username WHERE user_ID = ? LIMIT 1", [user_ID]);
}

//Inserts a new user
export async function createUser({ name, lastname, password, age, gender }) {
  const result = await pool.execute(
    "INSERT INTO Username (name, lastname, password, age, gender) VALUES (?, ?, ?, ?, ?)",
    [name, lastname, password, age ?? null, gender ?? null]
  );
  return result[0].insertId;
}

//Links the row to a user
export async function getPlayerByUserId(user_ID) {
  return query(
    "SELECT * FROM Player WHERE user_ID = ? LIMIT 1",
    [user_ID]
  );
}

//Creates the player stats
export async function createPlayer(user_ID, hp = 100, energy = 150) {
  const result = await pool.execute(
    "INSERT INTO Player (user_ID, hp, energy) VALUES (?, ?, ?)",
    [user_ID, hp, energy]
  );
  return result[0].insertId;
}

//Updates hp
export async function updatePlayerStats(player_ID, hp, energy) {
  return pool.execute(
    "UPDATE Player SET hp = ?, energy = ? WHERE player_ID = ?",
    [hp, energy, player_ID]
  );
}

//Opens a new run
export async function createRun(player_ID) {
  const result = await pool.execute(
    "INSERT INTO Run (player_ID, run_result, time) VALUES (?, NULL, NOW())",
    [player_ID]
  );
  return result[0].insertId;
}

//Closes a run
export async function finishRun(run_ID, run_result) {
  return pool.execute(
    "UPDATE Run SET run_result = ?, time = NOW() WHERE run_ID = ?",
    [run_result, run_ID]
  );
}

//Get all runs of a player
export async function getRunsByPlayer(player_ID) {
  return query(
    "SELECT * FROM Run WHERE player_ID = ? ORDER BY time DESC",
    [player_ID]
  );
}

//Return all enemys 
export async function getAllEnemies() {
  return query("SELECT * FROM Enemy ORDER BY enemy_lvl ASC");
}

//Find enemy
export async function getEnemyByName(enemy_name) {
  return query(
    "SELECT * FROM Enemy WHERE enemy_name = ? LIMIT 1",
    [enemy_name]
  );
}

//Return all cards
export async function getAllCards() {
  return query("SELECT * FROM Cards ORDER BY type, cost ASC");
}

//Return one card
export async function getCardByName(name) {
  return query("SELECT * FROM Cards WHERE name = ? LIMIT 1", [name]);
}


//Record the new combat
export async function createCombat(run_ID, enemy_ID, lvl) {
  const result = await pool.execute(
    "INSERT INTO Combat (run_ID, enemy_ID, lvl) VALUES (?, ?, ?)",
    [run_ID, enemy_ID, lvl]
  );
  return result[0].insertId;
}

//Return all combats
export async function getCombatsByRun(run_ID) {
  return query(
    "SELECT * FROM Combat WHERE run_ID = ? ORDER BY combat_ID ASC",
    [run_ID]
  );
}

//Final combat stats
export async function saveCombatStats(combat_ID, { dmg_done, dmg_receive, hp_recovered, cards_used }) {
  const result = await pool.execute(
    `INSERT INTO Combat_Stats (combat_ID, dmg_done, dmg_receive, hp_recovered, cards_used)
     VALUES (?, ?, ?, ?, ?)`,
    [combat_ID, dmg_done, dmg_receive, hp_recovered, cards_used]
  );
  return result[0].insertId;
}

//Combat stats
export async function getStatsByCombat(combat_ID) {
  return query(
    "SELECT * FROM Combat_Stats WHERE combat_ID = ? LIMIT 1",
    [combat_ID]
  );
}

//Record cards played
export async function addRunCard(card_ID, run_ID, combat_ID, quant_limit = 1) {
  return pool.execute(
    `INSERT INTO Run_Cards (card_ID, run_ID, combat_ID, quant_limit)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quant_limit = quant_limit + 1`,
    [card_ID, run_ID, combat_ID, quant_limit]
  );
}

//Get cards
export async function getCardsByRun(run_ID) {
  return query(
    "SELECT * FROM v_cartas_por_run WHERE run_ID = ?",
    [run_ID]
  );
}


//Views
export async function getHistorialByUser(user_ID) {
  return query(
    "SELECT * FROM v_historial_runs WHERE user_ID = ?",
    [user_ID]
  );
}
export async function getRunResumen(run_ID) {
  return query(
    "SELECT * FROM v_runs_resumen WHERE run_ID = ?",
    [run_ID]
  );
}
