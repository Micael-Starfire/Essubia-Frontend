import { MapMover } from './modules/mapmover.js';
import { Tile } from './modules/tile.js';
import { TileMap } from './modules/tileMap.js';
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
let gStructureTemplates = [];
let gUnitTemplates = [];
let gPlayer = new Player("mjm", "Draconis Imperium");
let gImmediateOrders = [];
let gBuildOrders = [];

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
            mapRow.appendChild(currentTile);

           let tileCanvas = document.createElement('canvas');
           tileCanvas.setAttribute('class', 'terrain');
           currentTile.appendChild(tileCanvas);
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
           if (tileData.army != null) {
            if (tileData.army.owner === gPlayer.id) {
                context.drawImage(document.getElementById('friendlyArmy'), 0, 0, tileCanvas.width, tileCanvas.height);
            } else {
                context.drawImage(document.getElementById('enemyArmy'), 0, 0, tileCanvas.width, tileCanvas.height);
            }
            
           }

           

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
    if (tileData.structure === null) {
        showStructure.style.display = 'none';
        buildButton.style.display = "inline-block";
        if ( isTileOwner) {
            buildButton.disabled = false;
            buildButton.dataset.col = tileX;
            buildButton.dataset.row = tileY;
        } else {
            buildButton.disabled = true;
        }
    } else {
        showStructure.style.display = 'inline-block';
        buildButton.style.display = 'none';
        showStructure.innerText = tileData.structure.name;
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
    let tileArmy = tileData.army;
    if (tileArmy !== null) {
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
            for (let index=1; index<5; index++) {
                infoBox.children[index].style.display = 'inline-block';
                infoBox.children[index].dataset.col = tileX;
                infoBox.children[index].dataset.row = tileY;
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
    gStructureTemplates.push(new Structure("capital", "capital"));
    gStructureTemplates[0].addTerrain("field");
    gStructureTemplates[0].addTerrain("forest");
    gStructureTemplates[0].addTerrain("hill");
    gStructureTemplates[0].addTerrain("mountain");

    gStructureTemplates.push( new Structure("farm", "farm"));
    gStructureTemplates[1].addTerrain("field");
    gStructureTemplates[1].addTerrain("hill");
    gStructureTemplates[1].laborCost = 5;
    gStructureTemplates[1].buildCost = {
        wood: 3,
        food: 5,
        stone: 3,
    };
    gStructureTemplates[1].description = 'Produces food every spring and autumn';

    gStructureTemplates.push( new Structure("lumbermill", "lumbermill"));
    gStructureTemplates[2].addTerrain("forest");
    gStructureTemplates[2].laborCost = 3;
    gStructureTemplates[2].buildCost = {
        wood: 2,
        stone: 3,
        horses: 1,
    };
    gStructureTemplates[2].description = 'Regularly produces wood';

    gStructureTemplates.push( new Structure("ranch", "ranch"));
    gStructureTemplates[3].addTerrain("field");
    gStructureTemplates[3].laborCost = 2;
    gStructureTemplates[3].buildCost = {
        wood: 5,
        stone: 3,
        horses: 1,
    };
    gStructureTemplates[3].description = 'Produces horses';

    gStructureTemplates.push( new Structure("lodge", "lodge"));
    gStructureTemplates[4].addTerrain("forest");
    gStructureTemplates[4].laborCost = 3;
    gStructureTemplates[4].buildCost = {
        wood: 2,
        iron: 3,
        leather: 2,
    };
    gStructureTemplates[4].description = 'Regularly produces some food and leather';

    gStructureTemplates.push( new Structure("mine", "mine"));
    gStructureTemplates[5].addTerrain("field");
    gStructureTemplates[5].addTerrain("hill");
    gStructureTemplates[5].addTerrain("mountain");
    gStructureTemplates[5].laborCost = 5;
    gStructureTemplates[5].buildCost = {
        wood: 5,
        stone: 3,
        iron: 2,
    };
    gStructureTemplates[5].description = 'Regularly produces iron';

    gStructureTemplates.push(new Structure("depot", "depot"));
    gStructureTemplates[6].addTerrain("field");
    gStructureTemplates[6].addTerrain("forest");
    gStructureTemplates[6].addTerrain("hill");
    gStructureTemplates[6].addTerrain("mountain");
    gStructureTemplates[6].laborCost = 15;
    gStructureTemplates[6].buildCost = {
        stone: 10,
        wood: 10,
        iron: 10,
    };
    gStructureTemplates[6].description = 'Creates a new supply point for provisioning armies';

    gStructureTemplates.push(new Structure("fort", "fort"));
    gStructureTemplates[7].addTerrain("field");
    gStructureTemplates[7].addTerrain("forest");
    gStructureTemplates[7].addTerrain("hill");
    gStructureTemplates[7].addTerrain("mountain");
    gStructureTemplates[7].laborCost = 20;
    gStructureTemplates[7].buildCost = {
        stone: 30,
        wood: 35,
        iron: 20,
    };
    gStructureTemplates[7].description = 'Defends and area and allows training of units';

    /* new Unit(
        pId, this.name, this.meleeAttack, this.missileAttack, this.meleeDefense, this.missileDefense,
        this.maxCohesion, this.speed, this.bulk
    ); */

    gUnitTemplates.push( new Unit(
        "0", "Militia", 1, 1, 1, 1,
        40, 8, 4
    ));
    gUnitTemplates.push( new Unit(
        "1", "Basic Infantry", 2, 2, 1, 1,
        50, 8, 2
    ));
    gUnitTemplates.push( new Unit(
        "2", "Archers", 1, 1, 3, 1,
        50, 8, 2
    ));
    gUnitTemplates.push( new Unit (
        "3", "Cavalry", 3, 1, 1, 1,
        50, 16, 2
    ));

}

//----- buildStructures -------------------------------------------------------
function buildStructures() {
    // Build the Capital Structure
    gTileMap.selectTile(4,4).buildStructure(gStructureTemplates[0]);

    // Connect garrison to Capital and populate it
    gTileMap.selectTile(4,4).garrison = new Garrison(4,4);
    gTileMap.selectTile(4,4).garrison.createUnit(gUnitTemplates[0], "c01");
    gTileMap.selectTile(4,4).garrison.createUnit(gUnitTemplates[2], "c02");
    gTileMap.selectTile(4,4).garrison.createUnit(gUnitTemplates[2], "c03");


    // build farms
    gTileMap.selectTile(3,3).buildStructure(gStructureTemplates[1]);
    gTileMap.selectTile(3,3).buildRoad();

    gTileMap.selectTile(3,4).buildStructure(gStructureTemplates[1]);
    gTileMap.selectTile(3,4).buildRoad();

    // build mine
    gTileMap.selectTile(4,7).buildStructure(gStructureTemplates[5]);
    gTileMap.selectTile(4,7).buildRoad();

    // build fort
    gTileMap.selectTile(6,5).buildStructure(gStructureTemplates[7]);
    gTileMap.selectTile(6,5).buildRoad();

    // Connect garrison to fort
    gTileMap.selectTile(6,5).garrison = new Garrison(6,5);

    // Populate garrison
    gTileMap.selectTile(6,5).garrison.createUnit(gUnitTemplates[0], "g01");
    gTileMap.selectTile(6,5).garrison.createUnit(gUnitTemplates[0], "g02");
    gTileMap.selectTile(6,5).garrison.createUnit(gUnitTemplates[2], "g03");
    gTileMap.selectTile(6,5).garrison.createUnit(gUnitTemplates[3], "g04");

    // build depot
    gTileMap.selectTile(6,7).buildStructure(gStructureTemplates[6]);
    gTileMap.selectTile(6,7).buildRoad();

    // build ranch
    gTileMap.selectTile(8,7).buildStructure(gStructureTemplates[3]);
    gTileMap.selectTile(8,7).buildRoad();

    // build lodge
    gTileMap.selectTile(9,2).buildStructure(gStructureTemplates[4]);
    gTileMap.selectTile(9,2).buildRoad();

    // build lumbermill
    gTileMap.selectTile(9,4).buildStructure(gStructureTemplates[2]);
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
    gTileMap.selectTile(8,6).army = new Army("Cavalry Force", "field01", "mjm", 8, 6);
    gTileMap.selectTile(8,6).army.addUnit( gUnitTemplates[3].create("a01"));
    gTileMap.selectTile(8,6).army.addUnit( gUnitTemplates[3].create("a02"));
    gTileMap.selectTile(8,6).army.addUnit( gUnitTemplates[3].create("a03"));
    gTileMap.selectTile(8,6).army.addUnit( gUnitTemplates[3].create("a04"));

    // Create second field army
    gTileMap.selectTile(9,9).army = new Army("Expeditionary Force", "field02", "mjm", 9, 9);
    gTileMap.selectTile(9,9).army.addUnit( gUnitTemplates[1].create("b01"));
    gTileMap.selectTile(9,9).army.addUnit( gUnitTemplates[1].create("b02"));
    gTileMap.selectTile(9,9).army.addUnit( gUnitTemplates[2].create("b03"));
    gTileMap.selectTile(9,9).army.addUnit( gUnitTemplates[2].create("b04"));
    gTileMap.selectTile(9,9).army.addUnit( gUnitTemplates[3].create("b05"));

    // Create hostile army
    gTileMap.selectTile(10,7).army = new Army("Cavalry Force", "hostile01", "other", 10, 7);
    gTileMap.selectTile(10,7).army.addUnit( gUnitTemplates[1].create("h01"));
    gTileMap.selectTile(10,7).army.addUnit( gUnitTemplates[1].create("h02"));
    gTileMap.selectTile(10,7).army.addUnit( gUnitTemplates[2].create("h03"));
    gTileMap.selectTile(10,7).army.addUnit( gUnitTemplates[2].create("h04"));

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

// Load button click handlers
function loadClickHandlers() {
    // Load the click event handler for claimTileButton
    document.getElementById('claimTileButton').addEventListener('click', (pEvent) => {
        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;

        if (gPlayer.labor < 3 ||
            gPlayer.resources.food < 3 ||
            gPlayer.resources.wood < 3) {
                console.log('Insufficient Resources');
            } else {
                gBuildOrders.push( new BuildOrder( "claimTile", tileX, tileY, ""));
console.log(gBuildOrders);
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
console.log(gBuildOrders);
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

    /*
    // Set up the Build Structure menu
    document.getElementById('buildStructureButton').addEventListener('click', (pEvent) => {
        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;

        document.getElementById('structureListBox').style.display = 'block';

        let selectionList = document.getElementById('structureList');

        for ()
    });
    */
}