import * as mongoose from "mongoose";

export interface IUser {
  id: Number;
  name: string;
}

export const UserSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
