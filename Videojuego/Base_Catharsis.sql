DROP SCHEMA IF EXISTS catharsis;
CREATE SCHEMA catharsis;
USE catharsis;
#Username
CREATE TABLE Username (
    user_ID     SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)         NOT NULL,
    lastname    VARCHAR(50)         NOT NULL,
    password    CHAR(64)            NOT NULL,
    age         TINYINT UNSIGNED,
    gender      ENUM('Male','Female'),

    CONSTRAINT pk_username PRIMARY KEY (user_ID)
);
#Player
CREATE TABLE Player (
    player_ID   SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    user_ID     SMALLINT UNSIGNED   NOT NULL,
    hp          SMALLINT UNSIGNED,
    energy      TINYINT UNSIGNED,

    CONSTRAINT pk_player PRIMARY KEY (player_ID),
    CONSTRAINT fk_player_user
        FOREIGN KEY (user_ID) REFERENCES Username(user_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);
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
);
#Enemy
CREATE TABLE Enemy (
    enemy_ID    SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    hp_min      SMALLINT UNSIGNED,
    hp_max      SMALLINT UNSIGNED,
    dmg_min     TINYINT UNSIGNED,
    dmg_max     TINYINT UNSIGNED,
    enemy_lvl   TINYINT UNSIGNED,
    enemy_name  VARCHAR(100),

    CONSTRAINT pk_enemy PRIMARY KEY (enemy_ID)
);
#Cards
CREATE TABLE Cards (
    card_ID          SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    type             ENUM('Attack','Defense','Control','Wildcard'),
    name             VARCHAR(100),
    effect           VARCHAR(255),
    target           ENUM('Enemy','Self'),
    what_effect      VARCHAR(255),
    cost_source      ENUM('Energy','HP'),
    cost             TINYINT UNSIGNED,
    sprite_reference VARCHAR(255),

    CONSTRAINT pk_cards PRIMARY KEY (card_ID)
);
#Combat
CREATE TABLE Combat (
    combat_ID   MEDIUMINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    run_ID      MEDIUMINT UNSIGNED  NOT NULL,
    enemy_ID    SMALLINT UNSIGNED   NOT NULL,
    lvl         TINYINT UNSIGNED,

    CONSTRAINT pk_combat PRIMARY KEY (combat_ID),
    CONSTRAINT fk_combat_run
        FOREIGN KEY (run_ID)   REFERENCES Run(run_ID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_combat_enemy
        FOREIGN KEY (enemy_ID) REFERENCES Enemy(enemy_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);
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
);
#Combat Stats
CREATE TABLE Combat_Stats (
    combat_stats_ID MEDIUMINT UNSIGNED  NOT NULL AUTO_INCREMENT,
    combat_ID       MEDIUMINT UNSIGNED  NOT NULL,
    dmg_done        SMALLINT UNSIGNED,
    dmg_receive     SMALLINT UNSIGNED,
    hp_recovered    SMALLINT UNSIGNED,
    cards_used      TINYINT UNSIGNED,

    CONSTRAINT pk_combat_stats PRIMARY KEY (combat_stats_ID),
    CONSTRAINT fk_combatstats_combat
        FOREIGN KEY (combat_ID) REFERENCES Combat(combat_ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);



####### DUMMY DATA ####

#Username
INSERT INTO Username (name, lastname, password, age, gender) VALUES
('Carlos',  'Mendoza',   'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', 22, 'Male'),
('Sofia',   'Ramirez',   'b3a8e0e1f9ab1bfe3a36f231f676f78bb28a489d0534e7f7f7a27ae3ef9e234a', 19, 'Female'),
('Diego',   'Torres',    'c1f8a7e2d3b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0', 25, 'Male'),
('Valeria', 'Lopez',     'd2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3', 21, 'Female'),
('Andres',  'Gutierrez', 'e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4', 28, 'Male');

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