var $buoop = {vs:{i:8,f:25,o:17,s:6},c:2}
function $buo_f(){
    var e = document.createElement('script')
    e.src = '//browser-update.org/update.js';
    document.body.appendChild(e);
};
try {document.addEventListener('DOMContentLoaded', $buo_f,false)}
catch(e){window.attachEvent('onload', $buo_f)}
