const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const order = require('../models/order');
const PDFDoc = require('pdfkit');
const session = require('express-session');
const stripe = require('stripe')(`sk_test_51H81v8CecUU2sn326rZuAIYp1H9KBHqIkR4mGhlNBXxCOGaFazs10PzWVnP9xgt7plgEx8QDGziFz3OxtOukmWZM00x92sLUsf`)
const ITEMS_PER_PAGE = 6
exports.getProducts = (req, res) => {
    const pageNo = Number(req.query.page) || 1;
    let totalNoprods;
    Product
        .find()
        .countDocuments()
        .then(numofProds => {
            totalNoprods = numofProds;
            return Product
                .find()
                .skip((pageNo - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            console.log('object', Math.ceil(totalNoprods / ITEMS_PER_PAGE))
            res.render('shop/product-list', {
                pageTitle: 'Home',
                prods: products,
                path: '/products',
                currentPage: pageNo,
                hasNextPage: ITEMS_PER_PAGE * pageNo < totalNoprods,
                hasPreviousPage: pageNo > 1,
                nextPage: Number(pageNo) + 1,
                previousPage: pageNo - 1,
                lastPage: Math.ceil(totalNoprods / ITEMS_PER_PAGE),
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error)
        })
}
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    // const loggedIn=req.get('Cookie').trim().split('=')
    Product.findById(prodId).then((product) => {
        res.render('shop/product-details', {
            pageTitle:
                product.title, product: product, path: '/products/id'
        })
    })
}
exports.getCart = (req, res, next) => {

    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            let total = 0;
            products.forEach(p => {
                // console.log('p', p)
                total = total + p.quantity * p.productId.price
                // console.log('total', total)
            })
            res.render('shop/cart', {
                pageTitle: 'cart',
                path: '/cart',

                cartProducts: user.cart.items,
                cartTotalprice: total,
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error)
        })
}
exports.postCart = (req, res) => {
    const prodId = req.body.productId
    // const loggedIn=req.get('Cookie').trim().split('=')
    Product.findById(prodId).then(product => {
        // console.log('product', product)
        return req.user.addToCart(product)
    }).then(() => {
        res.redirect('/cart')
    }).catch(error => { console.log(error) });
}
exports.CartDeleteProduct = (req, res) => {

    const prodId = req.params.productId
    req.user
        .deleteItemFromCart(prodId)
        .then(() => {
            res.status(200).json({
                message: 'Succes'
            })
        })
        .catch((err) => {
            res.status(500).json({
                message: 'failed'
            })
        })
}
exports.getCheckout = (req, res, next) => {
    let products;
    let total = 0;
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            products = user.cart.items;
            products.forEach(p => {
                total += p.quantity * p.productId.price
            })
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: p.productId.price * 100,
                        currency: 'inr',
                        quantity: p.quantity
                    }
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
            })

        })
        .then(session => {
            res.render('shop/checkout', {
                pageTitle: 'checkout',
                path: '/ck',
                cartProducts: products,
                cartTotalprice: total,
                sessionId: session.id
            })
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error)
        })
}
exports.getOrders = (req, res) => {

    // const loggedIn=req.get('Cookie').trim().split('=')
    Order.find({ 'user.userId': req.user }).then(orders => {
        res.render('shop/orders', { pageTitle: 'My Orders', orders: orders, path: '/order' })
    })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error)
        })
}
exports.getCheckoutSuccess = (req, res) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate().then(user => {
            const products = user.cart.items.map(item => {
                return { quantity: item.quantity, productData: { ...item.productId._doc } }
            })

            const order = new Order({
                items: products,
                user: {
                    name: req.user.name,
                    userId: req.user._id,
                },
                date: new Date().toString().slice(0, 24)
            })
            order.save()
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error)
        })
}
exports.getIndex = (req, res) => {
    const pageNo = Number(req.query.page) || 1;
    let totalNoprods;
    Product
        .find()
        .countDocuments()
        .then(numofProds => {
            totalNoprods = numofProds;
            return Product
                .find()
                .skip((pageNo - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            console.log('object', Math.ceil(totalNoprods / ITEMS_PER_PAGE))
            res.render('shop/index', {
                pageTitle: 'Home',
                prods: products,
                path: '/',
                currentPage: pageNo,
                hasNextPage: ITEMS_PER_PAGE * pageNo < totalNoprods,
                hasPreviousPage: pageNo > 1,
                nextPage: Number(pageNo) + 1,
                previousPage: pageNo - 1,
                lastPage: Math.ceil(totalNoprods / ITEMS_PER_PAGE),
            })
        })
        .catch(err => console.log('err', err))
}
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId).then(order => {
        if (!order) {
            return next(new Error('Not found'))
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized'))
        }
        const invoiceName = 'invoice-' + orderId + '.pdf'
        const invoicePath = path.join('data', 'invoices', invoiceName)

        const pdfDoc = new PDFDoc();

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline;filename="${invoiceName}"`)

        pdfDoc.pipe(fs.createWriteStream(invoicePath))
        pdfDoc.pipe(res)

        pdfDoc.fontSize(26).text('       Hello !! Here is yours Invoice')
        pdfDoc.text('----------------------------------------------------')
        let total = 0;
        order.items.forEach((item) => {
            pdfDoc.fontSize(20).text(item.productData.title + ': Rs.' + item.productData.price)
            pdfDoc.text('------------------------------------------------')
            total = total + item.productData.price
        });
        pdfDoc.text('|')
        pdfDoc.text('|')
        pdfDoc.fontSize(26).text('total :' + total)
        pdfDoc.end()

    }).catch(err => { next(err) })


}