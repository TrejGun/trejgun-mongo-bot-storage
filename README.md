# USAGE

es5
```js
var storage = require("mongo-bot-storage");
var MongoDbBotStorage = storage.MongoDbBotStorage;
var MongoDBStorageClient = storage.MongoDBStorageClient;
```

es6
```js
import {MongoDbBotStorage, MongoDBStorageClient} from "mongo-bot-storage";
```

default connection
```js
bot.set("storage", new MongoDbBotStorage(new MongoDBStorageClient()));
```

custom connection
```js
const connection = mongoose.createConnection(/* ... */);
bot.set("storage", new MongoDbBotStorage(new MongoDBStorageClient(connection)));
```