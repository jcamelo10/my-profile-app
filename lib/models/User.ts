import mongoose, { Schema, models } from "mongoose"

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, default: "" },
  age: { type: Number, default: null },
  favoriteFood: { type: String, default: "" },
  favoriteTeam: { type: String, default: "" },
})

const User = models.User || mongoose.model("User", UserSchema)

export default User