import MedicationLog from '../../../models/MedicationLog';

type DailyAdherence = {
  date: string;
  day: string;
  taken: number;
  late: number;
  missed: number;
  total: number;
  state: 'good' | 'ok' | 'bad';
};

function toAthensDate(dateStr: string, timeStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const baseUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const offsetMinutes =
    -new Date(
      baseUtc.toLocaleString('en-US', {
        timeZone: 'Europe/Athens'
      })
    ).getTimezoneOffset();

  return new Date(baseUtc.getTime() + offsetMinutes * 60000);
}

export async function getAdherence(
  patientId: number,
  days: number
) {
  const dates: string[] = [];

  const todayAthens = new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Athens'
    })
  );

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(todayAthens);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  let totalOnTime = 0;
  let totalLate = 0;
  let totalMissed = 0;

  const weekly: DailyAdherence[] = [];
  const now = new Date();

  for (const date of dates) {
    const logs = await MedicationLog.aggregate([
      { $match: { patient_id: patientId, date } },
      {
        $lookup: {
          from: 'medications',
          localField: 'medication_id',
          foreignField: '_id',
          as: 'med'
        }
      },
      { $unwind: '$med' },
      { $match: { 'med.patient_id': patientId } }
    ]);

    let onTime = 0;
    let late = 0;
    let missed = 0;

    for (const log of logs) {
      const scheduled = toAthensDate(
        log.date,
        log.scheduled_time
      );

      if (log.taken_at) {
        const takenAt = new Date(
  new Date(log.taken_at).toLocaleString('en-US', {
    timeZone: 'Europe/Athens'
  })
);

        const diffMinutes =
  (takenAt.getTime() - scheduled.getTime()) / 60000;

if (diffMinutes > 10) {
  late++;
} else {
  onTime++;
}

        continue;
      }

      if (now > scheduled) {
        missed++;
      }
    }

    const total = logs.length;

    totalOnTime += onTime;
    totalLate += late;
    totalMissed += missed;

    let state: 'good' | 'ok' | 'bad' = 'bad';
    const effectiveTotal = onTime + late + missed;

    if (effectiveTotal > 0) {
      const ratio = (onTime + late) / effectiveTotal;
      if (ratio === 1) state = 'good';
      else if (ratio >= 0.5) state = 'ok';
    }

    const day = new Date(
      new Date(date).toLocaleString('en-US', {
        timeZone: 'Europe/Athens'
      })
    ).toLocaleDateString('en-GB', {
      weekday: 'short'
    });

    weekly.push({
      date,
      day,
      taken: onTime,
      late,
      missed,
      total,
      state
    });
  }

  return {
    taken: totalOnTime,
    late: totalLate,
    missed: totalMissed,
    weekly
  };
}
