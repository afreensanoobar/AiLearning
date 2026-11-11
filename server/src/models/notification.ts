import { Schema, Types, model } from "mongoose";

interface NotificationFields {
  userId: Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
}

const notificationSchema = new Schema<NotificationFields>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = model<NotificationFields>("Notification", notificationSchema);
