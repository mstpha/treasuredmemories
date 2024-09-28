import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
  fullName: {
    required: true,
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

const User = model("User", userSchema);
export default User;


