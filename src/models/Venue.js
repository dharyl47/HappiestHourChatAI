// models/Venue.js
import mongoose from 'mongoose';

const VenueSchema = new mongoose.Schema({
  thh_id: Number,
  thh_key: String,
  update_history: [String],
  view_count: Number,
  accessToTFODeal: String,
  cityId: String,
  contact_email: String,
  contact_name: String,
  content: String,
  coordinates: [Number],
  country: String,
  createdAt: String,
  creatorId: String,
  email: String,
  featureId: [String],
  full_address: String,
  gallery: [String],
  image: String,
  location: {
    type: { type: String },
    coordinates: [Number],
  },
  metaForSpecial: Object,
  originalId: String,
  phone: String,
  planId: String,
  postcode: String,
  regionId: String,
  slug: String,
  sortOrder: Object,
  status: String,
  street: String,
  suburb: String,
  title: String,
  updatedAt: String,
  website: String,
  metaForSearch: {
    city: {
      title: String,
      slug: String,
    },
    region: {
      title: String,
      slug: String,
    },
  },
  mainImage: {
    filename: String,
    url: String,
  },
  features: [String],
  plan: {
    title: String,
    slug: String,
  },
});

export default mongoose.models.Venue || mongoose.model('Venue', VenueSchema);
