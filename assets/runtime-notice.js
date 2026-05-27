(function () {
  if (window.location.protocol !== "file:") return;
  if (document.querySelector(".runtime-notice")) return;

  const notice = document.createElement("aside");
  notice.className = "runtime-notice";
  notice.setAttribute("role", "status");
  notice.innerHTML = `
    <strong>Use the local server for the full ecosystem.</strong>
    <span>Forms, Levi actions, checkout, admin, and saved reviews work at <a href="http://localhost:3000/">localhost:3000</a>.</span>
  `;
  document.body.appendChild(notice);
})();
