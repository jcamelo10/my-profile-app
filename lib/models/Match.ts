import mongoose, { Schema, models } from "mongoose"

const MatchSchema = new Schema({
  matchNumber: { type: Number, required: true, unique: true },
  stage: { type: String, enum: ["group","r32","r16","qf","sf","3rd","final"], required: true },
  group: { type: String, default: null },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  homeFlag: { type: String, default: "" },
  awayFlag: { type: String, default: "" },
  kickoffUtc: { type: Date, required: true },
  venue: { type: String, default: "" },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  isFinished: { type: Boolean, default: false },
}, { timestamps: true })

const Match = models.Match || mongoose.model("Match", MatchSchema)
export default Match
