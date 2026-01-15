import mongoose from "mongoose";


interface MedicationDoc {
  med_name: string;
  dosage: string;
  time: string; 
  patient_id: number;
}

interface MedicationDetailsDoc {
  med_name: string;
  image_url?: string;
  tip?: string;
}

export interface NextMedication {
  userId: number;
  med_name: string;
  dosage: string;
  image: string | null;
  tip: string;
  scheduled_time: string; 
}
export async function getNextMedicationForUser(
  userId: number
): Promise<NextMedication | null> {

  const db = mongoose.connection.db;
  if (!db) throw new Error("Mongo not connected");

const now = new Date(
  new Date().toLocaleString('en-US', { timeZone: 'Europe/Athens' })
);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const medications = await db
    .collection<MedicationDoc>("medications")
    .find({ patient_id: userId })
    .toArray();
  if (!medications.length) {
    return null;
  }

  const withDelta = medications.map(med => {
    const [hh, mm] = med.time.split(":").map(Number);
    const medMinutes = hh * 60 + mm;

    const delta =
      medMinutes >= nowMinutes
        ? medMinutes - nowMinutes
        : 1440 - nowMinutes + medMinutes;

    const enriched = { ...med, delta };
    return enriched;
  });

  const next = withDelta.sort((a, b) => a.delta - b.delta)[0];

  const details = await db
    .collection<MedicationDetailsDoc>("medication_details")
    .findOne({ med_name: next.med_name });

  const result = {
    userId,
    med_name: next.med_name,
    dosage: next.dosage,
    image: details?.image_url ?? null,
    tip: details?.tip ?? "",
    scheduled_time: next.time
  };
  return result;
}
