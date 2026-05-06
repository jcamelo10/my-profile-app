import mongoose, { Schema, models } from "mongoose"

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, default: "" },
  groupId: { type: String, default: null },
  tournamentPicks: {
    champion: { type: String, default: "" },
    runnerUp: { type: String, default: "" },
    thirdPlace: { type: String, default: "" },
    topScorer: { type: String, default: "" },
    goldenBall: { type: String, default: "" },
    goldenGlove: { type: String, default: "" },
    groupAdvance: { type: [String], default: [] },
  },
  picksLocked: { type: Boolean, default: false },
}, { timestamps: true })

const User = models.User || mongoose.model("User", UserSchema)
export default User
