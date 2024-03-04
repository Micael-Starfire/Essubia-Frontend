class Order {
    constructor (pType, pX, pY) {
        this.type = pType;
        this.tileX = pX;
        this.tileY = pY;


    }
}

export class ImmediateOrder extends Order {
    constructor (pType, pX, pY, pArmyId, pArmyArray, pArmyName) {
        super(pType, pX, pY);
        this.armyId = pArmyId;
        this.armyArray = [];
        this.armyName = "";
    }
}

export class BuildOrder extends Order {
    constructor (pType, pX, pY, pBuildId) {
        super (pType, pX, pY);
        this.buildId = pBuildId;
    }
}