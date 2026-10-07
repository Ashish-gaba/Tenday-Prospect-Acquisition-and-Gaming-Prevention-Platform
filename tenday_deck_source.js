const pptxgen = require("pptxgenjs");

const INK   = "1C1E2B";
const INK2  = "2A2D3E";
const WHITE = "FFFFFF";
const PAPER = "FAF9F6";
const GOLD  = "C8952F";
const GOLDL = "E8D5A8";
const LOSS  = "A8322D";
const GAIN  = "2E6B4F";
const MUTED = "6E6B63";
const RULE  = "DCD8CC";

const SERIF = "Cambria";
const SANS  = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";           // 13.3 x 7.5
pres.author = "Tenday";
pres.title  = "Acquisition Value Review";

const W = 13.3, H = 7.5, M = 0.85;

/* ---------- helpers ---------- */

function marker(s, x, y) {                       // the repeating motif
  s.addShape(pres.ShapeType.rect, {
    x: x, y: y, w: 0.12, h: 0.12, fill: { color: GOLD }, rotate: 45,
  });
}

function titleSlide(s, kicker, title, sub) {
  s.background = { color: INK };
  s.addText(kicker, {
    x: M, y: 1.45, w: 8, h: 0.3, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 13, color: GOLD, charSpacing: 1.5,
  });
  s.addText(title, {
    x: M, y: 1.95, w: 10.4, h: 2.1, isTextBox: true, margin: 0,
    fontFace: SERIF, fontSize: 42, bold: true, color: WHITE, lineSpacing: 48,
  });
  if (sub) {
    s.addText(sub, {
      x: M, y: 4.3, w: 8.6, h: 1.1, isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 15, color: "B9B5AC", lineSpacing: 24,
    });
  }
}

function head(s, kicker, title) {
  s.background = { color: WHITE };
  marker(s, M, 0.62);
  s.addText(kicker, {
    x: M + 0.28, y: 0.5, w: 8, h: 0.32, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 12, color: GOLD, charSpacing: 1.2,
  });
  s.addText(title, {
    x: M, y: 0.92, w: 11.4, h: 0.85, isTextBox: true, margin: 0,
    fontFace: SERIF, fontSize: 32, bold: true, color: INK,
  });
}

function stat(s, x, y, w, value, label, sub, color) {
  s.addText(value, {
    x: x, y: y, w: w, h: 0.85, isTextBox: true, margin: 0,
    fontFace: SERIF, fontSize: 40, bold: true, color: color || INK,
  });
  s.addText(label, {
    x: x, y: y + 0.85, w: w, h: 0.32, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 13, bold: true, color: INK,
  });
  if (sub) {
    s.addText(sub, {
      x: x, y: y + 1.16, w: w, h: 0.5, isTextBox: true, margin: 0,
      fontFace: SANS, fontSize: 11, color: MUTED, lineSpacing: 15,
    });
  }
}

function card(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.rect, {
    x: x, y: y, w: w, h: h,
    fill: { color: fill || PAPER }, line: { color: RULE, width: 0.75 },
  });
}

function note(s, x, y, w, text, tone) {
  const bg = tone === "warn" ? "FBF1F0" : PAPER;
  const bar = tone === "warn" ? LOSS : GOLD;
  const h = 1.0;
  s.addShape(pres.ShapeType.rect, { x: x, y: y, w: w, h: h, fill: { color: bg } });
  s.addShape(pres.ShapeType.rect, { x: x, y: y, w: 0.045, h: h, fill: { color: bar } });
  s.addText(text, {
    x: x + 0.25, y: y + 0.12, w: w - 0.45, h: h - 0.24, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 12.5, color: INK2, lineSpacing: 18,
  });
}

/* ================= 1. TITLE ================= */
let s = pres.addSlide();
titleSlide(s, "ACQUISITION VALUE REVIEW",
  "We are paying to acquire customers who never pay us back",
  "A review of ₹51 crore of welcome-bonus spend across 200,000 cardholders and twelve months of activity.");
