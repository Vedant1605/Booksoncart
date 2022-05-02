const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Product = require('./product');


const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    resetToken: {
        type: String
    },
    resetTokenExpiration: {
        type: Date
    },
    password: {
        type: String,
        required: true
    },
    contactNo: {
        type: Number,
        required: true
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId, ref: 'Product', required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ],
        totalPrice: 0
    }
})

userSchema.methods.addToCart = function (product) {
    let Qty = 1;
    const updatedCartItems = [...this.cart.items]
    let updatedTotalPrice = this.cart.totalPrice
    const cartProductIndex = this.cart.items.findIndex(item => {
        return item.productId.toString() === product._id.toString()
    })
    if (cartProductIndex >= 0) {
        // console.log('ifblock me hain')
        Qty = this.cart.items[cartProductIndex].quantity + 1
        updatedCartItems[cartProductIndex].quantity = Qty
        console.log('Qty', updatedCartItems[cartProductIndex].quantity)
        updatedTotalPrice = updatedTotalPrice + product.price
    }
    else {
        // console.log('ELESE ME HAIN')
        console.log('Qty', Qty)
        updatedCartItems.push({ productId: product._id, quantity: Qty })
        updatedTotalPrice = updatedTotalPrice + product.price
    }
    const updatedCart = { items: updatedCartItems, totalPrice: updatedTotalPrice }
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.deleteItemFromCart = function (id) {
    let updatedTotalPrice = this.cart.totalPrice
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== id.toString())
    const cartProduct = this.cart.items.find(item => {
        return item.productId.toString() === id.toString()
    })

    const productPrice= Product.findById(id).then(prd=>{
        return prd.price
    })
    console.log('product', productPrice)
    updatedTotalPrice=updatedTotalPrice-(productPrice*cartProduct)
    const updatedCart = { items: updatedCartItems, totalPrice: updatedTotalPrice }
    this.cart = updatedCart
    return this.save()
}
userSchema.methods.clearCart = function () {
    this.cart.items=[]
    this.cart.totalPrice=0
    return this.save()
}

module.exports = mongoose.model('User', userSchema)

// const getDb = require('../util/database').getDb;
// const mongodb = require('mongodb');

// class User {
    //     constructor(name, email, contactNo, cart, id) {
        //         this.name = name;
        //         this.email = email;
        //         this.contactNo = contactNo;
        //         this.cart = cart;
        //         this._id = id;
        //     }
//     save() {
    //         const db = getDb()
//         return db.collection('users').insertOne(this)
//     }
//     addToCart(product) {

    //     }
//     getCart() {
//         const db = getDb()
//         const cartProductIds = this.cart.items.map(item => {
    //             return item.productId
//         })
//         return db.collection('products').
//             find({ _id: { $in: cartProductIds } })
//             .toArray()
//             .then(products => {
//                 return products.map(product => {
    //                     return {
        //                         product: product,
//                         quantity: this.cart.items.find(item => item.productId.toString() === product._id.toString()).quantity
//                     }
//                 })
//             })
//     }

//     addOrder() {
//         const db = getDb()
//         console.log('this', this)
//         return this.getCart().then(product => {
    //             console.log('this', this)
    //             const orders = {
        //                 items: product,
        //                 user: {
//                     _id: new mongodb.ObjectID(this._id),
//                     username: this.name
//                 },
//                 date: new Date().toString().slice(0, 24)
//             }
//             return db.collection('orders')
//                 .insertOne(orders)
//                 .then(() => {
    //                     this.cart.items = [];
//                     return db
//                         .collection('users')
//                         .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } })
//                 })
//         })
//     }
//     getOrders() {
//         const db = getDb()
//         return db.
//             collection('orders')
//             .find({ 'user._id': new mongodb.ObjectID(this._id) }).toArray()
//     }
// }

// static findById(userId) {
//     const db = getDb()
//     // return db.collection('users').find({_id:new mongodb.ObjectID(userId)}).next()  *******THIS CAN ALSO BE DONE ********/
//     return db
//         .collection('users')
//         .findOne({ _id: new mongodb.ObjectID(userId) })
// }
// module.exports = User