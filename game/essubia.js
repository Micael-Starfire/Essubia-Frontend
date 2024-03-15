import { MapMover } from './modules/mapmover.js';
import { Tile } from './modules/tile.js';
import { TileMap } from './modules/tilemap.js';
import { Structure } from './modules/structure.js';
import { Unit } from './modules/unit.js';
import { Army } from './modules/army.js';
import { Garrison } from './modules/garrison.js';
import { Player } from './modules/player.js';
import { ImmediateOrder, BuildOrder } from './modules/order.js';


// ----- Defined Constants ----------------------------------------------------
const MAP_WIDTH = 16;
const MAP_HEIGHT = 16;

// ----- Global Variables -----------------------------------------------------
let gTileMap = new TileMap();
let gStructureTemplates = {};
let gUnitTemplates = {};
let gPlayer = new Player("mjm", "Draconis Imperium");
let gArmyList = {};
let gImmediateOrders = [];
let gBuildOrders = [];
let gMenuOpen = false;

//import {loadClickHandlers} from './modules/loadclickhandlers.js';
// ----- Main Function --------------------------------------------------------
window.addEventListener('load', function() {

    // Set up Player
    buildPlayer();

    // Build the global templates
    buildTemplates();

    // Build Structures
    buildStructures();

    // Initialize the Resource info
    updateResources();

    // Build the map table
    let mapTable = document.getElementById('mapTable');

    for( let row = 0; row < gTileMap.width; row++ ) {
        let mapRow = document.createElement('tr');
        mapRow.setAttribute('class', 'tile');
        mapTable.appendChild(mapRow);
        for(let col = 0; col < gTileMap.height; col++ ) {
            let tileData = gTileMap.selectTile(col, row);
            let currentTile = document.createElement('td');
            currentTile.dataset.row = row;
            currentTile.dataset.col = col;
            currentTile.setAttribute('class', 'tile');

            // Sightly Darken Uncontrolled Tiles
            if ( tileData.owner !== gPlayer.name) {
                currentTile.style.opacity = 0.9;
            }
            mapRow.appendChild(currentTile);

            // Set up the canvas and context for the tile
            let tileCanvas = document.createElement('canvas');
            tileCanvas.setAttribute('class', 'terrain');
            currentTile.appendChild(tileCanvas);
            let context = tileCanvas.getContext('2d');

            // Draw the tile images
            drawTile(col, row);

           // Add the click event
           currentTile.addEventListener('click', readTile);
        }
    }

    // Add the button click handlers
    loadClickHandlers();

    // Add event handler for hold and drag
    let mapmover = new MapMover();
    let mapBox = document.getElementById("mapBox");
    mapBox.addEventListener("mousedown", mapmover);
});

