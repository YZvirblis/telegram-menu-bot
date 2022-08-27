import { Composer, Context } from "telegraf";
import bot from "../../config/botConfig";

const actions = [
  bot.action("action-1,1", (ctx: Context) => {
    ctx.answerCbQuery("שורה 1 כפטור 1");
    console.log("שורה 1 כפטור 1");
  }),
  bot.action("action-1,2", (ctx: Context) => {
    ctx.answerCbQuery("שורה 1 כפטור 2");
    console.log("שורה 1 כפטור 2");
  }),
  bot.action("action-3,1", (ctx: Context) => {
    ctx.answerCbQuery("שורה 3 כפטור 1");
    console.log("שורה 3 כפטור 1");
  }),
  bot.action("action-3,2", (ctx: Context) => {
    ctx.answerCbQuery("שורה 3 כפטור 2");
    console.log("שורה 3 כפטור 2");
  }),
  bot.action("action-3,3", (ctx: Context) => {
    ctx.answerCbQuery("שורה 3 כפטור 3");
    console.log("שורה 3 כפטור 3");
  }),
];

module.exports = Composer.action(actions);
