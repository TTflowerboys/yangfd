/**
 * Created by Michael on 14/11/1.
 */
angular.module('app')
    .directive('btnMinimize', function () {
        return {
            restrict: 'C',
            link: function (scope, element) {
                /* jshint ignore:start */

                $(element).click(function (e) {
                    e.preventDefault();
                    var $target = $(element).parent().parent().next('.box-content');
                    if ($target.is(':visible')) {
                        $('i',
                            $(this)).removeClass('fa-chevron-up').addClass('fa-chevron-down');
                    }
                    else { $('i', $(this)).removeClass('fa-chevron-down').addClass('fa-chevron-up');}
                    $target.slideToggle('slow', function () {
                        widthFunctions();
                    });
                });
                function widthFunctions(e) {
                    $('.timeline') && $('.timeslot').each(function () {
                        var e = $(this).find('.task').outerHeight();
                        $(this).css('height', e)
                    });
                    var t = $('#sidebar-left').outerHeight(), n = $('#content').height(), r = $('#content').outerHeight(), i = $('header').height(), s = $('footer').height(), o = $(window).height(), u = $(window).width();
                    if (u < 992) {
                        $('#main-menu-min').removeClass('minified').addClass('full').find('i').removeClass('fa-angle-double-right').addClass('fa-angle-double-left');
                        $('body').removeClass('sidebar-minified');
                        $('#content').removeClass('sidebar-minified');
                        $('#sidebar-left').removeClass('minified')
                    }
                    if (u > 767) {
                        o - 80 > t && $('#sidebar-left').css('min-height', o - i - s);
                        o - 80 > n && $('#content').css('min-height', o - i - s)
                    } else $('#sidebar-left').css('min-height', '0');
                    u < 768 ? $('.chat-full') && $('.chat-full').each(function () {$(this).addClass('alt')}) : $('.chat-full') && $('.chat-full').each(function () {$(this).removeClass('alt')})
                }

                /* jshint ignore:end */

            }
        }
    })
