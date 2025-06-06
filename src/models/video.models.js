import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aagregate-paginate-v2';

const VideoSchema = new Schema(
  {
    videoFiles: {
      required: true,
      type: String, // using cloudinary URL
    },
    thumbnail: {
      required: true,
      type: String, // using cloudinary URL
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // using cloudinary URL
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true } // CreatedAt, UpdatedAt
);
export const Video = mongoose.model('Video', UserSchema);
