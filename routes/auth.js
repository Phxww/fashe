const express = require('express');
const options = require('../connection/db_options');
const router = express.Router();

router.use(function(req, res, next) {
    let userInfo = req.session.userInfo === undefined ? {} : req.session.userInfo;
    res.locals.userInfo = userInfo;
    let login = req.session.login === undefined ? false : req.session.login;
    res.locals.login = login;
    next();
});

router.get('/logout', function(req, res ) {
    req.session.userInfo={};
    req.session.cart={};
    req.session.login = false;
    res.redirect('/');
});   

router.get('/login', function(req, res ) {
    // let userInfo = req.session.userInfo === undefined ? {}:req.session.userInfo;
    res.render('login', {message: req.flash('message')});
});

router.post('/login', function(req, res)  {
    req.session.userInfo ={};
    let email = req.body.email;
    let password = req.body.password;
    const knex = require('knex')(options);
    
    knex.from('users').select("user_id","nickname","email","passwd","address","phone").where('email', '=', email)
    .then((rows) => {
        let row = rows[0];
        
        if(rows.length===0){
            req.session.login = false;
            req.flash('message', '帳號有誤！請確認帳號後，重新登入！');
            res.redirect('/auth/login');
        }else if (row['email'] === email && row['passwd']=== password){ 
            req.session.userInfo = {
                user_id : row.user_id,
                nickname : row.nickname,
                email : row.email ,
                address : row.address || '', 
                phone : row.phone || ''
            }
            req.session.login = true;
            res.redirect('/');
        }else {
            req.session.login = false;
            req.flash('message', '密碼錯誤！請重新登入！');
            res.redirect('/auth/login');
        }
    }).catch((err) => { 
        req.session.login = false;
        console.log('in_error');
        console.log( err); throw err })
    .finally(() => {
        knex.destroy();
    });
});

router.get('/myaccount',function(req, res)  {
    let userInfo = req.session.userInfo === undefined ? {}:req.session.userInfo;
    if(Object.keys(userInfo).length != 0){
        res.render('myaccount', { userInfo:userInfo,message:req.flash('message')});
    }else{
        res.render('login', { message:'請先登入'});
    }
});  

router.post('/myaccount/:uid',function(req, res)  {
    let user_id = req.params.uid;
    let address = req.body.address;
    let nickname  = req.body.nickname;
    let phone  = req.body.phone;
    let email  = req.body.email;
    const knex = require('knex')(options);

    knex('users')
    .where('user_id', '=', user_id)
    .update({
        address: address,
        nickname: nickname,
        phone: phone
    }).then((rows) => {
        let newUserInfo = 
        {
            user_id : req.session.userInfo.user_id,
            email : req.session.userInfo.email,
            address: address,
            nickname: nickname,
            phone: phone, 
        }
    req.session.userInfo = newUserInfo;
        req.flash('message', '個人資料更新成功！');
        res.redirect('/auth/myaccount');
    }).catch((err) => { 
        console.log('/myaccount/:uid in_error');
        console.log( err); throw err ;
        req.flash('message', '個人資料更新失敗！請通知管理員！');
        res.redirect('/auth/myaccount');
    })  
    .finally(() => {
        knex.destroy();
    });   
   
    
});  


router.get('/signup', function(req, res ) {
    res.render('signup', { message: req.flash('message') });
});

router.post('/signup', function(req, res)  {
    let email = req.body.email;
    let password = req.body.password;
    let nickname  = req.body.nickname;
    const userInfo = [
        { nickname: nickname,email:email, passwd: password }
    ];
    const knex = require('knex')(options);

        knex.from('users').count('*')
        .where('email', '=', email)
        .then((rows) => {
            if(rows[0].count==0){
                return knex('users').insert(userInfo,'user_id')
            }
            else{
                return false
            }
        })    
        .then((result) => {
            if(!result){
                req.flash('message', ' Email 已註冊過！歡迎登入！');
                res.redirect('login');
            }
             req.flash('message', '註冊成功！歡迎登入！');
             res.redirect('login');
            })
        .catch((err) => {
            req.flash('message', '註冊失敗！請聯絡管理員！');
            res.redirect('signup');
             console.log(err); throw err 
            })
        .finally(() => {
            knex.destroy();
        });
});

module.exports = router;