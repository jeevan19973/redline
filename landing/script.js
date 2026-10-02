// Underline landing page: plumb lines, the descent, linked highlights, marine snow.
// Everything here is enhancement: with no script the page is complete and static.

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wideEnough = window.matchMedia("(min-width: 1101px)");
  var SVG_NS = "http://www.w3.org/2000/svg";

  var dive = document.querySelector("[data-dive]");
  if (!dive) return;
  var svg = dive.querySelector(".plumb");
  var keys = ["c31", "c54", "c142", "c186"];

  function byKey(selector, key) {
    return Array.prototype.slice.call(document.querySelectorAll(selector + '[data-key="' + key + '"]'));
  }

  // ---------- Plumb lines ----------
  // Each line leaves the end of its cited sentence, runs down the lease's
  // right margin, crosses under the waterline in its own lane, drops down a
  // gutter beside its slate, and ties on at the slate's head.

  var paths = {};
  var rings = {};

  function drawPlumb() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    paths = {};
    rings = {};
    if (!wideEnough.matches) return;

    var box = dive.getBoundingClientRect();
    var lease = dive.querySelector(".lease").getBoundingClientRect();
    var marginRight = lease.right - box.left - 14;

    svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);

    keys.forEach(function (key, i) {
      var cite = document.getElementById("s-" + key);
      var slate = document.getElementById("flag-" + key);
      if (!cite || !slate) return;

      var rects = cite.getClientRects();
      var last = rects[rects.length - 1];
      var s = slate.getBoundingClientRect();
      var head = slate.querySelector(".slate__head").getBoundingClientRect();

      var x0 = last.right - box.left + 6;
      var y0 = last.top - box.top + last.height * 0.62;
      var laneX = marginRight - i * 9;
      var jogY = lease.bottom - box.top + 14 + i * 11;
      var gutterX = s.left - box.left - 12 - (i % 2) * 8;
      var tieY = head.top - box.top + head.height / 2;
      var tieX = s.left - box.left;

      var d = [
        "M", x0, y0,
        "H", laneX,
        "V", jogY,
        "H", gutterX,
        "V", tieY,
        "H", tieX
      ].join(" ");

      var path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", d);
      path.dataset.key = key;
      svg.appendChild(path);
      paths[key] = path;

      var ring = document.createElementNS(SVG_NS, "circle");
      ring.setAttribute("cx", tieX);
      ring.setAttribute("cy", tieY);
      ring.setAttribute("r", 3.5);
      ring.dataset.key = key;
      svg.appendChild(ring);
      rings[key] = ring;
    });
  }

  // ---------- Linked highlights ----------
  // Hovering or focusing a sentence, a readout row or a slate lights all three.

  function light(key, on) {
    byKey(".cite", key).concat(byKey(".readout__row", key), byKey(".slate", key)).forEach(function (el) {
      el.classList.toggle("is-lit", on);
    });
    if (paths[key]) paths[key].classList.toggle("is-lit", on);
    if (rings[key]) rings[key].classList.toggle("is-lit", on);
    svg.classList.toggle("has-lit", on);
  }

  keys.forEach(function (key) {
    byKey(".cite", key).concat(byKey(".readout__row", key), byKey(".slate", key)).forEach(function (el) {
      el.addEventListener("pointerenter", function () { light(key, true); });
      el.addEventListener("pointerleave", function () { light(key, false); });
      el.addEventListener("focusin", function () { light(key, true); });
      el.addEventListener("focusout", function () { light(key, false); });
    });
  });

  // ---------- The descent ----------
  // In document order, each cited sentence underlines, then its slate sinks
  // along its line to its depth. Content is visible before and after; the
  // motion only moves it from just above its resting place.

  function descend() {
    if (reduceMotion.matches || !("animate" in Element.prototype)) return;
    document.documentElement.classList.add("is-descending");

    var order = ["c31", "c54", "c142", "c186"];
    order.forEach(function (key, i) {
      var start = 350 + i * 520;
      var cite = document.getElementById("s-" + key);
      var slate = document.getElementById("flag-" + key);
      var deep = key === "c142" || key === "c186";

      window.setTimeout(function () { if (cite) cite.classList.add("is-drawn"); }, start);

      if (slate) {
        slate.animate(
          [
            { transform: "translateY(" + (deep ? -64 : -36) + "px)", opacity: 0.25 },
            { transform: "translateY(0)", opacity: 1 }
          ],
          { duration: deep ? 1500 : 1100, delay: start + 380, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" }
        );
      }

      var path = paths[key];
      if (path && path.getTotalLength) {
        var len = path.getTotalLength();
        path.animate(
          [{ strokeDasharray: len, strokeDashoffset: len }, { strokeDasharray: len, strokeDashoffset: 0 }],
          { duration: 1100, delay: start + 200, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "backwards" }
        );
      }
    });

    window.setTimeout(function () {
      document.documentElement.classList.remove("is-descending");
    }, 350 + order.length * 520 + 1600);
  }

  // ---------- Copy the counter-offer ----------

  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (button) {
    var label = button.querySelector("[data-copy-label]");
    var original = label.textContent;
    button.addEventListener("click", function () {
      var source = document.getElementById(button.getAttribute("data-copy"));
      if (!source || !navigator.clipboard) return;
      navigator.clipboard.writeText(source.textContent.trim()).then(function () {
        button.dataset.state = "done";
        label.textContent = "Copied";
        window.setTimeout(function () {
          button.dataset.state = "";
          label.textContent = original;
        }, 1800);
      });
    });
  });

  // ---------- Marine snow ----------

  var canvas = dive.querySelector(".snow");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var flakes = [];
  var keepOut = [];
  var running = false;
  var visible = true;

  function sizeSnow() {
    if (!ctx) return;
    var rect = canvas.getBoundingClientRect();
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    var count = Math.min(140, Math.round((rect.width * rect.height) / 11000));
    flakes = [];
    for (var i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        r: 0.8 + Math.random() * 1.3,
        v: 0.06 + Math.random() * 0.22,
        drift: Math.random() * Math.PI * 2,
        a: 0.3 + Math.random() * 0.4
      });
    }
    // Flakes never land on text: sample the copy and slates once per layout.
    keepOut = Array.prototype.map.call(
      dive.querySelectorAll(".water--reach .band-note, .water--reach .readout, .water--reach .slate, .thermocline__inner > *"),
      function (el) {
        var r = el.getBoundingClientRect();
        return { l: r.left - rect.left - 8, t: r.top - rect.top - 8, r: r.right - rect.left + 8, b: r.bottom - rect.top + 8 };
      }
    );
    paintSnow(rect.width, rect.height, 0);
  }

  function onText(x, y) {
    for (var k = 0; k < keepOut.length; k++) {
      var z = keepOut[k];
      if (x > z.l && x < z.r && y > z.t && y < z.b) return true;
    }
    return false;
  }

  function paintSnow(w, h, t) {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      var fx = f.x + Math.sin(f.drift + t * 0.0004) * 6;
      if (onText(fx, f.y)) continue;
      ctx.globalAlpha = f.a;
      ctx.fillStyle = "#E9EEF3";
      ctx.beginPath();
      ctx.arc(fx, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function tick(t) {
    if (!running) return;
    var rect = canvas.getBoundingClientRect();
    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.v;
      if (f.y > rect.height + 4) { f.y = -4; f.x = Math.random() * rect.width; }
    }
    paintSnow(rect.width, rect.height, t);
    window.requestAnimationFrame(tick);
  }

  function setSnowRunning() {
    var should = !!ctx && visible && !document.hidden && !reduceMotion.matches;
    if (should && !running) { running = true; window.requestAnimationFrame(tick); }
    if (!should) running = false;
  }

  if (ctx && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      setSnowRunning();
    }).observe(canvas);
  }
  document.addEventListener("visibilitychange", setSnowRunning);

  // ---------- Boot ----------

  var resizeTimer;
  function relayout() {
    drawPlumb();
    sizeSnow();
  }

  function boot() {
    relayout();
    descend();
    setSnowRunning();
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(relayout, 120);
    });
    reduceMotion.addEventListener && reduceMotion.addEventListener("change", setSnowRunning);
    wideEnough.addEventListener && wideEnough.addEventListener("change", drawPlumb);
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot);
  } else {
    window.addEventListener("load", boot);
  }
})();
