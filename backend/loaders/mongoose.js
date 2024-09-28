import mongoose from 'mongoose';


export default async () => {
 
  mongoose.set("strictQuery", false);
  await mongoose.connect(process.env.DATABASE_URL,{})
    .then(() => {
      console.log('Mongodb Connection');
    })
    .catch(err => {
      console.error("error while connecting to mongoodb",err);
    });
};