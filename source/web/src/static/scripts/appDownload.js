/**
 * Created by levy on 15-5-13.
 */
(function(Swiper){
    window.swiper = new Swiper('.swiper-container', {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        autoplay: 4000
    });
})(window.Swiper)