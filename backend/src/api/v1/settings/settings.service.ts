import Settings from '../../../models/Settings';
import { emitSettingsUpdated } from '../../../services/socket.service';

export async function getSettings(userId: number) {
  let settings = await Settings.findOne({ user_id: userId }).lean();

  if (!settings) {
    await Settings.create({ user_id: userId });
    settings = await Settings.findOne({ user_id: userId }).lean();
  }

  return settings;
}

export async function updateSettings(
  userId: number,
  data: {
    vibration?: boolean;
    sound?: boolean;
    hideTimer?: boolean;
    postpone?: number;
  }
) {
  const updated = await Settings.findOneAndUpdate(
    { user_id: userId },
    { $set: data },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).lean();

  emitSettingsUpdated({
    userId,
    vibration: updated.vibration,
    sound: updated.sound,
    hideTimer: updated.hideTimer,
    postpone: updated.postpone
  });

  return updated;
}
