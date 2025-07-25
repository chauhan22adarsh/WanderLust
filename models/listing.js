const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
        required:true},
    description:{
        type:String,
        required:true},
    image:{
        filename:{
            type:String,
            default:"listingimage",
        },
        url:{
        type:String,
        default:"https://images.unsplash.com/photo-1712652056542-58ca6baac1d3?q=80&w=737&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        set:(v)=>v===""?"https://images.unsplash.com/photo-1712652056542-58ca6baac1d3?q=80&w=737&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D":v,
        },
        default:{},
        },
    price:{
        type:Number,
        required:true,},
    location:{
        type:String,
        required:true},
    country:{
        type:String,
        required:true},
})

const listing=mongoose.model("Listing",listingSchema);
module.exports=listing;