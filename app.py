"""
Tenday -- Streamlit demo.

Runs entirely on exported aggregates in data/. No Spark, no model
fitting, no credentials. Deploys to Streamlit Community Cloud as-is.

    streamlit run app.py
"""

from pathlib import Path

import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

DATA = Path(__file__).parent / "data"

st.set_page_config(page_title="Tenday", page_icon="•",
                   layout="wide", initial_sidebar_state="expanded")

GREY = "#6b7280"
RED = "#c0392b"
GREEN = "#1e8449"
BLUE = "#2471a3"


@st.cache_data
def load(name):
    path = DATA / f"{name}.csv"
    if not path.exists():
        return None
    return pd.read_csv(path)


@st.cache_data
def load_text(name):
    path = DATA / name
    return path.read_text(encoding="utf-8") if path.exists() else None


def money(x, unit="₹"):
    return f"{unit}{x:,.0f}"


# ----------------------------------------------------------------------
# Sidebar
# ----------------------------------------------------------------------

st.sidebar.title("Tenday")
st.sidebar.caption("Prospect Acquisition & Gaming Prevention")

PAGES = [
    "Overview",
    "Segments",
    "Gaming detection",
    "When the signal appears",
    "Targeting policy",
    "Automated memo",
    "Method & limitations",
]
page = st.sidebar.radio("", PAGES, label_visibility="collapsed")

st.sidebar.markdown("---")
st.sidebar.caption(
    "200,000 customers · 26.7M transactions\n\n"
    "PySpark · Delta Lake · Databricks\n\n"
    "Synthetic data — see Method"
)


# ----------------------------------------------------------------------
# Overview
# ----------------------------------------------------------------------

if page == "Overview":
    st.title("Where is acquisition spend going?")
    st.markdown(
        "A card issuer pays a welcome bonus and a channel cost for every "
        "customer it acquires. Some repay it many times over. Some quietly "
        "extract the bonus and stop. This is the analysis that tells them "
        "which is which — and, more usefully, **when** they could have known."
    )

    seg = load("segments")
    if seg is not None:
        total_cust = int(seg.customers.sum())
        total_bonus = seg.bonus_paid_cr.sum()
        gaming = seg.loc[seg.avg_net_value.idxmin()]

        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Customers", f"{total_cust:,}")
        c2.metric("Bonus paid", f"₹{total_bonus:,.1f} cr")
        c3.metric("Gaming segment",
                  f"{gaming.customers/total_cust:.1%}",
                  f"{gaming.bonus_paid_cr/total_bonus:.0%} of bonus spend",
                  delta_color="inverse")
        c4.metric("Net value lost to gaming",
                  f"₹{abs(gaming.total_net_value_cr):,.2f} cr",
                  delta_color="inverse")

        st.markdown("---")
        st.subheader("The book is carried by a minority and drained by another")

        d = seg.sort_values("total_net_value_cr")
        fig = go.Figure(go.Bar(
            x=d.total_net_value_cr, y=d.segment_name, orientation="h",
            marker_color=[GREEN if v > 0 else RED for v in d.total_net_value_cr],
            text=[f"₹{v:,.2f} cr" for v in d.total_net_value_cr],
            textposition="outside",
        ))
        fig.update_layout(height=380, xaxis_title="Total net value (₹ crore)",
                          yaxis_title="", margin=dict(l=0, r=40, t=10, b=0))
        st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")
    st.subheader("Three findings")
    a, b, c = st.columns(3)
    a.markdown(
        "**Offer structure beats targeting.**\n\n"
        "Channel choice moves net value by ₹231–₹559 per customer. "
        "Campaign choice moves it by roughly ₹5,000. Lean offers are "
        "profitable through every channel; rich offers lose money through "
        "every channel."
    )
    b.markdown(
        "**Screening cannot work.**\n\n"
        "Everything knowable at application predicts gaming at ROC-AUC "
        "0.62 and explains 9% of the variance in eventual value. The "
        "application form is nearly uninformative."
    )
    c.markdown(
        "**Thirty days is enough.**\n\n"
        "Adding first-month behaviour lifts value R² from 0.09 to 0.66. "
        "The intervention point is early-tenure monitoring, not the "
        "front door."
    )


# ----------------------------------------------------------------------
# Segments
# ----------------------------------------------------------------------

