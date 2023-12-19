import { Unit } from "./unit.js";

export class Garrison {
    constructor(pX, pY) {
        this.xPos = pX;
        this.yPos = pY;
        this.unitList = {};
        this.trainingUnit = "";
    }

    createUnit = (pUnit, pId) => {
        this.unitList[pId] = pUnit.create(pId);
    }
}