const messages = require("../lang/en/en.js");

class Utils {
    static getDate(name) {
        const now = new Date();
        // Replace %name with the actual name
        const message = messages.getGreeting().replace("%name", name);
        // Wrap in inline CSS for blue color
        return `<p style="color:blue;">${message} ${now}</p>`;
    }
}

module.exports = Utils;