//----- readTile --------------------------------------------------------------
function readTile(pEvent) {
    // If a menu is open, do nothing
    if (gMenuOpen) {
        return;
    }

    let targetTile = pEvent.currentTarget;
    let tileX = targetTile.dataset.col;
    let tileY = targetTile.dataset.row;
    let tileData = gTileMap.selectTile(tileX, tileY);
    let currentBlock = null;
    let outputString = "";
    let isTileOwner = (tileData.owner === gPlayer.name);

    // Fill in tileStats block
    currentBlock = document.getElementById('tileStats');
    outputString = '\n(' + tileX + ',' + tileY + ')';
    outputString += '\nTerrain: ' + tileData.getTerrain();
    outputString += '\nPopulation: ' + tileData.population.toLocaleString();

    currentBlock.innerText = outputString;

    // Fill in tileFaction block
    currentBlock = document.getElementById('tileFaction');
    let tileOwner = document.getElementById('tileOwner');
    let claimButton = document.getElementById('claimTileButton');
    if (tileData.claimingTile === true) {
        tileOwner.style.display = 'inline-block';
        claimButton.style.display = 'none';
        tileOwner.innerText = 'Claiming Tile';
    } else if (tileData.owner === null) {
        tileOwner.style.display = 'none';
        claimButton.style.display = 'inline-block';
        claimButton.dataset.col = tileX;
        claimButton.dataset.row = tileY;
    } else {
        tileOwner.style.display = 'inline-block'
        claimButton.style.display = 'none'
        outputString = tileData.owner;
        tileOwner.innerText = outputString;
    }

    // Fill in tileStructure block
    let showStructure = document.getElementById('showStructure');
    let buildButton = document.getElementById('buildStructureButton');

    if (tileData.structure !== null) {
        showStructure.style.display = 'inline-block';
        buildButton.style.display = 'none';
        showStructure.innerText = tileData.structure.name;
    } else if (tileData.buildingStructure !== "") {
        showStructure.style.display = 'inline-block';
        buildButton.style.display = 'none';
        showStructure.innerText = "Building " + tileData.buildingStructure;
    } else {
        showStructure.style.display = 'none';
        buildButton.style.display = "inline-block";
        if ( isTileOwner) {
            buildButton.disabled = false;
            buildButton.dataset.col = tileX;
            buildButton.dataset.row = tileY;
        } else {
            buildButton.disabled = true;
        }
    }
    
    // Check for road
    let showRoad = document.getElementById('showRoad');
    let buildRoad = document.getElementById('buildRoadButton');
    if (tileData.road === true) {
        showRoad.style.display = 'inline-block';
        buildRoad.style.display = 'none';
        showRoad.innerText = 'road';
    } else if (tileData.buildingRoad === true) {
        showRoad.style.display = 'inline-block';
        buildRoad.style.display = 'none';
        showRoad.innerText = 'Building Road';
    } else {
        showRoad.style.display = 'none';
        buildRoad.style.display = "inline-block";
        if ( isTileOwner) {
            buildRoad.disabled = false;
            buildRoad.dataset.col = tileX;
            buildRoad.dataset.row = tileY;
        } else {
            buildRoad.disabled = true;
        }
    }

    // Manage other tileCommands
    let manageGarrison = document.getElementById('manageGarrisonButton');
    let improveQuality = document.getElementById('improveQualityButton');
    if (isTileOwner) {
        if (tileData.improvingQuality === false) {
            improveQuality.disabled = false;
            improveQuality.dataset.col = tileX;
            improveQuality.dataset.row = tileY;
        } else {
            improveQuality.disabled = true;
        }
        
        if (tileData.garrison !== null) {
            manageGarrison.disabled = false;
            manageGarrison.dataset.col = tileX;
            manageGarrison.dataset.row = tileY;
        } else {
            manageGarrison.disabled = true;
        }
    } else {
        manageGarrison.disabled = true;
        improveQuality.disabled = true;
    }

    // Manage the Army Info Box
    if (tileData.armyId !== "") {
        let tileArmy = gArmyList[tileData.armyId];
        let infoBox = document.getElementById('armyInfoBox')
        infoBox.style.display = 'block';
        let isPlayerArmy = (tileArmy.owner === gPlayer.id);
        let armyOwner = document.getElementById('armyOwner');
        let armyName = document.getElementById('armyName');
        let inspectArmy = document.getElementById('inspectArmyButton');

        if (isPlayerArmy) {
            armyOwner.style.color = 'lightgreen';
            armyName.style.color = 'lightgreen';
            armyOwner.innerText = gPlayer.name;
            armyName.innerText = tileArmy.name;
            // Enable the army management
            for (let index=1; index<5; index++) {
                infoBox.children[index].style.display = 'inline-block';
                infoBox.children[index].dataset.col = tileX;
                infoBox.children[index].dataset.row = tileY;
                infoBox.children[index].dataset.armyId = tileData.armyId;
                inspectArmy.style.display = 'none'
            }
            if (isTileOwner) {
                document.getElementById('contestTerritoryButton').disabled = true;
            } else {
                document.getElementById('contestTerritoryButton').disabled = false;
            }

        } else {
            armyOwner.style.color = 'red';
            armyName.style.color = 'red';
            armyOwner.innerText = 'the enemy';
            armyName.innerText = 'Enemy Army';      
            for (let index=1; index<5; index++) {
                infoBox.children[index].style.display = 'none';
            }
            inspectArmy.style.display = 'inline-block';
            inspectArmy.dataset.col = tileX;
            inspectArmy.dataset.row = tileY;
        }
    } else {
        document.getElementById('armyInfoBox').style.display = 'none';
    }

    let tileTerrain = gTileMap.selectTile(tileX, tileY).getTerrain();
    let tilePop = gTileMap.selectTile(tileX, tileY).getPopulation();
    let tileStructure = gTileMap.selectTile(tileX, tileY).getStructure();

}

//----- drawTile --------------------------------------------------------------
function drawTile (col, row) {
    let tileData = gTileMap.selectTile(col, row);
    let mapTable = document.getElementById('mapTable');
    let currentCell = mapTable.rows[row].cells[col];
    let tileCanvas = currentCell.getElementsByTagName('canvas')[0];
    let context = tileCanvas.getContext('2d');
   
    // Draw the underlying Terrain
    let tileImage = document.getElementById(tileData.getTerrain());
    context.drawImage(tileImage, 0, 0, tileCanvas.width, tileCanvas.height);

    // Display Connecting Roads
    if (tileData.hasRoad()) {
     if (col >= 0) {
         // Tile is not on left edge
         if (row >= 0 && gTileMap.selectTile(col-1, row+1).hasRoad()) {
             context.drawImage(document.getElementById('roadSW'), 0, 0, tileCanvas.width, tileCanvas.height);
         }
         if ( gTileMap.selectTile(col-1, row).hasRoad()) {
             context.drawImage(document.getElementById('roadW'), 0, 0, tileCanvas.width, tileCanvas.height);
         }
         if ( row < gTileMap.height-1 && gTileMap.selectTile(col-1, row-1).hasRoad()) {
             context.drawImage(document.getElementById('roadNW'), 0, 0, tileCanvas.width, tileCanvas.height);
         }
     }
     if (col < gTileMap.width-1) {
         // Tile is not on right edge
         if (row >= 0 && gTileMap.selectTile(col+1, row+1).hasRoad()) {
             context.drawImage(document.getElementById('roadSE'), 0, 0, tileCanvas.width, tileCanvas.height);
         }
         if ( gTileMap.selectTile(col+1, row).hasRoad()) {
             context.drawImage(document.getElementById('roadE'), 0, 0, tileCanvas.width, tileCanvas.height);
         }
         if ( row < gTileMap.height-1 && gTileMap.selectTile(col+1, row-1).hasRoad()) {
             context.drawImage(document.getElementById('roadNE'), 0, 0, tileCanvas.width, tileCanvas.height);
         }
     }
     if (row >= 0 && gTileMap.selectTile(col, row-1).hasRoad()) {
         context.drawImage(document.getElementById('roadN'), 0, 0, tileCanvas.width, tileCanvas.height);
     }
     if (row < gTileMap.height-1 && gTileMap.selectTile(col, row+1).hasRoad()) {
         context.drawImage(document.getElementById('roadS'), 0, 0, tileCanvas.width, tileCanvas.height);
     }
    }

    // Display Structures
    if (tileData.structure != null) {
     context.drawImage(document.getElementById(tileData.structure.name), 0, 0, tileCanvas.width, tileCanvas.height);
    }

    // Display Army presence
    if (tileData.armyId != "") {
     if (gArmyList[tileData.armyId].owner === gPlayer.id) {
         context.drawImage(document.getElementById('friendlyArmy'), 0, 0, tileCanvas.width, tileCanvas.height);
     } else {
         context.drawImage(document.getElementById('enemyArmy'), 0, 0, tileCanvas.width, tileCanvas.height);
     }
     
    }
}

