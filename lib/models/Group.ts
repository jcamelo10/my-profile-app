import mongoose, { Schema, models } from "mongoose"

const GroupSchema = new Schema({
  name: { type: String, required: true },
  inviteCode: { type: String, required: true, unique: true },
  adminEmail: { type: String, required: true },
  members: [{ type: String }],
}, { timestamps: true })

const Group = models.Group || mongoose.model("Group", GroupSchema)
export default Group
