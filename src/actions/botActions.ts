import { Composer } from "telegraf";
const YuraZvirblis1001705288428 = require("./actionLibrary/YuraZvirblis.-1001705288428.actions");
const Elvis1001791937124 = require("./actionLibrary/Elvis.-1001791937124.actions");

const actions = [YuraZvirblis1001705288428, Elvis1001791937124];

module.exports = Composer.action(actions);