elif page == "Segments":
    st.title("Behavioural segments")
    st.caption(
        "MLlib K-Means over 14 full-window behavioural features. "
        "k=6 chosen on business separability — silhouette peaked at k=4, "
        "but lower k merged bonus gamers with early churners."
    )

    seg = load("segments")
    if seg is None:
        st.warning("data/segments.csv not found")
        st.stop()

    st.dataframe(
        seg[["segment_name", "customers", "avg_spend", "concentration",
             "liquid_share", "front_loading", "dormancy_days",
             "days_to_qualify", "redemption_lag", "avg_net_value"]],
        use_container_width=True, hide_index=True,
    )

    st.markdown("---")
    c1, c2 = st.columns(2)

    with c1:
        st.subheader("Speed to qualify")
        d = seg.dropna(subset=["days_to_qualify"]).sort_values("days_to_qualify")
        fig = px.bar(d, x="days_to_qualify", y="segment_name",
                     orientation="h",
                     color="days_to_qualify",
                     color_continuous_scale=["#c0392b", "#e8e8e8"])
        fig.update_layout(height=340, showlegend=False,
                          coloraxis_showscale=False,
                          xaxis_title="Days to cross bonus threshold",
                          yaxis_title="", margin=dict(l=0, r=0, t=10, b=0))
        st.plotly_chart(fig, use_container_width=True)

    with c2:
        st.subheader("Concentration vs cash-equivalent spend")
        fs = load("feature_sample")
        if fs is not None:
            fig = px.scatter(
                fs.sample(min(3000, len(fs)), random_state=42),
                x="full_category_hhi", y="full_liquid_share",
                color="segment_name", opacity=0.5,
                labels={"full_category_hhi": "Category concentration (HHI)",
                        "full_liquid_share": "Cash-equivalent share"},
            )
            fig.update_traces(marker=dict(size=5))
            fig.update_layout(height=340, margin=dict(l=0, r=0, t=10, b=0),
                              legend=dict(font=dict(size=10)))
            st.plotly_chart(fig, use_container_width=True)

    st.info(
        "**Bonus Opportunists** cross the threshold in ~10 days and redeem "
        "within 3, put roughly half their spend in gift cards, money "
        "transfer and wholesale clubs, then go dormant for 7 months. "
        "**Early Churners** look similar on dormancy and front-loading but "
        "take ~10x longer to qualify — they lost interest rather than "
        "working the offer."
    )


# ----------------------------------------------------------------------
# Gaming detection
# ----------------------------------------------------------------------

elif page == "Gaming detection":
    st.title("Detecting gaming without labels")
    st.caption(
        "Two unsupervised approaches, scored against held-out ground truth."
    )

    cmp = load("detection_comparison")
    if cmp is not None:
        c1, c2 = st.columns([1, 1])
        with c1:
            st.dataframe(cmp, use_container_width=True, hide_index=True)
        with c2:
            m = cmp.melt(id_vars="method",
                         value_vars=["precision", "recall", "f1"],
                         var_name="metric", value_name="score")
            fig = px.bar(m, x="metric", y="score", color="method",
                         barmode="group")
            fig.update_layout(height=300, yaxis_range=[0, 1],
                              margin=dict(l=0, r=0, t=10, b=0))
            st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")
    st.subheader("Why anomaly detection lost")
    st.markdown(
        "Isolation-based methods assume anomalies are **rare and "
        "heterogeneous**. Bonus gaming is neither — it is 14% of the book "
        "and behaviourally consistent. It is a *mode*, not an outlier.\n\n"
        "Meanwhile the customers who genuinely are statistical outliers are "
        "the high-value ones, so the forest flags them too. Its top drivers "
        "were `distinct_categories` and `spend_per_active_day`: proxies for "
        "*unusual*, not for *gaming*.\n\n"
        "The same wrong assumption bit twice. A first attempt to locate the "
        "gaming segment by highest mean anomaly score selected **Minimal "
        "Engagers** — 9,734 customers with ₹8,751 of spend and 12 "
        "transactions, the most isolated points in the space precisely "
        "because they barely transact. Replacing that heuristic with a "
        "behavioural definition fixed it."
    )

    st.warning(
        "Ensembling did not help. Requiring both flags held precision at "
        "0.997 but dropped recall to 0.431 — the intersection is bounded by "
        "the weaker model. The segmentation is used alone."
    )


# ----------------------------------------------------------------------
# Horizons
# ----------------------------------------------------------------------

