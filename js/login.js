var alertPlaceholder = document.getElementById('errorAlert');

function alert(message, type) {
  var wrapper = document.createElement('div');
  wrapper.innerHTML =
    '<div class="alert alert-' +
    type +
    ' alert-dismissible" role="alert">' +
    message +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';

  alertPlaceholder.append(wrapper);
}

function login(event) {
  event.preventDefault();
  $.ajax({
    url: 'http://127.0.0.1:6969/login',
    type: 'POST',
    async: false,
    contentType: 'application/json',
    data: JSON.stringify({
      user: document.getElementById('email').value,
      password: document.getElementById('password').value,
    }),
    success: function (data, textStatus, jqXHR) {
      let response = JSON.parse(data);
      setCookie('token', response.token);
      window.location.replace('http://localhost:8001/ide.html');
    },
    error: function (data) {
      deleteCookie('token');
      alert('Invalid login credentials', 'danger');
    },
  });
}
