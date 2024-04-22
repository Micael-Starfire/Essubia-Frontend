const enumSTRUCTURES = {
    "capital" : 0,
    "farm" : 1,
    "lumbermill" : 2,
    "ranch" : 3,
    "lodge" : 4,
    "mine" : 5,
    "depot" : 6,

    "fort" : 7,

    "total_structures" : 8
}

export class Structure {
    constructor(pName, pId) {
        this.name = pName;
        this.id = pId;
        this.description = "";
        this.terrains = [];
        this.buildCost = {};
        this.laborCost = 0;

    }

    getName = () => {
        return this.name;
    }

    addTerrain = (pTerrain) => {
        this.terrains.push(pTerrain);
    }

    allowsTerrain = (pTerrain) => {
        return this.terrains.includes(pTerrain);
    }

    create = () => {
        let rStructure = new Structure(this.name, "none");
        rStructure.description = this.description;
        this.terrains.forEach( (terrain) => {
            rStructure.addTerrain(terrain);
        });

        rStructure.laborCost = this.laborCost;
        for (let resource in this.buildCost) {
            rStructure.buildCost[resource] = this.buildCost[resource];
        }

        return rStructure;
    }

    static constructFromObject( pSource ) {
        let instance = new Structure(pSource.name, pSource.id);
        instance.description = pSource.description;

        pSource.terrains.forEach( (terrain) => {
            instance.addTerrain(terrain);
        });

        instance.laborCost = pSource.laborCost;
        for (let resource in pSource.buildCost) {
            instance.buildCost[resource] = pSource.buildCost[resource];
        }

        return instance;
    }
}