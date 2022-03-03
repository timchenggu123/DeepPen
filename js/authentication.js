function getCookie(cookie) {
  if (document.cookie) {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${cookie}=`))
      .split('=')[1];
  }
  return false;
}

function setCookie(key, value) {
  document.cookie = `${key}=${value}`;
}

window.addEventListener('load', function () {
  let token = getCookie('token');
  console.log(window.location);
  if (!token && window.location.href != 'http://localhost:8001/login.html') {
    window.location.replace('http://localhost:8001/login.html');
  }
});
