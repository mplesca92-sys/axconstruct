(function () {
  var AX = window.AX_SITE || {};

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll("[data-bind]").forEach(function (el) {
    var key = el.getAttribute("data-bind");
    if (AX[key]) el.textContent = AX[key];
  });

  document.querySelectorAll("[data-href='email']").forEach(function (el) {
    if (AX.email) {
      el.href = "mailto:" + AX.email;
      if (!el.textContent.trim() || el.textContent.indexOf("@") !== -1) {
        el.textContent = AX.email;
      }
    }
  });

  document.querySelectorAll("[data-href='phoneTel']").forEach(function (el) {
    if (!AX.phoneTel) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.href = "tel:" + AX.phoneTel;
    el.textContent = AX.phonePretty || AX.phoneTel;
  });

  document.querySelectorAll("[data-href='whatsapp']").forEach(function (el) {
    if (!AX.whatsapp) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    var preset = el.getAttribute("data-wa-text") || "";
    el.href = "https://wa.me/" + AX.whatsapp + (preset ? "?text=" + encodeURIComponent(preset) : "");
  });

  var legal = document.querySelector("[data-legal]");
  if (legal) {
    var bits = [];
    if (AX.legalName) bits.push(AX.legalName);
    if (AX.idno) bits.push("IDNO " + AX.idno);
    if (AX.address) bits.push(AX.address);
    if (bits.length) {
      legal.hidden = false;
      legal.textContent = bits.join(" · ");
    }
  }

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");

  function closeMenu() {
    if (!menu || !burger) return;
    menu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMenu();
      } else {
        menu.hidden = false;
        burger.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
      }
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  document.querySelectorAll(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      document.querySelectorAll(".filter").forEach(function (other) {
        other.setAttribute("aria-pressed", other === btn ? "true" : "false");
      });
      document.querySelectorAll(".tile").forEach(function (tile) {
        var show = cat === "toate" || tile.getAttribute("data-cat") === cat;
        tile.hidden = !show;
      });
    });
  });

  var form = document.getElementById("estimare");
  if (!form) return;

  var params = new URLSearchParams(window.location.search);
  var tip = params.get("tip");
  if (tip && form.elements.tip) {
    Array.prototype.forEach.call(form.elements.tip.options, function (option) {
      if (option.value === tip) form.elements.tip.value = tip;
    });
  }

  var success = document.getElementById("form-success");
  var letter = document.getElementById("letter");
  var openMail = document.getElementById("open-mail");
  var copyBtn = document.getElementById("copy-letter");
  var successTitle = document.getElementById("success-title");
  var successLead = document.getElementById("success-lead");

  function field(name) {
    var el = form.elements[name];
    if (!el) return "";
    if (el.tagName === "SELECT") {
      if (!el.value) return "—";
      var opt = el.options[el.selectedIndex];
      return opt ? opt.text.trim() : "—";
    }
    return String(el.value || "").trim();
  }

  function buildLetter() {
    var lines = [
      "Bună,",
      "",
      "Vreau o estimare de la AX Construct.",
      "",
      "Nume: " + field("nume"),
      "Telefon: " + field("telefon"),
      "Email: " + (field("email") || "—"),
      "Localitate: " + (field("localitate") || "—"),
      "Tip lucrare: " + field("tip"),
      "Stadiu: " + (field("stadiu") || "—"),
      "Suprafață aproximativă: " + (field("suprafata") || "—"),
      "Când aș vrea să încep: " + (field("cand") || "—"),
      "",
      "Detalii:",
      field("mesaj") || "—"
    ];
    return lines.join("\n");
  }

  function showSuccess(body, sent) {
    form.hidden = true;
    success.hidden = false;
    letter.textContent = body;
    if (sent) {
      successTitle.textContent = "Cererea a plecat.";
      successLead.textContent = "Revin în una-două zile lucrătoare, cu întrebările care lipsesc sau cu o primă încadrare.";
      openMail.hidden = true;
    } else {
      successTitle.textContent = "Mesajul e pregătit.";
      successLead.textContent = "Încă nu a plecat singur. Deschide emailul sau copiază textul în Viber și trimite-l, ca să am unde răspunde.";
      var subject = "Estimare AX Construct — " + field("tip") + " — " + field("nume");
      openMail.href = "mailto:" + (AX.email || "office@axconstruct.md") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      openMail.hidden = false;
    }
    if (AX.whatsapp) {
      var wa = document.getElementById("open-wa");
      if (wa) {
        wa.hidden = false;
        wa.href = "https://wa.me/" + AX.whatsapp + "?text=" + encodeURIComponent(body);
      }
    }
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.elements._gotcha && form.elements._gotcha.value) {
      showSuccess("", true);
      return;
    }
    var body = buildLetter();
    if (!AX.formEndpoint) {
      showSuccess(body, false);
      return;
    }
    var submit = form.querySelector("[type='submit']");
    if (submit) submit.disabled = true;
    fetch(AX.formEndpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    }).then(function (res) {
      if (!res.ok) throw new Error("fail");
      showSuccess(body, true);
    }).catch(function () {
      if (submit) submit.disabled = false;
      showSuccess(body, false);
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = letter.textContent || "";
      var done = function (label) {
        copyBtn.textContent = label;
        setTimeout(function () { copyBtn.textContent = "Copiază textul"; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          done("Copiat");
        }).catch(function () {
          done("Nu am putut copia");
        });
      }
    });
  }
})();
