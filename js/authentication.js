const publicPages = ['http://localhost:8001/login.html', 'http://localhost:8001/register.html', 'http://localhost:8001/landing.html']

function getCookie(name) {
  var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
  return v ? v[2] : null;
}

function setCookie(name, value, days) {
  var d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
  document.cookie = name + '=' + value + ';path=/;expires=' + d.toGMTString();
}

function deleteCookie(name) {
  setCookie(name, '', -1);
}

window.addEventListener('load', function () {
  let token = getCookie('token');
  console.log(window.location);
  if (!token &&  !publicPages.includes(window.location.href)) {
    window.location.replace('http://localhost:8001/login.html');
  }
});
