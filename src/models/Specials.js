// models/Specials.js
import mongoose from 'mongoose';

const SpecialsSchema = new mongoose.Schema({
  available: Object,
  day: [String],
  time: {
    start: String,
    end: String,
  },
  categoryId: [String],
  content: String,
  createdAt: String,
  updatedAt: String,
  image: String,
  slug: String,
  status: String,
  title: String,
  typeId: String,
  venueId: String,
  venueMeta: {
    location: {
      phone: String,
      postcode: String,
      status: String,
      street: String,
      suburb: String,
      city: String,
      region: String,
    },
    venue: {
      _id: String,
      title: String,
      slug: String,
    },
    cityObj: {
      title: String,
      slug: String,
    },
  },
});

export default mongoose.models.Specials || mongoose.model('Specials', SpecialsSchema);
