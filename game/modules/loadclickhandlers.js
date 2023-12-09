export function loadClickHandlers(pPlayer) {
    // Load the click event handler for claimTileButton
    document.getElementById('claimTileButton').addEventListener('click', (pEvent) => {
        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;

        if (pPlayer.labor < 3 ||
            pPlayer.resources.food < 3 ||
            pPlayer.resources.wood < 3) {
                console.log('Insufficient Resources');
            } else {
                gBuildOrders.push( new BuildOrder( "claimTile", tileX, tileY, ""));
console.log(gBuildOrders);
                gtileMap[tileX][tileY].owner = "claiming";
                pPlayer.labor -= 3;
                pPlayer.spendResource('food', 3);
                pPlayer.spendResource('wood', 2);
            }
    });

    // Load the click event handler for buildRoadButton
    document.getElementById('buildRoadButton').addEventListener('click', (pEvent) => {
        let targetButton = pEvent.currentTarget;
        let tileX = targetButton.dataset.col;
        let tileY = targetButton.dataset.row;

        if (gPlayer.labor < 5 ||
            gPlayer.resources.stone < 5 ||
            gPlayer.resources.wood < 3 ||
            gPlayer.resources.food < 5) {
                console.log('Insufficient Resources');
            } else {
                gBuildOrders.push( new BuildOrder('buildRoad', tileX, tileY));
console.log(gBuildOrders);
                gtileMap[tileX][tileY].buildingRoad = true;
                gPlayer.labor -= 5;
                gPlayer.spendResource('stone', 5);
                gPlayer.spendResource('wood', 3);
                gPlayer.spendResource('food', 5);
            }
    });
}
