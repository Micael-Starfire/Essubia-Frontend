export class ManageOrders {
    constructor (pOrders, pStructureTemplates, pUnitTemplates, pTileMap, pPlayer, pResourceUpdater) {
        // Singleton Pattern
        if (ManageOrders.instance != null) {
            return ManageOrders.instance;
        }

        this.ordersArray = pOrders;
        this.structureTemplates = pStructureTemplates;
        this.unitTemplates = pUnitTemplates;
        this.tileMap = pTileMap;
        this.player = pPlayer;
        this.resourceUpdater = pResourceUpdater;

        document.getElementById('closeManageOrders').addEventListener('click', this.closeOrders);

        ManageOrders.instance = this;
    }

    handleEvent = (pEvent) => {
        document.getElementById('manageOrdersBox').style.display = 'block';

        let ordersList = document.getElementById('manageOrdersList');

        this.ordersArray.forEach( (order, index) => {
            // Create the list item node
            let selection = document.createElement('li');
            selection.setAttribute('class', 'orderSelection');
            selection.dataset.index = index;

            // Add the remove order button
            let removeOrderButton = document.createElement('button');
            removeOrderButton.setAttribute('class', 'deleteOrder');
            removeOrderButton.dataset.index = index;
            removeOrderButton.innerText = "Remove";
            removeOrderButton.addEventListener('click', this.deleteOrder);
            selection.appendChild(removeOrderButton);

            // Fill in the order description
            let descBox = document.createElement('div');
            let orderDescription = this.describeOrder(order);
            descBox.innerText = "\n" + orderDescription;
            selection.appendChild(descBox);

            ordersList.appendChild(selection);
        });
    };

    closeOrders = (pEvent) => {
        document.getElementById('manageOrdersBox').style.display = 'none';
        document.getElementById('manageOrdersList').innerHTML = "";
    };

    deleteOrder = (pEvent) => {
        // Delete the selected order
        let targetButton = pEvent.currentTarget;
        let orderIndex = Number(targetButton.dataset.index);
        let targetOrder = this.ordersArray[orderIndex];
        let tileX = targetOrder.tileX;
        let tileY = targetOrder.tileY;
        let currentTile = this.tileMap.selectTile(tileX, tileY);

        // Undo the actions of the order
        switch( targetOrder.type ) {
            case 'claimTile':
                currentTile.claimingTile = false;
                // Refund Costs
                this.player.labor += 3;
                this.player.gainResource('food', 3);
                this.player.gainResource('wood', 2);
                this.resourceUpdater();
                break;
            case 'buildRoad':
                currentTile.buildingRoad = false;
                // Refund Costs
                this.player.labor += 5;
                this.player.gainResource('food', 5);
                this.player.gainResource('wood', 3);
                this.player.gainResource('stone', 5);
                this.resourceUpdater();
                break;
            case 'improveQuality':
                currentTile.improvingQuality = false;
                // Refund Costs
                this.player.labor += 1;
                this.player.gainResource('food', 1);
                this.player.gainResource('wood', 1);
                this.resourceUpdater();
                break;
            case 'buildStructure':
                currentTile.buildingStructure = "";
                // Refund Costs
                this.player.labor += this.structureTemplates[targetOrder.buildId].laborCost;
                for (const resource in this.structureTemplates[targetOrder.buildId].buildCost) {
                    this.player.gainResource(resource, this.structureTemplates[targetOrder.buildId].buildCost[resource]);
                }
                this.resourceUpdater();
                break;
            case 'trainUnit':
                currentTile.garrison.trainingUnit = "";
                break;
            default:
                // nop
        }
        // Reload the tile selection
        document.getElementById('mapTable').rows[tileY].cells[tileX].click();

        // Remove the order from the list
        // This is an ugly, ugly hack
        let tempArray = [];
        let total = this.ordersArray.length - orderIndex;
        for (let count=1; count < total; count++) {
            tempArray.push(this.ordersArray.pop());
        }
        this.ordersArray.pop(); // This is the order to remove

        for (let count=1; count < total; count++) {
            this.ordersArray.push(tempArray.pop());
        }

        // Clear and reset the orders list
        document.getElementById('manageOrdersList').innerHTML = "";
        document.getElementById('manageOrdersButton').click();
    };

    describeOrder = (pOrder) => {
        let retString = "";

        switch( pOrder.type ) {
            case 'claimTile':
                retString += "Claim tile at position (" + pOrder.tileX + ", " + pOrder.tileY + ")\n";
                break;
            case 'buildRoad':
                retString += "Build a road at position (" + pOrder.tileX + ", " + pOrder.tileY + ")\n";
                break;
            case 'improveQuality':
                retString += "Improve the quality of the tile\n";
                retString += "at position (" + pOrder.tileX + ", " + pOrder.tileY + ")\n";
                break;
            case 'buildStructure':
                retString += "Build a " + this.structureTemplates[pOrder.buildId].name;
                retString += " at position (" + pOrder.tileX + ", " + pOrder.tileY + ")\n";
                break;
            case 'trainUnit':
                retString += "Train a new " + this.unitTemplates[pOrder.buildId].name;
                retString += " in the garrison at (" + pOrder.tileX + ", " + pOrder.tileY + ")\n";
                break;
            default:
                retString = "";
        }

        return retString;

    };
}