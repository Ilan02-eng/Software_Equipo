

**User Stories**  
   
 

| Ilan Hannenberg Wasserman Paulina Cortez Balvanera María Espínola Forcén  | A01787440 A01782041 A01787172 |
| :---- | ----- |
|  |  |
|  |  |

*Software Construction and Decision MakIng*      
*Grupo 206*  
 

*Date:*  
 *May 6th, 2025*

User story 001: 

| Title: Start a run | Priority: High | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story:  As a player  I want to start a new run In order to begin a fresh gameplay session with reset/new progress    |  |  |
| Acceptance Criteria:  The player can start a new run from the main menu. All stats and progress are reset. The new run is initialized correctly. The map and cards are generated again.  |  |  |

User story 002: 

| Title: Explore Rooms | Priority: High | Estimate: 3 days |
| :---- | :---- | :---- |
| User Story:  As a player  I want to explore new and different rooms In order to discover new cards and have a different experience every run  |  |  |
| Acceptance Criteria:  The player can move between rooms.  Each room has hidden cards. Cards can be collected once per room. Rooms can be revisited but have no additional rewards.  |  |  |

User story 003: 

| Title: Interior Map Generation | Priority: High  | Estimate: 3 days |
| :---- | :---- | :---- |
| User Story:  As a game designer   I want the interior rooms to be generated randomly In order to make every run feel different, unpredictable and unique  |  |  |
| Acceptance Criteria:  3 rooms are generated in addition to the main entrance of the house. The position of the rooms vary every run. Some rooms are connected. One of the rooms is randomly assigned as the boss room. Random and hidden cards are in each room.  |  |  |

User story 004: 

| Title: Exterior Map Exploration  | Priority: Medium | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story:  As a game designer   I want the exterior area remains fixed between every run In order to give the players a familiar starting area   |  |  |
| Acceptance Criteria: The exterior layout is identical every run. Cards can still be found there. Cards are hidden randomly around the exterior layout.   |  |  |

User story 005: 

| Title: Card Collection Storage | Priority: High | Estimate: 1-2 days |
| :---- | :---- | :---- |
| User Story:  As a developer   I want want collected cards to be stored per run In order to use the correct deck during combat  |  |  |
| Acceptance Criteria:  Cards are added to the player's current deck. Cards can appear multiple times.  Cards are randomly selected every combat. Cards are stored as the player finds them around the map.  |  |  |

User story 006: 

| Title: Entering a Combat | Priority: High | Estimate: 1-2 days |
| :---- | :---- | :---- |
| User Story:  As a developer I want combat to start when the player gets closer to the boss In order to trigger the combat automatically   |  |  |
| Acceptance Criteria:  Combat begins immediately upon getting close to the boss. Player and enemy are initialized for battle. The player’s deck is randomly selected from the player’s stored cards.    |  |  |

User story 007: 

| Title: Turn-based Combat | Priority: Medium | Estimate: 2-3 days |
| :---- | :---- | :---- |
| User Story:  As a game designer   I want to alternate between player and enemy turns  In order to create strategic pacing  |  |  |
| Acceptance Criteria:  Player acts first. Enemy acts second. Turns alternate correctly. Turns can be affected by cards.  |  |  |

User story 008: 

| Title: Random Hand Draw | Priority: High | Estimate: 2 days |
| :---- | :---- | :---- |
| User Story:  As a player  I want to receive a random set of cards each combat In order to adapt my strategy dynamically   |  |  |
| Acceptance Criteria:  A new hand is generated every run.  Cards are selected from the player’s current card collection. Cards can duplicate in a hand. After using one card a new one is selected randomly to take its place in the hand.   |  |  |

User story 009: 

| Title: Energy System  | Priority: High | Estimate: 2-3 days |
| :---- | :---- | :---- |
| User Story:  As a game designer   I want cards to consume energy when used In order to limit how many actions the player can take during combat and strategies the use of resources  |  |  |
| Acceptance Criteria:  Each card has a fixed energy cost. The player starts with 100 energy points every combat. Energy points cannot exceed 150\. Cards cannot be used without enough energy. Wildcards can be used to trade life for energy during combat.  |  |  |

User story 010: 

| Title: Wildcard Mechanic   | Priority: Medium | Estimate: 1-2 days |
| :---- | :---- | :---- |
| User Story:  As a game designer  I want a card that trades health for energy In order to introduce risk based decision every combat  |  |  |
| Acceptance Criteria:  Using this type of card reduces the player’s health points. The player recovers energy points. The effect is applied immediately. CAn only be used once per combat. The player can only have one wildcard per run.   |  |  |