//----- updateResources -------------------------------------------------------
function updateResources() {
    const laborBox = document.getElementById("fieldLabor");
    let laborString = "Labor: " + gPlayer.labor + " / " + gPlayer.maxLabor;
    laborBox.innerHTML = laborString;

    const textBox = document.getElementById("resourceList");
    let outputString = "\n";
    for (const resource in gPlayer.resources ) {
        outputString += "\t " + resource + ": " + gPlayer.resources[resource] + "\n";
    }
    textBox.innerText = outputString;
}

//----- buildTemplates --------------------------------------------------------
function buildTemplates() {
    // Build the gStructureTemplates array
    //let totalStructures = Structure.enumSTRUCTURES["total_structures"];
    //for( let index = 0; index < totalStructures; index++) {}
    gStructureTemplates["capital"] = new Structure("capital", "capital");
    gStructureTemplates["capital"].addTerrain("field");
    gStructureTemplates["capital"].addTerrain("forest");
    gStructureTemplates["capital"].addTerrain("hill");
    gStructureTemplates["capital"].addTerrain("mountain");
    gStructureTemplates["capital"].description = 'Should not be shown in list';

    gStructureTemplates["farm"] =  new Structure("farm", "farm");
    gStructureTemplates["farm"].addTerrain("field");
    gStructureTemplates["farm"].addTerrain("hill");
    gStructureTemplates["farm"].laborCost = 5;
    gStructureTemplates["farm"].buildCost = {
        wood: 3,
        food: 5,
        stone: 3,
    };
    gStructureTemplates["farm"].description = 'Produces food every spring and autumn';

    gStructureTemplates["lumbermill"] = new Structure("lumbermill", "lumbermill");
    gStructureTemplates["lumbermill"].addTerrain("forest");
    gStructureTemplates["lumbermill"].laborCost = 3;
    gStructureTemplates["lumbermill"].buildCost = {
        wood: 2,
        stone: 3,
        horses: 1,
    };
    gStructureTemplates["lumbermill"].description = 'Regularly produces wood';

    gStructureTemplates["ranch"] = new Structure("ranch", "ranch");
    gStructureTemplates["ranch"].addTerrain("field");
    gStructureTemplates["ranch"].laborCost = 2;
    gStructureTemplates["ranch"].buildCost = {
        wood: 5,
        stone: 3,
        horses: 1,
    };
    gStructureTemplates["ranch"].description = 'Produces horses';

    gStructureTemplates["lodge"] = new Structure("lodge", "lodge");
    gStructureTemplates["lodge"].addTerrain("forest");
    gStructureTemplates["lodge"].laborCost = 3;
    gStructureTemplates["lodge"].buildCost = {
        wood: 2,
        iron: 3,
        leather: 2,
    };
    gStructureTemplates["lodge"].description = 'Regularly produces some food and leather';

    gStructureTemplates["mine"] = new Structure("mine", "mine");
    gStructureTemplates["mine"].addTerrain("field");
    gStructureTemplates["mine"].addTerrain("hill");
    gStructureTemplates["mine"].addTerrain("mountain");
    gStructureTemplates["mine"].laborCost = 5;
    gStructureTemplates["mine"].buildCost = {
        wood: 5,
        stone: 3,
        iron: 2,
    };
    gStructureTemplates["mine"].description = 'Regularly produces iron';

    gStructureTemplates["depot"] = new Structure("depot", "depot");
    gStructureTemplates["depot"].addTerrain("field");
    gStructureTemplates["depot"].addTerrain("forest");
    gStructureTemplates["depot"].addTerrain("hill");
    gStructureTemplates["depot"].addTerrain("mountain");
    gStructureTemplates["depot"].laborCost = 15;
    gStructureTemplates["depot"].buildCost = {
        stone: 10,
        wood: 10,
        iron: 10,
    };
    gStructureTemplates["depot"].description = 'Creates a new supply point for provisioning armies';

    gStructureTemplates["fort"] = new Structure("fort", "fort");
    gStructureTemplates["fort"].addTerrain("field");
    gStructureTemplates["fort"].addTerrain("forest");
    gStructureTemplates["fort"].addTerrain("hill");
    gStructureTemplates["fort"].addTerrain("mountain");
    gStructureTemplates["fort"].laborCost = 20;
    gStructureTemplates["fort"].buildCost = {
        stone: 30,
        wood: 35,
        iron: 20,
    };
    gStructureTemplates["fort"].description = 'Defends and area and allows training of units';

    /* new Unit(
        pId, this.name, this.meleeAttack, this.missileAttack, this.meleeDefense, this.missileDefense,
        this.maxCohesion, this.speed, this.bulk
    ); */

    gUnitTemplates["militia"] = new Unit(
        "militia", "Militia", 1, 1, 1, 1,
        40, 8, 4
    );
    gUnitTemplates["infantry"] = new Unit(
        "infantry", "Basic Infantry", 2, 2, 1, 1,
        50, 8, 2
    );
    gUnitTemplates["archer"] = new Unit(
        "archer", "Archers", 1, 1, 3, 1,
        50, 8, 2
    );
    gUnitTemplates["cavalry"] = new Unit (
        "cavalry", "Cavalry", 3, 1, 1, 1,
        50, 16, 2
    );

}

