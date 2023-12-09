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

        return rUnit;
    }
}