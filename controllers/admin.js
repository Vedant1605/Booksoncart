const Product = require('../models/product');
const Cart = require('../models/cart');
const mongoose = require('mongoose');
const { deleteFile } = require('../util/files');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Prouct',
    path: '/add-product',
    editing: false,
    isAuth: true,
    errMsg: null
  })
}
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  const image = req.file
  const description = req.body.description
  const price = req.body.price
  console.log('image', image)
  if (!image) {
    res.render('admin/edit-product', {
      pageTitle: 'Add Prouct',
      path: '/add-product',
      editing: false,
      isAuth: true,
      errMsg: 'Invalid File Type'
    })
  }
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: image.path,
    userId: req.user 

  })
  product.save()
    .then(() => {
      res.redirect('/admin/add-product')
    })
    .catch((err) => {
      const error = new Error(err);
      // error.httpStatusCode=500;
      return next(error)
    })
}
exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        errMsg: null
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    })
};
exports.postEditProduct = (req, res) => {
  const newTitle = req.body.title
  const newPrice = req.body.price
  const newDescription = req.body.description
  const image = req.file

  const id = req.body.productId
  Product.findById(id).then(product => {
    product.title = newTitle;
    product.price = newPrice;
    product.description = newDescription;
    if (image) {
      deleteFile(product.imageUrl)
      product.imageUrl = image.path
    }
    return product.save()
  })
    .then(() => {
      res.redirect('/admin/admin-products')
    }).catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    })
}
exports.DeleteProduct = (req, res) => {
  const prodId = req.params.productId
  Product.findById(prodId).then(product => {
    if (!product) {
      return next(new Error('fdjkbvjd'))
    }
    deleteFile(product.imageUrl)
    prodId.toString()
    return Product.findByIdAndRemove(prodId)
  })
    .then(() => {
      res.status(200).json({
        message:'Succes'
      })
    }).catch((err) => {
     res.status(500).json({
       message:'failed'
     })
    })
}
exports.adminProducts = (req, res) => {

  Product.find({ userId: req.user._id })
    .then(products => {
      res.render('admin/admin-products', {
        pageTitle: 'admin products',
        prods: products,
        path: '/admin-products'
      })
    }).catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    })
}
