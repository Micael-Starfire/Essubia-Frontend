export class Unit {
    constructor(
        pId, pName, pMeleeAtk, pMissileAtk, pMeleeDef, pMissileDef,
        pMaxCohesion, pSpeed, pBulk
    ) {
        this.id = pId;
        this.name = pName;
        this.meleeAttack = pMeleeAtk;
        this.missileAttack = pMissileAtk;
        this.meleeDefense = pMeleeDef;
        this.missileDefense = pMissileDef;

        this.maxCohesion = pMaxCohesion;
        this.cohesion = pMaxCohesion;

        this.speed = pSpeed;
        this.bulk = pBulk;

        this.buildCost = {};
        this.upkeepCost = {};
    }

    create = (pId) => {
        let rUnit = new Unit(
            pId, this.name, this.meleeAttack, this.missileAttack, this.meleeDefense, this.missileDefense,
            this.maxCohesion, this.speed, this.bulk
        );

        for (let resource in this.buildCost) {
            rUnit.buildCost[resource] = this.buildCost[resource];
        }

        for (let resource in this.upkeepCost) {
            rUnit.upkeepCost[resource] = this.upkeepCost[resource];
        }

        return rUnit;
    }

    static constructFromObject( pSource ) {
        let rUnit = new Unit( pSource.id, pSource.name, pSource.meleeAttack, pSource.missileAttack,
                            pSource.meleeDefense, pSource.missileDefense, pSource.maxCohesion,
                            pSource.speed, pSource.bulk);
        rUnit.cohesion = pSource.cohesion;

        for (let resource in pSource.buildCost) {
            rUnit.buildCost[resource] = pSource.buildCost[resource];
        }

        for (let resource in pSource.upkeepCost) {
            rUnit.upkeepCost[resource] = pSource.upkeepCost[resource];
        }

        return rUnit;
    }
}