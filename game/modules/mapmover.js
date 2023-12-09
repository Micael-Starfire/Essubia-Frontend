export class MapMover {
    constructor() {
        this.startX = 0;
        this.startY = 0;
    }

    handleEvent = (pEvent) => {
        if (pEvent.button == 0 ) {
            pEvent.preventDefault();

            let table = pEvent.currentTarget;
            table.style.cursor = "grabbing";

            this.startX = pEvent.clientX;
            this.startY = pEvent.clientY;

            document.addEventListener("mousemove", this.dragMap);
            document.addEventListener("mouseup", this.releaseMap);
        }
    }

    dragMap = (pEvent) => {
        pEvent.preventDefault();
        let dx = pEvent.clientX - this.startX;
        let dy = pEvent.clientY - this.startY;
        this.startX = pEvent.clientX;
        this.startY = pEvent.clientY;

        let table = document.getElementById("mapBox");
        table.scrollTop = table.scrollTop - dy;
        table.scrollLeft = table.scrollLeft - dx;
    }

    releaseMap = (pEvent) => {
        let table = document.getElementById("mapBox");

        table.style.cursor = "pointer";
        document.removeEventListener("mousemove", this.dragMap);
        document.removeEventListener("mouseup", this.releaseMap);
    }
}