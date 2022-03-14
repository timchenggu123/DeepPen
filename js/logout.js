window.onload = function () {
    document.getElementById('logoutButton').addEventListener('click', () => {
        logout();
    });
};

function logout(event) {
  $.ajax({
    url: 'http://127.0.0.1:6969/logout',
    type: 'POST',
    async: false,
    headers: { 'authorization': getCookie('token') },
    success: function (data, textStatus, jqXHR) {
      deleteCookie('token');
      window.location.replace('http://localhost:8001/login.html');
    },
    error: function (data) {
      deleteCookie('token');
      window.location.replace('http://localhost:8001/login.html');
    },
  });
}
