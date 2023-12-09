class Order {
    constructor (pType, pX, pY) {
        this.type = pType;
        this.tileX = pX;
        this.tileY = pY;


    }
}

export class ImmediateOrder extends Order {
    constructor (pType, pX, pY) {
        super(pType, pX, pY);
    }
}

export class BuildOrder extends Order {
    constructor (pType, pX, pY, pBuildId) {
        super (pType, pX, pY);
        this.buildId = pBuildId;
    }
}