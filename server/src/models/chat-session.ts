import { Schema, Types, model } from "mongoose";
import type { LearningLevel } from "./user.js";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  fallback: boolean;
}

interface ChatSessionFields {
  userId: Types.ObjectId;
  title: string;
  messages: ChatMessage[];
  levelAtCreation: LearningLevel;
}

const chatSessionSchema = new Schema<ChatSessionFields>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, trim: true, required: true, maxlength: 80 },
    messages: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        fallback: { type: Boolean, default: false },
      },
    ],
    levelAtCreation: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
  },
  { timestamps: true }
);

chatSessionSchema.index({ userId: 1, updatedAt: -1 });

export const ChatSession = model<ChatSessionFields>("ChatSession", chatSessionSchema);
