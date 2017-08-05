import {Schema} from "mongoose";


export default new Schema({
	partitionKey: String,
	rowKey: String,
	data: Schema.Types.Mixed,
});
