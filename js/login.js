function login(event) {
  event.preventDefault();
  console.log('Logging in');
  $.ajax({
    url: 'http://127.0.0.1:6969/login',
    type: 'POST',
    async: true,
    contentType: 'application/json',
    data: JSON.stringify({
      user: document.getElementById('email').value,
      password: document.getElementById('password').value,
    }),
    // xhrFields: {
    //   withCredentials: apiUrl.indexOf('/secure') != -1 ? true : false,
    // },
    success: function (data, textStatus, jqXHR) {
      let response = JSON.parse(data);
      setCookie('token', response.token);
      window.location.replace('http://localhost:8001/ide.html');
    },
    error: function (data) {
      console.log('error');
    },
  });
}
