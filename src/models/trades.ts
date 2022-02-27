import * as mongoose from "mongoose";
import { IUser } from "./users";

const Int = {
  type: Number,
  validate: {
    validator: Number.isInteger,
    message: "{VALUE} is not an integer value",
  },
};

export interface ITrade extends mongoose.Document {
  id: number;
  type: "buy" | "sell";
  user: IUser;
  symbol: string;
  shares: number;
  price: number;
  timestamp?: Date | string;
}

const UserType = {
  type: "object",
  required: ["id", "name"],
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
  },
};

export const TradeSchema = new mongoose.Schema(
  {
    id: { ...Int, unique: true, required: true },
    type: { type: String, enum: ["buy", "sell"], required: true },
    user: UserType,
    symbol: { type: String, required: true },
    shares: { ...Int, required: true, min: 10, max: 30 },
    price: {
      type: Number,
      required: true,
      min: 130.4,
      max: 195.65,
      set: (v: Number) => v.toFixed(2),
    },
  },
  { timestamps: { createdAt: "timestamp" } }
);

export const TradeModel = mongoose.model<ITrade>("Trade", TradeSchema);
