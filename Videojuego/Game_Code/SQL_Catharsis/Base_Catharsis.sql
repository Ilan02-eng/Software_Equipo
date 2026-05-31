DROP SCHEMA IF EXISTS catharsis;
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
    KEY key_dmg_recive(dmg_recive),
    KEY key_hp_recovered(hp_recovered),
    KEY key_cards_used(cards_used).
    CONSTRAINT pk_combat_stats PRIMARY KEY (combat_stats_ID),
    CONSTRAINT fk_combatstats_combat
        FOREIGN KEY (combat_ID) REFERENCES Combat(combat_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


#Historial de runs por jugador (Muestra cada run con el usuario, resultado y fecha)
CREATE VIEW v_historial_runs AS
SELECT
    u.user_ID,
    u.name,
    u.lastname,
    r.run_ID,
    r.run_result,
    r.time
FROM Username u
INNER JOIN Player  p ON u.user_ID  = p.user_ID
INNER JOIN Run     r ON p.player_ID = r.player_ID;

#Resumen de runs con total de combates por run
CREATE VIEW v_runs_resumen AS
SELECT
    r.run_ID,
    u.name,
    u.lastname,
    r.run_result,
    r.time,
    COUNT(c.combat_ID) AS total_combates
FROM Run     r
INNER JOIN Player  p ON r.player_ID = p.player_ID
INNER JOIN Username u ON p.user_ID  = u.user_ID
LEFT JOIN Combat c ON r.run_ID = c.run_ID
GROUP BY r.run_ID, u.name, u.lastname, r.run_result, r.time;

#Cartas usadas por run (Muestra qué cartas se usaron en cada run y en qué combate)
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

#Cartas disponibles por run (sin importar combate)
CREATE VIEW v_mazo_por_run AS
SELECT
    rc.run_ID,
    ca.card_ID,
    ca.name        AS carta_nombre,
    ca.type        AS carta_tipo,
    ca.effect,
    ca.target,
    ca.cost_source,
    ca.cost,
    SUM(rc.quant_limit) AS cantidad_total
FROM Run_Cards rc
INNER JOIN Cards ca ON rc.card_ID = ca.card_ID
GROUP BY rc.run_ID, ca.card_ID, ca.name, ca.type,
         ca.effect, ca.target, ca.cost_source, ca.cost;

#Runs con sus cartas y resultado final
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
FROM Run       r
INNER JOIN Player    p  ON r.player_ID  = p.player_ID
INNER JOIN Username  u  ON p.user_ID    = u.user_ID
INNER JOIN Run_Cards rc ON r.run_ID     = rc.run_ID
INNER JOIN Cards     ca ON rc.card_ID   = ca.card_ID;


#Trigger
DELIMITER $$
CREATE TRIGGER trg_edad
BEFORE INSERT ON Username
FOR EACH ROW
BEGIN
    IF NEW.age <= 13 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Edad debe ser mayor a 13.';
    END IF;
END$$
DELIMITER ;


####### DUMMY DATA ####

#Username
INSERT INTO Username (name, lastname, password, age, gender) VALUES
('Carlos',  'Mendoza',   'lkonsthajowq', 22, 'Male'),
('Sofia',   'Ramirez',   'hjokngtyhbfd', 19, 'Female'),
('Diego',   'Torres',    'hgbdntsnbgds', 25, 'Male'),
('Valeria', 'Lopez',     'njmkañplokjss', 21, 'Female'),
('Andres',  'Gutierrez', 'pokmnjinmaasñ', 28, 'Male');

#Player
INSERT INTO Player (user_ID, hp, energy) VALUES
(1, 100, 50),
(2,  80, 40),
(3, 120, 60),
(4,  90, 45),
(5, 110, 55);

#Run
INSERT INTO Run (player_ID, run_result, time) VALUES
(1, 'Win',  '2024-01-10 14:30:00'),
(1, 'Loss', '2024-01-11 09:15:00'),
(2, 'Win',  '2024-01-12 18:45:00'),
(3, 'Loss', '2024-01-13 11:00:00'),
(4, 'Win',  '2024-01-14 16:20:00');

#Enemy
INSERT INTO Enemy (hp_min, hp_max, dmg_min, dmg_max, enemy_lvl, enemy_name) VALUES
( 30,  60,  5, 10, 1, 'Slime'),
( 50, 100, 10, 20, 2, 'Goblin'),
( 80, 150, 15, 30, 3, 'Orc'),
( 20,  40,  3,  8, 1, 'Bat'),
(200, 255, 25, 50, 5, 'Dragon');

#Cards
INSERT INTO Cards (type, name, effect, target, what_effect, cost_source, cost, sprite_reference) VALUES
('Attack',   'Strike',      'Deal damage',        'Enemy', 'dmg+5',    'Energy', 1, 'sprites/strike.png'),
('Defense',  'Shield',      'Block incoming dmg', 'Self',  'block+10', 'Energy', 1, 'sprites/shield.png'),
('Attack',   'Fireball',    'AoE fire damage',    'Enemy', 'dmg+15',   'Energy', 3, 'sprites/fireball.png'),
('Wildcard', 'Potion',      'Recover HP',         'Self',  'hp+20',    'HP',     2, 'sprites/potion.png'),
('Control',  'Poison Dart', 'Apply poison DoT',   'Enemy', 'dot+5',    'Energy', 2, 'sprites/dart.png');

#Combat
INSERT INTO Combat (run_ID, enemy_ID, lvl) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 3),
(3, 1, 1),
(4, 4, 1);

#Run Cards
INSERT INTO Run_Cards (card_ID, run_ID, combat_ID, quant_limit) VALUES
(1, 1, 1, 3),
(2, 1, 1, 2),
(3, 1, 2, 1),
(4, 2, 3, 2),
(5, 3, 4, 3);

#Combat Stats
INSERT INTO Combat_Stats (combat_ID, dmg_done, dmg_receive, hp_recovered, cards_used) VALUES
(1,  45, 10,  0, 4),
(2,  80, 35, 20, 6),
(3,  20, 60,  0, 3),
(4,  55, 15, 10, 5),
(5,  30, 20,  5, 4),
(3,  20, 60,  0, 3),
(4,  55, 15, 10, 5),
(5,  30, 20,  5, 4);
