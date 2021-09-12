/* Dependencies */
const {MongoClient} = require("mongodb");
const config = require("./config");


const mongoClient = {}
const mongoKey = "mongoUri"

mongoClient._connectClient = async function(uri) {
  uri = uri && uri.length > 0? uri : config[mongoKey];
  const client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  return client;
}
mongoClient.database = async function (name, uri='') {
    return (await mongoClient._connectClient(uri)).db(name);
}

module.exports = mongoClient;