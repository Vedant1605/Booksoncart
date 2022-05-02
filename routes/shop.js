const express=require('express') ;
const router=express.Router()
const shopController=require('../controllers/shop')
const isAuth =require('../middleware/is-auth')

router.get('/',shopController.getIndex)
router.get('/products',shopController.getProducts)

router.get('/products/:productId',shopController.getProduct)

router.post('/cart',isAuth,shopController.postCart)
router.get('/cart',isAuth,shopController.getCart)
router.delete('/cart/:productId',isAuth,shopController.CartDeleteProduct)

router.get('/checkout',isAuth,shopController.getCheckout)
router.get('/checkout/cancel',isAuth,shopController.getCheckout)
router.get('/checkout/success',isAuth,shopController.getCheckoutSuccess)

router.get('/orders',isAuth,shopController.getOrders)
router.get('/orders/:orderId',isAuth,shopController.getInvoice)

module.exports=router