User story 011: 

| Title: Stats Tracking | Priority: High | Estimate: 2 days |
| :---- | :---- | :---- |
| User Story:  As a data analyst  I want the game to track the player’s performance every run In order to evaluate the gameplay results   |  |  |
| Acceptance Criteria:  The time duration of every run is recorded. Cards collected are recorded.  Damage dealt and received is recorded. Health recovered is recorded.  |  |  |

User story 012: 

| Title: End Run Summary  | Priority: Medium | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story: As a player  I want to see the summary at the end of a run  In order to understand my performance    |  |  |
| Acceptance Criteria:  A summary screen is shown after the run ends by either defeating the boss or dying. All stats are displayed clearly.  |  |  |

User story 013: 

| Title: Player’s Death  | Priority: Medium  | Estimate: 1-2 days  |
| :---- | :---- | :---- |
| User Story:  As a developer   I want the game’s run to end when the player is defeated by reaching 0 health during combat In order to maintain valid gameplay states   |  |  |
| Acceptance Criteria:  The run ends immediately when the health points of the player reaches 0\. The player cannot continue the run. All the player’s progress is lost and reset for another run.   |  |  |

User story 014: 

| Title: Enemy Attacks | Priority: High | Estimate: 1 day  |
| :---- | :---- | :---- |
| User Story: As a developer   I want the enemy to execute an attack during its turn   In order to correctly apply damage and flow during combat   |  |  |
| Acceptance Criteria:  The enemy only attacks during its designated turn. The attacks reduce the player’s health points based on predefined damage values. The attack is skipped if the enemy is affected by a control effect. If the player has an active evasion effect, the attack has no damage.  The system updates the player’s health points after the attack. The turn switches back to the player after the enemy’s action.    |  |  |

User story 015: 

| Title: Enemy Difficulty Balance | Priority: High  | Estimate: 2-3 days |
| :---- | :---- | :---- |
| User Story:  As a data analyst  I want to track the outcomes of the player encounter with the enemy In order to evaluate whether the difficulty scaling is balanced   |  |  |
| Acceptance Criteria: Record whether each encounter ends in victory or defeat. The system tracks how many attempts are needed to defeat the boos. Record the player’s remaining health after each combat. Comparison between different runs.     |  |  |

User story 016: 

| Title: Combat UI Feedback  | Priority: High | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story: As a UI designer  I want the combat interface to clearly display the player and enemy status  In order to help the player to make informed decisions    |  |  |
| Acceptance Criteria:  Player health is always visible. Enemy health is always visible. Player energy is clearly displayed. The current hand of cards is visible and readable. The energy cost of every card is displayed.  |  |  |

User story 017: 

| Title: Card Pickup Visual Feedback | Priority: Medium  | Estimate: 1 day  |
| :---- | :---- | :---- |
| User Story:  As a UI designer  I want the process of acquiring cards to have a clear visual and interactive feedback In order to make the action of finding a card more rewarding and simple to understand    |  |  |
| Acceptance Criteria: Each acquired card shows its name, type and effect in a readable format. After collection, the UI updates to reflect the new cards of the collection. A confirmation indicates the card was added to the player’s collection.   |  |  |

User story 018: 

| Title: Immersive Art Style  | Priority: Medium  | Estimate: 2 days  |
| :---- | :---- | :---- |
| User Story: As a player I want the game to have a consistent and attractive art style  In order to feel immersed and connected to the character and the environment     |  |  |
| Acceptance Criteria:  Cards have a clear visual based on their type. Sound effects match the tone of the game. The color palette is consistent, attractive and non distracting. The character’s design is consistent across gameplay elements. The exterior and interior environments follow a visual theme.    |  |  |

User story 019: 

| Title: Combat Balance  | Priority: High  | Estimate: 2-3 days  |
| :---- | :---- | :---- |
| User Story: As a game designer  I want the cards and energy costs to be balanced   In order to ensure fair and strategic gameplay  |  |  |
| Acceptance Criteria:  Stronger cards consume more energy than weaker ones.  Low cost cards provide weaker or smaller effects. The player cannot win consistently by using only one type of card. The energy system enforces decision making. All card types have a meaningful use.   |  |  |

User story 020: 

