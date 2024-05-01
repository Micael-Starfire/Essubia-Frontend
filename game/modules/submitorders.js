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

        
        fetch(this.serverURL, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json;charset=utf-8'
            },
            body: outputJSON
        }).then( (response) => response.json()
        ). then( (result) => console.log(result)
        ).then( location.reload(true) )
        //.catch( (err) => console.log(err));
        //.then( (response) = response.json()).then( (message) => console.log(message.msg));
    };
}