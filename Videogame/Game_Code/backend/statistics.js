import express    from "express";
import cors       from "cors";
import mysql from "mysql2";

const app = express();
app.use(cors());

//Conection pool
const pool = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'Bosco7878..',
    database: "catharsis"
}).promise()
    
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}
 
//Errores en pool
pool.on('error', (err) => {
  console.error('Error en el pool de MySQL:', err.message);
});
 
app.get('/api/stats', async (req, res) => {
  try {
    //Jugadores con al menos una run
    const players = await query(`
      SELECT DISTINCT u.user_ID, u.name
      FROM Username u
      INNER JOIN Player p ON u.user_ID   = p.user_ID
      INNER JOIN Run    r ON p.player_ID = r.player_ID
      ORDER BY u.name
    `);
 
    if (players.length === 0) {
      return res.json([]); 
    }
 
    // Runs + stats por jugador
    const result = [];
 
    for (const player of players) {
      const rows = await query(`
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
      `, [player.user_ID]);
 
      const runs = rows.map(r => ({
        dmgDone:  r.dmg_done,
        dmgRecv:  r.dmg_receive,
        time:     r.combates * 60,   
        cards:    r.cards_used,
        heal:     r.hp_recovered,
        complete: r.run_result === 'Win',
      }));
 
      if (runs.length > 0) {
        result.push({ name: player.name, runs });
      }
    }
 
    res.json(result);
 
  } catch (err) {
    console.error('Error en /api/stats:', err.message);
    // Tipo de error 
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(500).json({ error: 'Credenciales de MySQL incorrectas. Revisa user/password en statistics.js' });
    }
    if (err.code === 'ECONNREFUSED') {
      return res.status(500).json({ error: 'No se pudo conectar a MySQL. ¿Está corriendo el servidor?' });
    }
    if (err.code === 'ER_BAD_DB_ERROR') {
      return res.status(500).json({ error: 'La base de datos "catharsis" no existe. Ejecuta el script SQL primero.' });
    }
    res.status(500).json({ error: err.message });
  }
});
 
app.get('/api/health', (req, res) => res.json({ ok: true }));
 
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Stats: http://localhost:${PORT}/api/stats`);
});