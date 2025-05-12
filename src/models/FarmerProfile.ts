import mongoose, { Schema, Document } from 'mongoose';

export interface IFarmerProfile extends Document {
  user: mongoose.Schema.Types.ObjectId;
  farmName: string;
  description: string;
  profileImage: string;
  coverImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    }
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  farmingMethods: string[];
  certifications: Array<{
    name: string;
    issuedBy: string;
    issuedDate: Date;
    expiryDate?: Date;
    image?: string;
  }>;
  gallery: string[];
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  establishedYear?: number;
  farmSize?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FarmerProfileSchema = new Schema<IFarmerProfile>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  farmName: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String },
  },
  farmingMethods: [{
    type: String,
    enum: ['Organic', 'Conventional', 'Hydroponic', 'Permaculture', 'Biodynamic', 'Sustainable', 'Other'],
  }],
  certifications: [{
    name: { type: String, required: true },
    issuedBy: { type: String, required: true },
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date },
    image: { type: String },
  }],
  gallery: [{
    type: String,
  }],
  socialMedia: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String },
  },
  establishedYear: {
    type: Number,
  },
  farmSize: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.models.FarmerProfile || mongoose.model<IFarmerProfile>('FarmerProfile', FarmerProfileSchema);