export class MapMover {
    constructor() {
        // Singleton Pattern
        if (MapMover.instance != null) {
            return MapMover.instance;
        }

        this.startX = 0;
        this.startY = 0;

        this.previousX = 0;
        this.previousY = 0;

        MapMover.instance = this;
    }

    handleEvent = (pEvent) => {
        if (pEvent.button == 0 ) {
            pEvent.preventDefault();

            let table = pEvent.currentTarget;
            table.style.cursor = "grabbing";

            this.startX = pEvent.clientX;
            this.startY = pEvent.clientY;
            this.previousX = this.startX;
            this.previousY = this.startY;

            document.addEventListener("mousemove", this.dragMap);
            document.addEventListener("mouseup", this.releaseMap);
        }
    }

    dragMap = (pEvent) => {
        pEvent.preventDefault();
        let dx = pEvent.clientX - this.previousX;
        let dy = pEvent.clientY - this.previousY;
        this.previousX = pEvent.clientX;
        this.previousY = pEvent.clientY;

        let table = document.getElementById("mapBox");
        table.scrollTop = table.scrollTop - dy;
        table.scrollLeft = table.scrollLeft - dx;
    }

    releaseMap = (pEvent) => {
        let dx = pEvent.clientX - this.startX;
        let dy = pEvent.clientY - this.startY;

        // If more than 16 pixels moved, prevent tile selection
        if ( dx > 16 || dx < -16 || dy > 16 || dy < -16) {
            window.addEventListener('click', this.stopClick, true);
        }

        let table = document.getElementById("mapBox");

        table.style.cursor = "pointer";
        document.removeEventListener("mousemove", this.dragMap);
        document.removeEventListener("mouseup", this.releaseMap);
    }

    stopClick = (pEvent) => {
        // Executes on the capture phase
        // Prevents the normal tile click handler from firing
        pEvent.stopPropagation();
        window.removeEventListener('click', this.stopClick, true);
    }
}