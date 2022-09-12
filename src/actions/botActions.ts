import { Composer } from "telegraf";
const YuraZvirblis = require("./actionLibrary/YuraZvirblis.actions");

const actions = [YuraZvirblis];

module.exports = Composer.action(actions);
