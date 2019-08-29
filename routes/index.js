const express = require('express');
const router = express.Router();
const converPagination = require('../modules/converPagination');
const options = require('../connection/db_options');
const moment = require('moment');

router.use(function(req, res, next) {
  let userInfo = req.session.userInfo === undefined ? {} : req.session.userInfo;
  res.locals.userInfo = userInfo;
  let login = req.session.login === undefined ? false : req.session.login;
  res.locals.login = login;
  let cartCnt =  req.session.cart === undefined ? 0 : Object.keys(req.session.cart).length   ;
  let cartlist = req.session.cart;
  res.locals.cartlist = req.session.cart;
  res.locals.cartlist_t =  JSON.stringify(cartlist);
  res.locals.cartCnt = cartCnt ;

  let sum = 0;
  for( item in cartlist){
    sum += cartlist[item].price * cartlist[item].cnt;
  }
  res.locals.sum = sum;
  next();
});

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/about', function(req, res, next) {
  res.render('about', { title: 'Express' });
});

router.get('/contact', function(req, res, next) {
  res.render('contact', { title: 'Express' });
});

router.get('/cart', function(req, res) {
  let cartCnt = req.session.cart === undefined ? 0 : Object.keys(req.session.cart).length;
  let sessionCart = req.session.cart;
  let sum = 0;
  for( item in sessionCart){
    sum += sessionCart[item].price * sessionCart[item].cnt;
  }
  req.session.sum = sum;
  res.render('cart', { sum:sum });
});

router.post('/cart/delete/:pid/:size', function(req, res) {
  let pid = req.params.pid;
  let size = req.params.size;
  let sessionCart = req.session.cart;
  const index = sessionCart.findIndex(x => x.pid === pid && x.size === size);

  if (index !== undefined) sessionCart.splice(index, 1);
  req.session.cart = sessionCart;
  let sum = 0;
  for( item in sessionCart){
    sum += sessionCart[item].price * sessionCart[item].cnt;
  }
  req.session.sum = sum;
  res.redirect('/cart');
  // res.render('cart',{sum:sum});
});

router.post('/cartConfirm', function(req, res) {
  let userName = req.body.userName;
  let userEmail = req.body.userEmail;
  let userAddress = req.body.userAddress;
  let userConfirm = {userName:userName,userEmail:userEmail,userAddress:userAddress};

  req.session.userConfirm = userConfirm;
  res.render('cartConfirm',{userConfirm:userConfirm});
});

router.post('/cartComplete', function(req, res) {
  const knex = require('knex')(options);
  let sessionCart = req.session.cart;
  let sessionUserInfo = req.session.userInfo;
  let sessionTotal = req.session.sum;
  let order_id_seq ;
  let orderObj = [{
    user_id : sessionUserInfo.user_id,
    order_time : moment().format('YYYY/MM/DD HH:mm:ss'),
    total :sessionTotal
  }]
  let orderInfoObj = [];

  knex('order').returning('order_id').insert(orderObj)
    .then((result) => {
          order_id_seq = result[0];
          item.order_id = order_id_seq;
          let orderInfo ;
          sessionCart.forEach((item)=>{
            orderInfo = {
              order_id : order_id_seq,
              product_id : item.pid,
              size : item.size,
              quantity : item.cnt
            }
            orderInfoObj.push(orderInfo);
          })
          return  knex('orderinfo').insert(orderInfoObj);
    }).then((result) => {
      req.session.cart={};
      res.render('cartComplete',{userConfirm:req.session.userConfirm });
      
    })  
    .catch((err) => { 
      req.session.login = false;
      console.log('in_error');
      console.log( err); throw err })
    .finally(() => {
      knex.destroy();
  });


});

router.get('/shop', function(req, res) {
  let pageInfo ={};
  let prepage = 6;
  let queryPage = req.query.page;
  const knex = require('knex')(options);
  knex('product').count('*')
  .then((rows) => {
    
    pageInfo = converPagination(prepage,rows[0].count,queryPage);
    return knex('product').select("product_id","product_name","img_path","price")
    .orderBy('product_id')
    .limit(pageInfo.limitPage)
    .offset(pageInfo.minItem)    
  })
  .then((rows) => {
    res.render('shop', { product:rows,page:pageInfo,paginationUrl:'/shop'});
  })
  .catch((err) => { 
      console.log('/shop : in_error');
      console.log( err); throw err })
  .finally(() => {
      knex.destroy();
  });
});

router.post('/cart/add', function(req, res) {
  let pid = req.body.pid;
  let size = req.body.size;
  let cnt = req.body.cnt;
  let img = req.body.img;
  let pname = req.body.pname;
  let price = req.body.price;
  let newOrder = {"pid":pid,"pname":pname,"size":size,"cnt":cnt,"img":img,"price":price};
  let tmpSession ;
  let tmpNewCnt = 0;
  let tmpSessCnt = 0;
  let tmpSum = 0;
  let psCK = false;//pid & size 是否同時都有

  if(req.session.cart === undefined || Object.keys(req.session.cart).length < 1 ){
    tmpSession = [];
  }else{
    tmpSession = req.session.cart;
    tmpSession.forEach(element => {
      if(element.pid === newOrder.pid && 
        element.size === newOrder.size){
          psCK = true;
          tmpNewCnt = Number.parseInt(newOrder.cnt);
          tmpSessCnt =  Number.parseInt(element.cnt);
          tmpSum =  tmpNewCnt + tmpSessCnt;
          element.cnt = tmpSum.toString();
        }
    }); 
  }

  if(!psCK){
    tmpSession.push(newOrder);
  }
  req.session.cart = tmpSession || 0;
  let sum = 0;
  for( item in tmpSession){
    sum += tmpSession[item].price * tmpSession[item].cnt;
  }
  res.send({cartCnt:tmpSession.length,sum:sum,
    newOder:`
    <div class="row mt-2">
        <div class="col-4 bg-cover" style="background-image: url('${newOrder.img})');"></div>
        <div class="col-8">
            <p>${newOrder.pname} </p>
            <p class="small mb-1"> ${newOrder.size} x ${newOrder.cnt} </p> 
        </div>
    </div>
    `});
  res.end();
});

router.get('/product-detail/:p_id', function(req, res) {
  let p_id = req.params.p_id;
  let product;
  const knex = require('knex')(options);  
    knex.from('product').select("product_id","product_description","product_name","categories_id","img_path","img_path2","img_path3","price","xl_cnt","l_cnt","m_cnt","s_cnt").where('product_id', '=', p_id)
    .then(function(rows){
      product = rows[0];
        return knex.from('categories').select("categories_id","categories_name");    
    })
    .then(function(rows){
      categories = rows;
      res.render('product-detail', { categories:categories,product:product ,message:req.flash('message')});
    })
    .catch((err) => { 
        console.log('/product-detail : in_error');
        console.log( err); throw err })
    .finally(() => {
        knex.destroy();
    });

});

module.exports = router;
