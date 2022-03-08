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

function check_password(){
    if (document.getElementById("password").value === document.getElementById("re-password").value){
        return 0;
    } else {
        alert("Error: passwords do not match");
        return 1;
    }
}
function login(event) {
  event.preventDefault();
  if (check_password() === 1){
      return;
  }
  $.ajax({
    url: 'http://127.0.0.1:6969/register',
    type: 'POST',
    async: true,
    contentType: 'application/json',
    data: JSON.stringify({
      user: document.getElementById('email').value,
      password: document.getElementById('password').value,
    }),
    success: function (data, textStatus, jqXHR) {
      window.location.replace('http://localhost:8001/login.html');
    },
    error: function (data) {
      alert('Error encountered trying to register', 'danger');
    },
  });
}
