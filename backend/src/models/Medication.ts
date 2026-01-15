import { Schema, model } from 'mongoose';

const MedicationSchema = new Schema(
  {
    med_name: { type: String, required: true },
    dosage: { type: String, required: true }
  },
  {
    collection: 'medications',
    timestamps: false
  }
);

export default model('Medication', MedicationSchema);
