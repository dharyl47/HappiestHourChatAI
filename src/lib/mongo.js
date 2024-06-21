import mongoose from "mongoose";

const connectMongoDB = async () => {
    try{
        await mongoose.connect("mongodb+srv://thh:"+process.env.PASSWORD+"@clustersydney.yap1bzz.mongodb.net/thh?retryWrites=true&w=majority&appName=ClusterSydney");
        console.log("Connected to MongoDB")
    } catch (Error) {
        console.log("Error")
    }
};

export default connectMongoDB;