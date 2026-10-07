# Tenday

**Prospect Acquisition & Gaming Prevention Platform**

A card issuer pays a welcome bonus and a channel cost for every customer it
acquires. Most repay it. Some take the bonus and go dormant — and they are
invisible in the signup numbers, because a bonus-seeker looks exactly like a
successful acquisition until the dormancy shows up months later.

This project finds them, quantifies what they cost, and establishes **how early
the difference becomes visible.**

The name comes from the answer: a bonus-seeker clears a spending threshold in
**ten days** that takes a real customer five months.

**[Read the report →](https://ashish-gaba.github.io/tenday/)** · [Notebooks](notebooks/) · [Explainer](Tenday-explainer.html)

*200,000 customers · 26.7M transactions · PySpark on Databricks*

---

## Findings

### 1. The offer matters far more than the channel

| | Best channel | Worst channel | Spread |
|---|---|---|---|
| Lean offer — ₹2,000 bonus on ₹45,000 | +₹3,030 | +₹2,799 | ₹231 |
| Rich offer — ₹12,000 bonus on ₹150,000 | −₹1,562 | −₹2,121 | ₹559 |

Within a campaign, switching channel moves average net value by ₹231–₹559 per
customer. Switching campaign moves it by roughly **₹5,000**.

Lean offers are profitable through *every* channel, including affiliate. Rich
offers lose money through *every* channel, including branch and referral. Return
on acquisition spend is ₹2.90 per rupee on lean offers and ₹0.72 on rich ones.

A larger bonus does not buy a better customer. It buys someone who will do
precisely enough to qualify and then stop.

### 2. Applicant screening cannot work — early-tenure monitoring can

| Horizon | Features | Gaming ROC-AUC | Value R² |
|---|---|---|---|
| **L1** — acquisition-time only | 35 | 0.622 | 0.089 |
| **L2** — + first 30 days | 55 | 1.000\* | 0.658 |

Everything knowable at application — channel, campaign, offer terms, age band,
income band, region, credit limit — predicts gaming at ROC-AUC 0.622 and explains
**9%** of the variance in eventual customer value.

Adding first-month behaviour lifts value R² to 0.658, a **7x improvement**, and
cuts mean absolute error from ₹3,745 to ₹2,081.

**So the intervention point is the offer and the first thirty days, not the front
door.** Sustained-spend requirements instead of lump-sum thresholds, delayed bonus
release, or exclusion of cash-equivalent categories — all three act inside the
window where the signal exists.

\* *See [limitations](#limitations) — an AUC of 1.000 reflects synthetic
separability, not a realistic expectation.*

### 3. Gaming is a behavioural mode, not an anomaly

| Method | Flagged | Precision | Recall | F1 |
|---|---|---|---|---|
| IsolationForest | 30,000 | 0.429 | 0.452 | 0.440 |
| **KMeans segment** | 27,871 | **0.998** | **0.977** | **0.987** |
| Both (AND) | 12,301 | 0.997 | 0.431 | 0.601 |

Isolation-based methods assume anomalies are **rare and heterogeneous**. Bonus
gaming is neither — it is 14% of the book and behaviourally consistent. Meanwhile
the customers who genuinely *are* statistical outliers are the high-value ones, so
the forest flags them too. Its top drivers were `distinct_categories` and
`spend_per_active_day`: proxies for *unusual*, not for *gaming*.

The same wrong assumption bit twice. A first attempt to locate the gaming segment
by highest mean anomaly score selected **Minimal Engagers** — 9,734 customers with
₹8,751 of spend and 12 transactions, the most isolated points in the feature space
precisely because they barely transact.

Ensembling did not help: requiring both flags held precision at 0.997 but dropped
recall to 0.431. The intersection is bounded by the weaker model.

**The negative result is reported because it is the more useful finding.**

---

## The book

| Segment | Customers | Days to qualify | Near-cash spend | Avg net value | Total |
|---|---|---|---|---|---|
| High-Value Core | 84,517 | 154 | 23% | +₹3,154 | **+₹26.7 cr** |
| Casual Regulars | 45,120 | 261 | 23% | −₹709 | −₹3.2 cr |
| Early Churners | 27,718 | 96 | 23% | −₹708 | −₹2.0 cr |
| Minimal Engagers | 9,734 | never | 23% | −₹1,133 | −₹1.1 cr |
| Borderline Opportunists | 5,040 | 24 | 26% | −₹1,091 | −₹0.6 cr |
| **Bonus Opportunists** | 27,871 | **10** | **48%** | **−₹2,676** | **−₹7.5 cr** |

Bonus Opportunists are **13.9% of customers and absorbed 34.6% of all bonus
spend**.

Early Churners are the hard case: same dormancy, similar front-loading, but 96
days to qualify against 10. `k=6` was chosen over the silhouette-optimal `k=4`
because lower k merges the two into a single cluster that is half good customers.

---

## Method

```
PySpark generator  ->  200k customers, 26.7M transactions
       |               campaigns, redemptions, injected gaming behaviour,
       |               deliberate data-quality defects
       v
Delta Lake         ->  partitioned by acquisition cohort
       |
PySpark ETL        ->  cleaning, window functions over customer history
       |               ~36s for the full feature build
       v
  L1  acquisition-time only      35 features
  L2  + first 30 days            55 features
  L3  full 365-day window        47 columns
       |
       +-- MLlib KMeans      -> 6 behavioural segments
       +-- IsolationForest   -> anomaly score
       +-- DecisionTree      -> readable rules (surrogate on forest output)
       +-- XGBoost + SHAP    -> predicted value, out-of-fold
       v
Targeting tiers    ->  predicted value x gaming risk
       v
LLM memo + grounding check
```

### Horizon separation

Every behavioural column is prefixed `d30_` or `full_`. Layer 1 contains no
transaction-derived column at all. Redemption events are censored to the horizon —
a customer who qualifies on day 200 has **not** qualified as far as Layer 2 is
concerned. `behavioural_features()` is parameterised by window, so L2 and L3 are
computed by the same code with different bounds.

### Data quality

| Issue | Rows | % | Treatment |
|---|---|---|---|
| Null amounts | 105,920 | 0.40% | Dropped — imputing spend corrupts cumulative-spend features |
| Negative amounts | 39,950 | 0.15% | Refunds; excluded from spend aggregates, retained as a feature |
| Null categories | 53,326 | 0.20% | Labelled `unknown` — the amount is still valid |
| Duplicate IDs | 26,673 | 0.10% | Deduplicated on `transaction_id` |

Transaction amounts are heavily right-skewed (mean ₹1,702, stddev ₹3,315), so
spend features are log-transformed before scaling.

### Automated insight generation

An LLM writes the stakeholder memo from a JSON payload of 86 figures already
computed in PySpark and scikit-learn. It never touches the data and never does
arithmetic. Every numeric token in its output is then matched against that
payload, with a 2% tolerance for re-rounding.

It earns its place: an early run produced *"High-Value Core contains 8451"*
against a true figure of 84,517 — a truncated integer that reads perfectly
fluently.

**What the check does not do:** it verifies accuracy, not relevance. A summary can
be 100% grounded and still emphasise the wrong things.

---

## Limitations

**The data is synthetic.** Archetypes were generated with known behavioural
parameters, so features derived from those same dimensions separate them more
cleanly than real transaction data would. Noise, overlapping archetypes and
injected defects are deliberate, but the results are an **upper bound** on
achievable separation. The generative process is documented in
[`notebooks/01_generate_data.ipynb`](notebooks/01_generate_data.ipynb).

**Clustering recovered the generative structure at ~99% purity.** That is a
property of the simulation, not evidence K-Means would perform this way on a real
book.

**The Layer 2 gaming AUC of 1.000 is not a real result.** By day 30, 77% of gamers
have crossed the bonus threshold while almost nobody else has, so a single feature
nearly separates the classes. Not leakage — qualification genuinely is observable
at day 30 — but real data would be messier.

**The policy simulation is a bound, not a forecast.** Excluding tier 5 raises
modelled net value from ₹12.39cr to ₹31.87cr, but tier 5 is a third of the book
and only 26% of it is gamers. Most of that gain comes from withholding bonuses to
low-value customers generally, not from gaming prevention.

---

## Why PySpark

Pandas handled 5M rows in 17.6 seconds using about 1.1 GB, scaling linearly —
roughly 6 GB for the full 26.7M before any feature computation. That fits on one large
machine with no headroom, and does not grow. The pipeline was built in PySpark so
it scales horizontally and the same code works at 10x the volume.

MLlib KMeans is used for segmentation to keep the pipeline distributed end to end.
At 200k customers scikit-learn would also work; the remaining models run in
scikit-learn on the aggregated feature table, because at that size the
distribution overhead is not worth paying.

---

## Repository

```
notebooks/                         Databricks notebooks, run in order
  01_generate_data.ipynb           synthetic generator (PySpark) + data profile
  02_feature_engineering.ipynb     cleaning + horizon-separated features (L1/L2/L3)
  03_behavioural_segmentation.ipynb  MLlib KMeans, silhouette sweep, segment profiling
  04_gaming_detection.ipynb        IsolationForest + decision-tree surrogate vs segments
  05_three_horizon_comparison.ipynb  L1 vs L2 with XGBoost, SHAP
  06_targeting_policy.ipynb        channel verdict, out-of-fold tiers, policy simulation
  07_automated_insights.ipynb      LLM memo + grounding verification
data/                              exported aggregates the apps read from
app.py                             Streamlit demo
app1.py                            Streamlit stakeholder dashboard
Tenday-explainer.html              standalone explainer page
tenday_deck_source.js              pptxgenjs source for the stakeholder deck
```

### Running it

The pipeline needs Databricks (Free Edition is sufficient):

1. Create a Unity Catalog volume at `/Volumes/workspace/default/tenday` — every
   notebook reads and writes there.
2. Run notebooks `01` → `07` in order. Notebooks 05 and 06 `%pip install`
   `xgboost` (05 also `shap`); 07 installs `google-genai` and takes a Gemini API
   key through a notebook widget.
3. Copy the aggregates into `data/` for the apps.

The apps run anywhere, on the exported aggregates alone:

```bash
pip install -r requirements.txt
streamlit run app.py      # demo
streamlit run app1.py     # stakeholder dashboard
```

---

**Stack** — PySpark · Delta Lake · Databricks · Spark SQL · MLlib · scikit-learn ·
XGBoost · SHAP · MLflow · Gemini API · Streamlit · Plotly

**Ashish Gaba** — [LinkedIn](https://linkedin.com/in/ashish-gaba) ·
[GitHub](https://github.com/Ashish-gaba) · ashishgaba81@gmail.com
