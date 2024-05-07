(function (apiUrl, token) {
  fetch(apiUrl, {
    method: "POST",
    body: { url: window.location.toString(), token },
  }).then((res) => res.json()).then((res) => alert(res.data.join("\n"))).catch(
    (e) => {
      alert(e.message);
    },
  );
})(apiUrl, token);
