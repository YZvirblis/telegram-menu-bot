require("dotenv").config();
import mongoDB, { MongoClient } from "mongodb";
const mongoUri = process.env.MONGO_CONNECTION_STRING;
let cachedDB: null | mongoDB.Db = null;

const connectToDatabase = async () => {
  if (cachedDB) {
    console.log("Use existing connection");
    return Promise.resolve(cachedDB);
  } else {
    //@ts-ignore
    return await MongoClient.connect(mongoUri)
      .then((client) => {
        cachedDB = client.db("TelegramBot");
        console.log("NEW DATABASE CONNECTION");
        return cachedDB;
      })
      .catch((err) => {
        console.log("MONGO ERROR: ", err);
      });
  }
};

export default connectToDatabase;
