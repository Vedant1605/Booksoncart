const express=require('express') ;
const adminController=require('../controllers/admin') ;
const router=express.Router()
const isAuth =require('../middleware/is-auth')

router.get('/add-product',isAuth, adminController.getAddProduct)
router.post('/add-product',isAuth, adminController.postAddProduct)
router.get('/edit-product/:productId',isAuth,adminController.getEditProduct)
router.post('/edit-product',isAuth, adminController.postEditProduct)
router.get('/admin-products',isAuth, adminController.adminProducts)
router.delete('/admin-product/:productId',isAuth, adminController.DeleteProduct)

exports.routes=router;


