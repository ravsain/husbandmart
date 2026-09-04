(function () {
  "use strict";

  /* =========================================================
     EMAILJS CONFIG
     Create a free account at https://www.emailjs.com, connect
     your Gmail/Outlook as an Email Service, and build a template
     whose "To Email" field is set to {{to_email}} (not a fixed
     address). Paste your three keys below — see readme.md for
     the full walkthrough and the template fields it expects.
     ========================================================= */
  var EMAILJS_CONFIG = {
    serviceId: "PASTE_YOUR_SERVICE_ID",
    templateId: "PASTE_YOUR_TEMPLATE_ID",
    publicKey: "PASTE_YOUR_PUBLIC_KEY"
  };

  var emailjsReady = false;
  if (window.emailjs && EMAILJS_CONFIG.publicKey.indexOf("PASTE_") !== 0) {
    window.emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    emailjsReady = true;
  } else {
    console.warn("HusbandMart: EmailJS is not configured yet — order confirmations won't be emailed. See readme.md.");
  }

  /* =========================================================
     PRODUCT CATALOG
     Edit this list to add, remove, or reprice products.
     `cats` values must match a slug in CATEGORIES below.
     ========================================================= */
  var PRODUCTS = [
    { id: "hug", emoji: "🫂", name: "Unlimited Hugs", price: 0, note: "Valid forever.", cats: ["affection"] },
    { id: "loveyou", emoji: "❤️", name: 'One "I Love You"', price: 0, note: "Delivered immediately.", cats: ["affection"] },
    { id: "husbandtime", emoji: "🕐", name: "2 Hours Husband Time", price: 999, note: "Phone-free. Just the two of you.", cats: ["services", "dates"] },
    { id: "therapy", emoji: "🧠", name: "Emotional Therapy — Husband Edition", price: 499, note: "You talk. He listens. No arguing.", cats: ["support", "emergency"] },
    { id: "chai", emoji: "☕", name: "Chai Made By Husband", price: 49, note: "Includes serving + forehead kiss.", cats: ["household", "services"] },
    { id: "voucher", emoji: "👖", name: "Pant/Chaddi Shopping Voucher", price: 299, note: "Husband shops without complaining.", cats: ["household"] },
    { id: "chocolate", emoji: "🍫", name: "Emergency Chocolate", price: 199, note: "For the bad days.", cats: ["emergency", "affection"] },
    { id: "massage", emoji: "💆", name: "Head Massage — 30 Min", price: 599, note: "No expiry date.", cats: ["services"] },
    { id: "dinner", emoji: "🍽️", name: "Dinner Date", price: 1499, note: "Husband arranges everything.", cats: ["dates", "services"] },
    { id: "rightcert", emoji: "🛋️", name: '"You Were Right" Certificate', price: 9999, note: "Extremely rare item.", cats: ["support", "premium"], badge: "Rare" },
    { id: "kisses", emoji: "😘", name: "100 Kisses Pack", price: 100, note: "Non-refundable, by design.", cats: ["affection"] },
    { id: "queen", emoji: "👑", name: "Queen Treatment — 24 Hours", price: 2999, note: "Husband becomes personal assistant.", cats: ["premium", "dates"], badge: "Bestseller" },
    { id: "listening", emoji: "👂", name: "Husband Listening Service", price: 0, note: "Full attention. No phone. No 'but actually…'.", cats: ["services", "support"], badge: "Today Only" }
  ];

  var CATEGORIES = [
    { slug: "all", label: "All" },
    { slug: "affection", label: "Love & Affection" },
    { slug: "services", label: "Husband Services" },
    { slug: "emergency", label: "Emergency Wife Care" },
    { slug: "dates", label: "Date Night" },
    { slug: "household", label: "Household Services 😂" },
    { slug: "support", label: "Emotional Support" },
    { slug: "premium", label: "Premium Picks" }
  ];

  var PRICE_MAP = {};
  PRODUCTS.forEach(function (p) { PRICE_MAP[p.id] = p; });

  var state = {
    cart: {},         // productId -> quantity
    activeCategory: "all",
    searchTerm: "",
    wifeEmail: "",
    husbandEmail: ""
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var fmt = function (n) {
    return n === 0 ? "₹0" : "₹" + n.toLocaleString("en-IN");
  };

  var $ = function (id) { return document.getElementById(id); };

  /* ---------------------------------------------------------
     Category navigation + filter bar
     --------------------------------------------------------- */
  function renderCategoryControls() {
    var catNav = $("catNav");
    var filterBar = $("filterBar");

    CATEGORIES.forEach(function (cat) {
      var navPill = document.createElement("button");
      navPill.className = "cat-pill" + (cat.slug === "all" ? " active" : "");
      navPill.textContent = cat.label;
      navPill.dataset.cat = cat.slug;
      navPill.addEventListener("click", function () {
        setActiveCategory(cat.slug);
        $("shop").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      catNav.appendChild(navPill);

      var filterPill = document.createElement("button");
      filterPill.className = "cat-pill" + (cat.slug === "all" ? " active" : "");
      filterPill.textContent = cat.label;
      filterPill.dataset.cat = cat.slug;
      filterPill.addEventListener("click", function () { setActiveCategory(cat.slug); });
      filterBar.appendChild(filterPill);
    });
  }

  function setActiveCategory(slug) {
    state.activeCategory = slug;
    document.querySelectorAll(".cat-pill").forEach(function (el) {
      el.classList.toggle("active", el.dataset.cat === slug);
    });
    renderProductGrid();
  }

  /* ---------------------------------------------------------
     Product grid
     --------------------------------------------------------- */
  function renderProductGrid() {
    var grid = $("productGrid");
    grid.innerHTML = "";

    PRODUCTS.forEach(function (p) {
      var matchesCategory = state.activeCategory === "all" || p.cats.indexOf(state.activeCategory) !== -1;
      var term = state.searchTerm;
      var matchesSearch = !term || p.name.toLowerCase().indexOf(term) !== -1 || p.note.toLowerCase().indexOf(term) !== -1;
      if (!matchesCategory || !matchesSearch) return;

      var card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML =
        (p.badge ? '<div class="ribbon">' + p.badge + "</div>" : "") +
        '<div class="p-emoji">' + p.emoji + "</div>" +
        "<h4>" + p.name + "</h4>" +
        '<p class="note">' + p.note + "</p>" +
        '<div class="price-row">' +
        '<span class="price ' + (p.price === 0 ? "free" : "") + '">' + fmt(p.price) + "</span>" +
        '<button class="add-btn" data-add="' + p.id + '">Add to Cart</button>' +
        "</div>";
      grid.appendChild(card);
    });
  }

  /* ---------------------------------------------------------
     Toasts
     --------------------------------------------------------- */
  function showToast(html, life) {
    var stack = $("toast-stack");
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = html;
    stack.appendChild(toast);
    setTimeout(function () {
      toast.style.transition = "opacity .3s ease";
      toast.style.opacity = "0";
      setTimeout(function () { toast.remove(); }, 300);
    }, life || 3200);
  }

  function showAddedToCartToast(product) {
    showToast(
      "<strong>Added to cart ❤️ — " + product.name + "</strong>" +
      "Your husband has been notified." +
      '<div class="meta">Delivery: Right now · Shipping: Husband, personally</div>' +
      '<div class="meta">Returns: Absolutely not · Refund: One kiss required</div>'
    );
  }

  /* ---------------------------------------------------------
     Cart state + drawer
     --------------------------------------------------------- */
  function cartTotal() {
    return Object.keys(state.cart).reduce(function (sum, id) {
      return sum + PRICE_MAP[id].price * state.cart[id];
    }, 0);
  }

  function cartCount() {
    return Object.keys(state.cart).reduce(function (sum, id) { return sum + state.cart[id]; }, 0);
  }

  function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    renderCart();
  }

  function renderCart() {
    var body = $("cartBody");
    var ids = Object.keys(state.cart).filter(function (id) { return state.cart[id] > 0; });

    $("cartCount").textContent = cartCount();
    $("checkoutBtn").disabled = ids.length === 0;

    if (ids.length === 0) {
      body.innerHTML = '<div class="cart-empty">Your cart is empty.<br>Somehow, so is the fridge.</div>';
    } else {
      body.innerHTML = "";
      ids.forEach(function (id) {
        var p = PRICE_MAP[id];
        var row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML =
          '<div class="ci-emoji">' + p.emoji + "</div>" +
          '<div class="ci-info"><h5>' + p.name + '</h5><div class="ci-price tab-num">' + fmt(p.price) + " each</div></div>" +
          '<div class="qty">' +
          '<button data-dec="' + id + '">−</button>' +
          '<span class="tab-num">' + state.cart[id] + "</span>" +
          '<button data-inc="' + id + '">+</button>' +
          "</div>";
        body.appendChild(row);
      });
    }
    $("cartSubtotal").textContent = fmt(cartTotal());
  }

  function openCartDrawer() {
    $("cartDrawer").classList.add("open");
    $("scrim").classList.add("open");
  }

  function closeCartDrawer() {
    $("cartDrawer").classList.remove("open");
    $("scrim").classList.remove("open");
  }

  /* ---------------------------------------------------------
     Checkout flow (5 steps: review -> emails -> reveal -> confirm -> surprise)
     --------------------------------------------------------- */
  var checkoutSteps = ["step1", "stepEmails", "step2", "step3", "step4"].map($);

  function showCheckoutStep(index) {
    checkoutSteps.forEach(function (step, i) { step.classList.toggle("active", i === index); });
  }

  function openCheckout() {
    closeCartDrawer();
    buildOrderReview();
    showCheckoutStep(0);
    $("checkoutOverlay").classList.add("open");
    $("scrim").classList.add("open");
  }

  function closeCheckout() {
    $("checkoutOverlay").classList.remove("open");
    $("scrim").classList.remove("open");
  }

  function buildOrderReview() {
    var lines = $("reviewLines");
    lines.innerHTML = "";
    Object.keys(state.cart).forEach(function (id) {
      var p = PRICE_MAP[id];
      var line = document.createElement("div");
      line.className = "co-line";
      line.innerHTML =
        "<span>" + p.emoji + " " + p.name + ' <span class="qty-tag">×' + state.cart[id] + "</span></span>" +
        '<span class="tab-num">' + fmt(p.price * state.cart[id]) + "</span>";
      lines.appendChild(line);
    });
    $("reviewTotal").textContent = fmt(cartTotal());
  }

  function generateOrderId() {
    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var stamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
    var suffix = Math.floor(1000 + Math.random() * 9000);
    return "HM-" + stamp + "-" + suffix;
  }

  function buildItemListText() {
    return Object.keys(state.cart).map(function (id) {
      var p = PRICE_MAP[id];
      return p.emoji + " " + p.name + "  ×" + state.cart[id] + "  —  " + fmt(p.price * state.cart[id]);
    }).join("\n");
  }

  /* ---------------------------------------------------------
     Order confirmation emails, sent via EmailJS to both addresses
     collected at checkout. Each send is independent so one
     failing (e.g. a typo) doesn't block the other.
     --------------------------------------------------------- */
  function sendOrderEmails(orderId) {
    var statusEl = $("emailStatus");
    statusEl.hidden = false;
    statusEl.className = "email-status";

    if (!emailjsReady) {
      statusEl.textContent = "✉️ Email sending isn't configured yet (see readme.md).";
      statusEl.classList.add("err");
      return;
    }

    statusEl.textContent = "Sending confirmation to both inboxes…";

    var recipients = [
      { to_email: state.wifeEmail, to_name: "Wife" },
      { to_email: state.husbandEmail, to_name: "Husband" }
    ];
    var itemList = buildItemListText();
    var total = fmt(cartTotal());

    var sends = recipients.map(function (r) {
      return window.emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, {
        to_email: r.to_email,
        to_name: r.to_name,
        order_id: orderId,
        item_list: itemList,
        total: total
      });
    });

    Promise.allSettled(sends).then(function (results) {
      var okCount = results.filter(function (r) { return r.status === "fulfilled"; }).length;
      if (okCount === recipients.length) {
        statusEl.textContent = "✓ Sent to both inboxes ❤️";
        statusEl.classList.add("ok");
      } else if (okCount > 0) {
        statusEl.textContent = "✓ Sent to " + okCount + " of " + recipients.length + " — check the other email address.";
        statusEl.classList.add("err");
      } else {
        statusEl.textContent = "Couldn't send the emails — double-check the addresses and try again.";
        statusEl.classList.add("err");
        console.error("HusbandMart: EmailJS send failed", results);
      }
    });
  }

  /* ---------------------------------------------------------
     Heart-burst confetti (skipped under prefers-reduced-motion)
     --------------------------------------------------------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function burstHearts(count) {
    if (reduceMotion) return;
    var host = $("heartBurst");
    var palette = ["❤️", "💕", "💖", "😘"];
    for (var i = 0; i < count; i++) {
      var heart = document.createElement("div");
      heart.className = "heart-particle";
      heart.textContent = palette[Math.floor(Math.random() * palette.length)];
      heart.style.left = Math.random() * 100 + "vw";
      heart.style.top = "-40px";
      heart.style.animationDuration = (2 + Math.random() * 1.6) + "s";
      host.appendChild(heart);
      (function (el) { setTimeout(function () { el.remove(); }, 4000); })(heart);
    }
  }

  /* ---------------------------------------------------------
     Flash-sale countdown — decorative, loops forever ("today only", always)
     --------------------------------------------------------- */
  function startFlashCountdown() {
    var remaining = 23 * 3600 + 59 * 60 + 59;
    if (reduceMotion) {
      $("flashTimer").textContent = "always today";
      return;
    }
    setInterval(function () {
      remaining--;
      if (remaining < 0) remaining = 23 * 3600 + 59 * 60 + 59;
      var h = Math.floor(remaining / 3600);
      var m = Math.floor((remaining % 3600) / 60);
      var s = remaining % 60;
      var pad = function (n) { return String(n).padStart(2, "0"); };
      $("flashTimer").textContent = pad(h) + ":" + pad(m) + ":" + pad(s) + " left";
    }, 1000);
  }

  /* ---------------------------------------------------------
     Footer policy links — playful, non-navigating
     --------------------------------------------------------- */
  var POLICY_COPY = {
    about: "Founded today, by one husband, with zero investors and unlimited love.",
    shipping: "All orders shipped same-day by husband, on foot if necessary.",
    returns: "We do not accept returns. He is not going anywhere.",
    terms: "By using this site, you agree to be loved, occasionally annoyed, and never truly alone.",
    contact: "He's right there. Just ask."
  };

  /* ---------------------------------------------------------
     Wire up events
     --------------------------------------------------------- */
  function bindEvents() {
    $("searchInput").addEventListener("input", function (e) {
      state.searchTerm = e.target.value.trim().toLowerCase();
      renderProductGrid();
    });

    // Add-to-cart buttons (product grid + hero + flash sale), via delegation
    document.addEventListener("click", function (e) {
      var addBtn = e.target.closest("[data-add]");
      if (addBtn) {
        var id = addBtn.dataset.add;
        addToCart(id);
        showAddedToCartToast(PRICE_MAP[id]);
        var original = addBtn.textContent;
        addBtn.textContent = "Added ✓";
        addBtn.classList.add("added");
        setTimeout(function () { addBtn.textContent = original; addBtn.classList.remove("added"); }, 1200);
      }

      var incBtn = e.target.closest("[data-inc]");
      if (incBtn) { state.cart[incBtn.dataset.inc]++; renderCart(); }

      var decBtn = e.target.closest("[data-dec]");
      if (decBtn) {
        var decId = decBtn.dataset.dec;
        state.cart[decId]--;
        if (state.cart[decId] <= 0) delete state.cart[decId];
        renderCart();
      }

      var subBtn = e.target.closest("[data-sub]");
      if (subBtn) {
        showToast("<strong>Subscribed to " + subBtn.dataset.sub + " ❤️</strong>This plan cannot be cancelled by the husband. Ever.");
      }

      var policyLink = e.target.closest("[data-policy]");
      if (policyLink) {
        e.preventDefault();
        showToast("<strong>" + policyLink.textContent + "</strong>" + POLICY_COPY[policyLink.dataset.policy], 3600);
      }
    });

    $("openCart").addEventListener("click", openCartDrawer);
    $("closeCart").addEventListener("click", closeCartDrawer);
    $("scrim").addEventListener("click", function () { closeCartDrawer(); closeCheckout(); });

    $("checkoutBtn").addEventListener("click", function () {
      if (cartCount() === 0) return;
      openCheckout();
    });
    $("closeCheckout").addEventListener("click", closeCheckout);

    $("toEmailsBtn").addEventListener("click", function () {
      showCheckoutStep(1);
    });

    $("revealPriceBtn").addEventListener("click", function () {
      var wifeEmail = $("wifeEmail").value.trim();
      var husbandEmail = $("husbandEmail").value.trim();
      var valid = EMAIL_RE.test(wifeEmail) && EMAIL_RE.test(husbandEmail);
      $("emailError").hidden = valid;
      if (!valid) return;

      state.wifeEmail = wifeEmail;
      state.husbandEmail = husbandEmail;
      $("oldTotal").textContent = fmt(cartTotal());
      showCheckoutStep(2);
      burstHearts(14);
    });

    $("placeOrderBtn").addEventListener("click", function () {
      var orderId = generateOrderId();
      $("orderId").textContent = "Order #" + orderId;
      $("emailStatus").hidden = true;
      showCheckoutStep(3);
      sendOrderEmails(orderId);
    });

    $("surpriseBtn").addEventListener("click", function () {
      showCheckoutStep(4);
      burstHearts(22);
    });

    $("restartBtn").addEventListener("click", function () {
      closeCheckout();
      state.cart = {};
      state.wifeEmail = "";
      state.husbandEmail = "";
      $("wifeEmail").value = "";
      $("husbandEmail").value = "";
      $("emailError").hidden = true;
      renderCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    $("heroShopBtn").addEventListener("click", function () {
      $("shop").scrollIntoView({ behavior: "smooth" });
    });
    $("heroPlansBtn").addEventListener("click", function () {
      $("plans").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  function init() {
    renderCategoryControls();
    renderProductGrid();
    renderCart();
    bindEvents();
    startFlashCountdown();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
