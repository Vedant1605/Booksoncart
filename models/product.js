const mongoose  = require("mongoose");

const Schema = mongoose.Schema

const productSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    imageUrl:{
        type:String,
        required:true,
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
})

module.exports=mongoose.model('Product',productSchema)



// const mongodb=require('mongodb');
// const getDb = require('../util/database').getDb;
// class Product {
//     constructor(title, price, description, imageUrl,id,userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description
//         this.imageUrl = imageUrl
//         this._id = id?new mongodb.ObjectID(id):null // Converting string to mongoDb ObjectId Datatype
//         this.userId = userId
//     }
//     save() {
//         const db = getDb();
//         let dbOperation;
//         if(this.id){
//            dbOperation = db.collection("products").updateOne({_id:this.id},{$set:this})
//         }
//         else{
//            dbOperation= db.collection("products").insertOne(this)
//         }
//         return dbOperation
//         .then().catch(err=>{console.log('err', err)});
//     }
//     static fetchAll(){
//         const db = getDb();
//         return db.collection("products").find().toArray()
//     }
//     static findById(id){
//         const db =getDb()
//         return db.collection('products').find({_id:new mongodb.ObjectID(id)}).next().then(product=>product).catch(err=>{console.log('err', err)})
//     }
//     static deleteById(id){
//         const db=getDb()
//         return db.collection('products').deleteOne({_id:new mongodb.ObjectID(id)}).then().catch(error=>{console.log(error)});
//     }
// }

// module.exports = Product;