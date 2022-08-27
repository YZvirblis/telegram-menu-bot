import { Composer } from "telegraf";
const client1 = require("./actionLibrary/-1001638859125.actions");
const client2 = require("./actionLibrary/-1001678640360.actions");

const actions = [client1, client2];

module.exports = Composer.action(actions);
