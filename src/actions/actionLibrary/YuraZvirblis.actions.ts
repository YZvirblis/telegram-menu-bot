import mongoDB from "mongodb";
import { Composer, Context } from "telegraf";
import bot from "../../config/botConfig";
const data = require(`${process.cwd()}/src/DB/items.json`);
import connectToDatabase from "../../config/dbConfig";
import IValidationData from "../../Interfaces/IValidationData";
import axios from "axios";
require("dotenv").config();

const getUser = async () => {
  const db = await connectToDatabase();
  //@ts-ignore
  const clients: mongoDB.Collection = await db.collection("Clients");
  const client = await clients.findOne({ username: `${username}` });
  return client;
};

let cart: any = {};
const username = "YuraZvirblis";
const clientChatID = "969904554";
const groupID = "-1001791937124";
const menuPicture =
  "AgACAgQAAxkBAANJYyBHy_S76peFWyLuHNIsvOyX9nYAAhu6MRuPxgABUaL_dCQV8Vi6AQADAgADcwADKQQ";
const validationData: IValidationData = {};
let isAwaitingVideoNote = false;
let isAwaitingID = false;
let isAwaitingFB = false;
let messageToDelete: number | undefined = undefined;

const actions = Composer.action([
  // BACK TO MAIN
  bot.action("-1001791937124-action-0", (ctx: Context) => {
    isAwaitingFB = false;
    isAwaitingID = false;
    isAwaitingVideoNote = false;
    messageToDelete = undefined;
    getMainMenu(ctx);
    ctx.answerCbQuery();
    ctx.deleteMessage();
  }),
  // MAP ALL MENU CATEGORIES
  bot.action("-1001791937124-action-1", (ctx: Context) => {
    getCategoriesMenu(ctx, data);
    ctx.answerCbQuery();
    ctx.deleteMessage();
  }),
  // MAP ALL ACTIONS/ITEMS FOR CATEGORIES
  data.map((category: any, catIndex: any) => {
    return bot.action(
      `-1001791937124-action-1-${catIndex + 1}`,
      (ctx: Context) => {
        getCategoryMenu(ctx, category, catIndex, formatCurrentCart());
        ctx.answerCbQuery();
        ctx.deleteMessage();
      }
    );
  }),
  // ADD OR REMOVE ITEMS FROM CART (ACTIONS)
  data.map((category: any, catIndex: any) => {
    return category.items.map((item: any, itemIndex: any) => {
      bot.action(
        `-1001791937124-action-1-${catIndex + 1}-${itemIndex + 1}-add`,
        (ctx: Context) => {
          cart[item] = cart[item] ? cart[item] + 1 : 1;
          getCategoryMenu(ctx, category, catIndex, formatCurrentCart());
          ctx.answerCbQuery();
          ctx.deleteMessage();
        }
      ),
        bot.action(
          `-1001791937124-action-1-${catIndex + 1}-${itemIndex + 1}-subtract`,
          (ctx: Context) => {
            cart[item] = cart[item] ? cart[item] - 1 : 0;
            getCategoryMenu(ctx, category, catIndex, formatCurrentCart());
            ctx.answerCbQuery();
            ctx.deleteMessage();
          }
        );
    });
  }),
  // DISPLAY CART AND CHECKOUT BUTTON
  bot.action("-1001791937124-action-1-cart", async (ctx: Context) => {
    const user = await getUser();
    const isValidated =
      user && user.clients.includes(ctx.update.callback_query.from.username)
        ? true
        : false;
    //@ts-ignore
    validationData.username = ctx.update.callback_query.from.username;
    bot.telegram.sendPhoto(ctx.chat?.id, menuPicture, {
      disable_notification: true,
      caption: `${
        formatCurrentCart() === null
          ? ""
          : ` \n\ . \n\ __סל הקניות שלך__: \n\ ${formatCurrentCart()} \n\ .`
      }`,
      parse_mode: "markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "להזדהות / שליחת הזמנה 📝",
              callback_data: `${
                isValidated
                  ? "-1001791937124-action-1-checkout"
                  : "-1001791937124-action-1-validate"
              }`,
            },
          ],
          [
            {
              text: "חזרה 🔙",
              callback_data: `-1001791937124-action-1`,
            },
          ],
        ],
      },
    });
    ctx.answerCbQuery();
    ctx.deleteMessage();
  }),
  // RESET CART
  bot.action("-1001791937124-action-1-reset-cart", async (ctx: Context) => {
    cart = {};
    getCategoriesMenu(ctx, data);
    ctx.answerCbQuery();
    ctx.deleteMessage();
  }),
  // DISPLAY CHECKOUT MENU
  bot.action("-1001791937124-action-1-checkout", (ctx: Context) => {
    bot.telegram.sendPhoto(ctx.chat?.id, menuPicture, {
      disable_notification: true,
      parse_mode: "markdown",
      caption: `הזמנתכם התקבלה, המתינו בסבלנות ויצרו איתכם קשר 🙂`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "חזרה לתפריט הראשי 🔙",
              callback_data: `-1001791937124-action-0`,
            },
          ],
        ],
      },
    });

    bot.telegram.sendMessage(
      clientChatID,
      `
    יש לך הזמנה חדשה מ[${ctx.callbackQuery?.from.username}](tg://user?id=${
        ctx.callbackQuery?.from.id
      }) \n\ ${formatCurrentCart()} \n\ .
    `,
      {
        parse_mode: "markdown",
      }
    );
    ctx.answerCbQuery();
    ctx.deleteMessage();
  }),
  // VALIDATION 1ST STEP
  bot.action("-1001791937124-action-1-validate", (ctx: Context) => {
    bot.telegram.sendPhoto(ctx.chat?.id, menuPicture, {
      disable_notification: true,
      parse_mode: "markdown",
      caption: `היכונו לתהליך האימות. \n\ *תידרשו לספק:* \n\ *-* סרטון של עצמכם אומרים: תאריך נוכחי ומספר סודי שנוצר במיוחד בשבילכם \n\ *-* תכינו צילום תעודת זהות / רשיון - צילום מסך פייסבוק / אינסטגרם \n\ __הזמן שתעשו את זה מאוד חשוב לאימות - השתדלו להיות מוכנים.__`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "אני מוכן לאימות ✅",
              callback_data: `-1001791937124-action-1-validate-1`,
            },
          ],
          [
            {
              text: "חזרה לתפריט הראשי 🔙",
              callback_data: `-1001791937124-action-0`,
            },
          ],
        ],
      },
    });
    ctx.answerCbQuery();
    ctx.deleteMessage();
  }),
  // ANSWER CB QUERY FOR LINK OUTPUT
  bot.action("-1001791937124-action-0-video-info", (ctx: Context) => {
    ctx.answerCbQuery();
  }),
  // VALIDATION 2ND STEP
  bot.action("-1001791937124-action-1-validate-1", (ctx: Context) => {
    isAwaitingVideoNote = true;
    //@ts-ignore
    validationData.code = Math.floor(Math.random() * 1001).toString();
    messageToDelete = ctx.update.callback_query.message?.message_id;
    bot.telegram.sendPhoto(ctx.chat?.id, menuPicture, {
      disable_notification: true,
      parse_mode: "markdown",
      caption: `שלחו בבקשה סרטון עגול שלכם אומרים תאריך של היום ואת הקוד הסודי שנוצר במיוחד בשבילכם והוא: ${
        //@ts-ignore
        validationData.code
      }`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "מה זה סרטון עגול? ❓",
              callback_data: `-1001791937124-action-0-video-info`,
              url: "https://www.youtube.com/watch?v=pkxc-cA97I4",
            },
          ],
          [
            {
              text: "חזרה לתפריט הראשי 🔙",
              callback_data: `-1001791937124-action-0`,
            },
          ],
        ],
      },
    });
    ctx.answerCbQuery();
    ctx.deleteMessage();
  }),
  // BOT AWAITS VIDEO NOTE INPUT
  bot.on("video_note", (ctx: Context) => {
    if (
      //@ts-ignore
      validationData.username === ctx.update.message.from.username &&
      isAwaitingVideoNote
    ) {
      let today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const yyyy = today.getFullYear();
      //@ts-ignore
      today = mm + "/" + dd + "/" + yyyy;
      //@ts-ignore
      validationData.currentDate = today;
      //@ts-ignore
      validationData.videoNote = ctx.update.message.video_note.file_id;
      isAwaitingVideoNote = false;
      isAwaitingID = true;
      bot.telegram.sendPhoto(ctx.chat?.id, menuPicture, {
        disable_notification: true,
        parse_mode: "markdown",
        caption: `עוד קצת ומסיימים, כעת יש לשלוח צילום ת"ז/רשיון נהיגה...`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "חזרה לתפריט הראשי 🔙",
                callback_data: `-1001791937124-action-0`,
              },
            ],
          ],
        },
      });
    }
  }),
  // BOT AWAITS PHOTO INPUT
  bot.on("photo", (ctx: Context) => {
    if (
      //@ts-ignore
      validationData.username === ctx.update.message.from.username &&
      isAwaitingID
    ) {
      //@ts-ignore
      validationData.photoID = ctx.message?.photo[0].file_id;
      // ctx.deleteMessage(messageToDelete);
      bot.telegram.sendPhoto(ctx.chat?.id, menuPicture, {
        disable_notification: true,
        parse_mode: "markdown",
        caption: `הגעתם לשלב האחרון, יש לשלוח צילום מסך של עמוד הפייסבוק/אינסטגרם שלכם`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "חזרה לתפריט הראשי 🔙",
                callback_data: `-1001791937124-action-0`,
              },
            ],
          ],
        },
      });
      isAwaitingID = false;
      isAwaitingFB = true;
    }
    if (
      //@ts-ignore
      validationData.username === ctx.update.message.from.username &&
      isAwaitingFB &&
      !isAwaitingID &&
      //@ts-ignore
      ctx.message?.photo[0].file_id !== validationData.photoID
    ) {
      //@ts-ignore
      validationData.photoFB = ctx.message?.photo[0].file_id;
      isAwaitingFB = false;

      // SEND DATA TO CLIENT
      //@ts-ignore
      validationData.cart = cart;

      bot.telegram.sendMessage(
        clientChatID,
        `לקוח חדש ממתין לאישור: \n\ . \n\
        תאריך: ${validationData.currentDate} \n\
        שם משתמש: [${validationData.username}](tg://user?id=${
          ctx.update.message?.from.id
        }) \n\
        קוד סודי: ${validationData.code} \n\
        ${
          formatCurrentCart() === null
            ? ""
            : `__סל הקניות של הלקוח: \n\ ${formatCurrentCart()} \n\ `
        }על מנת להכניס משתמש זה לרשימת הלקוחות המאושרים יש להשיב עם הפקודה הבאה (עם שם המשתמש של הלקוח): \n\ \u002Fverify ${
          validationData.username
        }
        `,
        {
          parse_mode: "markdown",
        }
      );
      setTimeout(() => {
        bot.telegram.sendVideoNote(clientChatID, validationData.videoNote);
      }, 50);
      setTimeout(() => {
        bot.telegram.sendPhoto(clientChatID, validationData.photoID);
      }, 100);
      setTimeout(() => {
        bot.telegram.sendPhoto(clientChatID, validationData.photoFB);
      }, 150);

      // ctx.deleteMessage(messageToDelete);
      bot.telegram.sendPhoto(ctx.chat?.id, menuPicture, {
        disable_notification: true,
        parse_mode: "markdown",
        caption: `סיימנו את תהליך ההזדהות, הנתונים שלכם כעת נבדקים. יש להמתין בסבלנות ויצרו איתכם קשר 🙂.`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "חזרה לתפריט הראשי 🔙",
                callback_data: `-1001791937124-action-0`,
              },
            ],
          ],
        },
      });
    }
  }),
  // VERIFY FUNCTION FOR USER
  bot.command("verify", async (ctx: Context) => {
    if (ctx.update.message.from.username === username) {
      //@ts-ignore
      const { _id, ...currentUser } = await getUser();
      currentUser &&
        //@ts-ignore
        ctx.update.message.text.split("\u002Fverify ")[1] &&
        currentUser.clients.push(
          //@ts-ignore
          ctx.update.message.text.split("\u002Fverify ")[1]
        );
      const res = await axios.put(
        //@ts-ignore
        process.env.ADMIN_CLIENT_CONTROLLER,
        { client: currentUser }
      );
      if (res.data.lastErrorObject.updatedExisting) {
        ctx.reply("הלקוח אומת בהצלחה");
      }
    }
  }),
]);

