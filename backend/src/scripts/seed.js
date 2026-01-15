const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb://ami-fullstack-admin:i7iPL2ABWzC0J3euvEaKATnU8D9DKZCg@database:27000/ami-fullstack?authSource=admin";


const users = [
  { _id: 1, password: 123, type: "Grandma", name: "Eleni", surname: "Papadaki", age: 76, occupation: "Retired primary school teacher", condition: "chronic heart failure, hypertension" },
  { _id: 2, password: 123, type: "Parent", name: "Maria", surname: "Kostaki", age: 42, occupation: "Accountant", condition: "anemia, sinus infections" },
  { _id: 3, password: 123, type: "Child", name: "Sofia", surname: "Lianou", age: 9, occupation: "Primary school student", condition: "cold, mild bronchitis" },
  { _id: 4, password: 123, type: "YoungAdult", name: "Andreas", surname: "Michas", age: 23, occupation: "Junior software engineer", condition: "asthma, seasonal allergies" }
];

const defaultSettings = [
  { userId: 1, vibration: true, sound: false, hideTimer: false, postpone: 5 },
  { userId: 2, vibration: true, sound: false, hideTimer: false, postpone: 5 },
  { userId: 3, vibration: true, sound: true,  hideTimer: false, postpone: 5 },
  { userId: 4, vibration: true, sound: false, hideTimer: false, postpone: 5 }
];

const ICONS = {
  Ramipril: "assets/icons/ramipril.png",
  Bisoprolol: "assets/icons/bisoprolol.png",
  Furosemide: "assets/icons/furosemide.png",
  Spironolactone: "assets/icons/spironolactone.png",
  Atorvastatin: "assets/icons/atorvastatin.png",

  "Iron Supplement": "assets/icons/iron.png",
  "Vitamin D": "assets/icons/vitamind.png",

  Amoxicillin: "assets/icons/amoxicillin.png",
  "Cough Syrup": "assets/icons/pill.png",

  "Preventive Inhaler": "assets/icons/inhaler.png",
  "Vitamin B Complex": "assets/icons/vitaminb.png"
};

const medications = [
  { med_name: "Ramipril",        dosage: "5mg",  time: "08:30", patient_id: 1 },
  { med_name: "Bisoprolol",      dosage: "5mg",  time: "09:00", patient_id: 1 },
  { med_name: "Furosemide",      dosage: "40mg", time: "10:00", patient_id: 1 },
  { med_name: "Spironolactone",  dosage: "25mg", time: "12:00", patient_id: 1 },
  { med_name: "Atorvastatin",    dosage: "20mg", time: "21:00", patient_id: 1 },

  { med_name: "Iron Supplement", dosage: "325mg",  time: "08:00", patient_id: 2 },
  { med_name: "Vitamin D",       dosage: "1000IU", time: "09:00", patient_id: 2 },

  { med_name: "Amoxicillin",     dosage: "250mg", time: "08:00", patient_id: 3 },
  { med_name: "Cough Syrup",     dosage: "10ml",  time: "20:00", patient_id: 3 },

  { med_name: "Preventive Inhaler", dosage: "1 puff",   time: "07:30", patient_id: 4 },
  { med_name: "Vitamin B Complex",  dosage: "1 tablet", time: "09:30", patient_id: 4 }
];

const TIPS = {
  Ramipril: "Take Ramipril at the same time each day to keep your blood pressure stable.",
  Bisoprolol: "Bisoprolol may cause dizziness — take it slowly and avoid sudden standing.",
  Furosemide: "Avoid taking Furosemide late in the evening, as it increases urination.",
  Spironolactone: "While taking Spironolactone, avoid potassium-rich salt substitutes.",
  Atorvastatin: "Atorvastatin works best when taken in the evening.",

  "Iron Supplement": "Taking your Iron supplement with Vitamin C improves absorption.",
  "Vitamin D": "Take Vitamin D with food to improve absorption.",

  Amoxicillin: "Finish the full Amoxicillin course, even if you feel better.",
  "Cough Syrup": "After taking cough syrup, avoid lying down immediately.",

  "Preventive Inhaler": "After using your preventive inhaler, rinse your mouth to prevent irritation.",
  "Vitamin B Complex": "Vitamin B Complex is best taken in the morning for an energy boost."
};

const medicationDetails = Object.keys(ICONS).map(name => ({
  med_name: name,
  image_url: ICONS[name],
  tip: TIPS[name] || "No tip available."
}));


function todayDateString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}



async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db("ami-fullstack");
  console.log("Connected to MongoDB");
  await Promise.all([
    db.collection("users").deleteMany({}),
    db.collection("settings").deleteMany({}),
    db.collection("medications").deleteMany({}),
    db.collection("medication_details").deleteMany({}),
    db.collection("medication_logs").deleteMany({})
  ]);

  await db.collection("users").insertMany(users);
  await db.collection("settings").insertMany(defaultSettings);

  const medsResult = await db
    .collection("medications")
    .insertMany(medications);

  await db
    .collection("medication_details")
    .insertMany(medicationDetails);

  const today = todayDateString();
  const logs = [];

  Object.values(medsResult.insertedIds).forEach((medId, index) => {
    const med = medications[index];

    logs.push({
      patient_id: med.patient_id,
      medication_id: medId,

      date: today,
      scheduled_time: med.time,

      status: "not_taken",
      taken_at: null,
      minutes_offset: null
    });
  });

  await db.collection("medication_logs").insertMany(logs);

  console.log("Database seeded successfully");
  await client.close();
}

seed().catch(err => {
  console.error("Seeding failed:", err);
});
