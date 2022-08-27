import { Composer, Context } from "telegraf";
import bot from "../../config/botConfig";

//   client1001678640360

const actions = [
  bot.action("1001678640360orders", (ctx: Context) => {
    ctx.answerCbQuery("1001678640360 This is action 1");
    console.log("1001678640360 This is action 1");
  }),
  bot.action("1001678640360community", (ctx: Context) => {
    ctx.answerCbQuery("1001678640360 This is action 2");
    console.log("1001678640360 This is action 2");
  }),
  bot.action("1001678640360contact", (ctx: Context) => {
    ctx.answerCbQuery("1001678640360 This is action 3");
    console.log("1001678640360 This is action 3");
  }),
];

module.exports = Composer.action(actions);
