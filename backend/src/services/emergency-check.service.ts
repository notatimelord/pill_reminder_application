import MedicationLog from '../../models/MedicationLog';
import User from '../../models/User';
import { emitEmergencyStart } from './socket.service';

const TZ = 'Europe/Athens';
const GRACE_MINUTES = 5;

function todayDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ });
}

function nowInTZ(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: TZ })
  );
}

export async function checkDailyEmergencies() {
  const users = await User.find().lean();
  const now = nowInTZ();
  const today = todayDate();

  for (const user of users) {
    if (user.lastEmergencyDate === today) continue;

    const logs = await MedicationLog.find({
      patient_id: user.userId,
      date: today
    }).lean();

    if (!logs.length) continue;
    const lastScheduledTime = logs
      .map(l => l.scheduled_time)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .at(-1);

    if (!lastScheduledTime) continue;

    const lastScheduled = new Date(
      `${today}T${lastScheduledTime}:00`
    );

    lastScheduled.setMinutes(
      lastScheduled.getMinutes() + GRACE_MINUTES
    );

    if (now < lastScheduled) continue;

    const takenCount = logs.filter(
      l =>
        l.status === 'taken_on_time' ||
        l.status === 'taken_late'
    ).length;

    if (takenCount === 0) {
      console.log(
        `[EMERGENCY] user ${user.userId} missed ALL meds today`
      );

      emitEmergencyStart({ userId: user.userId });

      await User.updateOne(
        { _id: user._id },
        { lastEmergencyDate: today }
      );
    }
  }
}