s.addText("Card Acquisition  ·  Analytics", {
  x: M, y: 6.5, w: 6, h: 0.3, isTextBox: true, margin: 0,
  fontFace: SANS, fontSize: 11, color: MUTED,
});
s.addNotes("Framing: this is not a fraud problem. It is an offer-design problem. " +
  "Everything that follows leads to one recommendation — move the control from the " +
  "application form into the first thirty days.");

/* ================= 2. THE BET ================= */
s = pres.addSlide();
head(s, "THE MECHANIC", "Every new cardholder starts as a loss");

s.addText([
  { text: "We say: ", options: { color: INK2 } },
  { text: "spend ₹50,000 in your first months and we will give you ₹5,000 back.",
    options: { bold: true, color: INK } },
], { x: M, y: 2.05, w: 6.1, h: 0.75, isTextBox: true, margin: 0,
     fontFace: SANS, fontSize: 15, lineSpacing: 23 });

s.addText("Before a single rupee is spent on the card, roughly ₹6,500 has already left " +
  "the business — the bonus itself, plus the cost of reaching that person.\n\n" +
  "We earn it back slowly, through the small fee collected on every purchase they make " +
  "over the years that follow.\n\n" +
  "The bet works for most cardholders. For one group it never does.", {
  x: M, y: 3.0, w: 6.1, h: 2.6, isTextBox: true, margin: 0,
  fontFace: SANS, fontSize: 14, color: INK2, lineSpacing: 22,
});

const bx = 7.6, bw = 4.85;
card(s, bx, 2.05, bw, 1.55);
s.addText("What we pay out", { x: bx + 0.3, y: 2.2, w: 3, h: 0.3, isTextBox: true,
  margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: INK });
s.addText([
  { text: "Welcome bonus", options: { color: INK2 } },
  { text: "\t₹5,000", options: { color: INK, bold: true } },
], { x: bx + 0.3, y: 2.6, w: bw - 0.6, h: 0.3, isTextBox: true, margin: 0,
     fontFace: SANS, fontSize: 13 });
s.addText([
  { text: "Cost to reach them", options: { color: INK2 } },
  { text: "\t₹1,500", options: { color: INK, bold: true } },
], { x: bx + 0.3, y: 2.95, w: bw - 0.6, h: 0.3, isTextBox: true, margin: 0,
     fontFace: SANS, fontSize: 13 });
s.addShape(pres.ShapeType.line, { x: bx + 0.3, y: 3.28, w: bw - 0.6, h: 0,
  line: { color: RULE, width: 1 } });

card(s, bx, 3.8, bw, 1.85, "FBF1F0");
s.addText("What a bonus-seeker returns", { x: bx + 0.3, y: 3.98, w: 4, h: 0.3,
  isTextBox: true, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: INK });
s.addText("−₹2,676", { x: bx + 0.3, y: 4.3, w: 3, h: 0.75, isTextBox: true, margin: 0,
  fontFace: SERIF, fontSize: 34, bold: true, color: LOSS });
s.addText("average, per customer, over twelve months", { x: bx + 0.3, y: 5.05, w: 4.2,
  h: 0.3, isTextBox: true, margin: 0, fontFace: SANS, fontSize: 11, color: MUTED });

s.addNotes("The point of this slide is that acquisition is a loan we make to every " +
  "customer. Most repay it. The question is which ones do not, and whether we can " +
  "tell in time.");

/* ================= 3. THE NUMBERS ================= */
s = pres.addSlide();
head(s, "SCALE OF THE ISSUE", "One customer in seven takes a third of the bonus budget");

stat(s, M, 2.1, 2.7, "200,000", "Cardholders reviewed", "twelve months of activity");
stat(s, M + 2.95, 2.1, 2.7, "₹51 cr", "Spent on welcome bonuses", "across eight campaigns");
stat(s, M + 5.9, 2.1, 2.8, "₹17.7 cr", "Claimed by bonus-seekers",
     "35% of all bonus spend, from 14% of customers", LOSS);
stat(s, M + 8.85, 2.1, 2.7, "−₹7.5 cr", "Value they returned",
     "against ₹26.7 cr from our best customers", LOSS);

