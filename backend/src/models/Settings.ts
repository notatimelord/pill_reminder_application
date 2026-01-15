import { Schema, model } from 'mongoose';

const SettingsSchema = new Schema(
  {
    user_id: {
      type: Number,
      required: true,
      unique: true
    },

    vibration: {
      type: Boolean,
      default: true
    },

    sound: {
      type: Boolean,
      default: true
    },

    hideTimer: {
      type: Boolean,
      default: false
    },

    postpone: {
      type: Number,
      default: 5
    }
  },
  { timestamps: true }
);

export default model('Settings', SettingsSchema);
