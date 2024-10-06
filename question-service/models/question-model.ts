import mongoose, { Schema, Document } from 'mongoose';

interface IQuestion extends Document {
  questionId: number;
  title: string;
  description: string;
  category: string[];
  difficulty: string;
}

const questionSchema: Schema = new Schema({
  questionId: { 
    type: Number, 
    required: true, 
    unique: true 
},
  title: { 
    type: String, 
    required: true 
},
  description: { 
    type: String, 
    required: true 
},
  category: { 
    type: [String], 
    required: true, 
    validate: [(val: string[]) => val.length <= 2, 'Max 2 categories allowed'] 
},
  difficulty: { 
    type: String, 
    required: true 
},
});

const Question = mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
