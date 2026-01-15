import { Schema, model, Types, Document } from 'mongoose';

export interface MedicationLogDocument extends Document {
  patient_id: number;
  medication_id: Types.ObjectId;
  date: string;
  scheduled_time: string;
  status: 'not_taken' | 'taken_on_time' | 'taken_late';
  taken_at: Date | null;
  minutes_offset: number;
}

const MedicationLogSchema = new Schema<MedicationLogDocument>({
  patient_id: {
    type: Number,
    required: true
  },
  medication_id: {
    type: Schema.Types.ObjectId,
    ref: 'Medication',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  scheduled_time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['not_taken', 'taken_on_time', 'taken_late'],
    default: 'not_taken'
  },
  taken_at: {
    type: Date,
    default: null
  },
  minutes_offset: {
    type: Number,
    default: 0
  }
});

export default model<MedicationLogDocument>(
  'MedicationLog',
  MedicationLogSchema
);
