import { Schema, model } from "mongoose";

const homepageContentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    content: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const HomepageContent = model("HomepageContent", homepageContentSchema);
