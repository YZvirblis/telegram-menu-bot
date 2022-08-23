// require("dotenv").config();
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

export default bot;
