import mongoose, { Schema, models } from "mongoose"

const PredictionSchema = new Schema({
  userId: { type: String, required: true },
  matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  homeScore: { type: Number, required: true },
  awayScore: { type: Number, required: true },
  points: { type: Number, default: null },
}, { timestamps: true })

PredictionSchema.index({ userId: 1, matchId: 1 }, { unique: true })

const Prediction = models.Prediction || mongoose.model("Prediction", PredictionSchema)
export default Prediction
