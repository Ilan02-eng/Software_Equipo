CREATE SCHEMA catharsis;
USE catharsis;

#Username
CREATE TABLE Username (
    user_ID     SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)         NOT NULL,
    lastname    VARCHAR(50)         NOT NULL,
    password    CHAR(12)            NOT NULL,
    age         TINYINT UNSIGNED,
    gender      ENUM('Male','Female'),
    KEY key_lastname(lastname),
    KEY key_password(password),
    CONSTRAINT pk_username PRIMARY KEY (user_ID)
) ENGINE=InnoDB;
#Player
CREATE TABLE Player (
    player_ID   SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    user_ID     SMALLINT UNSIGNED   NOT NULL,
    hp          SMALLINT UNSIGNED,
    energy      TINYINT UNSIGNED,
    KEY key_hp(hp),
    KEY key_energy(energy),
    CONSTRAINT pk_player PRIMARY KEY (player_ID),
    CONSTRAINT fk_player_user
        FOREIGN KEY (user_ID) REFERENCES Username(user_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
#Run
CREATE TABLE Run (
    run_ID      MEDIUMINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    player_ID   SMALLINT UNSIGNED   NOT NULL,
    run_result  ENUM('Win','Loss'),
    time        DATETIME,
    CONSTRAINT pk_run PRIMARY KEY (run_ID),
    CONSTRAINT fk_run_player
        FOREIGN KEY (player_ID) REFERENCES Player(player_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
#Enemy
CREATE TABLE Enemy (
    enemy_ID    SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    hp_min      SMALLINT UNSIGNED,
    hp_max      SMALLINT UNSIGNED,
    dmg_min     TINYINT UNSIGNED,
    dmg_max     TINYINT UNSIGNED,
    enemy_lvl   TINYINT UNSIGNED,
    enemy_name  VARCHAR(30),
    KEY key_hp_min(hp_min),
    KEY key_hp_max(hp_max),
    KEY key_dmg_min(dmg_min),
    KEY key_dmg_max(dmg_max),
    KEY key_enemy_lvl(enemy_lvl),
    CONSTRAINT pk_enemy PRIMARY KEY (enemy_ID)
) ENGINE=InnoDB;
#Cards
CREATE TABLE Cards (
    card_ID          SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    type             ENUM('Attack','Defense','Control','Wildcard'),
    name             VARCHAR(50),
    effect           VARCHAR(40),
    target           ENUM('Enemy','Self'),
    what_effect      VARCHAR(255),
    cost_source      ENUM('Energy','HP'),
    cost             TINYINT UNSIGNED,
    sprite_reference VARCHAR(255),
    KEY key_type(type),
    KEY key_target(target),
    KEY key_cost_source(Cost_source),
    CONSTRAINT pk_cards PRIMARY KEY (card_ID)
) ENGINE=InnoDB;
#Combat
CREATE TABLE Combat (
    combat_ID   MEDIUMINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    run_ID      MEDIUMINT UNSIGNED  NOT NULL,
    enemy_ID    SMALLINT UNSIGNED   NOT NULL,
    lvl         TINYINT UNSIGNED,
    KEY key_lvl(lvl),
    CONSTRAINT pk_combat PRIMARY KEY (combat_ID),
    CONSTRAINT fk_combat_run
        FOREIGN KEY (run_ID)   REFERENCES Run(run_ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_combat_enemy
        FOREIGN KEY (enemy_ID) REFERENCES Enemy(enemy_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
#Run Cards
CREATE TABLE Run_Cards (
    card_ID     SMALLINT UNSIGNED   NOT NULL,
    run_ID      MEDIUMINT UNSIGNED  NOT NULL,
    combat_ID   MEDIUMINT UNSIGNED  NOT NULL,
    quant_limit TINYINT UNSIGNED,
    CONSTRAINT pk_run_cards PRIMARY KEY (card_ID, run_ID, combat_ID),
    CONSTRAINT fk_runcards_card
        FOREIGN KEY (card_ID)   REFERENCES Cards(card_ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_runcards_run
        FOREIGN KEY (run_ID)    REFERENCES Run(run_ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_runcards_combat
        FOREIGN KEY (combat_ID) REFERENCES Combat(combat_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
#Combat Stats
CREATE TABLE Combat_Stats (
    combat_stats_ID MEDIUMINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    combat_ID       MEDIUMINT UNSIGNED  NOT NULL,
    dmg_done        SMALLINT UNSIGNED,
    dmg_receive     SMALLINT UNSIGNED,
    hp_recovered    SMALLINT UNSIGNED,
    cards_used      TINYINT UNSIGNED,
    KEY key_dmg_donde(dmg_done),
    KEY key_dmg_recive(dmg_receive),
    KEY key_hp_recovered(hp_recovered),
    KEY key_cards_used(cards_used),
    CONSTRAINT pk_combat_stats PRIMARY KEY (combat_stats_ID),
    CONSTRAINT fk_combatstats_combat
        FOREIGN KEY (combat_ID) REFERENCES Combat(combat_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

#VIEWS

#1. Run history per player 
CREATE VIEW v_historial_runs AS
SELECT
    u.user_ID,
    u.name,
    u.lastname,
    r.run_ID,
    r.run_result,
    r.time
FROM Username u
INNER JOIN Player  p ON u.user_ID   = p.user_ID
INNER JOIN Run     r ON p.player_ID = r.player_ID;

#2. Run summary with total combats per run
CREATE VIEW v_runs_resumen AS
SELECT
    r.run_ID,
    u.name,
    u.lastname,
    r.run_result,
    r.time,
    COUNT(c.combat_ID) AS total_combates
FROM Run      r
INNER JOIN Player   p ON r.player_ID = p.player_ID
INNER JOIN Username u ON p.user_ID   = u.user_ID
LEFT  JOIN Combat   c ON r.run_ID    = c.run_ID
GROUP BY r.run_ID, u.name, u.lastname, r.run_result, r.time;

#3. Cards used per run 
CREATE VIEW v_cartas_por_run AS
SELECT
    rc.run_ID,
    rc.combat_ID,
    ca.card_ID,
    ca.name        AS carta_nombre,
    ca.type        AS carta_tipo,
    ca.cost_source,
    ca.cost,
    rc.quant_limit
FROM Run_Cards rc
INNER JOIN Cards ca ON rc.card_ID = ca.card_ID;

#4. Full deck available per run 
CREATE VIEW v_mazo_por_run AS
SELECT
    rc.run_ID,
    ca.card_ID,
    ca.name                  AS carta_nombre,
    ca.type                  AS carta_tipo,
    ca.effect,
    ca.target,
    ca.cost_source,
    ca.cost,
    SUM(rc.quant_limit)      AS cantidad_total
FROM Run_Cards rc
INNER JOIN Cards ca ON rc.card_ID = ca.card_ID
GROUP BY rc.run_ID, ca.card_ID, ca.name, ca.type,
         ca.effect, ca.target, ca.cost_source, ca.cost;

#5. Runs with their cards and final result
CREATE VIEW v_runs_con_cartas AS
SELECT
    u.name,
    u.lastname,
    r.run_ID,
    r.run_result,
    r.time,
    ca.name        AS carta_nombre,
    ca.type        AS carta_tipo,
    rc.combat_ID,
    rc.quant_limit
FROM Run        r
INNER JOIN Player    p  ON r.player_ID  = p.player_ID
INNER JOIN Username  u  ON p.user_ID    = u.user_ID
INNER JOIN Run_Cards rc ON r.run_ID     = rc.run_ID
INNER JOIN Cards     ca ON rc.card_ID   = ca.card_ID;

#6. Full combat stats per combat
CREATE VIEW v_stats_combate AS
SELECT
    cs.combat_stats_ID,
    cs.combat_ID,
    c.run_ID,
    e.enemy_name,
    e.enemy_lvl,
    cs.dmg_done,
    cs.dmg_receive,
    cs.hp_recovered,
    cs.cards_used
FROM Combat_Stats cs
INNER JOIN Combat c ON cs.combat_ID = c.combat_ID
INNER JOIN Enemy  e ON c.enemy_ID   = e.enemy_ID;

#7. Win/Loss record per player
CREATE VIEW v_record_jugador AS
SELECT
    u.user_ID,
    u.name,
    u.lastname,
    COUNT(r.run_ID)                                         AS total_runs,
    SUM(r.run_result = 'Win')                               AS wins,
    SUM(r.run_result = 'Loss')                              AS losses,
    ROUND(SUM(r.run_result = 'Win') / COUNT(r.run_ID) * 100, 2) AS win_rate_pct
FROM Username u
INNER JOIN Player  p ON u.user_ID   = p.user_ID
INNER JOIN Run     r ON p.player_ID = r.player_ID
GROUP BY u.user_ID, u.name, u.lastname;

#8. Average combat performance per player
CREATE VIEW v_rendimiento_jugador AS
SELECT
    u.user_ID,
    u.name,
    u.lastname,
    ROUND(AVG(cs.dmg_done),     2) AS avg_dmg_done,
    ROUND(AVG(cs.dmg_receive),  2) AS avg_dmg_received,
    ROUND(AVG(cs.hp_recovered), 2) AS avg_hp_recovered,
    ROUND(AVG(cs.cards_used),   2) AS avg_cards_used
FROM Username    u
INNER JOIN Player      p  ON u.user_ID    = p.user_ID
INNER JOIN Run         r  ON p.player_ID  = r.player_ID
INNER JOIN Combat      c  ON r.run_ID     = c.run_ID
INNER JOIN Combat_Stats cs ON c.combat_ID = cs.combat_ID
GROUP BY u.user_ID, u.name, u.lastname;

#9. Enemy encounter frequency and average damage dealt to players
CREATE VIEW v_estadisticas_enemigos AS
SELECT
    e.enemy_ID,
    e.enemy_name,
    e.enemy_lvl,
    COUNT(c.combat_ID)             AS veces_encontrado,
    ROUND(AVG(cs.dmg_done),    2)  AS avg_dmg_al_jugador,
    ROUND(AVG(cs.dmg_receive), 2)  AS avg_dmg_recibido
FROM Enemy       e
LEFT JOIN Combat      c  ON e.enemy_ID  = c.enemy_ID
LEFT JOIN Combat_Stats cs ON c.combat_ID = cs.combat_ID
GROUP BY e.enemy_ID, e.enemy_name, e.enemy_lvl;

#10. Most used cards across all runs
CREATE VIEW v_cartas_mas_usadas AS
SELECT
    ca.card_ID,
    ca.name        AS carta_nombre,
    ca.type        AS carta_tipo,
    ca.cost_source,
    ca.cost,
    COUNT(rc.run_ID)        AS apariciones_en_runs,
    SUM(rc.quant_limit)     AS uso_total
FROM Cards     ca
LEFT JOIN Run_Cards rc ON ca.card_ID = rc.card_ID
GROUP BY ca.card_ID, ca.name, ca.type, ca.cost_source, ca.cost
ORDER BY uso_total DESC;

#11 View cards
CREATE VIEW v_combat_run_cards AS
SELECT
    c.combat_ID,
    c.run_ID,
    c.enemy_ID,
    c.lvl AS combat_lvl,

    rc.card_ID,
    rc.quant_limit,

    ca.name AS card_name,
    ca.type AS card_type,
    ca.effect,
    ca.target,
    ca.cost_source,
    ca.cost

FROM Combat c
INNER JOIN Run_Cards rc
    ON c.combat_ID = rc.combat_ID
INNER JOIN Cards ca
    ON rc.card_ID = ca.card_ID;

#TRIGGERS

DELIMITER $$

#1. Reject users aged 13 or younger on insert
CREATE TRIGGER trg_edad
BEFORE INSERT ON Username
FOR EACH ROW
BEGIN
    IF NEW.age <= 13 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Edad debe ser mayor a 13.';
    END IF;
END$$

#2. Reject users aged 13 or younger on update
CREATE TRIGGER trg_edad_update
BEFORE UPDATE ON Username
FOR EACH ROW
BEGIN
    IF NEW.age <= 13 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Edad debe ser mayor a 13 (update).';
    END IF;
END$$

#3. Ensure enemy hp_min is never greater than hp_max on insert
CREATE TRIGGER trg_enemy_hp_range_insert
BEFORE INSERT ON Enemy
FOR EACH ROW
BEGIN
    IF NEW.hp_min > NEW.hp_max THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'hp_min no puede ser mayor que hp_max.';
    END IF;
    IF NEW.dmg_min > NEW.dmg_max THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'dmg_min no puede ser mayor que dmg_max.';
    END IF;
END$$

#4. Same range validation on enemy update
CREATE TRIGGER trg_enemy_hp_range_update
BEFORE UPDATE ON Enemy
FOR EACH ROW
BEGIN
    IF NEW.hp_min > NEW.hp_max THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'hp_min no puede ser mayor que hp_max.';
    END IF;
    IF NEW.dmg_min > NEW.dmg_max THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'dmg_min no puede ser mayor que dmg_max.';
    END IF;
END$$

#5. Prevent card cost from being negative or unreasonably high (>100)
CREATE TRIGGER trg_card_cost_insert
BEFORE INSERT ON Cards
FOR EACH ROW
BEGIN
    IF NEW.cost > 100 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El costo de una carta no puede superar 100.';
    END IF;
END$$

#6. Prevent a run from being inserted for a player_ID that does not exist
CREATE TRIGGER trg_run_valid_player
BEFORE INSERT ON Run
FOR EACH ROW
BEGIN
    DECLARE v_count INT;
    SELECT COUNT(*) INTO v_count FROM Player WHERE player_ID = NEW.player_ID;
    IF v_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'player_ID no existe en la tabla Player.';
    END IF;
END$$

DELIMITER ;

#STORED PROCEDURES (6)

DELIMITER $$

#1. Register a new user and automatically create their Player record.
CREATE PROCEDURE sp_registrar_usuario(
    IN  p_name      VARCHAR(50),
    IN  p_lastname  VARCHAR(50),
    IN  p_password  CHAR(12),
    IN  p_age       TINYINT UNSIGNED,
    IN  p_gender    ENUM('Male','Female'),
    OUT p_user_id   SMALLINT UNSIGNED
)
BEGIN
    INSERT INTO Username (name, lastname, password, age, gender)
        VALUES (p_name, p_lastname, p_password, p_age, p_gender);

    SET p_user_id = LAST_INSERT_ID();

    -- Default player stats: 100 HP, 50 energy
    INSERT INTO Player (user_ID, hp, energy)
        VALUES (p_user_id, 100, 50);
END$$

#2. Start a new run for an existing player.
CREATE PROCEDURE sp_iniciar_run(
    IN  p_player_id SMALLINT UNSIGNED,
    OUT p_run_id    MEDIUMINT UNSIGNED
)
BEGIN
    -- Validate player exists
    IF NOT EXISTS (SELECT 1 FROM Player WHERE player_ID = p_player_id) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Player no encontrado.';
    END IF;

    INSERT INTO Run (player_ID, run_result, time)
        VALUES (p_player_id, NULL, NOW());

    SET p_run_id = LAST_INSERT_ID();
END$$

#3. Close a run by recording its final result.
CREATE PROCEDURE sp_finalizar_run(
    IN p_run_id     MEDIUMINT UNSIGNED,
    IN p_resultado  ENUM('Win','Loss')
)
BEGIN
    UPDATE Run
       SET run_result = p_resultado
     WHERE run_ID = p_run_id;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Run no encontrada o resultado ya asignado.';
    END IF;
END$$

#4. Register a combat within a run and log its stats in one call.
CREATE PROCEDURE sp_registrar_combate(
    IN  p_run_id        MEDIUMINT UNSIGNED,
    IN  p_enemy_id      SMALLINT UNSIGNED,
    IN  p_lvl           TINYINT UNSIGNED,
    IN  p_dmg_done      SMALLINT UNSIGNED,
    IN  p_dmg_receive   SMALLINT UNSIGNED,
    IN  p_hp_recovered  SMALLINT UNSIGNED,
    IN  p_cards_used    TINYINT UNSIGNED,
    OUT p_combat_id     MEDIUMINT UNSIGNED
)
BEGIN
    INSERT INTO Combat (run_ID, enemy_ID, lvl)
        VALUES (p_run_id, p_enemy_id, p_lvl);

    SET p_combat_id = LAST_INSERT_ID();

    INSERT INTO Combat_Stats (combat_ID, dmg_done, dmg_receive, hp_recovered, cards_used)
        VALUES (p_combat_id, p_dmg_done, p_dmg_receive, p_hp_recovered, p_cards_used);
END$$

#5. Return complete run history for a given user, ordered from most recent.
CREATE PROCEDURE sp_historial_usuario(
    IN p_user_id SMALLINT UNSIGNED
)
BEGIN
    SELECT
        r.run_ID,
        r.run_result,
        r.time,
        COUNT(c.combat_ID) AS total_combates
    FROM Run      r
    INNER JOIN Player  p ON r.player_ID = p.player_ID
    LEFT  JOIN Combat  c ON r.run_ID    = c.run_ID
    WHERE p.user_ID = p_user_id
    GROUP BY r.run_ID, r.run_result, r.time
    ORDER BY r.time DESC;
END$$

#6. Return the top N players by win rate.
CREATE PROCEDURE sp_ranking_jugadores(
    IN p_top_n INT
)
BEGIN
    SELECT
        u.user_ID,
        u.name,
        u.lastname,
        COUNT(r.run_ID)                                              AS total_runs,
        SUM(r.run_result = 'Win')                                    AS wins,
        ROUND(SUM(r.run_result = 'Win') / COUNT(r.run_ID) * 100, 2) AS win_rate_pct
    FROM Username u
    INNER JOIN Player  p ON u.user_ID   = p.user_ID
    INNER JOIN Run     r ON p.player_ID = r.player_ID
    WHERE r.run_result IS NOT NULL
    GROUP BY u.user_ID, u.name, u.lastname
    HAVING total_runs >= 1
    ORDER BY win_rate_pct DESC, total_runs DESC
    LIMIT p_top_n;
END$$

DELIMITER ;

#Set Data
INSERT INTO Enemy (enemy_name, hp_min, hp_max, dmg_min, dmg_max, enemy_lvl) VALUES
    ('Little Jimmy', 100, 120,  9, 15, 1),
    ('Rotoplas',      70, 85, 15, 20, 1);
 
INSERT INTO Cards (type, name, effect, target, what_effect, cost_source, cost) VALUES
    ('Attack',   'Sharp Claw',    'Damage the enemy for 15 HP', 'Enemy', 'enemy.hp -= 15','Energy',  0),
    ('Attack',   'Shadow Pounce', 'Damage the enemy for 20 HP', 'Enemy', 'enemy.hp -= 20','Energy', 10),
    ('Attack',   'Purr Attack',   'Damage the enemy for 30 HP', 'Enemy', 'enemy.hp -= 30','Energy', 15),
    ('Attack',   'Scratches',     'Damage the enemy for 40 HP', 'Enemy', 'enemy.hp -= 40','Energy', 25),
    ('Attack',   'Love Bite',     'Damage the enemy for 55 HP', 'Enemy', 'enemy.hp -= 55','Energy', 55),
    ('Defense',  'Lick Wounds',   'Heals you for 10 HP',        'Self',  'player.hp += 10','Energy', 0),
    ('Defense',  'Tuna Can',      'Heals you for 20 HP',        'Self',  'player.hp += 20','Energy',  10),
    ('Defense',  'Cat Nap',       'Heals you for 30 HP',        'Self',  'player.hp += 30','Energy', 20),
    ('Defense',  'Deliciuos Treat', 'Heals you for 45 HP',      'Self',  'player.hp += 45', 'Energy', 30),
    ('Defense',  'Nine Lives',    'Evade the next enemy attack','Self',  'player.evasionChance += 1', 'Energy', 25),
    ('Control',  'Cat Reflexes',  'Enemy Stun 1 Turn',          'Enemy', 'enemy.stunnedTurns += 1',  'Energy', 25),
    ('Control',  'Laser Pointer', 'Enemy Stun 2 Turns',         'Enemy', 'enemy.stunnedTurns += 2',  'Energy', 35),
    ('Wildcard', 'Low Risk',      'Trade HP for 40 Energy',     'Self',  'player.hp -= 30; player.energy += 40', 'HP', 30),
    ('Wildcard', 'Moderate Risk', 'Trade HP for 60 Energy',     'Self',  'player.hp -= 40; player.energy += 60', 'HP', 40),
    ('Wildcard', 'High Risk',     'Trade HP for 80 Energy',     'Self',  'player.hp -= 50; player.energy += 80', 'HP', 50);
