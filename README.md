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



new native connection
```js
bot.set("storage", new MongoDbBotStorage(new MongoDBStorageClient({
    url: "mongodb://localhost/mydb",
    mongoOptions: {}
})));
```

mongoose connection
```js
const connection = mongoose.createConnection(/* ... */);
bot.set("storage", new MongoDbBotStorage(new MongoDBStorageClient({
    mongooseConnection: connection
})));
```

db connection
```js
MongoClient.connect("mongodb://localhost/mydb", (error, db) => {
    bot.set("storage", new MongoDbBotStorage(new MongoDBStorageClient({db})));
});
```

promise connection
```js
const dbPromise = new Promise((resolve, reject) => {
	MongoClient.connect("mongodb://localhost/mydb", (error, db) => {
		if (error) {
			reject(error);
		} else {
			resolve(db);
		}
	});
});

bot.set("storage", new MongoDbBotStorage(new MongoDBStorageClient({dbPromise})));
```