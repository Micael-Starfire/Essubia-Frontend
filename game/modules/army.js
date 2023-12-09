import { Unit } from "./unit.js";

export class Army {
    constructor(pName, pId, pOwner, pX, pY) {
        this.id = pId;
        this.name = pName;
        this.xPos = pX;
        this.yPos = pY;
        this.unitList = {};
        this.owner = pOwner;
        this.disorder = 0;

        this.burden = 0;
        this.burdenThreshold = 4;
        this.burdenModifier = 0;

        this.numUnits = 0;
        this.trueSpeed = 0;
        this.maxSpeed = 1000;
        this.avgSpeed = 0;
    }

    addUnit = (pUnit) => {
        // Recalculate the Army's burden and modifier
        this.burden += pUnit.bulk;
        if (this.burden > this.burdenThreshold) {
            // The burden modifer is logarithmically related to burden
            this.burdenModifier += 1;
            this.burdenThreshold *= 2;
        }

        // Army cannot move faster than the slowest unit
        if (pUnit.speed < this.maxSpeed) {
            this.maxSpeed = pUnit.speed;
        }

        // Recalculate the Army's average speed
        let totalSpeed = this.avgSpeed + this.numUnits;
        totalSpeed += pUnit.speed;
        this.avgSpeed = totalSpeed / (this.numUnits + 1);


        this.unitList[pUnit.id] = pUnit;
        this.numUnits += 1;
    }
}