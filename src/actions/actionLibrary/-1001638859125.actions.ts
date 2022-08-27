import { Composer, Context } from "telegraf";
import bot from "../../config/botConfig";

//   client1001638859125

const actions = [
  bot.action("1", (ctx: Context) => {
    ctx.answerCbQuery("This is action 1");
    console.log("This is action 1");
  }),
  bot.action("2", (ctx: Context) => {
    ctx.answerCbQuery("This is action 2");
    console.log("This is action 2");
  }),
  bot.action("3", (ctx: Context) => {
    ctx.answerCbQuery("This is action 3");
    console.log("This is action 3");
  }),
];

module.exports = Composer.action(actions);
