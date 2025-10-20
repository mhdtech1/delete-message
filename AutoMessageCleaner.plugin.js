//META{"name":"AutoMessageCleaner","author":"YourName","version":"1.0.0","description":"Automatically cleans messages in Discord channels."}*//

class AutoMessageCleaner {
    getName() { return "AutoMessageCleaner"; }
    getAuthor() { return "YourName"; }
    getVersion() { return "1.0.0"; }
    getDescription() { return "Automatically cleans messages in Discord channels."; }

    start() {
        console.log("AutoMessageCleaner has started.");
        // Add your plugin logic here
    }

    stop() {
        console.log("AutoMessageCleaner has stopped.");
        // Cleanup logic here
    }
}
