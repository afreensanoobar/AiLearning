import { Schema, Types, model } from "mongoose";

interface NotificationFields {
  userId: Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  eventKey?: string;
  createdAt?: Date;
}

const notificationSchema = new Schema<NotificationFields>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    eventKey: { type: String, trim: true },
  },
  { timestamps: true }
);

notificationSchema.index(
  { userId: 1, eventKey: 1 },
  { unique: true, partialFilterExpression: { eventKey: { $type: "string" } } }
);

export const Notification = model<NotificationFields>("Notification", notificationSchema);
