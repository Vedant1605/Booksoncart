const mongoose = require('mongoose');
const Schema = mongoose.Schema

const orderSchema = new Schema({
    items: [
        {
            productData: { type: Object },
            quantity: { type: Number }
        }
    ],
    user: {
        userId:{
            type: Schema.Types.ObjectId,
            ref: 'Users'
        },
        name:{
            type:String
        }


    },
    date: {
        type: String
    }
})

module.exports = mongoose.model('Orders', orderSchema)

// const Order =sequelize.define('order',{
    // const sequelize = require('../util/database');
    // const Sequelize=require('sequelize') ;
//     id:{
//         type:Sequelize.INTEGER,
//         autoIncrement:true,
//         allowNull:false,
//         primaryKey:true
//     },
// })


// module.exports=Order