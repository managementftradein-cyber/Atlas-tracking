// ---------- Mobile nav ----------
document.querySelectorAll("[data-nav-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".navlinks").classList.toggle("open");
  });
});

// ---------- Helpers ----------
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

const STATUS_LABEL = {
  pending: "Pending",
  picked_up: "Picked up",
  in_transit: "In transit",
  customs: "In customs",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  exception: "Exception",
};

function statusPill(status) {
  const label = STATUS_LABEL[status] || status;
  return `<span class="pill pill-${status}">${label}</span>`;
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ---------- Tracking lookup (used on home hero + track.html) ----------
async function lookupTracking(trackingNumber, resultEl) {
  const number = trackingNumber.trim();
  if (!number) return;

  resultEl.classList.remove("hidden");
  resultEl.innerHTML = `<p class="skel">Looking up ${escapeHtml(number)}…</p>`;

  const { data: shipment, error } = await supabaseClient
    .from("public_tracking")
    .select("*")
    .eq("tracking_number", number)
    .maybeSingle();

  if (error) {
    resultEl.innerHTML = `<div class="notice error">Something went wrong looking that up. Please try again.</div>`;
    return;
  }
  if (!shipment) {
    resultEl.innerHTML = `<div class="notice error">No shipment found for <strong class="mono">${escapeHtml(number)}</strong>. Check the tracking number and try again.</div>`;
    return;
  }

  const { data: events } = await supabaseClient
    .from("public_tracking_history")
    .select("*")
    .eq("tracking_number", number)
    .order("event_time", { ascending: false });

  const timelineHtml = (events && events.length)
    ? events.map((e, i) => `
        <div class="timeline-item ${i === 0 ? "current" : ""}">
          <div class="timeline-time mono">${escapeHtml(formatDateTime(e.event_time))}</div>
          <div class="timeline-status">${escapeHtml(e.status)}</div>
          <div class="timeline-loc">${escapeHtml(e.location || "")}${e.note ? " — " + escapeHtml(e.note) : ""}</div>
        </div>`).join("")
    : `<p class="skel">No tracking events yet.</p>`;

  resultEl.innerHTML = `
    <div class="result-panel">
      <div class="result-head">
        <div>
          <div class="eyebrow">Tracking number</div>
          <div class="mono" style="font-size:1.15rem;color:var(--fog)">${escapeHtml(shipment.tracking_number)}</div>
        </div>
        ${statusPill(shipment.status)}
      </div>
      <dl class="kv-grid" style="margin-bottom:28px;">
        <div><dt>Service</dt><dd>${escapeHtml(shipment.service_type || "—")}</dd></div>
        <div><dt>Origin</dt><dd>${escapeHtml(shipment.origin || "—")}</dd></div>
        <div><dt>Destination</dt><dd>${escapeHtml(shipment.destination || "—")}</dd></div>
        <div><dt>Weight</dt><dd>${escapeHtml(shipment.weight_kg ? shipment.weight_kg + " kg" : "—")}</dd></div>
        <div><dt>Dimensions</dt><dd>${escapeHtml(shipment.dimensions || "—")}</dd></div>
        <div><dt>Est. delivery</dt><dd>${escapeHtml(formatDate(shipment.est_delivery))}</dd></div>
      </dl>
      <div class="eyebrow">Route history</div>
      <div class="timeline">${timelineHtml}</div>
    </div>
  `;
}

document.querySelectorAll("[data-track-form]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    const resultId = form.getAttribute("data-track-form");
    const resultEl = document.getElementById(resultId);
    if (resultEl) lookupTracking(input.value, resultEl);
  });
});

// If track.html loaded with ?number=..., run the lookup automatically
(function autoTrackFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const number = params.get("number");
  const resultEl = document.getElementById("track-result");
  if (number && resultEl) {
    const input = document.querySelector('[data-track-form] input');
    if (input) input.value = number;
    lookupTracking(number, resultEl);
  }
})();

// ---------- Quote form ----------
const quoteForm = document.getElementById("quote-form");
if (quoteForm) {
  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = quoteForm.querySelector("button[type=submit]");
    const msg = document.getElementById("quote-msg");
    btn.disabled = true;
    btn.textContent = "Sending…";

    const payload = {
      name: quoteForm.name.value,
      email: quoteForm.email.value,
      phone: quoteForm.phone.value,
      origin: quoteForm.origin.value,
      destination: quoteForm.destination.value,
      package_details: quoteForm.package_details.value,
    };

    const { error } = await supabaseClient.from("quote_requests").insert(payload);

    if (error) {
      msg.innerHTML = `<div class="notice error">Couldn't send your request. Please try again in a moment.</div>`;
      btn.disabled = false;
      btn.textContent = "Request a quote";
    } else {
      quoteForm.reset();
      quoteForm.classList.add("hidden");
      msg.innerHTML = `<div class="notice success">Request received. We'll reply to your email within one business day.</div>`;
    }
  });
}

// ---------- Contact form ----------
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector("button[type=submit]");
    const msg = document.getElementById("contact-msg");
    btn.disabled = true;
    btn.textContent = "Sending…";

    const payload = {
      name: contactForm.name.value,
      email: contactForm.email.value,
      subject: contactForm.subject.value,
      message: contactForm.message.value,
    };

    const { error } = await supabaseClient.from("contact_messages").insert(payload);

    if (error) {
      msg.innerHTML = `<div class="notice error">Couldn't send your message. Please try again in a moment.</div>`;
      btn.disabled = false;
      btn.textContent = "Send message";
    } else {
      contactForm.reset();
      contactForm.classList.add("hidden");
      msg.innerHTML = `<div class="notice success">Message sent. We'll get back to you shortly.</div>`;
    }
  });
}
