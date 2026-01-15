import { Types } from 'mongoose';

import MedicationLog from '../../../models/MedicationLog';
import Medication from '../../../models/Medication';
import MedicationDetails from '../../../models/MedicationDetails';


export async function getScheduleByDate(
  patientId: number,
  date: string
): Promise<any[]> {
let logs = await MedicationLog.aggregate([
  {
    $match: {
      patient_id: patientId,
      date
    }
  },
  {
    $lookup: {
      from: 'medications',
      localField: 'medication_id',
      foreignField: '_id',
      as: 'med'
    }
  },
  {
    $unwind: {
      path: '$med',
      preserveNullAndEmptyArrays: false
    }
  },
  {
    $match: {
      'med.patient_id': patientId
    }
  },
  {
    $lookup: {
      from: 'medication_details',
      localField: 'med.med_name',
      foreignField: 'med_name',
      as: 'details'
    }
  },
  {
    $unwind: {
      path: '$details',
      preserveNullAndEmptyArrays: true
    }
  }
]);


  if (!logs.length) {
    await createDailyLogs(patientId, date);
    return getScheduleByDate(patientId, date);
  }

 return logs.map(log => {
  const taken =
    log.status === 'taken_on_time' ||
    log.status === 'taken_late';

  const medName = log.med?.med_name ?? 'Unknown medication';
  const dosage = log.med?.dosage ?? '';
  const scheduledTime = log.scheduled_time;

  return {
    logId: log._id.toString(),
    patientId: log.patient_id,

    name: medName,
    dosage,

    scheduledTime,

    taken,
    takenStatus:
      log.status === 'taken_late'
        ? 'delayed'
        : log.status === 'taken_on_time'
        ? 'on-time'
        : null,

    time: log.taken_at ?? null,
    delayMinutes: log.minutes_offset ?? null,

    image_url: log.details?.image_url ?? null,
    tip: log.details?.tip ?? null,

    in: 'Now',
    displayButton: taken ? 'Undo' : 'Take',
    displayDueText: `Due at ${scheduledTime}`
  };
});
} 

async function createDailyLogs(
  patientId: number,
  date: string
) {
  const existing = await MedicationLog.findOne({
    patient_id: patientId,
    date
  });

  if (existing) return;

  const meds = await Medication.find({
    patient_id: patientId
  }).lean<any[]>();

  if (!meds.length) return;

  const logs = meds.map(med => ({
    patient_id: patientId,
    medication_id: med._id,
    date,
    scheduled_time: med.time,
    status: 'not_taken',
    taken_at: null,
    minutes_offset: 0
  }));

  await MedicationLog.insertMany(logs);
}
export async function takeDose(logId: string) {
  const log = await MedicationLog.findById(
    new Types.ObjectId(logId)
  );

  if (!log) {
    throw new Error('Medication log not found');
  }

  const now = new Date();
  const scheduled = new Date(
    `${log.date}T${log.scheduled_time}:00`
  );

  const diffMinutes = Math.round(
    (now.getTime() - scheduled.getTime()) / 60000
  );

  const isDelayed = diffMinutes > 5;

  log.status = isDelayed ? 'taken_late' : 'taken_on_time';
  log.taken_at = now;
  log.minutes_offset = Math.max(diffMinutes, 0);

  await log.save();

  return {
    date: log.date,
    takenAt: now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    takenStatus: isDelayed ? 'delayed' : 'on-time',
    delayMinutes: log.minutes_offset
  };
}

export async function snoozeDose(
  logId: string,
  minutes: number
) {
  const log = await MedicationLog.findById(
    new Types.ObjectId(logId)
  );

  if (!log) {
    throw new Error('Medication log not found');
  }

  log.minutes_offset = (log.minutes_offset ?? 0) + minutes;
  log.status = 'not_taken';
  log.taken_at = null;

  await log.save();

  return {
    date: log.date,
    snoozedBy: minutes,
    totalOffset: log.minutes_offset
  };
}

export async function undoDose(logId: string) {
  const log = await MedicationLog.findById(
    new Types.ObjectId(logId)
  );

  if (!log) {
    throw new Error('Medication log not found');
  }

  log.status = 'not_taken';
  log.taken_at = null;
  log.minutes_offset = 0;

  await log.save();

  return {
    date: log.date
  };
}
