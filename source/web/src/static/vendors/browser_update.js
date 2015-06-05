var $buoop = {vs:{i:8,f:20,o:12.1,s:5.1},c:2};
function $buo_f(){
    var e = document.createElement('script')
    var url = '/static/vendors' + '/browser_update_check.js'
    e.src = url
    document.body.appendChild(e);
};
try {document.addEventListener('DOMContentLoaded', $buo_f,false)}
catch(e){window.attachEvent('onload', $buo_f)}