s.addShape(pres.ShapeType.line, { x: M, y: 4.25, w: 11.6, h: 0,
  line: { color: RULE, width: 1 } });

s.addText("What a bonus-seeker looks like", {
  x: M, y: 4.5, w: 6, h: 0.35, isTextBox: true, margin: 0,
  fontFace: SERIF, fontSize: 18, bold: true, color: INK,
});

const rows = [
  ["Reaches the ₹50,000 target in", "10 days", "others take 96 to 317"],
  ["Claims the bonus within", "3 days", "others take about 46"],
  ["Share of spend on near-cash categories", "48%", "others sit at 23%"],
  ["Then stops using the card for", "7 months", "no further activity"],
];
rows.forEach((r, i) => {
  const y = 5.05 + i * 0.42;
  s.addText(r[0], { x: M, y: y, w: 4.6, h: 0.32, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 13, color: INK2 });
  s.addText(r[1], { x: M + 4.7, y: y, w: 1.3, h: 0.32, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 13, bold: true, color: LOSS });
  s.addText(r[2], { x: M + 6.1, y: y, w: 5, h: 0.32, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 12, color: MUTED, italic: true });
});

s.addNotes("Near-cash means gift cards, money transfers and wholesale clubs — the " +
  "quickest way to hit a spending target without really spending. The speed measure " +
  "is the one that matters most; everything else follows from it.");

/* ================= 4. TWO CUSTOMERS ================= */
s = pres.addSlide();
head(s, "THE DISTINCTION", "Two cardholders, same offer, same signup day");

const cw = 5.55;
card(s, M, 2.0, cw, 3.9, "FBF1F0");
s.addText("The bonus-seeker", { x: M + 0.35, y: 2.22, w: 4, h: 0.35, isTextBox: true,
  margin: 0, fontFace: SERIF, fontSize: 19, bold: true, color: LOSS });
[
  ["Day 10", "Crosses ₹50,000 — mostly gift cards and transfers"],
  ["Day 13", "Claims the ₹5,000. She was waiting for it"],
  ["Day 40", "Last transaction on the card"],
  ["Day 365", "Still nothing. We are down ₹2,676"],
].forEach((r, i) => {
  const y = 2.75 + i * 0.76;
  s.addText(r[0], { x: M + 0.35, y: y, w: 1.0, h: 0.28, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 12, bold: true, color: LOSS });
  s.addText(r[1], { x: M + 1.4, y: y - 0.14, w: 3.9, h: 0.62, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 12.5, color: INK2, lineSpacing: 17 });
});

card(s, M + cw + 0.5, 2.0, cw, 3.9, "F2F7F4");
s.addText("The real customer", { x: M + cw + 0.85, y: 2.22, w: 4, h: 0.35,
  isTextBox: true, margin: 0, fontFace: SERIF, fontSize: 19, bold: true, color: GAIN });
[
  ["Day 10", "About ₹2,000 spent. Groceries, fuel, a restaurant"],
  ["Day 154", "Finally crosses ₹50,000, without trying to"],
  ["Day 200", "Claims the bonus, six weeks later. No hurry"],
  ["Day 365", "Still spending. We are up ₹3,154"],
].forEach((r, i) => {
  const y = 2.75 + i * 0.76;
  s.addText(r[0], { x: M + cw + 0.85, y: y, w: 1.0, h: 0.28, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 12, bold: true, color: GAIN });
  s.addText(r[1], { x: M + cw + 1.9, y: y - 0.14, w: 3.9, h: 0.62, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 12.5, color: INK2, lineSpacing: 17 });
});

note(s, M, 6.1, 11.6,
  "On signup day these two were indistinguishable. By day thirty they are not. " +
  "That gap is the whole opportunity.");

s.addNotes("Resist the instinct to call the first customer a fraudster. She did " +
  "nothing against the terms. We designed an offer she could satisfy in ten days.");

/* ================= 5. SIX GROUPS ================= */
s = pres.addSlide();
head(s, "WHO WE ARE PAYING FOR", "Six kinds of cardholder");

