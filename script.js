(function () {
  "use strict";

  const WEBHOOK_URL =
  "https://sagardondapati181.app.n8n.cloud/webhook/81f3f811-477f-416f-b511-ed223b274b42";

  const form = document.getElementById("itinerary-form");
  const summaryPanel = document.getElementById("summary-panel");
  const summaryList = document.getElementById("summary-list");
  const emailStatusEl = document.getElementById("email-status");
  const submitBtn = document.getElementById("submit-btn");

  const requiredFields = [
    { id: "starting-location", errorId: "starting-location-error", validate: nonEmpty },
    { id: "destination", errorId: "destination-error", validate: nonEmpty },
    { id: "number-of-days", errorId: "number-of-days-error", validate: validDays },
    { id: "number-of-travelers", errorId: "number-of-travelers-error", validate: validTravelers },
    { id: "budget", errorId: "budget-error", validate: validBudget },
    { id: "email", errorId: "email-error", validate: validEmail },
  ];

  const modeRadioName = "modeOfTravel";
  const modeErrorEl = document.getElementById("mode-of-travel-error");

  function nonEmpty(value) {
    const trimmed = (value || "").trim();
    return trimmed.length > 0 ? null : "This field is required.";
  }

  function validDays(value) {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1) return "Enter at least 1 day.";
    if (num > 365) return "Maximum 365 days.";
    return null;
  }

  function validTravelers(value) {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 1) return "Enter at least 1 traveler.";
    if (num > 99) return "Maximum 99 travelers.";
    return null;
  }

  function validBudget(value) {
    const num = parseFloat(value);
    if (value === "" || value === null || value === undefined) return "Budget is required.";
    if (Number.isNaN(num)) return "Enter a valid number.";
    if (num < 0) return "Budget cannot be negative.";
    return null;
  }

  function validEmail(value) {
    const trimmed = (value || "").trim();
    if (trimmed.length === 0) return "Email is required.";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRe.test(trimmed) ? null : "Enter a valid email address.";
  }

  function getFieldValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
  }

  function setFieldError(errorId, message) {
    const el = document.getElementById(errorId);
    if (el) {
      el.textContent = message || "";
    }
  }

  function validateModeOfTravel() {
    const checked = form.querySelector(`input[name="${modeRadioName}"]:checked`);
    if (!checked) {
      modeErrorEl.textContent = "Please select a mode of travel.";
      return false;
    }
    modeErrorEl.textContent = "";
    return true;
  }

  function validateForm() {
    let valid = true;

    requiredFields.forEach(function (field) {
      const value = getFieldValue(field.id);
      const error = field.validate(value);
      setFieldError(field.errorId, error);
      if (error) valid = false;
    });

    if (!validateModeOfTravel()) valid = false;
    return valid;
  }

  function getModeLabel(value) {
    const labels = { bus: "Bus", train: "Train", flight: "Flight", car: "Car" };
    return labels[value] || value;
  }

  function buildPayload() {
    const modeEl = form.querySelector(`input[name="${modeRadioName}"]:checked`);
    const additional = (getFieldValue("additional-preferences") || "").trim();
    return {
      startingLocation: getFieldValue("starting-location").trim(),
      destination: getFieldValue("destination").trim(),
      numberOfDays: parseInt(getFieldValue("number-of-days"), 10) || 0,
      numberOfTravelers: parseInt(getFieldValue("number-of-travelers"), 10) || 0,
      budget: parseFloat(getFieldValue("budget")) || 0,
      modeOfTravel: modeEl ? modeEl.value : "",
      email: getFieldValue("email").trim(),
      additionalPreferences: additional || undefined,
    };
  }

  function buildSummaryData() {
    const modeEl = form.querySelector(`input[name="${modeRadioName}"]:checked`);
    const additional = (getFieldValue("additional-preferences") || "").trim();

    return [
      ["Starting location", getFieldValue("starting-location")],
      ["Destination", getFieldValue("destination")],
      ["Number of days", getFieldValue("number-of-days")],
      ["Number of travelers", getFieldValue("number-of-travelers")],
      ["Budget", "$" + getFieldValue("budget")],
      ["Mode of travel", modeEl ? getModeLabel(modeEl.value) : ""],
      ["Email", getFieldValue("email")],
    ].concat(additional ? [["Additional preferences", additional]] : []);
  }

  function setEmailStatus(sent) {
    if (!emailStatusEl) return;
    emailStatusEl.textContent = sent ? "✉️ Email sent" : "✉️ Email not sent";
    emailStatusEl.className = "email-status email-status--" + (sent ? "sent" : "not-sent");
  }

  function clearEmailStatus() {
    if (emailStatusEl) {
      emailStatusEl.textContent = "";
      emailStatusEl.className = "email-status";
    }
  }

  function renderSummary() {
    const data = buildSummaryData();
    summaryList.innerHTML = data
      .map(function (pair) {
        return (
          "<dt>" + escapeHtml(pair[0]) + "</dt><dd>" + escapeHtml(pair[1]) + "</dd>"
        );
      })
      .join("");
    summaryPanel.classList.remove("hidden");
    summaryPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setFieldError("starting-location-error", "");
    setFieldError("destination-error", "");
    setFieldError("number-of-days-error", "");
    setFieldError("number-of-travelers-error", "");
    setFieldError("budget-error", "");
    setFieldError("email-error", "");
    modeErrorEl.textContent = "";

    if (!validateForm()) {
      const firstError = form.querySelector(".field-error:not(:empty)");
      if (firstError) {
        firstError.closest(".field-group")?.querySelector("input, textarea, .radio-option")?.focus?.();
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "⏳ Generating…";
    }

    var payload = buildPayload();

    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed: " + res.status);
        return res.json().catch(function () { return {}; });
      })
      .then(function (data) {
        renderSummary();
        var emailSent = !data || data.emailSent !== false;
        setEmailStatus(emailSent);
      })
      .catch(function (err) {
        console.error("Webhook error:", err);
        renderSummary();
        setEmailStatus(false);
        alert("Your trip was saved locally. There was a problem sending to the server — please try again later.");
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "✨ Generate itinerary";
        }
      });
  });

  form.addEventListener("reset", function () {
    setTimeout(function () {
      requiredFields.forEach(function (f) {
        setFieldError(f.errorId, "");
      });
      modeErrorEl.textContent = "";
      summaryPanel.classList.add("hidden");
      summaryList.innerHTML = "";
      clearEmailStatus();
    }, 0);
  });

  // Optional: clear field errors on input for better UX
  requiredFields.forEach(function (field) {
    const input = document.getElementById(field.id);
    if (input) {
      input.addEventListener("input", function () {
        const error = field.validate(input.value);
        setFieldError(field.errorId, error || "");
      });
    }
  });

  form.querySelectorAll(`input[name="${modeRadioName}"]`).forEach(function (radio) {
    radio.addEventListener("change", function () {
      modeErrorEl.textContent = "";
    });
  });

  // Interactive background: gradient follows mouse
  var bgEl = document.getElementById("bg-interactive");
  if (bgEl) {
    document.addEventListener("mousemove", function (e) {
      var x = (e.clientX / window.innerWidth) * 100;
      var y = (e.clientY / window.innerHeight) * 100;
      bgEl.style.setProperty("--mouse-x", x + "%");
      bgEl.style.setProperty("--mouse-y", y + "%");
    });
  }
})();
