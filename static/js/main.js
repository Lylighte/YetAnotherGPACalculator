(function () {
  "use strict";

  const ALGORITHMS = {
    s4:   { name: "标准 4.0",   threshold: [90, 80, 70, 60], letter: ["A", "B", "C", "D"], gpa: [4.0, 3.0, 2.0, 1.0] },
    s41:  { name: "改进 4.0(1)", threshold: [85, 70, 60],     letter: ["A", "B", "C"],      gpa: [4.0, 3.0, 2.0] },
    s42:  { name: "改进 4.0(2)", threshold: [85, 75, 60],     letter: ["A", "B", "C"],      gpa: [4.0, 3.0, 2.0] },
    p4:   { name: "北大 4.0(公式)", nju: true, desc: "官方固定公式：课程绩点 = 4 − 3 × (100 − X)² / 1600（60≤X≤100），100 分→4.00，60 分→1.00，60 以下→0；非百分制课程不计入。北大校内 2025 级起已停用绩点，此为改革前的官方公式。", threshold: [100, 90, 80, 70, 60], letter: ["", "", "", "", ""], gpa: [4.0, 3.81, 3.25, 2.31, 1.0] },
    c4:   { name: "加拿大 4.3",  threshold: [90, 85, 80, 75, 70, 65, 60], letter: ["A+", "A", "A-", "B+", "B", "B-", "C+"], gpa: [4.3, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3] },
    sjt4: { name: "上海交大 4.3", threshold: [95, 90, 85, 80, 75, 70, 67, 65, 62, 60], letter: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D"], gpa: [4.3, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.0] },
    cs4:  { name: "中科大 4.3",  threshold: [95, 90, 85, 82, 78, 75, 72, 68, 65, 64, 61, 60], letter: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-"], gpa: [4.3, 4.0, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.5, 1.3, 1.0] },
    zju5:  { name: "浙大 五分制", desc: "浙大校内五分制 15 档细查表；2022 级起出国成绩单改用 4.3 制。", threshold: [95, 92, 89, 86, 83, 80, 77, 74, 71, 68, 65, 62, 60], letter: ["", "", "", "", "", "", "", "", "", "", "", "", ""], gpa: [5.0, 4.8, 4.5, 4.2, 3.9, 3.6, 3.3, 3.0, 2.7, 2.4, 2.1, 1.8, 1.5] },
    zju43: { name: "浙大 4.3(出国)", desc: "2022 级起浙大出国成绩单折算办法。", threshold: [95, 92, 89, 86, 83, 80, 77, 74, 71, 68, 65, 62, 60], letter: ["", "", "", "", "", "", "", "", "", "", "", "", ""], gpa: [4.3, 4.2, 4.1, 4.0, 3.9, 3.6, 3.3, 3.0, 2.7, 2.4, 2.1, 1.8, 1.5] },
    nju5:  { name: "南大 5.0(公式)", nju: true, desc: "GPA = Σ(百分制分 ÷ 20 × 学分) ÷ Σ学分，连续映射无查表；五级制折算 优95/良85/中75/及格65。右表为示例值。", threshold: [100, 90, 80, 70, 60], letter: ["", "", "", "", ""], gpa: [5.0, 4.5, 4.0, 3.5, 3.0] }
  };

  // 各算法的标注与权威来源（card 标题即链接）
  const ALGO_META = {
    s4:   { tag: "通用惯例", note: "非院校现行制度，为留学圈通用的简化档位。" },
    s41:  { tag: "通用惯例", note: "非院校现行制度，为留学圈通用的简化档位。" },
    s42:  { tag: "通用惯例", note: "非院校现行制度，为留学圈通用的简化档位。" },
    c4:   { tag: "通用惯例", note: "非院校现行制度，申请加拿大方向的通用档位。" },
    p4:   { tag: "官方(已废止)", note: "2019 版《成绩评定和记载办法》第十三条官方公式；北大校内自 2022 试点、2025 级起不再使用绩点，公式仅供对外换算参考。", url: "https://dean.pku.edu.cn/web/rules_info.php?id=173" },
    sjt4: { tag: "官方现行", url: "https://jwc.sjtu.edu.cn/info/1482/12870.htm" },
    cs4:  { tag: "官方现行", url: "https://www.teach.ustc.edu.cn/wp-content/uploads/2015/08/学习指南2015-05-教学管理文件.pdf" },
    zju5:  { tag: "官方现行", url: "https://meetc.zju.edu.cn/2024/0306/c79045a2885825/page.htm" },
    zju43: { tag: "官方现行", url: "https://meetc.zju.edu.cn/2024/0306/c79045a2885825/page.htm" },
    nju5:  { tag: "官方现行", url: "https://jw.nju.edu.cn/_upload/article/files/7b/8f/6af8c2b749968eca4c4e18d09417/6df71d00-dc3f-4f31-9b05-65c2e1300e63.pdf" }
  };

  const ELEMENTS = [
    { label: "课程名", key: "name" },
    { label: "百分制", key: "hund" },
    { label: "等级制", key: "lett" },
    { label: "4分制", key: "four" },
    { label: "学分", key: "cred" },
    { label: "学时", key: "hour" }
  ];

  const ALGORITHM_ORDER = ["cs4", "p4", "sjt4", "zju5", "zju43", "nju5", "s4", "s41", "s42", "c4"];

  function renderAlgorithmTables() {
    const carousel = document.getElementById("alg-carousel");
    carousel.innerHTML = "";
    carousel.className = "carousel";

    const viewport = document.createElement("div");
    viewport.className = "car-viewport";
    const track = document.createElement("div");
    track.className = "car-track";
    viewport.appendChild(track);
    carousel.appendChild(viewport);

    const nav = document.createElement("div");
    nav.className = "car-nav";
    const prev = document.createElement("button");
    prev.className = "car-arrow";
    prev.setAttribute("aria-label", "上一个算法");
    prev.textContent = "\u2039";
    const dots = document.createElement("div");
    dots.className = "car-dots";
    const next = document.createElement("button");
    next.className = "car-arrow";
    next.setAttribute("aria-label", "下一个算法");
    next.textContent = "\u203a";
    nav.appendChild(prev);
    nav.appendChild(dots);
    nav.appendChild(next);
    carousel.appendChild(nav);

    let current = 0;
    const cards = ALGORITHM_ORDER.map(function (key) {
      const a = ALGORITHMS[key];
      const meta = ALGO_META[key] || {};
      const card = document.createElement("div");
      card.className = "card alg-card";
      const h3 = document.createElement("h3");
      const h3Text = document.createElement("span");
      h3Text.textContent = a.name;
      h3.appendChild(h3Text);
      if (meta.tag) {
        const tag = document.createElement("span");
        tag.className = "tag " + (meta.tag === "官方现行" ? "tag-official" : "tag-conv");
        tag.textContent = meta.tag;
        h3.appendChild(tag);
      }
      if (meta.url) {
        const link = document.createElement("a");
        link.className = "src";
        link.href = meta.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "权威来源";
        h3.appendChild(link);
      }
      card.appendChild(h3);
      if (meta.note || a.desc) {
        const p = document.createElement("p");
        p.className = "desc";
        p.textContent = [a.desc, meta.note].filter(Boolean).join(" ");
        card.appendChild(p);
      }
      const table = document.createElement("table");
      let html = "<tr><th>百分制成绩</th><th>等级</th><th>绩点</th></tr>";
      for (let i = 0; i < a.threshold.length; i++) {
        const high = i === 0 ? 100 : a.threshold[i - 1] - 1;
        if (a.nju) {
          // 南大公式只起到示例首行
          html += `<tr><td>${high}</td><td>—</td><td>${a.gpa[i]}</td></tr>`;
        } else {
          html += `<tr><td>${high}～${a.threshold[i]}</td><td>${a.letter[i] || "—"}</td><td>${a.gpa[i]}</td></tr>`;
        }
      }
      if (!a.skipF) html += "<tr><td>59～0</td><td>F</td><td>0</td></tr>";
      table.innerHTML = html;
      card.appendChild(table);
      track.appendChild(card);
      return card;
    });

    const dotEls = ALGORITHM_ORDER.map(function (key, i) {
      const dot = document.createElement("button");
      dot.className = "car-dot";
      dot.textContent = ALGORITHMS[key].name;
      dot.addEventListener("click", function () { go(i); });
      dots.appendChild(dot);
      return dot;
    });

    function go(i) {
      current = (i + cards.length) % cards.length;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      cards.forEach(function (card, j) { card.classList.toggle("active", j === current); });
      dotEls.forEach(function (dot, j) { dot.classList.toggle("active", j === current); });
    }

    prev.addEventListener("click", function () { go(current - 1); });
    next.addEventListener("click", function () { go(current + 1); });

    go(0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const panels = { alg: document.getElementById("panel-alg"), reform: document.getElementById("panel-reform") };
    tabBtns.forEach(btn => btn.addEventListener("click", function () {
      const target = this.id.replace("tab-", "");
      tabBtns.forEach(b => b.classList.toggle("active", b === this));
      for (const key in panels) panels[key].classList.toggle("hidden", key !== target);
    }));

    renderAlgorithmTables();
  });


})();
