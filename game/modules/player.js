export class Player {
    constructor (pId, pName) {
        this.id = pId;
        this.name = pName;
        this.labor = 25;
        this.maxLabor = 50;
        this.spentLabor = 5;

        this.resources = {
            iron: 0,
            wood: 0,
            food: 0,
            stone: 0,
            leather: 0,
            horses: 0
        };

    }

    gainResource = (pResource, pValue) => {
        this.resources[pResource] += pValue;
    };

    loseResource = (pResource, pValue) => {
        let newValue = this.resources[pResource] - pValue;
        if (newValue < 0) {
            newValue = 0;
        }
        this.resources[pResource] = newValue;
    }

    static constructFromObject( pSource ) {
        let rPlayer = new Player(pSource.id, pSource.name);

        rPlayer.labor = pSource.labor;
        rPlayer.maxLabor = pSource.labor;
        rPlayer.spentLabor = pSource.spentLabor;

        for (let resource in pSource.resources) {
            rPlayer.resources[resource] = pSource.resources[resource];
        }

        return rPlayer;
    }
}