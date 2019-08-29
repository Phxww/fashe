
$( function() {
    $( "#smallImg1" ).click(function() {
        $( "#showImg" ).attr('src',"images/<%- product['img_path'] %>");
        $( "#smallImg1" ).css('border','2px solid black');
        $( "#smallImg2" ).css('border','');
        $( "#smallImg3" ).css('border','');
    } );
    $( "#smallImg2" ).click(function() {
        $( "#showImg" ).attr('src',"images/<%- product['img_path'] %>");
        $( "#smallImg1" ).css('border','');
        $( "#smallImg2" ).css('border','2px solid black');
        $( "#smallImg3" ).css('border','');
    } );
    $( "#smallImg3" ).click(function() {
        $( "#showImg" ).attr('src','images/product-detail-03.jpg');
        $( "#smallImg1" ).css('border','');
        $( "#smallImg2" ).css('border','');
        $( "#smallImg3" ).css('border','2px solid black');
    } );
});
