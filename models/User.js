const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    first: { type: String, required: true, minlength: 2 },
    middle: { type: String },
    last: { type: String, required: true },
  },
  isBusiness: { type: Boolean, required: true },
  isAdmin: { type: Boolean, default: false },
  phone: { type: String, required: true },
  email: { type: String, required: true, minlength: 2 },
  password: { type: String, required: true, minlength: 2 },
  address: {
    type: {
      state: { type: String },
      country: { type: String, required: true, minlength: 2 },
      city: { type: String, required: true, minlength: 2 },
      street: { type: String, required: true },
      houseNumber: { type: Number, required: true },
      zip: { type: Number, required: true },
    },
  },
  loginStamp: { type: Array },
  image: {
    url: {
      type: String,
      required: false,
      default:
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
    },
    alt: { type: String, required: false, default: "profile picture" },
  },
});

const User = mongoose.model("Users", userSchema);

module.exports = User;
