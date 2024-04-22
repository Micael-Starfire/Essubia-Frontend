import { Tile } from './tile.js';
import { Structure } from "./structure.js";
import { Garrison } from "./garrison.js";
import { Unit } from "./unit.js";

export class TileMap {
    constructor(pWidth, pHeight) {
        this.tileMap = [];
        this.width = pWidth;
        this.height = pHeight;

        this.createMap();
    }

    selectTile = (pX, pY) => {
        return this.tileMap[pX][pY];
    }

    createMap = () => {

        // Populate the tileMap
        for( let col = 0; col < this.width; col++ ) {
            this.tileMap[col] = [];
            for( let row = 0; row < this.width; row++ ) {
                this.tileMap[col][row] = new Tile(col, row, 'water');
            }
        }
    
        // Add Field Tiles
        for( let x = 5; x < 11; x++ ) {
            for( let y = 0; y < 16; y++ ) {
                this.tileMap[x][y].setTerrain('field');
            }
        }
        for( let y = 1; y < 15; y++ ) {
            this.tileMap[4][y].setTerrain('field');
            this.tileMap[3][y].setTerrain('field');
            this.tileMap[11][y].setTerrain('field');
            this.tileMap[12][y].setTerrain('field');
        }
        for( let y = 2; y < 14; y++ ) {
            this.tileMap[2][y].setTerrain('field');
            this.tileMap[13][y].setTerrain('field');
        }
        for( let y = 3; y < 13; y++ ) {
            this.tileMap[1][y].setTerrain('field');
            this.tileMap[14][y].setTerrain('field');
        }
        for( let y = 5; y < 11; y++ ) {
            this.tileMap[0][y].setTerrain('field');
            this.tileMap[15][y].setTerrain('field');
        }

        // Add Forest Tiles
        for( let y = 2; y < 5; y++ ) {
            this.tileMap[9][y].setTerrain('forest');
            this.tileMap[10][y].setTerrain('forest');
        }
        this.tileMap[10][5].setTerrain('forest');
        this.tileMap[11][3].setTerrain('forest');
        this.tileMap[11][4].setTerrain('forest');
        this.tileMap[11][5].setTerrain('forest');
        this.tileMap[12][4].setTerrain('forest');
        this.tileMap[12][5].setTerrain('forest');

        this.tileMap[6][13].setTerrain('forest');
        this.tileMap[7][13].setTerrain('forest');
        this.tileMap[7][14].setTerrain('forest');
        this.tileMap[8][13].setTerrain('forest');
        this.tileMap[8][14].setTerrain('forest');

        this.tileMap[12][11].setTerrain('forest');
        this.tileMap[12][12].setTerrain('forest');
        this.tileMap[13][10].setTerrain('forest');
        this.tileMap[13][11].setTerrain('forest');

        // Add Hill Tiles
        this.tileMap[2][9].setTerrain('hill');
        this.tileMap[2][10].setTerrain('hill');
        this.tileMap[2][11].setTerrain('hill');
        this.tileMap[3][10].setTerrain('hill');
        this.tileMap[3][11].setTerrain('hill');

        this.tileMap[4][2].setTerrain('hill');
        this.tileMap[4][3].setTerrain('hill');
        this.tileMap[5][2].setTerrain('hill');
        this.tileMap[5][3].setTerrain('hill');
        this.tileMap[5][4].setTerrain('hill');
        this.tileMap[6][4].setTerrain('hill');
        this.tileMap[6][5].setTerrain('hill');

        this.tileMap[5][7].setTerrain('hill');
        this.tileMap[6][7].setTerrain('hill');
        this.tileMap[9][8].setTerrain('hill');
        this.tileMap[9][9].setTerrain('hill');

        this.tileMap[11][7].setTerrain('hill');
        this.tileMap[12][7].setTerrain('hill');
        this.tileMap[12][8].setTerrain('hill');
        this.tileMap[13][7].setTerrain('hill');
        this.tileMap[13][8].setTerrain('hill');
        this.tileMap[14][8].setTerrain('hill');

        // Add Mountain Tiles
        this.tileMap[4][7].setTerrain('mountain');
        this.tileMap[4][8].setTerrain('mountain');
        this.tileMap[5][8].setTerrain('mountain');
        this.tileMap[6][8].setTerrain('mountain');
        this.tileMap[6][9].setTerrain('mountain');
        this.tileMap[7][9].setTerrain('mountain');
        this.tileMap[7][10].setTerrain('mountain');
        this.tileMap[8][10].setTerrain('mountain');

        // Set the Capital
        this.tileMap[4][4].assignCapital();


        // Set populations
        for( let x = 0; x < this.width; x++) {
            for( let y = 0; y < this.height; y++) {
                // Get base pop
                let modX = Math.abs( 8 - x );
                let modY = Math.abs( 8 - y );
                let tempPop = modX * modY;
                tempPop = tempPop * (Math.pow(2, this.tileMap[x][y].getUrban()));

                // Modify by terrain
                if (this.tileMap[x][y].getTerrain() === 'field' ) {   
                    tempPop *= 20;

                } else if (this.tileMap[x][y].getTerrain() === 'forest' ) {
                    tempPop *= 5;
                } else if (this.tileMap[x][y].getTerrain() === 'hill' ) {
                    tempPop *= 10;
                } else if (this.tileMap[x][y].getTerrain() === 'mountain' ) {
                    tempPop *= 2;
                } else if (this.tileMap[x][y].getTerrain() === 'water' ) {
                    tempPop = 0;
                } else {
                    tempPop = 0;
                }

                // Assign Population
                this.tileMap[x][y].setPopulation(tempPop);
            }
        }

        // Assign Ownership
        for (let col=3; col<10; col++) {
            for (let row=2; row<8; row++) {
                this.tileMap[col][row].owner = "Draconis Imperium";
            }
        }
    }

    static constructFromObject(pObject) {
        let width = pObject.width;
        let height = pObject.height;
        let instance = new TileMap( width, height);

        for (let col=0; col < width; col++) {
            for (let row=0; row < height; row++) {
                let currentTile = instance.selectTile(col, row);
                let sourceTile = pObject.tileMap[col][row];

                currentTile.setTerrain(sourceTile.terrain);
                currentTile.owner = sourceTile.owner;
                currentTile.claimingTile = sourceTile.claimingTile;
                currentTile.road = sourceTile.road;
                currentTile.buildingRoad = sourceTile.buildingRoad;
                currentTile.urbanization = sourceTile.urbanization;
                currentTile.population = sourceTile.population;
                currentTile.buildingStructure = sourceTile.buildingStructure;
                currentTile.armyId = sourceTile.armyId;
                currentTile.improvingQuality = sourceTile.improvingQuality;

                if (sourceTile.structure != null) {
                    currentTile.structure = Structure.constructFromObject(sourceTile.structure);
                }

                if (sourceTile.garrison != null) {
                    currentTile.garrison = new Garrison(col, row);
                    currentTile.garrison.trainingUnit = sourceTile.garrison.trainingUnit;
                    currentTile.garrison.disbandedArmyName = sourceTile.garrison.disbandedArmyName;

                    for (let unitId in sourceTile.garrison.unitList) {
                        currentTile.garrison.unitList[unitId] = Unit.constructFromObject(sourceTile.garrison.unitList[unitId] );
                    }
                }
            }
        }

        return instance;
    }
}