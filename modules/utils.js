const messages = require("../lang/en/en.js");

class Utils {
    static getDate(name) {
        const now = new Date();
        // Replace %name with the actual name in the greeting
        const message = messages.getGreeting().replace("%name", name);
        return `<p style="color:blue;">${message} ${now.toString()}</p>`;
    }
}

module.exports = Utils;