//----- buildStructures -------------------------------------------------------
function buildStructures() {
    // Build the Capital Structure
    gTileMap.selectTile(4,4).buildStructure(gStructureTemplates["capital"]);

    // Connect garrison to Capital and populate it
    gTileMap.selectTile(4,4).garrison = new Garrison(4,4);
    gTileMap.selectTile(4,4).garrison.createUnit(gUnitTemplates["archer"], "c01");
    gTileMap.selectTile(4,4).garrison.createUnit(gUnitTemplates["archer"], "c02");
    gTileMap.selectTile(4,4).garrison.createUnit(gUnitTemplates["archer"], "c03");


    // build farms
    gTileMap.selectTile(3,3).buildStructure(gStructureTemplates["farm"]);
    gTileMap.selectTile(3,3).buildRoad();

    gTileMap.selectTile(3,4).buildStructure(gStructureTemplates["farm"]);
    gTileMap.selectTile(3,4).buildRoad();

    // build mine
    gTileMap.selectTile(4,7).buildStructure(gStructureTemplates["mine"]);
    gTileMap.selectTile(4,7).buildRoad();

    // build fort
    gTileMap.selectTile(6,5).buildStructure(gStructureTemplates["fort"]);
    gTileMap.selectTile(6,5).buildRoad();

    // Connect garrison to fort
    gTileMap.selectTile(6,5).garrison = new Garrison(6,5);

    // Populate garrison
    gTileMap.selectTile(6,5).garrison.createUnit(gUnitTemplates["militia"], "g01");
    gTileMap.selectTile(6,5).garrison.createUnit(gUnitTemplates["militia"], "g02");
    gTileMap.selectTile(6,5).garrison.createUnit(gUnitTemplates["archer"], "g03");
    gTileMap.selectTile(6,5).garrison.createUnit(gUnitTemplates["cavalry"], "g04");

    // build depot
    gTileMap.selectTile(6,7).buildStructure(gStructureTemplates["depot"]);
    gTileMap.selectTile(6,7).buildRoad();

    // build ranch
    gTileMap.selectTile(8,7).buildStructure(gStructureTemplates["ranch"]);
    gTileMap.selectTile(8,7).buildRoad();

    // build lodge
    gTileMap.selectTile(9,2).buildStructure(gStructureTemplates["lodge"]);
    gTileMap.selectTile(9,2).buildRoad();

    // build lumbermill
    gTileMap.selectTile(9,4).buildStructure(gStructureTemplates["lumbermill"]);
    gTileMap.selectTile(9,4).buildRoad();

    // build roads
    gTileMap.selectTile(4,5).buildRoad();
    gTileMap.selectTile(4,6).buildRoad();
    gTileMap.selectTile(5,5).buildRoad();
    gTileMap.selectTile(6,5).buildRoad();
    gTileMap.selectTile(6,6).buildRoad();
    gTileMap.selectTile(7,5).buildRoad();
    gTileMap.selectTile(8,3).buildRoad();
    gTileMap.selectTile(8,4).buildRoad();
    gTileMap.selectTile(8,6).buildRoad();

    // Create field army
    gTileMap.selectTile(8,6).armyId = "field01";
    gArmyList["field01"] = new Army("Cavalry Force", "field01", "mjm", 8, 6);
    gArmyList["field01"].addUnit( gUnitTemplates["cavalry"].create("a01"));
    gArmyList["field01"].addUnit( gUnitTemplates["cavalry"].create("a02"));
    gArmyList["field01"].addUnit( gUnitTemplates["cavalry"].create("a03"));
    gArmyList["field01"].addUnit( gUnitTemplates["cavalry"].create("a04"));

    // Create second field army
    gTileMap.selectTile(9,9).armyId = "field02";
    gArmyList["field02"] = new Army("Expeditionary Force", "field02", "mjm", 9, 9);
    gArmyList["field02"].addUnit( gUnitTemplates["infantry"].create("b01"));
    gArmyList["field02"].addUnit( gUnitTemplates["infantry"].create("b02"));
    gArmyList["field02"].addUnit( gUnitTemplates["archer"].create("b03"));
    gArmyList["field02"].addUnit( gUnitTemplates["archer"].create("b04"));
    gArmyList["field02"].addUnit( gUnitTemplates["cavalry"].create("b05"));

    // Create hostile army
    gTileMap.selectTile(10,7).armyId = "hostile01";
    gArmyList["hostile01"] = new Army("Cavalry Force", "hostile01", "other", 10, 7);
    gArmyList["hostile01"].addUnit( gUnitTemplates["infantry"].create("h01"));
    gArmyList["hostile01"].addUnit( gUnitTemplates["infantry"].create("h02"));
    gArmyList["hostile01"].addUnit( gUnitTemplates["archer"].create("h03"));
    gArmyList["hostile01"].addUnit( gUnitTemplates["archer"].create("h04"));

}

