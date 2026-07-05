import type { ProjectSpec, ValidationReport } from "./types";

// Renders a fully self-contained HTML preview of the generated startup —
// what the downloaded app actually looks like — for the builder's live
// iframe. Inline styles + inline JS, no external requests.

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generatePreviewHtml(
  spec: ProjectSpec,
  report: ValidationReport
): string {
  const accent = spec.accentColor;
  const lp = report.landingPage;
  const fieldsHtml = spec.inputFields
    .map((f) =>
      f.type === "textarea"
        ? `<label>${esc(f.label)}<textarea id="f_${f.id}" placeholder="${esc(f.placeholder)}"></textarea></label>`
        : `<label>${esc(f.label)}<input id="f_${f.id}" placeholder="${esc(f.placeholder)}" /></label>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(spec.appName)} — ${esc(spec.tagline)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #07080d; color: #eef0f6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .aurora { position: fixed; inset: 0; z-index: -1; overflow: hidden; }
  .aurora div { position: absolute; border-radius: 50%; filter: blur(80px); opacity: .25; }
  nav {
    position: sticky; top: 0; z-index: 10; display: flex; align-items: center;
    justify-content: space-between; padding: 14px 22px; margin: 12px;
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
    border-radius: 18px; backdrop-filter: blur(20px);
  }
  nav b { letter-spacing: -.02em; }
  .btn {
    display: inline-block; background: ${accent}; color: #fff; border: 0;
    padding: 12px 26px; border-radius: 999px; font-weight: 600; font-size: 14px;
    cursor: pointer; text-decoration: none; transition: filter .2s, transform .2s;
  }
  .btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
  .btn.sm { padding: 8px 16px; font-size: 13px; }
  .ghost {
    display: inline-block; color: #eef0f6; border: 1px solid rgba(255,255,255,.15);
    padding: 12px 26px; border-radius: 999px; font-weight: 500; font-size: 14px;
    cursor: pointer; text-decoration: none; background: transparent;
  }
  section { max-width: 860px; margin: 0 auto; padding: 56px 22px; }
  .hero { text-align: center; padding-top: 72px; }
  .hero .pill {
    display: inline-block; font-size: 12px; font-weight: 600; color: ${accent};
    border: 1px solid rgba(255,255,255,.12); padding: 5px 14px; border-radius: 999px;
  }
  h1 { font-size: clamp(30px, 5.6vw, 52px); letter-spacing: -.03em; line-height: 1.08; margin: 18px auto 0; max-width: 640px; }
  .sub { color: #9aa1b5; font-size: 17px; max-width: 480px; margin: 16px auto 0; line-height: 1.55; }
  .cta { margin-top: 28px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 26px; text-align: left; }
  .card {
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
    border-radius: 18px; padding: 18px; font-size: 14px; line-height: 1.5;
  }
  .card b { color: ${accent}; }
  h2 { font-size: 28px; letter-spacing: -.02em; text-align: center; }
  .app {
    background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
    border-radius: 22px; padding: 26px; margin-top: 26px;
  }
  label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 14px; }
  input, textarea {
    width: 100%; margin-top: 6px; background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.12); border-radius: 12px; color: #eef0f6;
    padding: 11px 14px; font-size: 14px; font-family: inherit; outline: none;
  }
  input:focus, textarea:focus { border-color: ${accent}; }
  textarea { min-height: 70px; resize: vertical; }
  #result { display: none; margin-top: 20px; border-top: 1px solid rgba(255,255,255,.09); padding-top: 18px; }
  #result h4 { color: ${accent}; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; margin: 14px 0 6px; }
  #result li { font-size: 14px; color: #c9cede; margin-left: 18px; line-height: 1.6; }
  .price-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-top: 26px; }
  .price { text-align: left; }
  .price .amount { font-size: 34px; font-weight: 700; margin-top: 6px; }
  .price ul { list-style: none; margin-top: 14px; }
  .price li { font-size: 13.5px; color: #9aa1b5; margin-top: 7px; }
  .price li::before { content: "✓ "; color: ${accent}; }
  .pro { border-color: ${accent}55; }
  footer { text-align: center; color: #9aa1b5; font-size: 13px; padding: 30px 0 44px; border-top: 1px solid rgba(255,255,255,.08); margin-top: 30px; }
  .loading { display: inline-block; opacity: .7; }
</style>
</head>
<body>
<div class="aurora">
  <div style="width:60vw;height:60vw;top:-20vw;left:-15vw;background:${accent}"></div>
  <div style="width:45vw;height:45vw;bottom:-15vw;right:-10vw;background:${accent}"></div>
</div>

<nav>
  <b>${esc(spec.appName)}</b>
  <a class="btn sm" href="#app">Open app</a>
</nav>

<section class="hero">
  <span class="pill">${esc(lp.socialProof)}</span>
  <h1>${esc(lp.headline)}</h1>
  <p class="sub">${esc(lp.subheadline)}</p>
  <div class="cta">
    <a class="btn" href="#app">${esc(lp.cta)}</a>
    <a class="ghost" href="#pricing">See pricing</a>
  </div>
  <div class="cards">
    ${lp.bullets.map((b) => `<div class="card"><b>✓</b> ${esc(b)}</div>`).join("\n    ")}
  </div>
</section>

<section id="app">
  <h2>Try ${esc(spec.appName)}</h2>
  <div class="app">
    ${fieldsHtml}
    <button class="btn" style="width:100%" onclick="generate(this)">Generate ${esc(spec.resultNoun)}</button>
    <div id="result"></div>
  </div>
</section>

<section id="pricing">
  <h2>Pricing</h2>
  <div class="price-grid">
    <div class="card price">
      <b style="color:#eef0f6">Free</b>
      <div class="amount">$0</div>
      <ul><li>3 ${esc(spec.resultNoun)}s / month</li><li>Core features</li><li>Saved history</li></ul>
    </div>
    <div class="card price pro">
      <b style="color:#eef0f6">Pro</b>
      <div class="amount">$${report.pricing.monthly}<span style="font-size:14px;color:#9aa1b5">/mo</span></div>
      <ul><li>Unlimited ${esc(spec.resultNoun)}s</li><li>Priority processing</li><li>Export &amp; sharing</li></ul>
    </div>
  </div>
</section>

<footer>© ${esc(spec.appName)} — ${esc(spec.tagline)}</footer>

<script>
  var SECTIONS = ${JSON.stringify(spec.resultSections)};
  var NOUN = ${JSON.stringify(spec.resultNoun)};
  function generate(btn) {
    var input = document.querySelector("input, textarea");
    var val = input && input.value ? input.value : "your input";
    btn.disabled = true;
    btn.innerHTML = '<span class="loading">Generating…</span>';
    setTimeout(function () {
      var el = document.getElementById("result");
      el.style.display = "block";
      el.innerHTML = SECTIONS.map(function (s) {
        return "<h4>" + s + "</h4><ul>" +
          "<li>Preview " + NOUN + " output for: " + val.slice(0, 60) + "</li>" +
          "<li>In the downloaded app this is generated by the real AI.</li></ul>";
      }).join("");
      btn.disabled = false;
      btn.textContent = "Generate " + NOUN;
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 1400);
  }
</script>
</body>
</html>`;
}