s.addTable([
  [
    { text: "Group", options: { bold: true, color: MUTED, fontSize: 11, align: "left" } },
    { text: "Customers", options: { bold: true, color: MUTED, fontSize: 11, align: "right" } },
    { text: "Days to hit target", options: { bold: true, color: MUTED, fontSize: 11, align: "right" } },
    { text: "Near-cash spend", options: { bold: true, color: MUTED, fontSize: 11, align: "right" } },
    { text: "Value each", options: { bold: true, color: MUTED, fontSize: 11, align: "right" } },
    { text: "Value total", options: { bold: true, color: MUTED, fontSize: 11, align: "right" } },
  ],
  [{ text: "Our best customers", options: { align: "left" } }, "84,517", "154", "23%",
    { text: "+\u20B93,154", options: { color: GAIN, bold: true } },
    { text: "+\u20B926.7 cr", options: { color: GAIN, bold: true } }],
  [{ text: "Small but genuine", options: { align: "left" } }, "45,120", "261", "23%", "\u2212\u20B9709", "\u2212\u20B93.2 cr"],
  [{ text: "Lost interest early", options: { align: "left" } }, "27,718", "96", "23%", "\u2212\u20B9708", "\u2212\u20B92.0 cr"],
  [{ text: "Barely used the card", options: { align: "left" } }, "9,734", "never", "23%", "\u2212\u20B91,133", "\u2212\u20B91.1 cr"],
  [{ text: "Borderline", options: { align: "left" } }, "5,040", "24", "26%", "\u2212\u20B91,091", "\u2212\u20B90.6 cr"],
  [{ text: "Bonus-seekers", options: { bold: true, align: "left" } },
   { text: "27,871", options: { bold: true } },
   { text: "10", options: { bold: true, color: LOSS } },
   { text: "48%", options: { bold: true, color: LOSS } },
   { text: "\u2212\u20B92,676", options: { color: LOSS, bold: true } },
   { text: "\u2212\u20B97.5 cr", options: { color: LOSS, bold: true } }],
], {
  x: M, y: 2.05, w: 11.6, colW: [3.3, 1.6, 1.9, 1.7, 1.55, 1.55],
  rowH: 0.42, fontFace: SANS, fontSize: 12.5, color: INK2,
  border: { type: "solid", color: RULE, pt: 0.75 },
  align: "right", valign: "middle",
  fill: { color: WHITE },
});

note(s, M, 5.55, 11.6,
  "Two groups decide the outcome. Our best customers are 42% of the book and generate " +
  "essentially all of the profit. Bonus-seekers are 14% and take 35% of the bonus budget. " +
  "Everything in between roughly breaks even.");

s.addNotes("Note the fourth column. Every group sits at 23% near-cash spending except " +
  "bonus-seekers at 48%. That single measure separates them.");

/* ================= 6. OFFER VS CHANNEL ================= */
s = pres.addSlide();
head(s, "FINDING ONE", "The offer matters more than the channel");

s.addChart(pres.ChartType.bar, [
  { name: "Average value per customer",
    labels: ["Lean offer\n₹2,000 on ₹45,000", "Mid offer\n₹5,000 on ₹60,000",
             "Rich offer\n₹12,000 on ₹150,000"],
    values: [2940, 858, -1749] },
], {
  x: M, y: 2.05, w: 6.4, h: 3.5, barDir: "col",
  chartColors: [GAIN, GOLD, LOSS],
  showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12,
  dataLabelFontFace: SANS, dataLabelColor: INK,
  showLegend: false, showTitle: false,
  catAxisLabelColor: INK2, catAxisLabelFontSize: 11, catAxisLabelFontFace: SANS,
  valAxisLabelColor: MUTED, valAxisLabelFontSize: 10,
  valGridLine: { color: RULE, size: 0.75 }, catGridLine: { style: "none" },
  barGapWidthPct: 60,
});

s.addText("What we expected", { x: 7.7, y: 2.05, w: 4.8, h: 0.32, isTextBox: true,
  margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: MUTED });
