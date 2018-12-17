const mongoose = require('mongoose');
const path = require('path');
const Request = require('request');
const User = require('../api/models/user');
const Qrcode = require('../models/qrcodegenerator');
var helpers = require('../api/middleware/common-function');

// Get All Orders
exports.login_page = (req,res,next) => {
    res.render("login");
    // res.sendFile(path.join(__dirname, "../views/login.html"));
  // res.sendFile(path.join (__filename + "../views/login.html"));
}
exports.loginRedirect = (req,res,next) => {
  email = req.body.email;
  password = req.body.password;

   if(email == ''){
    res.render("login", {msg:"Email is Required"});
   }
   if(password == ''){
    res.render("login", {msg:"Password is Required"});
  }
  Request.post({
    "headers": {
        "content-type": "application/json",  
    },
    "url": "http://localhost:3000/user/login",
    "body": JSON.stringify({
            "email" : email,
            "password" : password
    })
}, (err, response, body) => {
    data = JSON.parse(body);
    if(response.statusCode == 200 && data.message == "Auth Successful"){
      sess = req.session;
      sess.email= data.data.email;
      res.redirect("/dashboard");
    }else{
      const msg = "Failed Login";
      res.render("login", {msg:"Please Try Again"});
      //res.redirect("/?" + msg );
    }
  });
  //res.sendFile(path.join(__dirname, "../views/login.html"));
  // res.sendFile(path.join (__filename + "../views/login.html"));
}

exports.dashboard = (req, res, next) => {
  sess = req.session;
  if(sess.email){
 // res.locals.user = req.session.user;
  const user_email = sess.email;
  res.render("dashboard",{user_email: user_email})
  }else{
      res.render("login", {msg:"Session Log Out"});
  }
}


// qrcodegenerator

exports.qrcodegenerator = (req,res,next) => {
  sess = req.session;
  var checkSession = helpers.checkSession(sess,res);
  const user_email = sess.email;
  if(req.query.id){
    Qrcode.findById(req.query.id)
    .then(result=>{
      res.render("qrcodegenerator",{user_email: sess.email,data:result});
    }).catch(err=>console.log(err));
  }else{
  res.render("qrcodegenerator",{user_email: sess.email});
  }
}


// List Qrcode

exports.listqrcode = (req,res,next) => {
  sess = req.session;
  var checkSession = helpers.checkSession(sess,res);
  if(req.query.id){
  var id = req.query.id;
  var status = req.query.status;
  var query = {_id:id};
  if(status == 1)
  {
    status = 0;
  }else{
    status = 1;
  }
  var update = {
      status: status
  }
  Qrcode.findOneAndUpdate(query,update)
  .exec()
  .then(result=>(result=>{
  })).catch(err=>console.log(err));
  }
  var perpage = 5;
  if(req.query.page_id && req.query.page_id != ''){
    var curpage = req.query.page_id;
  }else{
    var curpage = 1;
  }
  var start = ( curpage * perpage ) - perpage;
  Qrcode.countDocuments({}, function( err, count){
	var endpage = Math.ceil(count/perpage);
	var startpage = 1;
	var nextpage = parseInt(curpage) + 1;
	var previouspage = parseInt(curpage) - 1;
  var nav = {"startpage": startpage, "previouspage": previouspage, "curpage": curpage,"nextpage" : nextpage,"endpage":endpage};
  Qrcode.find()
  .sort( { create_date: -1 } )
  .limit(perpage)
  .skip(start)
  .then(result=>{
      res.render("listqrcode",{user_email: sess.email,data:result,nav : nav});
  }).catch(err=>console.log(err));
  });
}

// Insert Qrcode
exports.insert_qrcode = (req,res,next) => {
  sess = req.session;
  var checkSession = helpers.checkSession(sess,res);
  if(req.body.update_id){
    const id = req.body.update_id;
    var query = {_id:id};
    var update = {
      location: req.body.location,
      name: req.body.name,
      points: req.body.points,
      qrcode: req.body.qr_code,
    }
  Qrcode.findOneAndUpdate(query,update)
  .exec()
  .then(result=>{
    res.redirect('/qrcodegenerator?id='+id);
  }).catch(err=>console.log(err));
  }else{
  const qrcodes = new Qrcode({
        _id: new mongoose.Types.ObjectId(),
        location: req.body.location,
        name: req.body.name,
        points: req.body.points,
        qrcode: req.body.qr_code,
    });
    qrcodes.save().then(result=>{
      //res.render("qrcodegenerator",{layout:false,user_email: sess.email});
      res.redirect('/qrcodegenerator');
    }).catch(err=>console.log(err));
   // res.redirect("qrcodegenerator",{user_email: sess.email});
  }
}

// Passsword Change

exports.password_reset = (req,res,next) => {
    User.findOne({ _id: req.query.id , token_key: req.query.key })
    .exec()
    .then( result => {
        if(result){
          var curr_date = new Date();
          
          timeDiff = Math.floor( (Date.parse(curr_date) - Date.parse(result.token_expire)) / (1000*60) % 60);
          if(timeDiff < 30){
          res.render('password_reset');
          }else{
            res.render('password_reset',{user_msg: "Link Expire"});
          }
        }else{
          res.render('password_reset',{user_msg: "Invalid Token"});
        }
    }).catch(err=>{
      console.log(err);
      res.status(500).json({
          error: err
      });
  });
}
// Password Matching
exports.password_match = (req,res,next) => {
  User.findOne({ _id: req.body.object_id , token_key: req.body.key })
  .exec()
  .then( result => {
      if(result){
          var encrypted = helpers.passwordEncrypted(req.body.password);
          var query = {_id:result._id};
          var update = {
          password: encrypted,
          token_key: '',
          token_expire:'' 
          }
          User.findOneAndUpdate(query,update)
          .exec()
          .then(result=>{
            res.render('login',{msg: "Password Reset, Please Login"});
          }).catch(err=>console.log(err));
      }else{
        res.render('password_reset',{user_msg: "U can't be smart"});
      }
})
}


// LOgout

exports.logout = (req,res,next) => {
  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
}