| Title: Sound Effects for Actions  | Priority: Medium  | Estimate: 1 day  |
| :---- | :---- | :---- |
| User Story: As a sound designer  I want key gameplay actions to have a unique and distinct sound effect In order to ensure player feedback and immersion to the game  |  |  |
| Acceptance Criteria: Playing and using a card triggers a unique sound effect. Collecting a card plays a rewarding sound. Enemy attacks have a unique audio. Different card types have a slightly different sound effect. Sounds are not overwhelming.   |  |  |

User story 21: 

| Title: Attack Cards  | Priority: High | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story: As a game designer  I want attack cards to deal varying amounts of damage based on their energy costs In order to provide meaningful offensive choices during combat  |  |  |
| Acceptance Criteria:  Attack cards deal damage within defined numerical ranges. Players must choose between multiple attack options rather than relying on one. The energy costs vary depending on the amount of damage the card can deal to the enemy.  |  |  |

User story 22: 

| Title: Defensive Cards | Priority: High | Estimate: 1 day  |
| :---- | :---- | :---- |
| User Story: As a game designer  I want defensive cards to provide and offer healing and protection options In order to allow players to survive longer during combat and recover from damage  |  |  |
| Acceptance Criteria: Some cards restore player health points. Some cards prevent or avoid incoming damage from enemy attacks.  Healing values are balanced against enemy damage output. Players must decide when to heal versus when to attack.      |  |  |

User story 23:

| Title: Control Cards  | Priority: Medium | Estimate: 1-2 days  |
| :---- | :---- | :---- |
| User Story:  As a game designer  I want control cards to influence the enemy behavior  In order to add strategic depth and turn management   |  |  |
| Acceptance Criteria:  Control cards can skip enemy turns. Different cards apply different control levels (1 turn or 2 turns). Control effects are temporary and defined.  Control cards have higher energy costs than other cards.  Players must decide when it is worth delaying the enemy attacks instead of doing other actions.   |  |  |

User story 24: 

| Title: Card Description Clarity  | Priority: Medium | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story:  As a UI designer  I want card descriptions to be clear and easy to read for the players  In order to help players understand their effects quickly    |  |  |
| Acceptance Criteria:  Text is easy to read and short. Important effects or values highlighted. Card type is clearly indicated.  |  |  |

User story 25: 

| Title: Player Movement Feedback  | Priority: Medium  | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story:  As a player I want visual feedback when moving between rooms In order to understand my current position and where to go    |  |  |
| Acceptance Criteria:  Movement is animated or indicated.  Location is always visible. The movement of the character is consistent with the controls.  |  |  |

User story 26: 

| Title: Combat Result Feedback | Priority: Medium  | Estimate: 1-2 days |
| :---- | :---- | :---- |
| User Story:  As a player I want clear feedback of when the combat ends and the result  In order to understand the final outcome     |  |  |
| Acceptance Criteria: The victory or defeat result is clearly shown.  Smooth transition.  |  |  |

User story 27: 

| Title: Intuitive Controls   | Priority: High | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story:  As a player I want simple and intuitive controls  In order to move, explore and interact with the game easier    |  |  |
| Acceptance Criteria:  The player can select and play cards easily during combat encounters. Inputs respond immediately without a noticeable delay. Basic introductions are available for new players. Controls are consistent.    |  |  |

User story 28: 

| Title: Minimal UI Clutter  | Priority: Medium | Estimate: 1 day  |
| :---- | :---- | :---- |
| User Story:  As a UI designer  I want the interface of the game to remain clean and simple In order to avoid overwhelming the player with too many options and elements    |  |  |
| Acceptance Criteria: Only essential elements are shown. The game’s screens are not overcrowded by elements. The interface feels smooth and consistent.    |  |  |

User story 29: 

| Title:Dynamic Background Music Design  | Priority: Medium  | Estimate: 2 days  |
| :---- | :---- | :---- |
| User Story:  As a sound designer  I want background music that matches the different stages and environments of the game   In order to enhance the immersion and emotional tone of the game     |  |  |
| Acceptance Criteria: Main screens and exploration areas have a calm or ambient music. Combat has more intense and fast pacing music. Music changes appropriately and smoothly when entering combat. Transitions are smooth. The music tracks are in a constant loop.   |  |  |

User story 30: 

| Title: Run Time Awareness  | Priority: Low   | Estimate: 1 day   |
| :---- | :---- | :---- |
| User Story:  As a player I want to know how long my runs lasted   In order to manage my time and performance   |  |  |
| Acceptance Criteria: Time starts running once the run has started. Time is displaced during and after the run. Time is shown as part of the stats of the player.     |  |  |

User story 31: 

