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

    handleEvent = async (pEvent) => {
        const outputJSON = JSON.stringify({ immediateOrders: this.immediateOrders,
                                            buildOrders: this.buildOrders,
                                            armyList: this.armyList });

        let logMessage = "";
        let response = await fetch(this.serverURL, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json;charset=utf-8'
            },
            body: outputJSON
        });
        let result = await response.json();
        location.reload(true);
        console.log(result);
    };
}