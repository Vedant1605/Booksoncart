const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check');


const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}))

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if (message.length) {
    message = message[0]
  }
  else {
    message = null;
  }

  console.log('req.session', req.session)
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errMsg: message,
    oldInput: { email: '', password: '' },
  })
}
exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
          path: '/login',
          oldInput: { email: '', password: password },
          errMsg: 'Email'
        })

      }
      bcrypt.compare(password, user.password) // this gives us a boolean whter pass matched or not
        .then(didMatch => {
          if (didMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log('err', err)
              res.redirect('/')
            })
          }
          return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            oldInput: { email: email, password: '' },
            errMsg: 'password'
          })

        })
        .catch(error => {
          console.log(error)
          res.redirect('/login')
        });
    })
    .catch(err => console.log(err));
};
exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/')
  })
};
exports.getSignUp = (req, res, next) => {
  let message = req.flash('error')
  if (message.length) {
    message = message[0]
  }
  else {
    message = null;
  }
  res.render('auth/signUp', {
    pageTitle: 'SignUp',
    path: '/login',
    errMsg: message,
    oldInput: { name: '', email: '', contact: '', password: '' },
    validationInfo: [],
  })
};
exports.postSignUp = (req, res, next) => {
  const name = req.body.name
  const password = req.body.password
  const email = req.body.email
  const contact = req.body.contact
  const error = validationResult(req)
  console.log('error.array()', error.array())
  if (!error.isEmpty()) {
    res.status(422).render('auth/signUp', {
      pageTitle: 'SignUp',
      path: '/login',
      errMsg: error.array()[0].msg,
      oldInput: { name: name, email: email, contact: contact, password: password },
      validationInfo: error.array()
    })
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        contactNo: contact,
        cart: { items: [] }
      })
      user.save();
    })
    .then(() => {
      res.redirect('/login')
      return transporter.sendMail({
        to: email,
        from: 'vedant.kuki4444@gmail.com',
        subject: 'Welcome to BooksOnCart',
        html: `<h3>Welcome ${name} to BookOnCart</h3>`
      })
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    })

};

exports.getPasswordReset = (req, res, next) => {
  let message = req.flash('error')
  if (message.length) {
    message = message[0]
  }
  else {
    message = null;
  }
  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/reset',
    errMsg: message
  })
};
exports.postPasswordReset = (req, res, next) => {
  const email = req.body.email
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log('err', err)
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex')
    User.findOne({ email: email }).then(user => {
      if (!user) {
        req.flash('error', `Email does't exits`)
        return res.redirect('/reset')
      }
      console.log('token', token)
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save()
    })
      .then(() => {
        res.redirect('/login')
        return transporter.sendMail({
          to: email,
          from: 'vedant.kuki4444@gmail.com',
          subject: 'Welcome to BooksOnCart',
          html: `<h1> BookOnCart </h1>
              <p>The Best Book Store</p>
              <p>Your link to reset password as Requested</p>
              <p>Click Here To Reset<a href="http://localhost:3000/reset/${token}">Here</a> </p>
        `
        })
      }).catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error)
      })
  })
};
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      res.render('auth/new-pass', {
        pageTitle: 'New Password',
        path: '/new-pass',
        userId: user._id.toString(),
        token: token,
        errMsg: null,
      })
    }).catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    })

};
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const token = req.body.token
  const error = validationResult(req)
  if (!error.isEmpty()) {
    return res.status(422).render('auth/new-pass', {
      pageTitle: 'reset',
      path: '/login',
      userId: userId,
      token: token,
      errMsg: error.array()[0].msg,
    })
  }
  console.log('userId', userId)
  let resetUser;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      console.log('user', user)
      resetUser = user
      return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save()
    })
    .then(() => {
      res.redirect('/login')
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    })

};