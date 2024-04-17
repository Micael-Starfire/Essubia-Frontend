export class SubmitOrders {
    constructor(pImmediateOrders, pBuildOrders, pArmyList, pServerURL) {
        // Singleton Pattern
        if (SubmitOrders.instance != null) {
            return SubmitOrders.instance;
        }

        this.immediateOrders = pImmediateOrders;
        this.buildOrders = pBuildOrders;
        this.armyList = pArmyList;
        this.serverURL = pServerURL;

        SubmitOrders.instance = this;
    }

    handleEvent = (pEvent) => {
        const outputJSON = JSON.stringify({ immediateOrders: this.immediateOrders,
                                            buildOrders: this.buildOrders,
                                            armyList: this.armyList });

        console.log( outputJSON );
    };
}