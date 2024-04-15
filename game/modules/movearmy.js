export class MoveArmy {
    constructor (pTileMap, pArmyList) {
        // Singleton Pattern
        if (MoveArmy.instance != null) {
            return MoveArmy.instance;
        }

        this.tileMap = pTileMap;
        this.armyList = pArmyList;

        this.newWaypoints = [];
        this.tileArmy = null;

        document.getElementById('clearWaypointButton').addEventListener('click', this.clearWaypoint);
        document.getElementById('cancelMoveButton').addEventListener('click', this.cancelMovement);
        document.getElementById('finishMoveButton').addEventListener('click', this.finishMovement);

        MoveArmy.instance = this;
    }

    handleEvent = (pEvent) => {
        // If a menu is open, do nothing
        if (window.gMenuOpen) {
            return;
        }

        // This handler opens a menu
        window.gMenuOpen = true;

        let targetButton = pEvent.currentTarget;
        let tileX = Number(targetButton.dataset.col);
        let tileY = Number(targetButton.dataset.row);
        let tileArmyId = targetButton.dataset.armyId;
        this.tileArmy = this.armyList[tileArmyId];

        this.tileArmy.waypoints.forEach( (position) => {
            this.newWaypoints.push ({ x: position.x, y: position.y});
        });

        // Add the waypoint click handlers
        for( let row = 0; row < this.tileMap.width; row++ ) {
            for(let col = 0; col < this.tileMap.height; col++ ) {
               // Add the click event
               let currentTile = document.getElementById('mapTable').rows[row].cells[col];
               currentTile.addEventListener('click', this.setWaypoint);
            }
        }

        // Replace the army info box with the army movement box
        document.getElementById('moveArmyBox').style.display = 'block';
        document.getElementById('armyInfoBox').style.display = 'none';

        this.displayWaypoints();

    };

    setWaypoint = (pEvent) => {
        let targetTile = pEvent.currentTarget;
        let tileX = Number(targetTile.dataset.col);
        let tileY = Number(targetTile.dataset.row);

        this.newWaypoints.push({x: tileX, y: tileY});
        this.displayWaypoints();
    }

    clearWaypoint = (pEvent) => {
        if (this.newWaypoints.length < 2) {
            // Only the current position is left,
            // so do nothing
            return;
        }

        let point = this.newWaypoints.pop();
        this.displayWaypoints();
    }

    cancelMovement = (pEvent) => {
        this.cleanup();
    };

    finishMovement = (pEvent) => {
        this.tileArmy.waypoints = this.newWaypoints;
        this.cleanup();
    }

    displayWaypoints = () => {
        // Show a list of waypoints in the army movement box
        let infoBox = document.getElementById('moveArmyList');
        infoBox.innerHTML = "";

        let waypointList = "";
        this.newWaypoints.forEach( (waypoint) => {
            waypointList += '(' + waypoint.x + ', ' + waypoint.y + ')<br>';
        });
        infoBox.innerHTML = waypointList;
    }

    cleanup = () => {
        let tileX = this.tileArmy.xPos;
        let tileY = this.tileArmy.yPos;

        // Manage exiting movement mode
        document.getElementById('moveArmyBox').style.display = 'none';

        // Reset to defaults
        this.newWaypoints = [];
        this.tileArmy = null;
        window.gMenuOpen = false;

        // Remove the waypoint click handlers
        for( let row = 0; row < this.tileMap.width; row++ ) {
            for(let col = 0; col < this.tileMap.height; col++ ) {
               // Remove the click event
               let currentTile = document.getElementById('mapTable').rows[row].cells[col];
               currentTile.removeEventListener('click', this.setWaypoint);
            }
        }

        // Reselect the current tile
        document.getElementById('mapTable').rows[tileY].cells[tileX].click();
    }
}