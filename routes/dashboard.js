const express = require('express');
const router = express.Router();
const options = require('../connection/db_options');
const converPagination = require('../modules/converPagination');

router.use(function(req, res, next) {
  let userInfo = req.session.userInfo === undefined ? {} : req.session.userInfo;
  let login = req.session.login === undefined ? false : req.session.login;
  res.locals.login = login;
  if(!login){
    res.render('login', {message: '請先登入管理者帳號'});
  }else if(userInfo.email != process.env.ADMIN_ACCOUNT){
    res.render('login', {message: '權限不足！請登入管理者帳號'});
  }
  next();
});

router.get('/categories', function(req, res, next) {
    res.render('dashboard/categories', { title: 'Express' });
});

router.get('/productAdmin', function(req, res) {
  let pageInfo ={};
  let prepage = 5;
  let queryPage = req.query.page;
  const knex = require('knex')(options);

  knex('product').count('*')
  .then((rows) => {
    if (rows[0].count == 0){
      return 0;
    }else{
      pageInfo = converPagination(prepage,rows[0].count,queryPage);
      return knex('product').select("product_id","product_name","img_path","price","xl_cnt","l_cnt","m_cnt","s_cnt")
      .orderBy('product_id')
      .limit(pageInfo.limitPage)
      .offset(pageInfo.minItem)    
    }
  })
  .then((rows) => {
    if(rows == 0){
      res.render('dashboard/productAdmin', { product:{},page:{},message:req.flash('message'),paginationUrl:'/dashboard/productAdmin'});
    }else{
      res.render('dashboard/productAdmin', { product:rows,page:pageInfo,message:req.flash('message'),paginationUrl:'/dashboard/productAdmin'});
    }
  })
  .catch((err) => { 
      console.log('/productAdmin : in_error');
      console.log( err); throw err })
  .finally(() => {
      knex.destroy();
  });
});   
  
router.get('/product/edit/:p_id', function(req, res){
  let p_id = req.params.p_id;
  let product;
  let categories;
  const knex = require('knex')(options);  
    knex.from('product').select("product_id","product_description","product_name","categories_id","img_path","img_path2","img_path3","img_path","price","xl_cnt","l_cnt","m_cnt","s_cnt").where('product_id', '=', p_id)
    .then(function(rows){
      product = rows[0];
        return knex.from('categories').select("categories_id","categories_name");    
    })
    .then(function(rows){
      categories = rows;
      res.render('dashboard/product', { categories:categories,product:product ,message:req.flash('message')});
    })
    .catch((err) => { 
        console.log('/product/edit : in_error');
        console.log( err); throw err })
    .finally(() => {
        knex.destroy();
    });
});

router.post('/product/delete/:p_id', function(req, res ){
  let p_id = req.params.p_id;
  const knex = require('knex')(options);  
  knex('product')
  .where('product_id', '=', p_id)
  .del()
  .then(function(rows){
    req.flash('message','刪除商品成功！');
    res.redirect('/dashboard/productAdmin');
  })
  .catch((err) => { 
    console.log('/product/delete : in_error');
    console.log( err); throw err })
  .finally(() => {
      knex.destroy();
  });

});

router.post('/product/update/:p_id', function(req, res ){
  
  let p_id = req.params.p_id;
  const updateInfo = 
    { 
      product_name: req.body.productName,
      product_description:req.body.productDetail,
      price :parseInt(req.body.price),
      categories_id:parseInt(req.body.categories),
      xl_cnt:parseInt(req.body.xlCount),
      l_cnt:parseInt(req.body.xlCount),
      m_cnt:parseInt(req.body.mCount),
      s_cnt:parseInt(req.body.sCount),
      img_path:req.body.imgPath
    };

  const knex = require('knex')(options); 

  knex('product')
  .where('product_id', '=', p_id)
  .update(updateInfo)
  .then(function(updaterows){
    req.flash('message', `修改商品成功！<a href="/dashboard/productAdmin"> 返回管理頁面</a>`);
    res.redirect(`/dashboard/product/edit/${p_id}`);
  })
  .catch((err) => { 
    console.log('/product/update : in_error');
    console.log( err); throw err })
  .finally(() => {
    knex.destroy();
  });
  
}); 


router.get('/product/create', function(req, res ) {
    const knex = require('knex')(options);
    knex.from('categories').select("categories_id","categories_name")
    .then((rows) => {
      res.render('dashboard/product', { categories:rows ,message: req.flash('message')});
    }).catch((err) => { 
        console.log('/product/create : in_error');
        console.log( err); throw err })
    .finally(() => {
        knex.destroy();
    });
    
});  

router.post('/product/create', function(req, res ) {
  let productName = req.body.productName;
  let productDetail = req.body.productDetail;
  let categories = parseInt(req.body.categories);
  let price = parseInt(req.body.price);
  let xlCount= parseInt(req.body.xlCount);
  let lCount= parseInt(req.body.xlCount);
  let mCount= parseInt(req.body.mCount);
  let sCount= parseInt(req.body.sCount);
  let imgPath= req.body.imgPath;
  let imgPath2= req.body.imgPath2;
  let imgPath3= req.body.imgPath3;


  const knex = require('knex')(options);
  const productInfo = [
    { product_name: productName,
      product_description:productDetail,
      price :price,
      categories_id:categories,
      xl_cnt:xlCount,
      l_cnt:lCount,
      m_cnt:mCount,
      s_cnt:sCount,
      img_path:imgPath,
      img_path2:imgPath2,
      img_path3:imgPath3
      }
  ];

  knex('product').insert(productInfo)
        .then(() => {
             req.flash('message', '新增商品成功！');
             res.redirect('/dashboard/product/create');
            })
        .catch((err) => {
            req.flash('message', '新增商品失敗！請聯絡管理員！');
            res.redirect('/dashboard/product/create');
             console.log(err); throw err 
            })
        .finally(() => {
            knex.destroy();
        });
});  

 


module.exports = router;