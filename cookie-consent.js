/* J.B Property Developments: opt-in Google Analytics and Ads */
(function () {
  "use strict";
  const KEY = "jb_cookie_prefs_v1";
  const GA = "G-V7Y0KLBMCS";
  const ADS = "AW-18468608489";
  const CONVERSION = "AW-18468608489/MQxACLrR_owdEOmzwuzE";
  const EXPIRY_MS = 180 * 86400 * 1000;
  let prefs = null;
  try {
    const old = JSON.parse(localStorage.getItem(KEY));
    if (old && typeof old.analytics === "boolean" &&
        typeof old.ads === "boolean" &&
        typeof old.when === "number" && Date.now() - old.when < EXPIRY_MS) {
      prefs = old;
    }
  } catch (_) { /* No stored preference: ask before loading Google tags. */ }

  function loadGoogle() {
    if (!prefs || (!prefs.analytics && !prefs.ads)) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", {
      analytics_storage: prefs.analytics ? "granted" : "denied",
      ad_storage: prefs.ads ? "granted" : "denied",
      ad_user_data: prefs.ads ? "granted" : "denied",
      ad_personalization: prefs.ads ? "granted" : "denied"
    });
    window.gtag("js", new Date());
    if (prefs.analytics) window.gtag("config", GA, { allow_google_signals: prefs.ads });
    if (prefs.ads) {
      window.gtag("config", ADS);
      if (window.location.pathname.endsWith("/thank-you.html")) {
        window.gtag("event", "conversion", { send_to: CONVERSION });
      }
    }
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" +
      encodeURIComponent(prefs.analytics ? GA : ADS);
    document.head.appendChild(tag);
  }

  function removeOptionalCookies() {
    document.cookie.split(";").forEach(function (entry) {
      const name = entry.split("=")[0].trim();
      if (/^(_ga($|_)|_gid$|_gat($|_)|_gcl_|_gac_|_dc_gtm_)/.test(name)) {
        document.cookie = name + "=; Max-Age=0; Path=/; SameSite=Lax";
        document.cookie = name + "=; Max-Age=0; Path=/; Domain=.jbpropertydevelopments.co.uk; SameSite=Lax";
      }
    });
  }

  function save(analytics, ads) {
    if (prefs && (prefs.analytics !== analytics || prefs.ads !== ads)) removeOptionalCookies();
    prefs = { analytics: !!analytics, ads: !!ads, when: Date.now() };
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs));
      location.reload();
    } catch (_) {
      document.getElementById("jb-cookie-banner").hidden = true;
      document.getElementById("jb-cookie-dialog-backdrop").hidden = true;
      loadGoogle();
    }
  }

  function setupUI() {
    const style = document.createElement("style");
    style.textContent =
      "#jb-cookie-banner,#jb-cookie-trigger,#jb-cookie-dialog-backdrop{font:14px/1.5 Arial,sans-serif;box-sizing:border-box}" +
      "#jb-cookie-banner *,#jb-cookie-dialog-backdrop *{box-sizing:border-box}" +
      "#jb-cookie-banner{position:fixed;z-index:2147483000;bottom:12px;left:12px;right:12px;max-width:740px;margin:auto;padding:16px 18px;border:1px solid #b98039;border-radius:10px;background:#17202b;color:white;box-shadow:0 8px 35px #0006}" +
      "#jb-cookie-banner p{margin:8px 0 12px}" +
      "#jb-cookie-banner strong{font-size:16px}" +
      "#jb-cookie-banner a,#jb-cookie-dialog-backdrop a{color:#f4d4a0;text-decoration:underline}" +
      ".jb-cookie-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}" +
      ".jb-cookie-actions button{flex:1;min-width:105px;border:1px solid #ddd;border-radius:6px;background:white;color:#17202b;padding:10px;font:700 13px Arial,sans-serif;cursor:pointer}" +
      ".jb-cookie-actions button.jb-outline{background:transparent;color:white}" +
      "#jb-cookie-trigger{position:fixed;z-index:2147482999;bottom:12px;left:12px;padding:7px 10px;border-radius:5px;border:1px solid #a68a63;background:#17202b;color:white;cursor:pointer;font-size:12px}" +
      "#jb-cookie-dialog-backdrop{position:fixed;inset:0;z-index:2147483001;background:#000a;display:flex;align-items:center;justify-content:center;padding:16px}" +
      "#jb-cookie-dialog{width:100%;max-width:480px;padding:22px;border-radius:10px;background:#17202b;color:#fff}" +
      "#jb-cookie-dialog h2{font:700 22px Arial,sans-serif;margin:0 0 14px;color:#fff}" +
      "#jb-cookie-dialog p{margin:12px 0}" +
      "#jb-cookie-dialog label{display:block;margin:14px 0}" +
      "#jb-cookie-dialog input{margin-right:8px}" +
      "#jb-cookie-banner[hidden],#jb-cookie-dialog-backdrop[hidden]{display:none!important}" +
      "@media(max-width:500px){#jb-cookie-banner{padding:13px;font-size:13px}.jb-cookie-actions button{font-size:12px;padding:9px 6px}}";
    document.head.appendChild(style);

    const openButton = document.createElement("button");
    openButton.id = "jb-cookie-trigger";
    openButton.type = "button";
    openButton.textContent = "Cookie preferences";
    document.body.appendChild(openButton);

    const banner = document.createElement("section");
    banner.id = "jb-cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie choices");
    banner.innerHTML =
      '<strong>Your cookie choices</strong><p>We use optional Google Analytics to understand visits and Google Ads to measure enquiries. You can accept, reject or customise. <a href="/cookies.html">Cookie information</a>.</p>' +
      '<div class="jb-cookie-actions"><button type="button" class="jb-outline" id="jb-reject">Reject optional</button>' +
      '<button type="button" class="jb-outline" id="jb-customise">Customise</button>' +
      '<button type="button" id="jb-accept">Accept all</button></div>';
    document.body.appendChild(banner);

    const backdrop = document.createElement("div");
    backdrop.id = "jb-cookie-dialog-backdrop";
    backdrop.hidden = true;
    backdrop.innerHTML =
      '<div id="jb-cookie-dialog" role="dialog" aria-modal="true" aria-labelledby="jb-cookie-heading">' +
      '<h2 id="jb-cookie-heading">Cookie preferences</h2>' +
      '<p>Essential functions and the storage of these preferences always stay on. All other Google tracking is optional.</p>' +
      '<label><input type="checkbox" id="jb-enable-analytics"> Analytics: website usage statistics</label>' +
      '<label><input type="checkbox" id="jb-enable-ads"> Advertising: Google Ads enquiry measurement</label>' +
      '<p><a href="/cookies.html">Cookie information</a></p>' +
      '<div class="jb-cookie-actions"><button type="button" class="jb-outline" id="jb-cancel">Cancel</button>' +
      '<button type="button" id="jb-save">Save preferences</button></div></div>';
    document.body.appendChild(backdrop);

    function showSettings() {
      document.getElementById("jb-enable-analytics").checked = !!(prefs && prefs.analytics);
      document.getElementById("jb-enable-ads").checked = !!(prefs && prefs.ads);
      backdrop.hidden = false;
      document.getElementById("jb-enable-analytics").focus();
    }
    openButton.addEventListener("click", showSettings);
    document.getElementById("jb-customise").addEventListener("click", showSettings);
    document.getElementById("jb-reject").addEventListener("click", function () { save(false, false); });
    document.getElementById("jb-accept").addEventListener("click", function () { save(true, true); });
    document.getElementById("jb-save").addEventListener("click", function () {
      save(document.getElementById("jb-enable-analytics").checked,
        document.getElementById("jb-enable-ads").checked);
    });
    document.getElementById("jb-cancel").addEventListener("click", function () { backdrop.hidden = true; });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") backdrop.hidden = true;
    });
    banner.hidden = !!prefs;
  }


  // Measure contact-link clicks as engagement events, not as confirmed calls.
  function setupContactClickTracking() {
    document.addEventListener("click", function (event) {
      const link = event.target && event.target.closest ? event.target.closest('a[href^="tel:"]') : null;
      if (!link || !window.gtag || !prefs || !prefs.analytics) return;
      window.gtag("event", "phone_click", {
        event_category: "contact",
        link_url: link.getAttribute("href"),
        link_text: (link.textContent || "").trim().slice(0, 80)
      });
    });
  }

  if (prefs) loadGoogle();
  setupContactClickTracking();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupUI);
  } else {
    setupUI();
  }
})();