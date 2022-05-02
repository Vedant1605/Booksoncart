exports.E_404 =(req,res,next)=>{
    // const loggedIn=req.get('Cookie').trim().split('=')
    res.status(404).render('error/404',{pageTitle:'Not Found',isAuth:req.session.isLoggedIn,path:null})
}
exports.E_500 =(req,res,next)=>{
    // const loggedIn=req.get('Cookie').trim().split('=')
    res.status(500).render('error/500',{pageTitle:'Error!!',isAuth:req.session.isLoggedIn,path:null})
}