//----- buildPlayer -----------------------------------------------------------
function buildPlayer() {
    gPlayer.gainResource("food", 42);
    gPlayer.gainResource("iron", 22);
    gPlayer.gainResource("wood", 20);
    gPlayer.gainResource("stone", 18);
    gPlayer.gainResource("leather", 8);
    gPlayer.gainResource("horses", 2);

}

//----- loadClickHandlers() ---------------------------------------------------
// Load button click handlers
function loadClickHandlers() {
    // Load the click event handler for claimTileButton
    document.getElementById('claimTileButton').addEventListener('click', (pEvent) => {
        // If a menu is open, do nothing
        if (gMenuOpen) {
            return;
        }

        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;

        if (gPlayer.labor < 3 ||
            gPlayer.resources.food < 3 ||
            gPlayer.resources.wood < 3) {
                console.log('Insufficient Resources');
            } else {
                gBuildOrders.push( new BuildOrder( "claimTile", tileX, tileY, ""));
                gTileMap.selectTile(tileX, tileY).claimingTile = true;
                gPlayer.labor -= 3;
                gPlayer.loseResource('food', 3);
                gPlayer.loseResource('wood', 2);
                updateResources();
                document.getElementById('mapTable').rows[tileY].cells[tileX].click();
            }
    });

    // Load the click event handler for buildRoadButton
    document.getElementById('buildRoadButton').addEventListener('click', (pEvent) => {
        // If a menu is open, do nothing
        if (gMenuOpen) {
            return;
        }

        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;

        if (gPlayer.labor < 5 ||
            gPlayer.resources.stone < 5 ||
            gPlayer.resources.wood < 3 ||
            gPlayer.resources.food < 5) {
                console.log('Insufficient Resources');
            } else {
                gBuildOrders.push( new BuildOrder('buildRoad', tileX, tileY));
                gTileMap.selectTile(tileX, tileY).buildingRoad = true;
                gPlayer.labor -= 5;
                gPlayer.loseResource('stone', 5);
                gPlayer.loseResource('wood', 3);
                gPlayer.loseResource('food', 5);
                updateResources();
                document.getElementById('mapTable').rows[tileY].cells[tileX].click();
            }
    });

    // Load the click event handler for improveQuality
    document.getElementById('improveQualityButton').addEventListener( 'click', (pEvent) => {
        // If a menu is open, do nothing
        if (gMenuOpen) {
            return;
        }

        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;

        // Check that the player can afford
        if ( gPlayer.labor < 1 ||
             gPlayer.resources.food < 1 ||
             gPlayer.resources.wood < 1) {
                console.log('Insufficent Resources');
             } else {
                gBuildOrders.push( new BuildOrder('improveQuality', tileX, tileY, "" ));
                gTileMap.selectTile(tileX, tileY).improvingQuality = true;
                gPlayer.labor -= 1;
                gPlayer.loseResource('food', 1);
                gPlayer.loseResource('wood', 1);
                updateResources();
                document.getElementById('mapTable').rows[tileY].cells[tileX].click();
             }
    });

    
    // Set up the Build Structure menu
    document.getElementById('buildStructureButton').addEventListener('click', (pEvent) => {
        // If a menu is open, do nothing
        if (gMenuOpen) {
            return;
        }

        // This handler opens a menu
        gMenuOpen = true;

        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;

        document.getElementById('structureListBox').style.display = 'block';

        let selectionList = document.getElementById('structureList');
        for (const structureId in gStructureTemplates) {
            let currentStructure = gStructureTemplates[structureId];

            // Skip the capital structure
            if (currentStructure.name == 'capital') {
                continue;
            }

            // Skip if the tile terrain is not available for buiding the structure
            if ( !currentStructure.terrains.includes(gTileMap.selectTile(tileX, tileY).terrain) ) {
                continue;
            }

            let selection = document.createElement('div');
            selection.classList.add('structureSelection');
            selection.dataset.buildId = currentStructure.id;
            selection.dataset.col = tileX;
            selection.dataset.row = tileY;

            // Display the struture's information
            let dataDisplay = document.createElement('div');
            dataDisplay.classList.add('selectionData');
            dataDisplay.innerText = currentStructure.name + '\n\n' + currentStructure.description;
            selection.appendChild(dataDisplay);

            // Display the structure's costs
            let canAfford = true;
            let costDisplay = document.createElement('ul');
            costDisplay.classList.add('selectionCost');
            let laborField = document.createElement('li');
            if (gPlayer.labor < currentStructure.laborCost) {
                laborField.style.color = 'red';
                canAfford = false;
            }
            laborField.innerText = "  " + currentStructure.laborCost + " labor";
            costDisplay.appendChild(laborField);

            for (const resource in currentStructure.buildCost) {
                let field = document.createElement('li');
                if (gPlayer.resources[resource] < currentStructure.buildCost[resource]) {
                    field.style.color = 'red';
                    canAfford = false;
                }
                field.innerText = "  " + currentStructure.buildCost[resource] + " " + resource;
                costDisplay.appendChild(field);
            }
            selection.appendChild(costDisplay);

            // Add the Selection click handlers
            if (canAfford) {
                selection.addEventListener('click', (pEvent) => {
                    let targetSelection = pEvent.currentTarget;
                    let buildId = targetSelection.dataset.buildId;
                    let xPos = targetSelection.dataset.col;
                    let yPos = targetSelection.dataset.row;

                    gBuildOrders.push( new BuildOrder('buildStructure', xPos, yPos, buildId));

                    // Subtract Costs
                    gPlayer.labor -= gStructureTemplates[buildId].laborCost;
                    for (const resource in gStructureTemplates[buildId].buildCost) {
                        gPlayer.loseResource(resource, gStructureTemplates[buildId].buildCost[resource]);
                    }
                    updateResources();

                    // Set the Tile's buildingStructure to the structure's name
                    gTileMap.selectTile(xPos, yPos).buildingStructure = gStructureTemplates[buildId].name;

                    // Close the menu
                    gMenuOpen = false;
                    document.getElementById('structureListBox').style.display = 'none';
                    document.getElementById('structureList').innerHTML = "";
                    document.getElementById('mapTable').rows[yPos].cells[xPos].click();
                });
            } else {
                selection.style.opacity = 0.6;
                selection.style.cursor = 'not-allowed';
            }

            selectionList.appendChild(selection);
        }

        
    });

    // Add the Close Build Structure menu click handler
    document.getElementById('closeStructure').addEventListener('click', (pEvent) => {
        gMenuOpen = false;
        document.getElementById('structureListBox').style.display = "none";
        document.getElementById('structureList').innerHTML = "";
    });

    // Set up the Garrison Management Menu
    document.getElementById('manageGarrisonButton').addEventListener('click', (pEvent) => {
        // If a menu is open, do nothing
        if (gMenuOpen) {
            return;
        }

        // This handler opens a menu
        gMenuOpen = true;
        
        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;
        let tileData = gTileMap.selectTile(tileX, tileY);

        document.getElementById('garrisonListBox').style.display = 'block';

        // Assign the Garrison management command buttons
        
        let trainUnit = document.getElementById('trainUnitButton')
        if (tileData.garrison.trainingUnit == "") {
            trainUnit.disabled = false;
            trainUnit.dataset.col = tileX;
            trainUnit.dataset.row = tileY;
            document.getElementById('currentlyTraining').innerText = " nothing";
        } else {
            trainUnit.disabled = true;
            document.getElementById('currentlyTraining').innerText = " " +
                    gUnitTemplates[tileData.garrison.trainingUnit].name;
        }

        let createArmy = document.getElementById('createArmyButton');
        if (tileData.armyId == "") {
            createArmy.disabled = false;
            createArmy.dataset.col = tileX;
            createArmy.dataset.row = tileY;
        } else {
            createArmy.disabled = true;
        }
        

        let garrisonList = document.getElementById('garrisonList');
        let units = tileData.garrison.unitList;
        for (const unit in units) {
            let currentUnit = units[unit];

            let unitDisplay = document.createElement('li');
            unitDisplay.id = unit;
            unitDisplay.classList.add('unitSelection');
            unitDisplay.dataset.id = unit;
            unitDisplay.dataset.col = tileX;
            unitDisplay.dataset.row = tileX;
            unitDisplay.innerText = currentUnit.name + '\n\nCoshesion: ' + currentUnit.cohesion;

            garrisonList.appendChild(unitDisplay);
        }

    });

    // Add the Close Garrison Management click handler
    document.getElementById('closeGarrison').addEventListener('click', (pEvent) => {
        gMenuOpen = false;

        // Close Train Unit if open
        if( document.getElementById('unitListBox').style.display == "block") {
            document.getElementById('unitListBox').style.display = "none";
            document.getElementById('unitList').innerHTML = "";
            //document.getElementById('closeTrainUnit').click();
        }
        // Close Create Army if open
        if (document.getElementById('newArmyBox').style.display == "block") {
            document.getElementById('newArmyBox').style.display = "none";
            document.getElementById('newArmy').innerHTML = "";
            //document.getElementById('closeNewArmy').click();
        }
        
        document.getElementById('garrisonListBox').style.display = "none";
        document.getElementById('garrisonList').innerHTML = "";

    });

    // Add the Train Unit click event listener
    document.getElementById('trainUnitButton').addEventListener( 'click', (pEvent) => {
        // Close the create army menu f open
        if (document.getElementById('newArmyBox').style.display == 'block') {
            document.getElementById('closeNewArmy').click();
        }
        //document.getElementById('closeCreateArmy').click();

        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;
        let tileData = gTileMap.selectTile(tileX, tileY);

        document.getElementById('unitListBox').style.display = 'block';

        let unitList = document.getElementById('unitList');
        for (const unitId in gUnitTemplates) {
            let currentUnit = gUnitTemplates[unitId];

            let selection = document.createElement('li');
            selection.classList.add('unitSelection');
            selection.dataset.buildId = unitId;
            selection.dataset.col = tileX;
            selection.dataset.row = tileY;
            selection.innerText = currentUnit.name + '\n\nMax Coshesion: ' + currentUnit.cohesion;

            selection.addEventListener('click', (pEvent) => {
                let targetSelection = pEvent.currentTarget;
                let buildId = targetSelection.dataset.buildId;
                let xPos = targetSelection.dataset.col;
                let yPos = targetSelection.dataset.row;

                gBuildOrders.push(new BuildOrder('trainUnit', xPos, yPos, buildId));
                gTileMap.selectTile(xPos, yPos).garrison.trainingUnit = buildId;

                document.getElementById('unitListBox').style.display = "none";
                document.getElementById('unitList').innerHTML = "";
                document.getElementById('closeGarrison').click();
                document.getElementById('manageGarrisonButton').click();

            });

            unitList.appendChild(selection);

        }

    });

    // Add the close Train Unit click handler
    document.getElementById('closeTrainUnit').addEventListener('click', (pEvent) =>{
        document.getElementById('unitListBox').style.display = "none";
        document.getElementById('unitList').innerHTML = "";
    });

    // Add the Create Army click handler
    document.getElementById('createArmyButton').addEventListener('click', (pEvent) => {
        // Get Button Attributes
        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;

        // Close the train unit menu, if open
        if( document.getElementById('unitListBox').style.display == "block") {
            document.getElementById('closeTrainUnit').click();
        }

        // Pass data to the create army button
        let newArmyButton = document.getElementById('newArmyButton');
        newArmyButton.dataset.col = tileX;
        newArmyButton.dataset.row = tileY;

        // Open the Create Army Box
        document.getElementById('newArmyBox').style.display = "block";

        // Click handlers that allow for transfering units between
        // Army and Garrison
        let garrisonList = document.getElementById('garrisonList');
        let newArmy = document.getElementById('newArmy');
        for (let unit of garrisonList.children) {
            unit.dataset.inArmy = false;
            unit.addEventListener('click', (pEvent) => {
                let currentUnit = pEvent.currentTarget;
                if (currentUnit.dataset.inArmy == "true") {
                    currentUnit.dataset.inArmy = false;
                    newArmy.removeChild(currentUnit);
                    garrisonList.appendChild(currentUnit);
                } else {
                    currentUnit.dataset.inArmy = true;
                    garrisonList.removeChild(currentUnit);
                    newArmy.appendChild(currentUnit);
                }
            });
        }

    });

    // Add the Close Create Army click handler
    document.getElementById('closeNewArmy').addEventListener('click', (pEvent) => {
        document.getElementById('newArmyBox').style.display = "none";
        document.getElementById('newArmy').innerHTML = "";

        //clocse and reopen garrison management
        document.getElementById('closeGarrison').click();
        document.getElementById('manageGarrisonButton').click();
    });

    
    // Add the click handler for final Army Creation button
    document.getElementById('newArmyButton').addEventListener('click', (pEvent) => {
        // Get Button Attributes
        let targetButton = pEvent.currentTarget;
        let tileX = Number(targetButton.dataset.col);
        let tileY = Number(targetButton.dataset.row);

        let armyArray = [];
        let newArmy = document.getElementById('newArmy');
        for (let unit of newArmy.children) {
            armyArray.push(unit.dataset.id);
        }

        // Determine army name
        let armyName = "New Army";

        // Determine the placeholder Id
        let placeholder = "";
        let subscript = 1;
        let done = false;
        while (!done) {
            let tempId = "placeholder" + subscript.toString();
            if (!(tempId in gArmyList)) {
                placeholder = tempId;
                done = true;
            }
            subscript += 1;
        }

        // Create the order
        gImmediateOrders.push( new ImmediateOrder(
            'createArmy', tileX, tileY, placeholder, armyArray, armyName
        ));

        // Create the local Army
        gTileMap.selectTile(tileX, tileY).armyId = placeholder;
        gArmyList[placeholder] = new Army(
            armyName, placeholder, 'mjm', tileX, tileY );
        let localGarrison = gTileMap.selectTile(tileX, tileY).garrison.unitList;

        // Move units from the garrison to the army
        armyArray.forEach( (unitId) => {
            gArmyList[placeholder].addUnit(localGarrison[unitId]);
            delete localGarrison[unitId];
        });

        // Draw the new Army on the map
        drawTile(tileX, tileY);

        // Close the garrison menu
        document.getElementById('closeGarrison').click();
    });

    // Assign the General Orders button handler
    document.getElementById('generalOrdersButton').addEventListener('click', (pEvent) => {
        // If a menu is open, do nothing
        if (gMenuOpen) {
            return;
        }

        // This handler opens a menu
        gMenuOpen = true;

        // Get button attributes
        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;
        let tileArmyId = targetButton.dataset.armyId;
        let tileArmy = gArmyList[tileArmyId];

        // Pass the Army Id to the submit orders
        document.getElementById('submitGeneralOrders').dataset.armyId = tileArmyId;

        document.getElementById('generalOrdersBox').style.display = 'block';
        let engagement = document.getElementById('engagement');
        engagement.value = tileArmy.generalOrders['engagement'];
        //document.getElementById('engagement').value = tileArmy.generalOrders['engagment'];
    });

    // Assign the Close General Orders handler
    document.getElementById('closeGeneralOrders').addEventListener('click', (pEvent) => {
        document.getElementById('generalOrdersBox').style.display = 'none';
        gMenuOpen = false;
    });

    // Assign the Save Orders button handler
    document.getElementById('submitGeneralOrders').addEventListener('click', (pEvent) => {
        // Don't reload the page
        pEvent.preventDefault();

        // Get button attributes
        let targetButton = pEvent.currentTarget;
        let tileArmyId = targetButton.dataset.armyId;
        let tileArmy = gArmyList[tileArmyId];

        tileArmy.generalOrders['engagement'] = document.getElementById("engagement").value;

        // Close the General Orders menu
        gMenuOpen = false;
        document.getElementById('generalOrdersBox').style.display = 'none';
    });

    // Assign the Manage Army click handler
    document.getElementById('manageArmyButton').addEventListener('click', (pEvent) => {
        // If a menu is open, do nothing
        if (gMenuOpen) {
            return;
        }

        // This handler opens a menu
        gMenuOpen = true;
        
        // Get button attributes
        let targetButton = pEvent.currentTarget;
        let tileX = Number(targetButton.dataset.col);
        let tileY = Number(targetButton.dataset.row);
        let tileArmyId = targetButton.dataset.armyId;
        let tileArmy = gArmyList[tileArmyId];
        
        // Pass data to the disband army button if there is a garrison here
        let disbandArmyButton = document.getElementById('disbandArmyButton');
        if (gTileMap.selectTile(tileX, tileY).garrison != null) {
            disbandArmyButton.disabled = false;
            disbandArmyButton.dataset.col = tileX;
            disbandArmyButton.dataset.row = tileY;
            disbandArmyButton.dataset.armyId = tileArmyId;
        } else {
            disbandArmyButton.disabled = true;
        }
        

        document.getElementById('manageArmyBox').style.display = 'block';

        let armyList = document.getElementById('manageArmy');
        let units = tileArmy.unitList;
        for (const unit in units) {
            let currentUnit = units[unit];

            let unitDisplay = document.createElement('li');
            unitDisplay.id = unit;
            unitDisplay.classList.add('unitSelection');
            unitDisplay.dataset.id = unit;
            unitDisplay.dataset.col = tileX;
            unitDisplay.dataset.row = tileX;
            unitDisplay.innerText = currentUnit.name + '\n\nCoshesion: ' + currentUnit.cohesion;

            armyList.appendChild(unitDisplay);
        }
    });

    // Assign the Close Army Management handler
    document.getElementById('closeManageArmy').addEventListener('click', (pEvent) => {
        gMenuOpen = false;
        document.getElementById('manageArmyBox').style.display = "none";
        document.getElementById('manageArmy').innerHTML = "";

    });

    // Assign the Disband Army Button click handler
    document.getElementById('disbandArmyButton').addEventListener('click', (pEvent) => {
        // Get Button attributes
        let targetButton = pEvent.currentTarget;
        let tileX = Number(targetButton.dataset.col);
        let tileY = Number(targetButton.dataset.row);
        let tileArmyId = targetButton.dataset.armyId;
        let tileArmy = gArmyList[tileArmyId];
        let tileGarrison =  gTileMap.selectTile(tileX, tileY).garrison;

        // Manage the Immediate Order
        if (tileArmyId.includes('placeholder')) {
            // Army was recently created, so just undo the creation order
            gImmediateOrders = gImmediateOrders.filter( (order) => {
                return order.armyId != tileArmyId;
            });
        } else {
            // Create the disband order
            gImmediateOrders.push( new ImmediateOrder(
                'disbandArmy', tileX, tileY, tileArmyId
            ));
        }

        // Move the units from the army to the garrison
        for (const unitId in tileArmy.unitList) {
            tileGarrison.unitList[unitId] = tileArmy.unitList[unitId];
            delete tileArmy.unitList[unitId];
        }

        tileGarrison.disbandedArmyName = tileArmy.name;
        delete gArmyList[tileArmyId];
        gTileMap.selectTile(tileX, tileY).armyId = "";

        // Redraw the tile
        drawTile(tileX, tileY);

        // Close the army menu and open the garrison menu
        document.getElementById('closeManageArmy').click();
        document.getElementById('manageGarrisonButton').click();
    });
}

