import { Schema, model } from 'mongoose';

const MedicationDetailsSchema = new Schema(
  {
    med_name: { type: String, required: true },
    image_url: { type: String },
    tip: { type: String }
  },
  {
    collection: 'medication_details',
    timestamps: false
  }
);

export default model('MedicationDetails', MedicationDetailsSchema);