| Title: Run Comparison | Priority: Medium | Estimate: 1-2 days |
| :---- | :---- | :---- |
| User Story:  As a data analyst  I want to compare different runs  In order to identify patterns and the player performance      |  |  |
| Acceptance Criteria:  Runs can be compared by stats. Differences are noticeable. The stats data is well summarized.  |  |  |

User story 32: 

| Title: Health Bar   | Priority: High | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story: As a game designer  I want the player health to have a fixed maximum amount   In order to maintain balance in healing and combat mechanics    |  |  |
| Acceptance Criteria: Player health cannot exceed 100\. The enemy health varies depending on the difficulty and is predefined by a numerical range. Healing stops at maximum value. If the health reaches 0 from either the player or enemy the combat ends.    |  |  |

User story 33: 

| Title: Boss Room Discovery  | Priority: High | Estimate: 2 days |
| :---- | :---- | :---- |
| User Story: As a player I want to explore the interior area to discover which room contains the enemy  In order to plan my exploration and discovery of new rooms      |  |  |
| Acceptance Criteria:  The boss room is hidden. It is revealed when entering. It generates randomly every run and level.  |  |  |

User story 34: 

| Title: Main Menu Screen  | Priority: High  | Estimate: 1 day  |
| :---- | :---- | :---- |
| User Story: As a UI designer  I want the main menu screen to be visually clean, well organized and consistent with the games tone In order to allow players to navigate the game easily       |  |  |
| Acceptance Criteria: The main options are prominently displayed such as Start, Options and  Credits. Buttons are distinguished and readable. Navigation is intuitive.  The screen’s layout is clean and not overwhelming.    |  |  |

User story 35: 

| Title: Credits Screen | Priority: Medium   | Estimate: 1 day  |
| :---- | :---- | :---- |
| User Story:  As a UI designer  I want the credits screen to be clean, well organized and to contain the information of everything and everyone who had a role during the game development In order to present information clearly and professionally     |  |  |
| Acceptance Criteria:  Names and roles are organized in a readable format. The text alignment and speaking is consistent. The design is consistent with the game’s art. It’s not overloaded with information. A clear option to return to the menu is displayed.   |  |  |

User story 36: 

| Title: Combat UI Design   | Priority: High | Estimate: 2-3 days  |
| :---- | :---- | :---- |
| User Story: As a UI designer  I want the combat interface to be well structured and consistent   In order to help the player to quickly understand the available options and actions   |  |  |
| Acceptance Criteria:  Player Health and energy is visible. Enemy health is visible.  Cards at hand are displayed in an organized layout. Important elements are prioritized. The interface is not cluttered with elements.  |  |  |

User story 37: 

| Title: First Time User  | Priority: High | Estimate: 1 day |
| :---- | :---- | :---- |
| User Story: As a player I want the game to guide me the first time I play  In order to comprehend the main mechanics of the game     |  |  |
| Acceptance Criteria: The first run includes guidance and hints. Introductions include the controls for movement. Introductions explain the usage of cards and their effects. Explain the health and energy bars. Explain how combats are played.  |  |  |

User story 38: 

| Title: Pixel Art Visual Identity   | Priority: High  | Estimate: 2-3 days  |
| :---- | :---- | :---- |
| User Story: As a UI designer  I want all visual elements of the game to follow consistent pixel art style In order to create a cohesive and appealing in game experience     |  |  |
| Acceptance Criteria: All assets like characters, cards, map and environment are pixel art. The resolution is consistent across all elements. Animations respect the pixel art style of the game. UI elements like buttons and text align with the pixel art aesthetic. Not a single visual element breaks the style and art consistency.    |  |  |

User story 39: 

| Title: Core Gameplay Loop  | Priority: High  | Estimate: 2 days |
| :---- | :---- | :---- |
| User Story: As a game designer  I want the core gameplay loop to be clear and engaging   In order to to ensure the player understands and enjoys the main flow of the game      |  |  |
| Acceptance Criteria: The loop of the game follows a clear structure. Encourages new runs.  Each stage of the loop has a defined purpose or role. |  |  |

User story 40: 

| Title: Data Structure for Game  | Priority: High | Estimate: 2-3 days  |
| :---- | :---- | :---- |
| User Story: As a data analyst  I want the game data to be organized in a structured way  In order to easily analyze the game stats and performance      |  |  |
| Acceptance Criteria: Data from each run is stored in a consistent format. Key metrics are clearly defined and assigned. No data is lost or incomplete.  The structure avoids redundancy.  Relations between elements are consistent.  The system allows for the retrieval of information for gameplay and analysis.    |  |  |

