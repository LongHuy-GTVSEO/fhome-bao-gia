(function () {
  var P = window.FHOME_PRICING;
  var root = document.getElementById("fq");
  if (!root) return;
  var $ = function (id) { return document.getElementById("fq-" + id); };
  var M = 1000000;

  // ---------- Trạng thái ----------
  var state = {
    service: "tron",    // tron = thiết kế và thi công trọn gói, thietke = chỉ thiết kế, thicong = chỉ thi công
    type: P.defaults.type, tier: P.defaults.tier, area: P.defaults.area, style: "",
    tho: {},        // id -> hệ số 0, 0.5, 1
    items: {},      // "phong:hangmuc" -> true/false
    counts: {},     // phong -> số lượng
    quote: null
  };
  P.thoItems.forEach(function (t) { state.tho[t.id] = null; });   // khách tự chọn, ban đầu chưa chọn gì
  P.rooms.forEach(function (r) {
    state.counts[r.id] = r.perUnit ? r.count : 1;
    r.items.forEach(function (it) { state.items[r.id + ":" + it.id] = false; });
  });

  // ---------- Tiện ích ----------
  function fmt(v) {
    var tr = Math.round(v / M);
    if (tr >= 1000) return (Math.round(tr / 100) / 10).toString().replace(".", ",") + " tỷ";
    if (v / M < 100) return (Math.round(v / M * 10) / 10).toString().replace(".", ",") + " triệu";   // dưới 100 triệu: giữ 1 số lẻ (phí thiết kế)
    return tr.toLocaleString("vi-VN") + " triệu";
  }
  function rangeText(q) { return q.low === q.high ? fmt(q.low) : fmt(q.low) + " đến " + fmt(q.high); }
  var SERVICES = [
    { id: "tron",    name: "Thi công trọn gói", label: "thi công trọn gói", hint: "FHome thiết kế và thi công cùng một đơn vị. Phí thiết kế thường được miễn hoặc giảm.", wp: "Thi công nội thất" },
    { id: "thietke", name: "Chỉ thiết kế",      label: "chỉ thiết kế",      hint: "Bản vẽ kỹ thuật 2D và phối cảnh 3D. Bạn không cần chọn hạng mục thi công.", wp: "Thiết kế nội thất" },
    { id: "thicong", name: "Chỉ thi công",      label: "chỉ thi công",      hint: "Dành cho bạn đã có bản vẽ thiết kế. Giá chưa gồm phí thiết kế.", wp: "Thi công nội thất" }
  ];
  function getService() { return SERVICES.filter(function (s) { return s.id === state.service; })[0]; }
  function mid(a) { return (a[0] + a[1]) / 2; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function getType() { return P.types.filter(function (t) { return t.id === state.type; })[0]; }
  function getTier() { return P.tiers.filter(function (t) { return t.id === state.tier; })[0]; }
  function getStyle() { return P.styles.filter(function (s) { return s.id === state.style; })[0] || null; }

  // ---------- Dựng giao diện ----------
  function pressGroup(container, value) {
    [].forEach.call(container.children, function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === String(value))); });
  }

  function buildSeg(container, list, key, onChange) {
    list.forEach(function (it) {
      var b = el("button", "", it.name); b.type = "button"; b.dataset.v = it.id;
      b.addEventListener("click", function () { state[key] = it.id; pressGroup(container, it.id); onChange(); });
      container.appendChild(b);
    });
    pressGroup(container, state[key]);
  }

  function buildTho() {
    var box = $("thoList");
    P.thoItems.forEach(function (t) {
      var row = el("div", "fq-row"); row.appendChild(el("p", "fq-rowname", t.name));
      var opts = el("div", "fq-opts" + (t.mode === "bin" ? " two" : ""));
      var list = t.mode === "tri"
        ? [["0", "Không"], ["0.5", "Một phần"], ["1", "Toàn bộ"]]
        : [["0", "Không"], ["1", "Có"]];
      list.forEach(function (o) {
        var b = el("button", "fq-chip", o[1]); b.type = "button"; b.dataset.v = o[0];
        b.addEventListener("click", function () {
          state.tho[t.id] = Number(o[0]);
          [].forEach.call(opts.children, function (c) { c.setAttribute("aria-pressed", String(c === b)); });
          render();
        });
        b.setAttribute("aria-pressed", String(Number(o[0]) === state.tho[t.id]));
        opts.appendChild(b);
      });
      row.appendChild(opts); box.appendChild(row);
    });
  }

  function buildRooms() {
    var box = $("roomList");
    P.rooms.forEach(function (r) {
      var wrap = el("div", "fq-room");
      var head = el("div", "fq-roomhead");
      head.appendChild(el("h4", "", r.name));
      var tools = el("div", "fq-tools");
      if (r.perUnit) {
        var cnt = el("div", "fq-count");
        var minus = el("button", "", "−"); minus.type = "button"; minus.setAttribute("aria-label", "Giảm số " + r.name.toLowerCase());
        var num = el("b", "", String(state.counts[r.id]));
        var plus = el("button", "", "+"); plus.type = "button"; plus.setAttribute("aria-label", "Tăng số " + r.name.toLowerCase());
        cnt.appendChild(el("span", "", "Số lượng")); cnt.appendChild(minus); cnt.appendChild(num); cnt.appendChild(plus);
        tools.appendChild(cnt);
        var change = function (d) {
          state.counts[r.id] = Math.max(r.min, Math.min(r.max, state.counts[r.id] + d));
          num.textContent = state.counts[r.id];
          grid.classList.toggle("off", state.counts[r.id] === 0);
          render();
        };
        minus.addEventListener("click", function () { change(-1); });
        plus.addEventListener("click", function () { change(1); });
      }
      var all = el("button", "fq-link", "Chọn tất cả"); all.type = "button";
      var none = el("button", "fq-link", "Bỏ chọn"); none.type = "button";
      tools.appendChild(all); tools.appendChild(none); head.appendChild(tools); wrap.appendChild(head);

      var grid = el("div", "fq-items" + (state.counts[r.id] === 0 ? " off" : ""));
      var chips = [];
      r.items.forEach(function (it) {
        var k = r.id + ":" + it.id;
        var b = el("button", "fq-chip", it.name); b.type = "button";
        b.setAttribute("aria-pressed", String(state.items[k]));
        b.addEventListener("click", function () { state.items[k] = !state.items[k]; b.setAttribute("aria-pressed", String(state.items[k])); render(); });
        chips.push([k, b]); grid.appendChild(b);
      });
      var setAll = function (v) { chips.forEach(function (c) { state.items[c[0]] = v; c[1].setAttribute("aria-pressed", String(v)); }); render(); };
      all.addEventListener("click", function () { setAll(true); });
      none.addEventListener("click", function () { setAll(false); });
      wrap.appendChild(grid); box.appendChild(wrap);
    });
  }

  // ---------- Tính giá ----------
  function imgSrc(url) { return (window.FHOME_ASSETS && window.FHOME_ASSETS[url]) || url; }
  function calc(tierOverride) {
    var type = getType(), tier = tierOverride || getTier(), area = state.area;
    if (state.service === "thietke") {
      var st0 = getStyle();
      var dz = st0 ? [area * st0.fee * M, area * st0.fee * M] : [area * type.designFee[0] * M, area * type.designFee[1] * M];
      return {
        service: "thietke", type: type, tier: tier, style: st0, area: area, total: (dz[0] + dz[1]) / 2, tho: 0, noiThat: 0,
        lines: [{ name: "Thiết kế: bản vẽ kỹ thuật 2D và phối cảnh 3D", value: (dz[0] + dz[1]) / 2, text: dz[0] === dz[1] ? "khoảng " + fmt(dz[0]) : fmt(dz[0]) + " đến " + fmt(dz[1]) }],
        low: dz[0], high: dz[1], design: dz
      };
    }
    var thoAll = 0, thoSel = 0;
    P.thoItems.forEach(function (t) { thoAll += t.w; thoSel += t.w * (state.tho[t.id] || 0); });
    var tho = area * mid(tier.tho) * M * (thoSel / thoAll);

    var full = 0, sel = 0, parts = [];
    P.rooms.forEach(function (r) {
      var sumW = r.items.reduce(function (s, it) { return s + it.w; }, 0);
      var chosen = r.items.reduce(function (s, it) { return s + (state.items[r.id + ":" + it.id] ? it.w : 0); }, 0);
      var c = state.counts[r.id];
      full += r.weight * c;
      var part = r.weight * c * (chosen / sumW);
      sel += part;
      if (part > 0) parts.push({ room: r, count: c, w: part });
    });
    var noiThat = full > 0 ? area * mid(tier.noiThat[type.id]) * M * (sel / full) : 0;
    var total = noiThat + tho;
    var lines = parts.map(function (p) {
      var label = p.room.perUnit && p.count > 1 ? p.room.name + " (" + p.count + ")" : p.room.name;
      return { name: label, value: noiThat * (p.w / sel) };
    });
    var style = getStyle();
    var design = style ? [area * style.fee * M, area * style.fee * M] : [area * type.designFee[0] * M, area * type.designFee[1] * M];
    return {
      service: state.service, type: type, tier: tier, style: style, area: area, total: total, tho: tho, noiThat: noiThat, lines: lines,
      low: total * P.rangeLow, high: total * P.rangeHigh, design: design
    };
  }

  function render() {
    var area = state.area;
    var ok = area >= P.areaMin && area <= P.areaMax;
    var q = state.quote = ok ? calc() : null;
    var txt = q && q.total > 0 ? rangeText(q) : "0";
    $("total").textContent = txt;
    $("mtotal").textContent = txt;
    $("tierHint").textContent = getTier().desc + ".";
    var designOnly = state.service === "thietke";
    $("svcHint").textContent = getService().hint;
    ["secTho", "secRoom", "tierBox", "cmpBox"].forEach(function (id) { $(id).hidden = designOnly; });
    var st = getStyle(), sh = $("styleHint");
    if (!designOnly && st && st.suggest && st.suggest.indexOf(state.tier) < 0) {
      var names = st.suggest.map(function (id) { return P.tiers.filter(function (t) { return t.id === id; })[0].name; }).join(" hoặc ");
      sh.textContent = "Phong cách " + st.name + " thường đi cùng gói " + names + " của FHome. Bạn vẫn có thể chọn gói khác, FHome sẽ tư vấn thêm khi khảo sát.";
      sh.className = "fq-hint warn";
    } else {
      sh.textContent = st ? "" : "Chưa chọn cũng được, FHome sẽ tư vấn phong cách phù hợp khi gặp bạn.";
      sh.className = "fq-hint";
    }
    renderSlider(st);
    renderCompare(ok);
    var ul = $("lines"); ul.innerHTML = "";
    if (q && q.total > 0) {
      $("sumSub").textContent = q.type.name + " " + area + " m², " + (q.style ? "phong cách " + q.style.name + ", " : "") +
        (designOnly ? getService().label : getService().label + ", gói " + q.tier.name);
      q.lines.forEach(function (l) { ul.appendChild(el("li", "", "<span>" + l.name + "</span><span>" + (l.text || fmt(l.value)) + "</span>")); });
      if (q.tho > 0) ul.appendChild(el("li", "", "<span>Hoàn thiện phần thô</span><span>" + fmt(q.tho) + "</span>"));
      var dfee = q.design[0] === q.design[1] ? "khoảng " + fmt(q.design[0]) : "khoảng " + fmt(q.design[0]) + " đến " + fmt(q.design[1]);
      $("designFee").textContent = state.service === "tron"
        ? "Phí thiết kế (bản vẽ 2D, phối cảnh 3D) " + dfee + ". FHome thường miễn hoặc giảm khoản này khi bạn ký thi công trọn gói."
        : state.service === "thicong"
          ? "Giá này chưa gồm phí thiết kế, vì bạn đã có bản vẽ."
          : "Phí thiết kế thường được miễn hoặc giảm khi bạn ký thi công trọn gói với FHome.";
    } else {
      $("sumSub").textContent = !ok ? "Nhập diện tích từ " + P.areaMin + " đến " + P.areaMax + " m² để xem chi phí." : "Bạn chọn các hạng mục ở Bước 2 và Bước 3 để xem chi phí.";
      $("designFee").textContent = "";
    }
  }

  // ---------- Slide ảnh công trình theo phong cách ----------
  var sl = { styleId: null, i: 0, n: 0, slides: [] };
  function slideGo(i, smooth) {
    var tr = $("track");
    sl.i = Math.max(0, Math.min(sl.n - 1, i));
    tr.scrollTo({ left: sl.i * tr.clientWidth, behavior: smooth === false ? "auto" : "smooth" });
    slideMark();
  }
  function slideMark() {
    $("galTitle").textContent = "Dự án FHome Sài Gòn đã triển khai phong cách " + sl.name;
    $("galCap").textContent = sl.slides[sl.i] ? sl.slides[sl.i].cap : "";
    [].forEach.call($("dots").children, function (d, k) { d.setAttribute("aria-current", String(k === sl.i)); });
    $("prev").hidden = sl.i === 0; $("next").hidden = sl.i >= sl.n - 1;
  }
  function renderSlider(st) {
    var box = $("styleGal"), slides = st && st.slides ? st.slides : [];
    if (!slides.length) { box.hidden = true; sl.styleId = null; return; }
    box.hidden = false;
    if (sl.styleId === st.id) return;          // cùng phong cách thì giữ nguyên ảnh đang xem
    sl = { styleId: st.id, name: st.name, i: 0, n: slides.length, slides: slides };
    var tr = $("track"), dots = $("dots"); tr.innerHTML = ""; dots.innerHTML = "";
    slides.forEach(function (s, k) {
      var im = el("img"); im.src = imgSrc(s.img); im.alt = s.cap + ", phong cách " + st.name + " do FHome thi công"; if (k > 0) im.loading = "lazy";
      tr.appendChild(im);
      var d = el("button"); d.type = "button"; d.setAttribute("aria-label", "Xem ảnh " + (k + 1) + " trên " + slides.length);
      d.addEventListener("click", function () { slideGo(k); });
      dots.appendChild(d);
    });
    tr.scrollLeft = 0; slideMark();
  }
  $("track").addEventListener("scroll", function () {
    var tr = this, i = Math.round(tr.scrollLeft / (tr.clientWidth || 1));
    if (i !== sl.i && i >= 0 && i < sl.n) { sl.i = i; slideMark(); }
  });
  $("prev").addEventListener("click", function () { slideGo(sl.i - 1); });
  $("next").addEventListener("click", function () { slideGo(sl.i + 1); });

  // ---------- So sánh 3 gói ----------
  function renderCompare(ok) {
    var box = $("cmp"); box.innerHTML = "";
    P.tiers.forEach(function (t) {
      var r = ok ? calc(t) : null;
      var b = el("button", "fq-cmprow", "<b>" + t.name + "</b><span>" + (r && r.total > 0 ? fmt(r.low) + " đến " + fmt(r.high) : "0") + " · " + t.desc + "</span>");
      b.type = "button"; b.setAttribute("aria-pressed", String(t.id === state.tier));
      b.addEventListener("click", function () { state.tier = t.id; pressGroup($("tierSeg"), t.id); render(); });
      box.appendChild(b);
    });
  }

  // ---------- Sao chép bảng báo giá ----------
  function sheetText() {
    var q = state.quote; if (!q || q.total <= 0) return "";
    var designOnly = q.service === "thietke";
    var L = [
      "BÁO GIÁ THAM KHẢO - " + P.brand.toUpperCase(),
      q.type.name + " " + q.area + " m², " + (q.style ? "phong cách " + q.style.name + ", " : "") +
        (designOnly ? getService().label : getService().label + ", gói " + q.tier.name),
      (designOnly ? "Phí thiết kế ước tính: " : "Chi phí ước tính: ") + rangeText(q),
      ""
    ];
    q.lines.forEach(function (l) { L.push("- " + l.name + ": " + (l.text || "khoảng " + fmt(l.value))); });
    if (q.tho > 0) L.push("- Hoàn thiện phần thô: khoảng " + fmt(q.tho));
    var d = q.design[0] === q.design[1] ? fmt(q.design[0]) : fmt(q.design[0]) + " đến " + fmt(q.design[1]);
    if (q.service === "tron") L.push("", "Phí thiết kế (miễn hoặc giảm khi ký thi công trọn gói): khoảng " + d);
    else if (q.service === "thicong") L.push("", "Giá chưa gồm phí thiết kế.");
    else L.push("", "Phí thiết kế thường được miễn hoặc giảm khi ký thi công trọn gói với FHome.");
    L.push("Giá chỉ mang tính tham khảo. Báo giá chính thức sau khi FHome khảo sát.",
      "Liên hệ: " + (P.hotlineLabel || P.hotline));
    return L.join("\n");
  }
  function copyText(btn) {
    var txt = sheetText(), old = btn.textContent;
    var ok = function () { btn.textContent = "Đã sao chép"; setTimeout(function () { btn.textContent = old; }, 1800); };
    var fallback = function () {
      var ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (x) { btn.textContent = "Bạn bôi đen và sao chép thủ công nhé"; }
      document.body.removeChild(ta);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(ok, fallback); else fallback();
  }
  $("copy").addEventListener("click", function () { copyText(this); });
  $("copy2").addEventListener("click", function () { copyText(this); });

  // ---------- Bước 1 ----------
  buildSeg($("svcSeg"), SERVICES, "service", render);
  buildSeg($("typeSeg"), P.types, "type", function () { $("areaHint").textContent = getType().areaHint; render(); });
  buildSeg($("styleSeg"), [{ id: "", name: "Chưa chọn, cần tư vấn" }].concat(P.styles), "style", render);
  $("styleSeg").children[0].className = "fq-none";
  buildSeg($("tierSeg"), P.tiers, "tier", render);
  $("areaHint").textContent = getType().areaHint;
  $("area").value = state.area;
  $("area").addEventListener("focus", function () { this.select(); });
  $("area").addEventListener("input", function () {
    var v = parseFloat(this.value.replace(",", "."));
    state.area = isNaN(v) ? 0 : v; render();
  });
  buildTho();
  buildRooms();

  // ---------- Cửa sổ nhận báo giá ----------
  var lastFocus = null;
  function openModal() {
    if (!state.quote || state.quote.total <= 0) {
      $("sumSub").textContent = state.service === "thietke" ? "Bạn nhập diện tích trước nhé." : "Bạn nhập diện tích và chọn ít nhất một hạng mục trước nhé.";
      $("panel").scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    var q = state.quote, W = P.wpforms;
    $("mquote").innerHTML = q.type.name + " " + q.area + " m², " + (q.style ? "phong cách " + q.style.name + ", " : "") +
      (q.service === "thietke" ? getService().label : getService().label + ", gói " + q.tier.name) + "<br><b>" + rangeText(q) + "</b>";
    $("emailWrap").hidden = !(W && W.fields.email != null);
    $("leadForm").hidden = false; $("thanks").hidden = true; $("leadError").hidden = true;
    var b = $("leadBtn"); b.disabled = false; b.textContent = "Gửi thông tin nhận báo giá";
    lastFocus = document.activeElement;
    $("modal").hidden = false;
    $("leadForm").fqname.focus();
  }
  function closeModal() { $("modal").hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  $("open").addEventListener("click", openModal);
  $("open2").addEventListener("click", openModal);
  $("close").addEventListener("click", closeModal);
  $("modal").addEventListener("click", function (e) { if (e.target === $("modal")) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("modal").hidden) closeModal(); });

  // ---------- Gửi thông tin khách qua WPForms ----------
  function buildMessage(q, lead) {
    var thoText = P.thoItems.filter(function (t) { return state.tho[t.id] > 0; }).map(function (t) {
      return t.name + (state.tho[t.id] === 0.5 ? " (một phần)" : "");
    }).join(", ") || "không làm phần thô";
    var rooms = P.rooms.filter(function (r) { return state.counts[r.id] > 0; }).map(function (r) {
      var names = r.items.filter(function (it) { return state.items[r.id + ":" + it.id]; }).map(function (it) { return it.name; });
      if (!names.length) return null;
      var head = r.perUnit && state.counts[r.id] > 1 ? r.name + " (x" + state.counts[r.id] + ")" : r.name;
      return head + ": " + names.join(", ");
    }).filter(Boolean);
    var lines = q.service === "thietke" ? [
      "[Báo giá online] Khách cần CHỈ THIẾT KẾ. " + q.type.name + " " + q.area + " m².",
      "Phong cách: " + (q.style ? q.style.name : "chưa chọn, cần tư vấn") + ".",
      "Phí thiết kế tool tính: " + rangeText(q) + "."
    ] : [
      "[Báo giá online] Khách cần " + getService().label.toUpperCase() + ". " + q.type.name + " " + q.area + " m², gói " + q.tier.name + ".",
      "Phong cách: " + (q.style ? q.style.name : "chưa chọn, cần tư vấn") + ".",
      "Khoảng giá tool tính: " + fmt(q.low) + " đến " + fmt(q.high) + " (nội thất " + fmt(q.noiThat) + ", phần thô " + fmt(q.tho) + ").",
      "Phần thô: " + thoText + ".",
      "Nội thất: " + rooms.join("; ") + "."
    ];
    if (lead.place) lines.push("Khu vực hoặc dự án: " + lead.place + ".");
    return lines.join("\n");
  }

  function setField(form, num, value) {
    var f = form.querySelector('[name="wpforms[fields][' + num + ']"]');
    if (!f) return false;
    f.value = value;
    ["input", "change"].forEach(function (t) { f.dispatchEvent(new Event(t, { bubbles: true })); });
    return true;
  }

  // Trả về true nếu tìm thấy form WPForms trên trang và đã bấm gửi
  function submitViaWpforms(lead, message, onOk, onFail) {
    var W = P.wpforms;
    if (!W || !W.formId) return false;
    var form = document.getElementById("wpforms-form-" + W.formId);
    if (!form) return false;
    var F = W.fields;
    setField(form, F.name, lead.name);
    setField(form, F.phone, lead.phone);
    if (F.email != null) setField(form, F.email, lead.email);
    if (F.message != null) setField(form, F.message, message);
    if (F.service != null) setField(form, F.service, getService().wp);   // Thiết kế nội thất hoặc Thi công nội thất

    var done = false, timer;
    var finish = function (ok) { if (done) return; done = true; clearTimeout(timer); (ok ? onOk : onFail)(); };
    if (window.jQuery) {
      window.jQuery(form).one("wpformsAjaxSubmitSuccess", function () { finish(true); });
      window.jQuery(form).one("wpformsAjaxSubmitFailed wpformsAjaxSubmitError", function () { finish(false); });
    }
    timer = setTimeout(function () { finish(false); }, 15000);
    var btn = form.querySelector('button[type="submit"], input[type="submit"], .wpforms-submit');
    if (!btn) { clearTimeout(timer); return false; }
    btn.click();
    return true;
  }

  $("leadForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, le = $("leadError"), btn = $("leadBtn");
    var lead = {
      name: f.fqname.value.trim(),
      phone: f.fqphone.value.replace(/[\s.\-]/g, ""),
      email: f.fqemail.value.trim(),
      place: f.fqplace.value.trim()
    };
    var W = P.wpforms, needEmail = W && W.fields.email != null && W.emailRequired;
    if (!lead.name) { le.textContent = "Bạn nhập giúp họ tên nhé."; le.hidden = false; return; }
    if (!/^(0|\+84)\d{9}$/.test(lead.phone)) { le.textContent = "Số điện thoại chưa đúng, bạn kiểm tra lại nhé."; le.hidden = false; return; }
    if (needEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) { le.textContent = "Email chưa đúng, bạn kiểm tra lại nhé."; le.hidden = false; return; }
    le.hidden = true;

    var q = state.quote, message = buildMessage(q, lead);
    var thanks = function () {
      $("leadForm").hidden = true; $("thanks").hidden = false;
      var t = $("thanks");
      if (P.preview) {
        t.querySelector("h3").textContent = "Đây là bản xem thử";
        t.querySelector("p").textContent = "Thông tin bạn vừa nhập chưa được gửi đến FHome. Khi tool chạy trên website, bước này sẽ gửi thông tin về form WPForms của FHome.";
      }
      $("sheet").textContent = sheetText();
      $("sheetNote").textContent = P.preview
        ? "Bản xem thử: bạn sao chép bảng này để gửi người thân. Khi chạy thật trên website FHome, bảng này có thể được gửi thẳng về email hoặc Zalo của khách."
        : "Bạn có thể sao chép bảng này để lưu lại hoặc gửi người thân.";
      var c = $("contactBtns"); c.innerHTML = "";
      if (P.zalo) c.innerHTML += '<a href="' + P.zalo + '" target="_blank" rel="noopener">Chat Zalo</a>';
      if (P.hotline) c.innerHTML += '<a href="tel:' + P.hotline + '">Gọi ' + (P.hotlineLabel || P.hotline) + "</a>";
    };
    var fail = function () {
      btn.disabled = false; btn.textContent = "Gửi thông tin nhận báo giá";
      le.textContent = "Chưa gửi được. Bạn thử lại hoặc gọi " + (P.hotlineLabel || P.hotline) + " để FHome hỗ trợ ngay nhé.";
      le.hidden = false;
    };

    btn.disabled = true; btn.textContent = "Đang gửi...";
    if (submitViaWpforms(lead, message, thanks, fail)) return;

    // Không có form WPForms trên trang (ví dụ đang mở thử file trên máy): lưu tạm trong trình duyệt
    var payload = { time: new Date().toISOString(), name: lead.name, phone: lead.phone, email: lead.email, message: message };
    try { var k = "fhome_leads", a = JSON.parse(localStorage.getItem(k) || "[]"); a.push(payload); localStorage.setItem(k, JSON.stringify(a)); } catch (x) {}
    console.log("[FHome báo giá] Không thấy form WPForms trên trang nên chưa gửi đi đâu. Dữ liệu:", payload);
    thanks();
  });

  render();
})();
