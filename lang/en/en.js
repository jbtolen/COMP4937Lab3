class Messages {
    constructor() {
        this.greeting = "Hello %name, What a beautiful day. Server current date and time is";
    }

    getGreeting() {
        return this.greeting;
    }
}

module.exports = new Messages();