s.addText("That some acquisition channels were sending us worse customers than others.",
  { x: 7.7, y: 2.4, w: 4.75, h: 0.6, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 13.5, color: INK2, lineSpacing: 19 });

s.addText("What we found", { x: 7.7, y: 3.25, w: 4.8, h: 0.32, isTextBox: true,
  margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: MUTED });
s.addText("Within any campaign, switching channel moves value by ₹231 to ₹559. " +
  "Switching campaign moves it by about ₹5,000 — roughly ten times as much.",
  { x: 7.7, y: 3.6, w: 4.75, h: 1.0, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 13.5, color: INK2, lineSpacing: 19 });

s.addText("The lean offer is profitable through every channel, including affiliate. " +
  "The rich offer loses money through every channel, including our own branches.",
  { x: 7.7, y: 4.75, w: 4.75, h: 0.85, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 13.5, color: INK2, lineSpacing: 19 });

note(s, M, 5.95, 11.6,
  "A larger bonus does not buy a better customer. It buys someone who will do precisely " +
  "enough to qualify and then stop. Restructure the offers before reallocating budget " +
  "between channels.", "warn");

s.addNotes("Return on acquisition spend is ₹2.90 per rupee on lean offers and ₹0.72 on " +
  "rich ones. The rich campaigns are not marginal; they are loss-making everywhere.");

/* ================= 7. TIMING ================= */
s = pres.addSlide();
head(s, "FINDING TWO", "We cannot screen for this. We can watch for it.");

s.addChart(pres.ChartType.bar, [
  { name: "Share of a customer's value we can explain",
    labels: ["What we know on\nsignup day", "Plus the first 30 days\nof spending"],
    values: [9, 66] },
], {
  x: M, y: 2.1, w: 5.6, h: 3.3, barDir: "col",
  chartColors: ["B7B2A5", GOLD],
  showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 13,
  dataLabelFontFace: SANS, dataLabelColor: INK, dataLabelFormatCode: '0"%"',
  showLegend: false, showTitle: false,
  catAxisLabelColor: INK2, catAxisLabelFontSize: 11, catAxisLabelFontFace: SANS,
  valAxisLabelColor: MUTED, valAxisLabelFontSize: 10, valAxisMaxVal: 80,
  valGridLine: { color: RULE, size: 0.75 }, catGridLine: { style: "none" },
  barGapWidthPct: 90,
});
s.addText("How much of a cardholder's eventual value we can explain", {
  x: M, y: 5.45, w: 5.6, h: 0.3, isTextBox: true, margin: 0,
  fontFace: SANS, fontSize: 11, color: MUTED, italic: true,
});

const rx = 6.95;
s.addText("Tightening approvals would not work", { x: rx, y: 2.1, w: 5.4, h: 0.35,
  isTextBox: true, margin: 0, fontFace: SERIF, fontSize: 17, bold: true, color: INK });
s.addText("Channel, campaign, age band, income band, region and credit limit together " +
  "sit barely above a coin flip at identifying who will game the offer. They explain " +
  "9% of eventual value. The other 91% is invisible on signup day.\n\n" +
  "A stricter screen built on these fields would decline good applicants at close to " +
  "the same rate as bad ones.", {
  x: rx, y: 2.55, w: 5.4, h: 1.85, isTextBox: true, margin: 0,
  fontFace: SANS, fontSize: 13.5, color: INK2, lineSpacing: 19 });

s.addText("One month changes everything", { x: rx, y: 4.55, w: 5.4, h: 0.35,
  isTextBox: true, margin: 0, fontFace: SERIF, fontSize: 17, bold: true, color: INK });
s.addText("Adding the first thirty days of spending lifts what we can explain to 66%, " +
  "and separates bonus-seekers almost completely. Thirty days is early — most of the " +
  "bonus liability has not been paid out yet.", {
  x: rx, y: 5.0, w: 5.4, h: 1.2, isTextBox: true, margin: 0,
  fontFace: SANS, fontSize: 13.5, color: INK2, lineSpacing: 19 });