elif page == "When the signal appears":
    st.title("Where along the timeline does the signal live?")
    st.caption(
        "Same targets, same split, same model family. Only the feature set "
        "changes — so any difference is attributable to information, not to "
        "modelling choices."
    )

    h = load("horizon_comparison")
    if h is None:
        st.warning("data/horizon_comparison.csv not found")
        st.stop()

    c1, c2 = st.columns(2)
    with c1:
        fig = go.Figure(go.Bar(
            x=h.horizon, y=h.gaming_roc_auc,
            marker_color=[GREY, BLUE],
            text=[f"{v:.3f}" for v in h.gaming_roc_auc], textposition="outside",
        ))
        fig.add_hline(y=0.5, line_dash="dash", line_color=RED,
                      annotation_text="chance")
        fig.update_layout(title="Gaming detection (ROC-AUC)",
                          yaxis_range=[0, 1.1], height=340,
                          margin=dict(l=0, r=0, t=40, b=0))
        st.plotly_chart(fig, use_container_width=True)

    with c2:
        fig = go.Figure(go.Bar(
            x=h.horizon, y=h.value_r2,
            marker_color=[GREY, BLUE],
            text=[f"{v:.3f}" for v in h.value_r2], textposition="outside",
        ))
        fig.update_layout(title="Value prediction (R²)",
                          yaxis_range=[0, 1.0], height=340,
                          margin=dict(l=0, r=0, t=40, b=0))
        st.plotly_chart(fig, use_container_width=True)

    st.dataframe(h, use_container_width=True, hide_index=True)

    st.markdown("---")
    st.markdown(
        "### The conclusion\n"
        "**Applicant screening is the wrong intervention point.** Channel, "
        "campaign, age, income, region and credit limit together give a "
        "gaming ROC-AUC of 0.62 and explain 9% of the variance in eventual "
        "value. A screen built on them would reject good customers at "
        "nearly the same rate as bad ones.\n\n"
        "**Early-tenure monitoring is the right one.** First-month "
        "behaviour lifts value R² to 0.66 and separates gamers almost "
        "completely — early enough to act before most of the bonus "
        "liability has been redeemed."
    )

    st.warning(
        "**Caveat.** The Layer 2 gaming ROC-AUC of 1.000 reflects synthetic "
        "separability, not a realistic expectation. By day 30, 77% of "
        "gamers have crossed the bonus threshold while almost nobody else "
        "has, so a single feature nearly separates the classes. This is not "
        "leakage — qualification genuinely is observable at day 30 — but "
        "real transaction data would be messier."
    )


# ----------------------------------------------------------------------
# Targeting
# ----------------------------------------------------------------------

elif page == "Targeting policy":
    st.title("Targeting policy")

    cc = load("channel_campaign")
    if cc is not None:
        st.subheader("Offer structure dominates channel choice")
        piv = cc.pivot_table(index="acquisition_channel",
                             columns="campaign_id",
                             values="avg_net_value")
        fig = px.imshow(piv, text_auto=".0f", aspect="auto",
                        color_continuous_scale=["#c0392b", "#f5f5f5", "#1e8449"],
                        color_continuous_midpoint=0,
                        labels=dict(color="Avg net value (₹)"))
        fig.update_layout(height=330, margin=dict(l=0, r=0, t=10, b=0))
        st.plotly_chart(fig, use_container_width=True)
        st.caption(
            "Read down a column, not across a row. Whole campaigns are "
            "profitable or unprofitable; the channel barely moves it."
        )

    st.markdown("---")
    t = load("tiers")
    if t is not None:
        st.subheader("Forward tiers")
        st.dataframe(t, use_container_width=True, hide_index=True)

    cs = load("customers_sample")
    if cs is not None:
        st.subheader("Predicted value against gaming risk")
        fig = px.scatter(
            cs.sample(min(4000, len(cs)), random_state=42),
            x="gaming_score", y="predicted_value", color="tier_label",
            opacity=0.55,
            labels={"gaming_score": "Gaming risk score",
                    "predicted_value": "Predicted net value (₹)"},
        )
        fig.update_traces(marker=dict(size=5))
        fig.update_layout(height=420, margin=dict(l=0, r=0, t=10, b=0))
        st.plotly_chart(fig, use_container_width=True)

    st.warning(
        "**Tier 2 carries the highest realised value and an elevated gaming "
        "rate.** High value and high risk overlap because both involve heavy "
        "spend. A pure risk screen would reject the most profitable cohort "
        "in the book — which is why the action is monitoring, not exclusion."
    )

    st.error(
        "**The policy simulation is a bound, not a forecast.** Excluding "
        "tier 5 raises modelled net value from ₹12.39 cr to ₹31.87 cr, but "
        "tier 5 is a third of the book and only 26% of it is gamers. Most "
        "of that gain comes from withholding bonuses to low-value customers "
        "generally, not from gaming prevention. Declining a third of "
        "applicants is also not a realistic policy."
    )


