
const options = require('../connection/db_options');

let converPagination2 = function(prepage,dataCnt,queryPage,tableName,tableColumn,orderbyName){

    const knex = require('knex')(options);
    console.log("=====3-1===");
    let qPage = Number.parseInt(queryPage) || 1;
    let limitPage = Number.parseInt(prepage);
    let currentPage = qPage <= 0 ? 1 : qPage;
    let totalCnt = Number.parseInt(dataCnt);
    let pageTotal = Math.ceil(totalCnt/limitPage);
    if(currentPage > pageTotal){ currentPage = pageTotal;}
    let minItem = (currentPage * limitPage) - limitPage ;
    let maxItem = (currentPage * limitPage);
    let data = {};
    let  page ={};
    knex(tableName).select(tableColumn)
    .orderBy(orderbyName)
    .limit(limitPage)
    .offset(minItem)
    .then((rows) => {
        console.log('rowsing========:');
        data = rows; 
        page = {
            limitPage,//
            currentPage,
            pageTotal,
            minItem,//
            maxItem,
            hasPre: currentPage >1,
            hasNext: currentPage < pageTotal,
            
        }
    
        console.log('f_page:',page); 
        return {page,data}   
            
    })
    .catch((err) => { 
        console.log('/converPagination : in_error');
        console.log( err); throw err })
    .finally(() => {
        knex.destroy();
    }); 
  
       
    return  ;

    console.log("=====3-2===");
   
    
    
}

module.exports = converPagination2;