s.addNotes("Both figures come from the same customers and the same method. The only " +
  "thing that changed is what the analysis was allowed to see. So the difference is " +
  "about information, not technique.");

/* ================= 8. RECOMMENDATIONS ================= */
s = pres.addSlide();
s.background = { color: INK };
marker(s, M, 0.62);
s.addText("WHAT WE RECOMMEND", { x: M + 0.28, y: 0.5, w: 8, h: 0.32, isTextBox: true,
  margin: 0, fontFace: SANS, fontSize: 12, color: GOLD, charSpacing: 1.2 });
s.addText("Move the control into the first thirty days", {
  x: M, y: 0.92, w: 11.4, h: 0.85, isTextBox: true, margin: 0,
  fontFace: SERIF, fontSize: 32, bold: true, color: WHITE });

const recs = [
  ["01", "Restructure the offers",
   "Replace lump-sum spending targets with sustained spend across three months. " +
   "A target that cannot be cleared in ten days cannot be gamed in ten days."],
  ["02", "Exclude near-cash categories",
   "Gift cards, money transfers and wholesale clubs should not count toward a " +
   "bonus threshold. They are the mechanism, and removing them removes most of the route."],
  ["03", "Hold the bonus to day 90",
   "Paying at qualification means paying before we know anything. A short delay " +
   "moves the payout to the point where the behaviour is visible."],
  ["04", "Monitor month one, do not screen at the door",
   "Track early-tenure behaviour on new accounts rather than tightening approval " +
   "criteria that we now know carry almost no signal."],
];
recs.forEach((r, i) => {
  const y = 2.15 + i * 1.18;
  s.addText(r[0], { x: M, y: y, w: 0.6, h: 0.4, isTextBox: true, margin: 0,
    fontFace: SERIF, fontSize: 17, bold: true, color: GOLD });
  s.addText(r[1], { x: M + 0.75, y: y - 0.03, w: 4.4, h: 0.4, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 15, bold: true, color: WHITE });
  s.addText(r[2], { x: M + 5.3, y: y - 0.19, w: 6.3, h: 0.95, isTextBox: true, margin: 0,
    fontFace: SANS, fontSize: 12.5, color: "C3BFB6", lineSpacing: 18 });
});

s.addNotes("These four act inside the window where the behaviour is visible. None of " +
  "them requires declining anybody.");

/* ================= 9. TIERS ================= */
s = pres.addSlide();
head(s, "HOW TO ACT ON IT", "Five groups, five actions");

s.addTable([
  [
    { text: "Action", options: { bold: true, color: MUTED, fontSize: 11, align: "left" } },
    { text: "Why", options: { bold: true, color: MUTED, fontSize: 11, align: "left" } },
    { text: "Customers", options: { bold: true, color: MUTED, fontSize: 11, align: "right" } },
    { text: "Value total", options: { bold: true, color: MUTED, fontSize: 11, align: "right" } },
  ],
  ["Acquire more of these", "Valuable, no risk signals",
    { text: "36,178", options: { align: "right" } },
    { text: "+\u20B97.7 cr", options: { color: GAIN, bold: true, align: "right" } }],
  [{ text: "Acquire, and watch month one", options: { bold: true } },
   "Our most valuable customers, some carrying risk signals",
    { text: "32,905", options: { align: "right" } },
    { text: "+\u20B926.1 cr", options: { color: GAIN, bold: true, align: "right" } }],
  ["Acquire on lean offers only", "Marginal on current offer economics",
    { text: "49,116", options: { align: "right" } },
    { text: "\u2212\u20B91.7 cr", options: { align: "right" } }],
  ["Watch list", "Ambiguous \u2014 monitor before committing more",
    { text: "15,741", options: { align: "right" } },
    { text: "\u2212\u20B90.3 cr", options: { align: "right" } }],
  ["Do not target", "Consistently costs more than it returns",
    { text: "66,060", options: { align: "right" } },
    { text: "\u2212\u20B919.5 cr", options: { color: LOSS, bold: true, align: "right" } }],
], {
  x: M, y: 2.05, w: 11.6, colW: [3.4, 4.5, 1.85, 1.85],
  rowH: 0.46, fontFace: SANS, fontSize: 12.5, color: INK2,
  border: { type: "solid", color: RULE, pt: 0.75 },
  align: "left", valign: "middle", fill: { color: WHITE },
});

