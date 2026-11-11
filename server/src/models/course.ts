import { Schema, model } from "mongoose";

interface CourseFields {
  slug: string;
  title: string;
  category: string;
  order: number;
  ui: {
    color: string;
    bg: string;
    icon: string;
    iconColor: string;
  };
}

const courseSchema = new Schema<CourseFields>(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    order: { type: Number, required: true, min: 0 },
    ui: {
      color: { type: String, required: true },
      bg: { type: String, required: true },
      icon: { type: String, required: true },
      iconColor: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export const Course = model<CourseFields>("Course", courseSchema);
