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

// function authenticate(data) {
//   $.ajax({
//     url: apiUrl + `/submissions?base64_encoded=true&wait=${wait}`,
//     type: 'POST',
//     async: true,
//     contentType: 'application/json',
//     data: JSON.stringify(data),
//     xhrFields: {
//       withCredentials: apiUrl.indexOf('/secure') != -1 ? true : false,
//     },
//     success: function (data, textStatus, jqXHR) {
//       console.log(`Your submission token is: ${data.token}`);
//       if (wait == true) {
//         handleResult(data);
//       } else {
//         setTimeout(fetchSubmission.bind(null, data.token), check_timeout);
//       }
//     },
//     error: handleRunError,
//   });
// }

window.addEventListener('load', function () {
  let token = getCookie('token');
  console.log('token', token);
  if (!token) {
    window.location.replace('http://localhost:8001/login.html');
  }
});
