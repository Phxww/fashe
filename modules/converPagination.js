
//限制筆數,總筆數,目前頁數
let converPagination = function(prepage,dataCnt,queryPage){

    let qPage = Number.parseInt(queryPage) || 1;
    let limitPage = Number.parseInt(prepage);
    let currentPage = qPage <= 0 ? 1 : qPage;
    let totalCnt = Number.parseInt(dataCnt);
    let pageTotal = Math.ceil(totalCnt/limitPage);
    if(currentPage > pageTotal){ currentPage = pageTotal;}
    let minItem = (currentPage * limitPage) - limitPage ;
    let maxItem = (currentPage * limitPage);

    const page = {
        limitPage,
        currentPage,
        pageTotal,
        minItem,
        maxItem,
        hasPre: currentPage >1,
        hasNext: currentPage < pageTotal
    }

    return page;
        

}


module.exports = converPagination;