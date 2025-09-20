import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

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
      type: Number, // duration in seconds
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

// Add pagination plugin
VideoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', VideoSchema);
