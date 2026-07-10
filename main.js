const CA = "0x98555aaaf50d90628c4d56409fc8a0d02c1bb642";

const nav = document.getElementById("nav");

function onScroll() {
  nav.classList.toggle("scrolled", window.scrollY > 40);
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const revealEls = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}

async function copyCA(btn) {
  const label = btn.querySelector("[data-copy-label]") || btn;
  try {
    await navigator.clipboard.writeText(CA);
    const prev = label.textContent;
    label.textContent = "copied";
    setTimeout(() => {
      label.textContent = prev === "copied" ? "copy" : prev;
    }, 1400);
  } catch {
    label.textContent = "failed";
  }
}

document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", () => copyCA(btn));
});

function fmtUsd(n) {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  if (n >= 1) return "$" + n.toFixed(2);
  return "$" + n.toPrecision(3);
}

function setText(sel, value) {
  document.querySelectorAll(sel).forEach((el) => {
    el.textContent = value;
  });
}

async function loadQuote() {
  try {
    const res = await fetch(
      "https://api.dexscreener.com/latest/dex/tokens/" + CA
    );
    if (!res.ok) return;
    const data = await res.json();
    const pair =
      (data.pairs || []).find((p) => /robinhood/i.test(p.chainId || "")) ||
      (data.pairs || [])[0];
    if (!pair) return;
    const price = Number(pair.priceUsd);
    const fdv = Number(pair.fdv);
    const liq = Number(pair.liquidity?.usd);
    setText("[data-price]", price ? fmtUsd(price) : "—");
    setText("[data-fdv]", fdv ? fmtUsd(fdv) : "—");
    setText("[data-liq]", liq ? fmtUsd(liq) : "—");
  } catch {
    /* keep placeholders */
  }
}

loadQuote();