note(s, M, 5.15, 11.6,
  "Do not simply reject everyone who looks risky. The second group is the most valuable " +
  "in the portfolio and carries elevated risk signals — because heavy spending is what " +
  "makes a customer valuable, and heavy early spending is what makes them resemble a " +
  "bonus-seeker. A blunt screen would decline our best customers alongside the worst.");

s.addNotes("If someone asks why we do not simply decline the bottom group: it is a " +
  "third of all applicants and only a quarter of it is bonus-seekers. See the next slide.");

/* ================= 10. CAVEATS ================= */
s = pres.addSlide();
head(s, "BEFORE ACTING", "What this analysis does not tell you");

const cav = [
  ["The portfolio is simulated",
   "Real card transaction data cannot be shared, so this book was generated to mirror " +
   "acquisition economics. Customer types were built with known patterns, so the " +
   "separation here is cleaner than production would be. Treat the results as an upper " +
   "bound on what is achievable."],
  ["The ₹19.5 crore is a bound, not a forecast",
   "Removing the bottom group entirely would lift modelled value from ₹12.4 crore to " +
   "₹31.9 crore. But that group is a third of all customers and only a quarter of it is " +
   "bonus-seekers, so most of the gain comes from not paying bonuses to low-value " +
   "customers generally. No issuer declines a third of applicants."],
  ["Changing the offer will change behaviour",
   "These figures describe customers acquired under the current terms. Restructuring " +
   "the offer changes who applies and how they behave, so the effect of the " +
   "recommendations cannot be read directly off this analysis."],
];
cav.forEach((c, i) => {
  const y = 2.1 + i * 1.55;
  card(s, M, y, 11.6, 1.35);
  s.addText(c[0], { x: M + 0.35, y: y + 0.18, w: 10.9, h: 0.32, isTextBox: true,
    margin: 0, fontFace: SANS, fontSize: 14, bold: true, color: INK });
  s.addText(c[1], { x: M + 0.35, y: y + 0.55, w: 10.9, h: 0.7, isTextBox: true,
    margin: 0, fontFace: SANS, fontSize: 12.5, color: INK2, lineSpacing: 17 });
});

s.addNotes("Raise these before anyone else does. The analysis is worth acting on, but " +
  "the size of the prize is not the same as a promised saving.");

/* ================= 11. CLOSE ================= */
s = pres.addSlide();
s.background = { color: INK };
s.addText("In one line", { x: M, y: 2.1, w: 8, h: 0.35, isTextBox: true, margin: 0,
  fontFace: SANS, fontSize: 13, color: GOLD, charSpacing: 1.5 });
s.addText("We cannot tell who will game an offer from their application. " +
  "We can tell almost perfectly from their first month. So the fix is the offer and " +
  "the first thirty days — not the front door.", {
  x: M, y: 2.65, w: 10.6, h: 2.4, isTextBox: true, margin: 0,
  fontFace: SERIF, fontSize: 28, bold: true, color: WHITE, lineSpacing: 40 });

s.addShape(pres.ShapeType.line, { x: M, y: 5.4, w: 3, h: 0, line: { color: GOLD, width: 1.5 } });
s.addText("Next: agree the offer changes, then a ninety-day trial on one campaign " +
  "with early-tenure monitoring in place.", {
  x: M, y: 5.65, w: 8.4, h: 0.8, isTextBox: true, margin: 0,
  fontFace: SANS, fontSize: 14, color: "B9B5AC", lineSpacing: 21 });

s.addNotes("Close by asking for a decision on one campaign, not on the whole portfolio.");

pres.writeFile({ fileName: "/home/claude/tenday/Tenday_Acquisition_Review.pptx" })
  .then(() => console.log("written"));
