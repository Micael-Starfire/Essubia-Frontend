export class ManageNotifications {
    constructor() {
        // Singleton Pattern
        if (ManageNotifications.instance != null) {
            return ManageNotifications.instance;
        }

        this.notificationsList = [];

        document.getElementById('closeManageNotifications').addEventListener('click', this.closeNotifications);

        ManageNotifications.instance = this;
    }

    handleEvent = (pEvent) => {
        document.getElementById('manageNotificationsBox').style.display = 'block';
    }

    closeNotifications = (pEvent) => {
        document.getElementById('manageNotificationsBox').style.display = 'none';
        document.getElementById('manageNotificationsList').innerHTML = "";
    }
}