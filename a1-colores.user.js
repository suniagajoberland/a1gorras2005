// ==UserScript==
// @name         A1 Gorras - Extractor de colores
// @namespace    a1gorras
// @version      1.0
// @description  Recorre las gorras y extrae la imagen de cada color
// @match        https://articulo.mercadolibre.com.ve/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";
  var KEY = "a1_colores_crawl_v1";
  var URLS = [
  "https://articulo.mercadolibre.com.ve/MLV-977064658-gorras-unicolor-acrilicas-para-bordar-con-cierre-magico-_JM?searchVariation=199073162543",
  "https://articulo.mercadolibre.com.ve/MLV-985137718-viseras-unicolor-deportiva-cierre-magico-_JM?searchVariation=192166946306",
  "https://articulo.mercadolibre.com.ve/MLV-1007588924-gorras-unicolor-vip-completa-_JM?searchVariation=193415915010",
  "https://articulo.mercadolibre.com.ve/MLV-777260171-pack-12-gorras-acrilicas-bordadas-personalizadas-unicolor-multicolor-un-drill-_JM",
  "https://articulo.mercadolibre.com.ve/MLV-1013907674-gorras-unicolor-prelavada-vintage-_JM?searchVariation=206648131463",
  "https://articulo.mercadolibre.com.ve/MLV-1013591820-gorras-unicolor-acrilicas-para-ninos-_JM?searchVariation=195800950222",
  "https://articulo.mercadolibre.com.ve/MLV-978220586-gorras-unicolor-acrilica-frontal-free-sin-costura-al-frente-_JM?searchVariation=198951704873",
  "https://articulo.mercadolibre.com.ve/MLV-1010564740-gorras-vip-bicolor-de-malla-con-broche-plastico-_JM?searchVariation=201755048111",
  "https://articulo.mercadolibre.com.ve/MLV-977388904-gorras-bicolor-acrilica-cierre-magico-_JM?searchVariation=199171922641",
  "https://articulo.mercadolibre.com.ve/MLV-1009060972-gorras-platinium-bicolor-frontal-free-_JM?searchVariation=203348668503",
  "https://articulo.mercadolibre.com.ve/MLV-978117262-gorras-unicolor-malla-modelo-ff-broche-plastico-_JM?searchVariation=199426320765",
  "https://articulo.mercadolibre.com.ve/MLV-977246562-gorras-unicolor-acrilica-broche-caiman-metalico-_JM?searchVariation=198887756139",
  "https://articulo.mercadolibre.com.ve/MLV-1013927420-pack-6-gorras-acrilicas-bordadas-personalizadas-unicolor-_JM?searchVariation=203391374149",
  "https://articulo.mercadolibre.com.ve/MLV-978156566-gorras-camuflada-regulada-con-cierre-magico-_JM?searchVariation=199141871251",
  "https://articulo.mercadolibre.com.ve/MLV-1001662038-pasamontanas-unicolor-para-ninos-_JM?searchVariation=200060186287",
  "https://articulo.mercadolibre.com.ve/MLV-988282668-gorras-camuflada-regulada-de-malla-_JM?searchVariation=192338131712",
  "https://articulo.mercadolibre.com.ve/MLV-1012469556-gorras-unicolor-premium-tres-paneles-microperforada-planas-_JM?searchVariation=202500360333",
  "https://articulo.mercadolibre.com.ve/MLV-777260871-pack-24-gorras-acrilicas-bordadas-personalizadas-unicolor-multicolor-un-drill-_JM",
  "https://articulo.mercadolibre.com.ve/MLV-988166252-gorras-unicolor-planas-completa-_JM?searchVariation=199375380873",
  "https://articulo.mercadolibre.com.ve/MLV-985816028-viseras-degradada-deportivas-cierre-magico-_JM?searchVariation=204940153945",
  "https://articulo.mercadolibre.com.ve/MLV-998827148-gorras-planas-mett-unicolor-de-malla-_JM?searchVariation=192843768462",
  "https://articulo.mercadolibre.com.ve/MLV-1011064896-gorras-unicolor-premium-camuflada-microperforada-_JM?searchVariation=202000923459",
  "https://articulo.mercadolibre.com.ve/MLV-998840204-gorras-planas-mett-bicolor-de-malla-_JM?searchVariation=192844038326",
  "https://articulo.mercadolibre.com.ve/MLV-977168674-gorras-unicolor-malla-acolchada-broche-plastico-_JM?searchVariation=198884296929",
  "https://articulo.mercadolibre.com.ve/MLV-989361632-gorras-bicolor-malla-modelo-ff-broche-plastico-_JM?searchVariation=199443653451",
  "https://articulo.mercadolibre.com.ve/MLV-978181878-gorras-unicolor-prelavada-broche-caiman-metalico-_JM?searchVariation=199220568505",
  "https://articulo.mercadolibre.com.ve/MLV-1009955942-gorras-unicolor-vip-de-malla-camuflada-_JM?searchVariation=194149765922",
  "https://articulo.mercadolibre.com.ve/MLV-1010487578-gorras-unicolor-vip-camuflada-completa-_JM?searchVariation=194408111966",
  "https://articulo.mercadolibre.com.ve/MLV-777296111-gorras-premium-camufladas-con-laureles-frontal-free-_JM?searchVariation=196212064412",
  "https://articulo.mercadolibre.com.ve/MLV-978246808-gorras-unicolor-planas-mett-completa-broche-plastico-_JM?searchVariation=199802204273",
  "https://articulo.mercadolibre.com.ve/MLV-1012460802-gorras-unicolor-flex-premium-completa-_JM?searchVariation=202512428619",
  "https://articulo.mercadolibre.com.ve/MLV-776104127-gorras-unicolor-delax-vip-impermeables-_JM?searchVariation=194145612812",
  "https://articulo.mercadolibre.com.ve/MLV-988308614-gorras-camuflada-regulada-de-malla-completa-_JM?searchVariation=192337975760",
  "https://articulo.mercadolibre.com.ve/MLV-1020876072-sombrero-o-gorro-de-pesca-solapa-ajustable-_JM?searchVariation=197896034276",
  "https://articulo.mercadolibre.com.ve/MLV-978285780-gorras-unicolor-impermeable-ciclista-_JM?searchVariation=199430129197",
  "https://articulo.mercadolibre.com.ve/MLV-778459389-sombrero-o-gorro-de-pesca-solapa-proteccion-solar-ajustable-negro-60cm-lona-_JM",
  "https://articulo.mercadolibre.com.ve/MLV-776248405-gorras-unicolor-vip-frontal-free-_JM?searchVariation=194490607982",
  "https://articulo.mercadolibre.com.ve/MLV-988153130-gorras-camuflada-regulada-planas-_JM?searchVariation=192338496312",
  "https://articulo.mercadolibre.com.ve/MLV-1012185388-gorras-premium-unicolor-microperforada-completa-_JM?searchVariation=195129672348",
  "https://articulo.mercadolibre.com.ve/MLV-777261507-pack-36-gorras-acrilicas-bordadas-personalizadas-unicolor-multicolor-un-drill-_JM",
  "https://articulo.mercadolibre.com.ve/MLV-776629603-gorras-unicolor-premium-tres-paneles-microperforada-_JM?searchVariation=195023863034",
  "https://articulo.mercadolibre.com.ve/MLV-977622928-gorras-unicolor-acrilica-broche-plastico-snapback-_JM?searchVariation=191712243328",
  "https://articulo.mercadolibre.com.ve/MLV-989415646-gorras-unicolor-malla-modelo-ff-frontal-free-_JM?searchVariation=192404365626",
  "https://articulo.mercadolibre.com.ve/MLV-995707628-gorras-bicolor-planas-mett-completa-broche-plastico-_JM?searchVariation=192722646674",
  "https://articulo.mercadolibre.com.ve/MLV-1012456532-gorras-unicolor-premium-microperforada-planas-_JM?searchVariation=202500448303",
  "https://articulo.mercadolibre.com.ve/MLV-1013591596-gorras-unicolor-prelavada-para-ninos-ajustable-_JM?searchVariation=203173866771",
  "https://articulo.mercadolibre.com.ve/MLV-1013172638-gorras-bicolor-acrilica-frontal-free-sin-costura-al-frente-_JM?searchVariation=202856501815",
  "https://articulo.mercadolibre.com.ve/MLV-1007601342-gorras-bicolor-vip-de-malla-tela-especial-_JM?searchVariation=200570497815"
];

  var state = null;
  try { state = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (!state) state = { active: false, i: 0, results: {} };

  var base = location.href.split("#")[0].split("?")[0];
  var idx = URLS.findIndex(function (u) { return u.split("?")[0].split("#")[0] === base; });

  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

  function download() {
    var blob = new Blob([JSON.stringify(state.results, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "colores.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    localStorage.removeItem(KEY);
    alert("Listo! Se descargo colores.json. Envia ese archivo en el chat.");
  }

  function collect() {
    var map = {};
    var list = [];
    document
      .querySelectorAll(
        ".ui-pdp-outside_variations__dropdown__item__picture, .ui-pdp-outside_variations__thumbnails__item__picture"
      )
      .forEach(function (img) {
        var name = (img.getAttribute("alt") || "").trim();
        var src = img.getAttribute("src") || "";
        if (name && /^https?:/.test(src) && !map[src]) {
          map[src] = true;
          list.push({ name: name, image: src });
        }
      });
    return list;
  }

  function openColorDropdown() {
    var pickers = document.querySelectorAll(".ui-pdp-outside_variations__picker");
    for (var i = 0; i < pickers.length; i++) {
      var label = pickers[i].querySelector(".ui-pdp-outside_variations__title__label");
      if (label && /color/i.test(label.textContent)) {
        var btn = pickers[i].querySelector("button.andes-dropdown__trigger");
        if (btn) { btn.click(); return true; }
      }
    }
    return false;
  }

  function banner(text) {
    var b = document.getElementById("a1-banner");
    if (!b) {
      b = document.createElement("div");
      b.id = "a1-banner";
      b.style.cssText = "position:fixed;z-index:999999;top:0;left:0;right:0;background:#d4af37;color:#000;font:bold 14px sans-serif;padding:8px;text-align:center;";
      document.body.appendChild(b);
    }
    b.textContent = text;
  }

  function finishPage() {
    var colors = collect();
    state.results[idx] = { url: location.href, title: document.title, colors: colors };
    save();
    if (idx + 1 < URLS.length) {
      banner("Extrayendo " + (idx + 1) + "/" + URLS.length + "...");
      setTimeout(function () { location.href = URLS[idx + 1]; }, 1200);
    } else {
      download();
    }
  }

  function step() {
    var waited = 0;
    var t = setInterval(function () {
      waited += 300;
      if (collect().length > 0 || waited >= 4500) {
        clearInterval(t);
        finishPage();
      }
    }, 300);
  }

  if (idx < 0) {
    if (!state.active && confirm("Iniciar la extraccion de colores de las gorras de A1 Gorras?")) {
      state = { active: true, i: 0, results: {} };
      save();
      location.href = URLS[0];
    }
    return;
  }

  if (!state.active) return;

  banner("Extrayendo " + (idx + 1) + "/" + URLS.length + "...");
  setTimeout(function () { openColorDropdown(); step(); }, 1800);
})();
