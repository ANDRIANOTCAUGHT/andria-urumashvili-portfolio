(function () {
  var toggle = document.getElementById("menu-toggle");
  var panel = document.getElementById("mobile-menu");
  var iconOpen = document.getElementById("menu-icon-open");
  var iconClose = document.getElementById("menu-icon-close");
  if (!toggle || !panel) return;

  function isOpen() {
    return !panel.classList.contains("hidden");
  }

  function setOpen(open) {
    panel.classList.toggle("hidden", !open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      open ? "მენიუს დახურვა" : "მენიუს გახსნა"
    );
    if (iconOpen) iconOpen.classList.toggle("hidden", open);
    if (iconClose) iconClose.classList.toggle("hidden", !open);
    document.body.classList.toggle("overflow-hidden", open);
  }

  toggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!isOpen());
  });

  panel.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 768) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });

  document.addEventListener("click", function (e) {
    if (!isOpen()) return;
    if (panel.contains(e.target) || toggle.contains(e.target)) return;
    setOpen(false);
  });
})();
