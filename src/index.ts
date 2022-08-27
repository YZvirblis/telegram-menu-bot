import mongoDB from "mongodb";
import connectToDatabase from "./config/dbConfig";
const actions = require("./actions/botActions");
import { Context } from "telegraf";
import bot from "./config/botConfig";
import express from "express";
import cron from "node-cron";

const expressApp = express();
bot.use(actions);

const getClient = async (username?: string | undefined) => {
  const db = await connectToDatabase();
  if (username) {
    //@ts-ignore
    const clients: mongoDB.Collection = await db.collection("Clients");
    const client = await clients.findOne({ username: `${username}` });
    return client;
  } else {
    //@ts-ignore
    const fetchedClients = await db.collection("Clients").find().toArray();
    return fetchedClients;
  }
};

bot.on("message", async (ctx: Context, next: any) => {
  //@ts-ignore
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
  //@ts-ignore
  const client = await getClient(ctx.message?.from.username);
  ctx.reply(`Hello there ${client?.username}`);
});

bot.command("start", async (ctx: Context) => {
  //@ts-ignore
  const client = await getClient(ctx.message?.from.username);
  if (client) {
    for (let i = 0; i < client.menus.length; i++) {
      try {
        bot.telegram.sendMessage(
          client.menus[i].chatID,
          client.menus[i].message,
          client.menus[i].replyMarkup
        );
      } catch (err) {
        console.log(err);
      }
    }
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

cron.schedule("0 */4 * * *", async () => {
  // cron.schedule("* * * * *", async () => {
  const clients = await getClient();
  for (let i = 0; i < clients.length; i++) {
    if (clients[i].posts) {
      for (const post of clients[i].posts) {
        if (post.photo) {
          bot.telegram.sendPhoto(post.channelID, post.photo, {
            caption: post.text,
          });
        } else {
          bot.telegram.sendMessage(post.channelID, post.text);
        }
      }
    }
  }
});

bot.hears("initiate", async (ctx: Context) => {
  console.log(ctx);
});

const port = process.env.PORT || 3000;
expressApp.get("/", (req, res) => {
  res.send("Hello World!");
});
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

bot.launch();
bot.catch((e: Error) => console.log(" ~ * ~ * ~ BOT ERROR: ", e));
