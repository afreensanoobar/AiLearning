import { Schema, model } from "mongoose";
const notificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    eventKey: { type: String, trim: true },
}, { timestamps: true });
notificationSchema.index({ userId: 1, eventKey: 1 }, { unique: true, partialFilterExpression: { eventKey: { $type: "string" } } });
export const Notification = model("Notification", notificationSchema);
