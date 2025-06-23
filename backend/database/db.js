import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
           dbName : "pinterest",
        });
        console.log("connected DB")
    } catch (error) {
        console.log(error);
    }
}
export default connectDb;