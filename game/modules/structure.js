export class Structure {

    enumSTRUCTURES = {
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
        let rStructure = new Structure(this.name);
        this.terrains.forEach( (terrain) => {
            rStructure.addTerrain(terrain);
        });

        return rStructure;
    }
}