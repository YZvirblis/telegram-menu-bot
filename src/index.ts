import mongoDB from "mongodb";
import connectToDatabase from "./config/dbConfig";
import * as actions from "./actions/botActions";
import { Context } from "telegraf";
import bot from "./config/botConfig";
import { telegrafThrottler } from "telegraf-throttler";

const throttler = telegrafThrottler();

const getClient = async (username: string | undefined) => {
  const db = await connectToDatabase();
  //@ts-ignore
  const clients: mongoDB.Collection = await db.collection("Clients");
  const client = await clients.findOne({ username: `${username}` });
  return client;
};

bot.on("message", (ctx: Context, next: any) => {
  if (ctx.message?.from.username === "YuraZvirblis") {
    //@ts-ignore
    if (ctx.message.photo) {
      //@ts-ignore
      ctx.reply(`${ctx.message.photo[0].file_id}`);
    }
  }
  next(ctx);
});

bot.command("test", async (ctx: Context) => {
  const client = await getClient(ctx.message?.from.username);
  ctx.reply(`Hello there ${client?.username}`);
});

bot.command("start", async (ctx: Context) => {
  const client = await getClient(ctx.message?.from.username);
  if (client) {
    bot.telegram.sendMessage(client.chatID, client.message, client.replyMarkup);
  }
});

bot.command("send", async (ctx: Context) => {
  const client = await getClient(ctx.message?.from.username);
  if (client) {
    for (const post of client.posts) {
      if (post.photo) {
        bot.telegram.sendPhoto(
          post.channelID ? post.channelID : client.chatID,
          post.photo,
          { caption: post.text }
        );
      } else {
        bot.telegram.sendMessage(
          post.channelID ? post.channelID : client.chatID,
          post.text
        );
      }
    }
  }
});

bot.command("help", (ctx: Context) => {
  ctx.reply("List of commands goes here");
});

bot.catch((e: Error) => console.log(" ~ * ~ * ~ BOT ERROR: ", e));
bot.use(actions);
bot.use(throttler);
bot.launch();