const getCategoriesMenu = (ctx: Context, data: any) => {
  return bot.telegram.sendPhoto(ctx.chat?.id, menuPicture, {
    disable_notification: true,
    parse_mode: "markdown",
    caption: `קטגוריות ${
      formatCurrentCart() === null
        ? ""
        : ` \n\ . \n\ __סל הקניות שלך__: \n\ ${formatCurrentCart()} \n\ .`
    }`,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "איפוס סל ❌",
            callback_data: `-1001791937124-action-1-reset-cart`,
          },
          {
            text: "סל קניות 🛒",
            callback_data: `-1001791937124-action-1-cart`,
          },
        ],
        ...data.map((item: any, index: any) => {
          return [
            {
              text: item.category,
              callback_data: `-1001791937124-action-1-${index + 1}`,
            },
          ];
        }),
        [
          {
            text: "חזרה 🔙",
            callback_data: `-1001791937124-action-0`,
          },
        ],
      ],
    },
  });
};
const getMainMenu = async (ctx: Context) => {
  const user = await getUser();
  return bot.telegram.sendPhoto(
    ctx.update.callback_query.message?.chat.id,
    //@ts-ignore
    user.menu.photo,
    {
      //@ts-ignore
      caption: user.menu.message,
      parse_mode: "markdown",
      //@ts-ignore
      reply_markup: user.menu.replyMarkup.reply_markup,
    }
  );
};
const getCategoryMenu = (
  ctx: Context,
  category: any,
  index: any,
  newCart?: any
) => {
  return bot.telegram.sendPhoto(ctx.chat?.id, menuPicture, {
    disable_notification: true,
    parse_mode: "markdown",
    caption: `${category.category} ${
      formatCurrentCart() === null
        ? ""
        : ` \n\ . \n\ __סל הקניות שלך__: \n\ ${formatCurrentCart()} \n\ .`
    }`,
    reply_markup: {
      inline_keyboard: [
        ...category.items.map((product: any, productIndex: any) => {
          return [
            {
              text: "➕",
              // callback_data: `-1001791937124-action-1-item`,
              callback_data: `-1001791937124-action-1-${index + 1}-${
                productIndex + 1
              }-add`,
            },
            {
              text: product,
              // callback_data: `-1001791937124-action-1-item`,
              callback_data: `-1001791937124-action-1-${index + 1}-${
                productIndex + 1
              }`,
            },
            {
              text: "➖",
              // callback_data: `-1001791937124-action-1-item`,
              callback_data: `-1001791937124-action-1-${index + 1}-${
                productIndex + 1
              }-subtract`,
            },
          ];
        }),
        [
          {
            text: "חזרה 🔙",
            callback_data: `-1001791937124-action-1`,
          },
        ],
      ],
    },
  });
};
const formatCurrentCart = () => {
  let currentCart: any = [];
  for (const item in cart) {
    currentCart.push({ name: item, quantity: cart[item] });
  }
  if (currentCart.length > 0) {
    return `${currentCart
      .map((item: any) => {
        if (item.quantity > 0) {
          return `*${item.name}*: ${item.quantity} \n\ `;
        }
      })
      .toString()
      .replaceAll(",", "")}
    `;
  } else {
    return null;
  }
};

module.exports = actions;
