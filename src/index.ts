import mongoDB from "mongodb";
import connectToDatabase from "./config/dbConfig";
import * as actions from "./actions/botActions";
import { Context } from "telegraf";
import bot from "./config/botConfig";
import { telegrafThrottler } from "telegraf-throttler";
import express from "express";
import cron from "node-cron";

const expressApp = express();
const throttler = telegrafThrottler();
bot.use(throttler);

const getClient = async (username?: string | undefined) => {
  const db = await connectToDatabase();
  //@ts-ignore
  const clients: mongoDB.Collection = await db.collection("Clients");
  if (username) {
    const client = await clients.findOne({ username: `${username}` });
    return client;
  } else {
    return clients;
  }
};

bot.on("message", async (ctx: Context, next: any) => {
  if (ctx.message?.from.username === "YuraZvirblis") {
    //@ts-ignore
    if (ctx.message.photo) {
      //@ts-ignore
      await ctx.reply(`${ctx.message.photo[0].file_id}`);
    }
  }
  next(ctx);
});

bot.command("test", async (ctx: Context) => {
  const client = await getClient(ctx.message?.from.username);
  //@ts-ignore
  await ctx.reply(`Hello there ${client?.username}`);
});

bot.command("start", async (ctx: Context) => {
  const client = await getClient(ctx.message?.from.username);
  if (client) {
    await bot.telegram.sendMessage(
      //@ts-ignore
      client.chatID,
      //@ts-ignore
      client.message,
      //@ts-ignore
      client.replyMarkup
    );
  }
});

// bot.command("send", async (ctx: Context) => {
//   const client = await getClient(ctx.message?.from.username);
//   if (client) {
//     for (const post of client.posts) {
//       if (post.photo) {
//         await bot.telegram.sendPhoto(
//           post.channelID ? post.channelID : client.chatID,
//           post.photo,
//           { caption: post.text }
//         );
//       } else {
//         await bot.telegram.sendMessage(
//           post.channelID ? post.channelID : client.chatID,
//           post.text
//         );
//       }
//     }
//   }
// });

bot.command("help", (ctx: Context) => {
  ctx.reply("List of commands goes here");
});

bot.use(actions);
bot.launch();
bot.catch((e: Error) => console.log(" ~ * ~ * ~ BOT ERROR: ", e));

cron.schedule("* * * * *", async () => {
  console.log("running a task every minute");
  const clients = await getClient();
  //@ts-ignore
  for (const client of clients) {
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
  }
});

const port = process.env.PORT || 3000;
expressApp.get("/", (req, res) => {
  res.send("Hello World!");
});
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
