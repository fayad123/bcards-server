const mongoose = require("mongoose");

const cardSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String },
    phone: {
      type: String,
      required: true,
      match: /^05\d{8,9}$/,
    },
    email: { type: String, required: true, minlength: 5, unique: true },
    web: { type: String },
    image: {
      type: {
        url: { type: String, required: true },
        alt: { type: String, required: true },
      },
    },
    address: {
      type: {
        state: { type: String, default: "not defined" },
        country: { type: String, required: true },
        city: { type: String, required: true },
        street: { type: String, required: true },
        houseNumber: { type: Number, required: true },
        zip: { type: String, default: "0" },
      },
    },
    bizNumber: { type: Number },
    likes: { type: Array },
    user_id: { type: String },
    createdAt: { type: String, default: new Date().toLocaleString() },
    updatedAt: { type: String, default: new Date().toLocaleString() },
    __v: { type: Number },
  },
  { timestamps: true }
);

const Cards = mongoose.model("Cards", cardSchema);

module.exports = Cards;
