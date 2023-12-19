import {Structure} from "./structure.js";
import { Garrison } from "./garrison.js";
import { Army } from "./army.js";

export class Tile {

    constructor(pX, pY, pTerrain = 'field') {
        this.xPos = pX;
        this.yPos = pY;
        this.terrain = pTerrain;
        this.owner = null;
        this.claimingTile = false;
        this.road = false;
        this.buildingRoad = false;
        this.urbanization = 0;
        this.population = 0;
        this.structure = null;
        this.buildingStructure = "";
        this.garrison = null;
        this.army = null;
        this.improvingQuality = false;
    }

    setTerrain = (pTerrain) => {
        this.terrain = pTerrain;
    };

    getTerrain = () => {
        return this.terrain;
    };

    getX = () => {
        return this.xPos;
    };

    getY = () => {
        return this.yPos;
    };

    buildRoad = () => {
        this.road = true;
    }

    hasRoad = () => {
        return this.road;
    };

    buildUrban = () => {
        if (this.urbanization < 6) {
            this.urbanization++;
        }
    }

    razeUrban = () => {
        this.urbanization = 0;
    }

    getUrban = () => {
        return this.urbanization;
    }

    setPopulation = (pValue) => {
        this.population = pValue;
    }

    getPopulation = () => {
        return this.population;
    }

    assignCapital = () => {
        this.urbanization = 8;
        this.buildRoad();
    }

    buildStructure = (pStructure) => {
        this.structure = pStructure.create();
    }

    getStructure = () => {
        return this.structure;
    }

}