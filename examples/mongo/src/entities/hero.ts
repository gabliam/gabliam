import { Document, mongoose } from '@gabliam/mongoose';

export interface HeroModel {
  name: string;
  power: string;
  amountPeopleSaved: number;
  createdAt?: Date;
  modifiedAt?: Date;
}

@Document('Hero')
export class Hero {
  static getSchema() {
    const schema = new mongoose.Schema({
      name: {
        type: String,
        required: true
      },
      power: {
        type: String,
        required: true
      },
      amountPeopleSaved: {
        type: Number,
        required: false
      },
      createdAt: {
        type: Date,
        required: false
      },
      modifiedAt: {
        type: Date,
        required: false
      }
    });

    schema.pre('save', function(this: HeroModel, next) {
      if (this) {
        const now = new Date();
        if (!this.createdAt) {
          this.createdAt = now;
        }
        this.modifiedAt = now;
      }
      next();
    });

    return schema;
  }
}
