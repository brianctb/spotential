# Spotential ML Architecture: Market Saturation Engine (Strict Tract-Level)

This document outlines the machine learning strategy for Spotential. It utilizes a Tract-Level Capacity Model to identify market gaps based on standardized geographic boundaries.

---

## 1. The Core Philosophy: The Market Gap

Spotential identifies "Market Gaps" by comparing a neighborhood's **Capacity** against its **Current Supply**.

- **Capacity:** Predicted by a machine learning model based on demographics.
- **Supply:** The actual total business count within the census tract, extracted from OpenStreetMap (OSM).

---

## 2. Data Alignment (The Training Phase)

To maintain statistical integrity, all data is synchronized to the **Census Tract** scale. This avoids the "spatial resolution mismatch" caused by mixing point-radius features with tract-level labels.

### A. Features ($X$) - The "Demand"

- **Data Points:** Median Income, Total Population, Population Density, Average Age.
- **Scale:** Census Tract.

### B. Target ($y$) - The "Ground Truth"

- **Data Points:** Total business count (e.g., Gyms) found within the boundaries of that specific Tract.
- **Scale:** Census Tract.

**Model:** XGBoost Regressor trained to predict: _“Given these demographics, what is the expected total number of businesses this entire neighborhood can support?”_

---

## 3. The "Spotentiate" Scoring Engine (Inference)

When a user clicks a coordinate ($Lat/Lng$), the system performs a stable, tract-based evaluation:

### Step 1: Identify and Predict (Macro)

The system performs a point-in-polygon lookup to find the **Tract ID** for the click. It then feeds that tract's Census data into the model.

- _Output:_ **Predicted Capacity** (e.g., "This neighborhood should support 10 gyms.")

### Step 2: Measure Actual Supply (Macro)

The system queries the database for the total number of existing businesses **already located within that specific Tract boundary**.

- _Output:_ **Actual Tract Supply** (e.g., "There are currently 8 gyms in this census tract.")

### Step 3: Calculate Opportunity Index

The final score is a normalized percentage of the "untapped" market within that neighborhood.

$$Score = \max\left(0, \left( \frac{\text{Predicted Capacity} - \text{Actual Tract Supply}}{\text{Predicted Capacity}} \right) \times 100\right)$$
