import mongoDB from "mongodb";
import connectToDatabase from "./config/dbConfig";
const actions = require("./actions/botActions");
import { Context } from "telegraf";
import bot from "./config/botConfig";
import express from "express";
import cron from "node-cron";
import fs from "fs";

const expressApp = express();
bot.use(actions);

// GEY USER ITEMS AND SAVE ON FILE
const writeUserItems = async () => {
  const username = "YuraZvirblis";

  const db = await connectToDatabase();
  //@ts-ignore
  const clients: mongoDB.Collection = await db.collection("Clients");
  const client = await clients.findOne({ username: `${username}` });
  //@ts-ignore
  const items = JSON.stringify(client.items);

  const fileStream = fs.createWriteStream(`${process.cwd()}/src/DB/items.json`);
  fileStream.write(items);
  fileStream.close;
};
writeUserItems();

// CONTROLLER SET UP COMMANDS FOR ADMIN:
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
bot.command("chatid", (ctx: Context) => {
  ctx.reply(ctx.update.message.chat.id.toString());
});

// bot.command("test", async (ctx: Context) => {
//   //@ts-ignore
//   const client = await getClient(ctx.message?.from.username);
//   ctx.reply(`Hello there ${client?.username}`);
// });

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

bot.command("start", async (ctx: Context) => {
  //@ts-ignore
  const client = await getClient(ctx.message?.from.username);
  if (client) {
    if (client.menu.photo) {
      try {
        bot.telegram.sendPhoto(ctx.update.message.chat.id, client.menu.photo, {
          parse_mode: "markdown",
          caption: client.menu.message,
          reply_markup: client.menu.replyMarkup.reply_markup,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        bot.telegram.sendMessage(
          ctx.update.message.chat.id,
          client.menu.message,
          client.menu.replyMarkup
        );
      } catch (err) {
        console.log(err);
      }
    }
  }
});

// cron.schedule("0 */4 * * *", async () => {
//   await writeUserItems();
//   // cron.schedule("* * * * *", async () => {
//   const clients = await getClient();
//   for (let i = 0; i < clients.length; i++) {
//     if (clients[i].posts) {
//       for (const post of clients[i].posts) {
//         if (post.photo) {
//           bot.telegram.sendPhoto(post.channelID, post.photo, {
//             caption: post.text,
//           });
//         } else {
//           bot.telegram.sendMessage(post.channelID, post.text);
//         }
//       }
//     }
//   }
// });

const port = process.env.PORT || 3000;
expressApp.get("/", (req, res) => {
  res.send("Hello World!");
});
expressApp.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

bot.launch();
bot.catch((e: Error) => console.log(" ~ * ~ * ~ BOT ERROR: ", e));
