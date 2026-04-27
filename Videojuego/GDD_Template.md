# **Catharsis**

## _Game Design Document_

![alt text](image.png)

##### **Copyright notice / author information / boring legal stuff nobody likes**

This videogames has been developed thoughout the February-June 2026 semester (April 6th, 2026 - ____) for the subject TC2005B: Software Construction and Decision Making (Group 501) for the Tecnológico de Monterrey in Campus Santa Fe


*Supervisors:* 
- Gilberto Echeverría Furió 
- Esteban Castillo Juarez
- José Ángel Martínez Navarro

*Development team: Supernova*

- Paulina Cortez Balvanera | A01782041
- María Espínola Forcén | A01787172
- Ilan Hanenberg Wasserman | A01787440

##
## _Index_

---

1. [Index](#index)
2. [Game Design](#game-design)
    1. [Summary](#summary)
    2. [Gameplay](#gameplay)
    3. [Mindset](#mindset)
3. [Technical](#technical)
    1. [Screens](#screens)
    2. [Controls](#controls)
    3. [Mechanics](#mechanics)
4. [Level Design](#level-design)
    1. [Themes](#themes)
        1. Ambience
        2. Objects
            1. Ambient
            2. Interactive
        3. Challenges
    2. [Game Flow](#game-flow)
5. [Development](#development)
    1. [Abstract Classes](#abstract-classes--components)
    2. [Derived Classes](#derived-classes--component-compositions)
6. [Graphics](#graphics)
    1. [Style Attributes](#style-attributes)
    2. [Graphics Needed](#graphics-needed)
7. [Sounds/Music](#soundsmusic)
    1. [Style Attributes](#style-attributes-1)
    2. [Sounds Needed](#sounds-needed)
    3. [Music Needed](#music-needed)
8. [Schedule](#schedule)

## _Game Design_

---

### **Summary**
*Catharsis* is a rougelite videogame presented in top-down perspective in 2D with a pixely artstyle, where you take the role of a little cat that comes to a new village and discovers his neighbours are behaving quite strange, just to learn that at night they are turning into monsters. He slowly discovers some new cards across the town that will help him protect himself and his new home. 
You will randomly explore the different houses of your neighbours, use your cards to save them and protect yourself, and find what is happening around the village.

Every time you get to heal your neighbours you will obtain experience points that will help us keep developing the story and obtain better cards that will increase your abilities to fight, defend, heal and control your neighbours. Giving the monster random abilities every night that forces you to think about how to defend yourself without harming them. Learning more about what is the secret behind the way of how your neighbours are behaving.

### **Gameplay**
**Description and context**

*Catharsis* is a story that will follow you; a little black cat that moves to a new village "Finetown" - in search for a new home, at first glance, the town will appear warm and welcoming since it is a colorful village with peaceful routines. In there he meets his new neighbours, who seem to not behave so fine - they rarely go out and do not seem to talk a lot, as the night falls, the cat will begin to notice many unsettling changes: the villagers seem to behave erratically, eventually transforming into strange and hostile creatures.

The game starts by showing your new house in your new neighbourhood - inside the house we can see a small letter that explains the rules of your new home:
1. Feel free to explore your surroundings, the nature is full of fruits and surprises.
2. Please return home before nightfall. Nights can be unpredictable
3. Be nice to everyone! A small act of kindness may be remembered longer than you think!
4. If you notice unusual behaviour, do not panic. It will return to normal in the morning
5. If you hear something calling your name in the night... ignore it!
6. Do not enter locked houses, some doors are closed for a reason.

*We hope you enjoy your stay, you'll get used to it!*

The letter will also include the basic instructions about how to develop themselves in the game in terms of both tasks and movement *(check in control section)*. 
 
After reading the letter, you go outside where you meet a villager who live next to your house; **Little Jimmy**, a fluffy dog who always wear a night gown and a sleeping hat, he is always tired yet he never opens his eyes. As a protagonist, the user must explore the village by entering their different houses. The rougelite elements depend a lot on how the procedurally change the layout and the powers of each creature every time. Allowing the player to keep learning fragments of the story, hidden secrets and discover the different cards. 

**Objective**

The final goal will be to cure the different neighbours that live across your home through a card-based combat interaction system, where the user is capable of collecting different cards that obtain different capacities like attacking, healing, defending and controlling your enemies, yet unlike usual combat systems - the user should not search to eliminate the neighbours but instead to protect or 'purify' them, allowing them to return to their normal state without harm and trying to learn more about the weird curse that seems to posess the village.

**Important elements**

For the Rougelite mechanics, it has been cosndiered the need for replayability for the multiple runs. Throughout the gameplay, the player will engage in the exploration of the village - in there the layout of the houses, the encounters and rewards will change every night. This random system will be reinforced through a card-based system that will be described below, where the player will gradually build their set up and how they choose between the options to fight and defend - trying to force the user to think strategiacally to achieve a win. Adding the fact that the game will depend on a progression system that will depend on healing the neighbours in order to keep obtaining experience points to unlock cards, abilities and upgrades for the next turn. In case we are presented with a failure during the night, it will be presented as a dream and will force the user to restart the current run - preserving the long-time progress yet allowing to try the again and grow and experiment with different cards. At the same time, considering that the randomized enemy behaviour wil be changed every night, and will force the player to adapt to grow. The unpredicatbility will help the storyline to progress and create a balance between abilities.

This game is built arround a dynamic card based combat system with four card categories that are attack,, defense, crowd control and healing. Every card consumes energy that regenerates each turn preventing spam and forcing players to think carefully about every move. Cards are discovered through exploration across a randomized map that ensures no runs are the same. Winning an encounter rewards the player with cards and duplicates can be fused together to level up their stats.

Death means that the player go down to just 3 random cards pushing them to explore aggressively and rebild from scratch. Each run ends with a boss encounter that puts every skill and card the player has gathered to the ultimate test. 


**References and Inspirations**

*Catharsis* has been developed with inspiration form multiple titles from different genres. As a team, it has been decided that the concept of the mechanics and rougelite structure is influenced by games like *Slay the Spire (2019)*, who is the image for card combat systems and its way to be replayable thoughout the gaming rounds.

![alt text](image-1.png)
*Slay the Spire(2019) - Similarities for card concept*

For the general concept, it has been taken a contrasting approach; it mixes both a cute and dark tone - for the same reason we decided to take inspiration from games that mix the concept of disturbing and emotional themes and subtle visual horror and cute and cozy games that depend more on social interactions.

*Cult of the Lamb (2022)* and *Omori (2020)* were the main inspirations for the emotional yet dark storytelling that the game will be based on, since they are games that seem unsettling either from start of slowly fading from a safe environment to a more horrifying one. 

![alt text](image-2.png)
*Omori (2020) - Similarities for themes and visual tone*

Lastly, it was mentioned that there is also some inspiration from more soft and cozier games; the main inspirations being *Animal Crossing (2001)*, *Stardew Valley (2016)* and *Sprout Valley (2023)*. Games that are known for their peaceful gameplay and daily routines, and their need for social interactions. At the same time, the main visual inspirations come from here - considering their cozy and warm atmosphere that makes you feel safe, contrasting to the dark themes that come later on the game.

![alt text](image-3.png)
*Sprout Valley (2023) - Similarities between visual and color palettes*

**Starting Sketches**

Initial concepts for the game:
![alt text](image-4.png)
*UI idea and possible placement for elements*

Initial logo concept: 
![alt text](image-5.png)
*Logo idea without pixel art*

### **Mindset**

*Catharsis* is designed to provoke a constant feeling of empathy. The player should never feel fully powerful, instead they should feel like they have just enough tools to make a difference. The whole game is an allegory to the concept that being kind and having hope will bring you good things back.

By day the village feels calm and safe, encouraging curiosity and the need for exploration. By night the tone shifts into something tense and uncertain - activating the sense of alert and need to be careful with your surroundings. The player knows the monsters in front of them are their neighbours; actual living creatures, which makes every decision feel heavy. You're not here to destroy, you're here to protect.The goal is to make the player feel nervous but hopeful always one bad hand away from failure, but always believing they can pull it off.

## _Technical_

---

### **Screens**

1. Title Screen

Purpose: It is the first impression that the player gets of our game, it gives the player access to the main options.
- Game logo and title: Positioned in the upwards central part of the screen, to establish the game’s identity.
- Start Button: A flashy button with the word “START” to draw the player to start the game’s experience.
- Options Menu Button: A button to allow the player to configure some aspects of the game.
- Credits Button: A section to recognize the game collaborators and developers.
- Background Music: An attractive and thematic track that sets the tone for the adventure.  
- Studio’s Name and Year: Supernova @2026. 

*(Title screen initial concept)*

2. Game/Map

Purpose: The main screen where the player navigates and interacts with the map.
- Inventory/Card Collection: A button that allows the player to see the cards they have acquired.
- Pause Button: Allows the player to stop for a moment the game and shows the Options Menu screen.
- Background Music: A track that sets the motion of the game.


 *(Game screen initial concept)* 

3. Inventory (Card Collection)
Purpose: Shows the player the cards they have acquired, it includes:

- Cards: Shows all the cards the player currently has and allows to show the player the information of each card.
- Back Button: Allows the player to return to the game screen.


*(Inventory screen initial concept)*

4. Combat Screen

Purpose: It provides a visual stage for the battle between the player and the opponent/enemy, includes: 
- Battlefield: The area where the combat takes place and the cards are played.
- Hand Overlay: Positioned at the bottom part showing the player’s current playable cards.
- Music: The track that sets the tone of the combat.
- Health (life) Bar: Indicates the amount of health that the player and the enemy currently have.
- Energy Bar: Shows the player the amount of available energy to play cards.

*(Combat screen initial concept)*

5. Ending Credits: 

Purpose: Show the developers and collaborators of the game, includes:
- Names: The team’s members' names. 
- References: Giving credit to aspects used in the game from other sources.
- Back: Allows the player to return to the Title Screen. 
- Background Music: Same as the Title Screen.

*(Ending credits screen initial concept)*


### **Controls**

1. Moving: The controls will require the usage of the W, A, S, and D for determining the movement.
    - W: up
    - A: left
    - S: down
    - D: right 

2. Combat: 
- Selection: Hover the mouse to select a card and see the description, effects and cost of each card.
- Execution: Click to play the selected card during a combat (each card type has its own visual and sound effect).

3. Navigate:
- You can navigate around the screens by using the mouse.
- Click on the button that you want to interact with.  



### **Mechanics**

Are there any interesting mechanics? If so, how are you going to accomplish them? Physics, algorithms, etc.

## _Level Design_

---

### **Themes**

1. Outside world: Surroundings around the neighbourhood.
    1. Mood
        1. Light, soft, and calm. 
    2. Objects
        1. _Ambient_
            1. Flowers
            2. Grass
        2. _Interactive_
            1. Bushes
            2. Trees
            3. Houses (Personal and Neighbour's)
2. Personal House
    1. Mood
        1. Cozy, warm and homelike
    2. Objects
        1. _Ambient_
            1. Furniture
        2. _Interactive_
            1. Letter
            2. Bed
            3. Door
3. Little Jimmy's House
    1. Mood
        1. Version I: Unsettling, weird, and not entirely safe - backroom similarities
        ![alt text](image-6.png)

         *(Inspiration for the Version I room)*

        2. Version II: Dark, scary and mysterious - entirely dark room where barely anything sees the light
        ![alt text](image-8.png)
        
        *(Inspiration for the Version II room)*
    2. Objects
        1. _Interactive_
            1. Enemy

### **Game Flow**

**Game Starts**
1. A start menu appears displaying the game's title and a button to begin.
2. The player spawns in a flat village featuring bushes, trees, and two houses.
3. The HUD is displayed, including the player's health bar.

**Initial Exploration**
1. The player begins inside their own house, where a letter is found explaining the game's controls and the village's rules.
2. The player explores the village, discovering letters scattered near bushes, chairs, and trees.
3. The player notices that their neighbor is asleep outside their house.
4. The player observes that Little Jimmy's house is emanating loud and unusual noises.


**Night Exploration**

1. The player exits their house to find that Little Jimmy is still inside his home, which continues to produce loud noises.
2. The player enters the house to investigate and ensure everything is alright.
3. A combat encounter begins in an attempt to cure Little Jimmy.
4. If the player is defeated, the game resets and the player retains only 3 randomly selected cards from their deck.
5. If the player wins, Little Jimmy is partially cured.
6. The player returns home to rest.


**Second Day**
1. The player resumes their investigation of the village.
2. The player continues to discover new cards throughout the environment.


**Second Night**
1. The player returns to Little Jimmy's house.
2. A second combat encounter begins in another attempt to cure Little Jimmy.
3. If the player is defeated, the game resets and the player retains only 3 randomly selected cards from their deck.
4. If the player wins, Little Jimmy is further cured.
5. The player returns home to rest.


**Third Day**

1. The player resumes their investigation of the village.
2. The player continues to discover new cards throughout the environment.


**Third Night**

1. The player returns to Little Jimmy's house.
2. A third and final combat encounter begins in a last attempt to cure Little Jimmy.
3. If the player is defeated, the game resets and the player retains only 3 randomly selected cards from their deck.
4. If the player wins, Little Jimmy is fully cured and appears in his normal form.
5. The player saves the village and the game concludes.


## _Development_

---

### **Abstract Classes / Components**

1. BasePhysics
    1. BasePlayer
    2. BaseEnemy
    3. BaseObject
2. BaseObstacle
3. BaseInteractable

_(example)_

### **Derived Classes / Component Compositions**

1. BasePlayer
    1. PlayerMain
    2. PlayerUnlockable
2. BaseEnemy
    1. EnemyWolf
    2. EnemyGoblin
    3. EnemyGuard (may drop key)
    4. EnemyGiantRat
    5. EnemyPrisoner
3. BaseObject
    1. ObjectRock (pick-up-able, throwable)
    2. ObjectChest (pick-up-able, throwable, spits gold coins with key)
    3. ObjectGoldCoin (cha-ching!)
    4. ObjectKey (pick-up-able, throwable)
4. BaseObstacle
    1. ObstacleWindow (destroyed with rock)
    2. ObstacleWall
    3. ObstacleGate (watches to see if certain buttons are pressed)
5. BaseInteractable
    1. InteractableButton

_(example)_

## _Graphics_

---

### **Style Attributes**

The game follows a concept where contrast is a very important factor. The pixel-artstyle will be consistent thoughout the whole game, yet, day and night should depend on a high contrast between themes. Day time will consist on lighter colors

What kinds of colors will you be using? Do you have a limited palette to work with? A post-processed HSV map/image? Consistency is key for immersion.

What kind of graphic style are you going for? Cartoony? Pixel-y? Cute? How, specifically? Solid, thick outlines with flat hues? Non-black outlines with limited tints/shades? Emphasize smooth curvatures over sharp angles? Describe a set of general rules depicting your style here.

Well-designed feedback, both good (e.g. leveling up) and bad (e.g. being hit), are great for teaching the player how to play through trial and error, instead of scripting a lengthy tutorial. What kind of visual feedback are you going to use to let the player know they&#39;re interacting with something? That they \*can\* interact with something?

### **Graphics Needed**

1. Characters
    1. Human-like
        1. Goblin (idle, walking, throwing)
        2. Guard (idle, walking, stabbing)
        3. Prisoner (walking, running)
    2. Other
        1. Wolf (idle, walking, running)
        2. Giant Rat (idle, scurrying)
2. Blocks
    1. Dirt
    2. Dirt/Grass
    3. Stone Block
    4. Stone Bricks
    5. Tiled Floor
    6. Weathered Stone Block
    7. Weathered Stone Bricks
3. Ambient
    1. Tall Grass
    2. Rodent (idle, scurrying)
    3. Torch
    4. Armored Suit
    5. Chains (matching Weathered Stone Bricks)
    6. Blood stains (matching Weathered Stone Bricks)
4. Other
    1. Chest
    2. Door (matching Stone Bricks)
    3. Gate
    4. Button (matching Weathered Stone Bricks)

_(example)_


## _Sounds/Music_

---

### **Style Attributes**

The music of Catharsis will consist of two different tracks that will be played depending on the state or scene of the game. The main track will be played in a loop for most of the instances of the game while the second track will be only played while in combat. Both will be played in a loop. 


This way we maintain a cohesive atmosphere while providing a dynamic shift in the energy according to what is happening in the game. 

### **Sounds Needed**

1. ***Effects***
- The sound effects (SFX) are designed to provide feedback to the auditory player, ensuring each interaction from the player feels responsive, intuitive and impactful. To maintain the aesthetic of the game, the sound effects design will be inspired by a retro bit style, matching the game’s pixel-art identity.
- **Movement**   
    - A walking/foot steps effect while the player is exploring and moving around the map.
- **Interactions**  
    - Finding a card, like a shimmer effect.
    - Opening a door, a wooden creak effect (when you enter the house of the enemy).
- **Cards/Combat**
    - Healing card effect.
    - Attack card effect. 
    - Control card effect (like a freezing effect).
    - Victory/defeating the enemy.

2. ***Feedback***
- Due to current development scope, the feedback from sound effects will be kept  direct and functional. Beyond basic interactions, the sound effects serve to communicate the player’s status and the weight of their choices, the combat feedback is prioritized through different sounds that signal the state of the battle and the actions that are taking place.


### **Music Needed**

The game will feature two tracks that define the gameplay state, designed to distinguish between peaceful exploration and active engagement for combat.


***Details:***
- **Atmospheric Exploration (Main Track):** 
    - Style: Ambient, melodic and immersive.
    - Function: This track plays during the Title Screen, World Map, Inventory and Credits. It’s meant to be non-intrusive, allowing the player to focus on the game while still being immersed in the atmosphere that it provides for the game.

- **Combat (Battle Track):**
    - Style: High tempo, percussive and driving.
    - Function: It will trigger immediately upon entering combat. The shift in rhythm creates a new atmosphere that generates a state of action for the player.


## _Schedule_

---

_(define the main activities and the expected dates when they should be finished. This is only a reference, and can change as the project is developed)_

1. develop base classes
    1. base entity
        1. base player
        2. base enemy
        3. base block
  2. base app state
        1. game world
        2. menu world
2. develop player and basic block classes
    1. physics / collisions
3. find some smooth controls/physics
4. develop other derived classes
    1. blocks
        1. moving
        2. falling
        3. breaking
        4. cloud
    2. enemies
        1. soldier
        2. rat
        3. etc.
5. design levels
    1. introduce motion/jumping
    2. introduce throwing
    3. mind the pacing, let the player play between lessons
6. design sounds
7. design music

_(example)_
