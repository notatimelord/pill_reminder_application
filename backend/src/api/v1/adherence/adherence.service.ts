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
  return new Date(
    `${dateStr}T${timeStr}:00+02:00`
  );
}

export async function getAdherence(
  patientId: number,
  days: number
) {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(
      new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Athens'
      })
    );
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  let totalOnTime = 0;
  let totalLate = 0;
  let totalMissed = 0;

  const weekly: DailyAdherence[] = [];

  const nowAthens = new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Athens'
    })
  );

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
      if (log.taken_at) {
        const scheduled = toAthensDate(
          log.date,
          log.scheduled_time
        );

        const takenAt = new Date(
          new Date(log.taken_at).toLocaleString('en-US', {
            timeZone: 'Europe/Athens'
          })
        );

        const diffMinutes =
          (takenAt.getTime() - scheduled.getTime()) / 60000;

        if (diffMinutes > 0) {
          late++;
        } else {
          onTime++;
        }

        continue;
      }
      const scheduled = toAthensDate(
        log.date,
        log.scheduled_time
      );

      if (nowAthens > scheduled) {
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

    weekly.push({
      date,
      day: new Date(
        new Date(date).toLocaleString('en-US', {
          timeZone: 'Europe/Athens'
        })
      ).toLocaleDateString('en-GB', {
        weekday: 'short'
      }),
      taken: onTime + late,
      late,
      missed,
      total,
      state
    });
  }

  return {
    taken: totalOnTime + totalLate,
    late: totalLate,
    missed: totalMissed,
    weekly
  };
}
