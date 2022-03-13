document.getElementById('logoutButton').addEventListener('click', () => {
  logout();
});

function logout(event) {
  event.preventDefault();
  $.ajax({
    url: 'http://127.0.0.1:6969/logout',
    type: 'POST',
    async: false,
    contentType: 'application/json',
    data: JSON.stringify({
      user: document.getElementById('email').value,
      password: document.getElementById('password').value,
    }),
    success: function (data, textStatus, jqXHR) {
      let response = JSON.parse(data);
      deleteCookie('token', response.token);
      window.location.replace('http://localhost:8001/login.html');
    },
    error: function (data) {
      let response = JSON.parse(data);
      deleteCookie('token', response.token);
      window.location.replace('http://localhost:8001/login.html');
    },
  });
}
