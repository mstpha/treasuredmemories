import mongooseLoader from './mongoose.js';
import expressLoader from './express.js';

//load env file
import { config } from "dotenv";
config();

export default async (app) => {
  await mongooseLoader();
  expressLoader(app);
}