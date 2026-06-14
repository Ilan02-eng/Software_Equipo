# Catharsis Repository

- Paulina Cortez Balvanera | A01782041
- María Espínola Forcén | A01787172
- Ilan Hanenberg Wasserman | A01787440

***Final edition***

## Description as a project
*"Catharsis"* is the videogame that was developed for the *Software Construction and decision making* course. This repository includes all the basics that were created for the game in terms of the database, webpage and the game itself.

## Structure of the repository

```text
Software_Equipo/
│
├── Actividades/
│   └── Course activities and supporting assignments.
│
├── Videogame/
│   ├── Data_Bases/
│   │   ├── SQL_Catharsis/
│   │   │   └── Base_Catharsis.sql
│   │   ├── Database diagrams and normalization documents
│   │   └── Database design resources.
│   │
│   ├── Documents/
│   │   ├── Game Design Document (GDD)
│   │   ├── User Stories
│   │   ├── Interface sketches
│   │   ├── Gameplay mockups
│   │   └── Development documentation.
│   │
│   ├── Game_Code/
│   │   ├── assets/
│   │   │   ├── audio/
│   │   │   ├── screens/
│   │   │   └── sprites/
│   │   │
│   │   ├── backend/
│   │   │   ├── API_Catharsis.js
│   │   │   ├── query_Catharsis.js
│   │   │   ├── statistics.js
│   │   │   └── Backend dependencies
│   │   │
│   │   ├── html/
│   │   │   ├── index.html
│   │   │   ├── Catharsis.html
│   │   │   ├── prototipo.html
│   │   │   └── estadisticas.html
│   │   │
│   │   └── js/
│   │       ├── Catharsis.js
│   │       ├── prototipo.js
│   │       └── Supporting libraries
│   │
│   ├── Presentation/
│   │   └── Project presentation materials
│   │
│   ├── VisualsVideogame/
│   │   ├── Cards/
│   │   ├── CharacterDesigns/
│   │   ├── ConceptArt/
│   │   ├── Rooms/
│   │   ├── Screens/
│   │   └── Web/
│   │
│   └── Web/
│       ├── css/
│       ├── html/
│       └── js/
│
├── package.json
├── package-lock.json
└── README.md
```

### Brief description of folders
**Actividades:** A folder for non-project related activities that were completed during the course

**Videogame/Data_Bases:** In here the have all the database related files, schemas, scripts, diagrams and the normalization used

**Videogame/Documents:** The project documentation; files like the Game Design Document and the images that appear in there as well as user stories file

**Videogame/Game_code:** Complete set of code related files, including both frontend and backend as well as the logic, assets and libraries that were used for the project

**Videogame/VisualsVideogame:** The visual resources that were initially created for the game, including designs and concept art.

**Videogame/Presentation:** Files required for the final delivery that include the video and personal reflections.

## Running the game

### How to download the files?
For running the game, we will require to either download all the files or clone the repository [Software_Equipo](https://github.com/Ilan02-eng/Software_Equipo). 

For clonning use the commands
```
git clone <repository-url> 
cd Software_Equipo
```

### Requirements before the run
Install the following libraries:
- Node.js
- npm
- express
- cors
- dotenv
- mysql2

### After downloads
Open the terminal and run the command
```
node API_Catharsis.js
```

Then, we require the usage of a second terminal, in there we should include the command:

```
node statistics.js
```

**Game controls**

*Movement*

| Letter Key |  Arrow key |    Action  |
|------------|------------|------------|
|      W     |      ↑     |   Move Up  |
|      A     |      ←     |  Move Left |
|      S     |      ↓     |  Move Down |
|      D     |      →     | Move Right |

