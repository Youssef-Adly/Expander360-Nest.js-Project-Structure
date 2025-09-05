import * as mongoose from "mongoose"


export const ReportSchema = new mongoose.Schema({
  projectId: Number,
  title: String,
  content: String,
  tags: String,
})