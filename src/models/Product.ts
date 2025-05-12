import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  farmer: mongoose.Schema.Types.ObjectId;
  category: string;
  images: string[];
  price: number;
  unit: string;
  quantityAvailable: number;
  isOrganic: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  harvestDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  farmer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Dairy', 'Eggs', 'Meat', 'Herbs', 'Honey', 'Bakery', 'Processed', 'Other'],
  },
  images: [{
    type: String,
    required: true,
  }],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'lb', 'piece', 'bunch', 'dozen', 'liter', 'pint', 'quart', 'gallon'],
  },
  quantityAvailable: {
    type: Number,
    required: true,
    min: 0,
  },
  isOrganic: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  harvestDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
  },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);