# ----------------------------------------------------------------------
# Memo
# ----------------------------------------------------------------------

elif page == "Automated memo":
    st.title("Automated insight generation")
    st.caption(
        "An LLM writes the stakeholder narrative. It never touches the data "
        "and never does arithmetic — it receives a JSON payload of figures "
        "already computed in PySpark and scikit-learn."
    )

    c1, c2, c3 = st.columns(3)
    c1.metric("Facts in payload", "86")
    c2.metric("Numeric claims verified", "100%")
    c3.metric("Arithmetic done by the model", "None")

    memo = load_text("insights.md")
    if memo:
        st.markdown("---")
        st.markdown(memo)
    else:
        st.info("data/insights.md not found — run notebook 07 and export it.")

    st.markdown("---")
    st.subheader("The grounding check")
    st.markdown(
        "Every numeric token in the generated text is extracted and matched "
        "against the payload, with a 2% tolerance for re-rounding. "
        "Unverified figures are reported rather than silently accepted.\n\n"
        "It earns its place. An early run produced *“High-Value Core "
        "contains 8451”* against a true figure of 84,517 — a truncated "
        "integer that reads perfectly fluently. The check caught it."
    )
    st.warning(
        "**What it does not do.** The check verifies accuracy, not "
        "relevance. A summary can be 100% grounded and still emphasise the "
        "wrong things — an early version ranked acquisition channels at "
        "length when the analysis showed channel barely matters. "
        "Verification and editorial judgement are separate problems, and "
        "only one of them is automatable."
    )


# ----------------------------------------------------------------------
# Method
# ----------------------------------------------------------------------

else:
    st.title("Method & limitations")

    st.subheader("Pipeline")
    st.code(
        "PySpark generator  ->  200k customers, 26.7M transactions\n"
        "        |               campaigns, redemptions, injected gaming\n"
        "        v\n"
        "Delta Lake         ->  partitioned by acquisition cohort\n"
        "        |\n"
        "PySpark ETL        ->  cleaning, window functions over customer\n"
        "        |               history, horizon-separated features\n"
        "        v\n"
        "  L1  acquisition-time only      (35 features)\n"
        "  L2  + first 30 days            (55 features)\n"
        "  L3  full 365-day window        (47 columns)\n"
        "        |\n"
        "        +-- MLlib KMeans        -> 6 behavioural segments\n"
        "        +-- IsolationForest     -> anomaly score\n"
        "        +-- DecisionTree        -> readable rules (surrogate)\n"
        "        +-- XGBoost + SHAP      -> predicted value\n"
        "        v\n"
        "Targeting tiers    ->  predicted value x gaming risk\n"
        "        v\n"
        "LLM memo + grounding check",
        language="text",
    )

    st.markdown(
        "**Horizon separation is enforced by construction.** Every "
        "behavioural column is prefixed `d30_` or `full_`. Layer 1 contains "
        "no transaction-derived column at all. Redemption events are "
        "censored to the horizon — a customer who qualifies on day 200 has "
        "not qualified as far as Layer 2 is concerned."
    )

    st.markdown("---")
    dq = load("data_quality")
    if dq is not None:
        st.subheader("Data quality — injected, then handled")
        st.dataframe(dq, use_container_width=True, hide_index=True)

    st.markdown("---")
    st.subheader("Limitations")
    st.markdown(
        "**The data is synthetic.** Archetypes were generated with known "
        "behavioural parameters, so features derived from those same "
        "dimensions separate them more cleanly than real transaction data "
        "would. Noise, overlapping archetypes and data-quality issues are "
        "deliberate, but the results are an upper bound on achievable "
        "separation, not a realistic estimate.\n\n"
        "**Clustering recovered the generative structure at ~99% purity.** "
        "That is a property of the simulation, not evidence that K-Means "
        "would perform this way on a real book.\n\n"
        "**The policy simulation is a counterfactual, not a forecast.** "
        "Customers declined under a live policy would not be identical to "
        "those declined retrospectively, and changed offer terms would "
        "change behaviour.\n\n"
        "**The grounding check verifies magnitude, not sign.** Prose often "
        "carries direction lexically — *“lost ₹7.46 crore”* for a stored "
        "−7.46 — so absolute values are admitted. A model that inverted a "
        "sign would pass."
    )
