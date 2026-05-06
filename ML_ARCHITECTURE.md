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

### A. Features ($X$) - The Demographics and Supply

- **Data Points:** Median Income, Total Population, Population Density, Average Age, Other Businesses Count
- **Reference:** Model features can be found in ml_model.py under scehma package

### B. Target ($y$) - The Existing Business

- **Data Point:** Total business count for a specific type found within the boundaries of that specific Tract.

**Model:** XGBoost Regressor trained to predict: _“Given these demographics, what is the expected total number of businesses of a specific type this entire neighborhood can support?”_

---

## 3. The "Spotentiate" Scoring Engine (Inference)

When a user clicks a coordinate ($Lat/Lng$), the system performs a stable, tract-based evaluation:

### Step 1: Identify and Predict (Macro)

The system performs a point-in-polygon lookup to find the **Tract ID** for the click. It then feeds that tract's Census data into the model. Finds all other business that is in that neighbourhood and aggergate them and also feeds into the model.

- _Output:_ **Predicted Capacity** (e.g., "This neighborhood should support 10 gyms.")

### Step 2: Measure Actual Supply (Macro)

The system queries the database for the total number of existing businesses **already located within that specific Tract boundary**.

- _Output:_ **Actual Tract Supply** (e.g., "There are currently 8 gyms in this census tract.")

### Step 3: Calculate Opportunity Index

The final score is calculated using a sigmoid-based normalization that compares the predicted market capacity against the current actual supply within the tract.

$$
\text{ratio} = \ln(1 + \text{Predicted Capacity}) - \ln(1 + \text{Actual Tract Supply})
$$

$$
Score = \frac{100}{1 + e^{-k \cdot \text{ratio}}}
$$

Where:

- \(k\) is a scaling factor controlling score sensitivity
- Higher predicted capacity relative to actual supply increases the score
- Log scaling reduces the impact of extreme outliers
- The score is normalized between \(0\) and \(100\)

Using:

$$
k = 5
$$

---

## 4. Limitations

- **Zoning and Land Use Constraints**
  - The model currently predicts demand based purely on demographic capacity, which may suggest locations in strictly residential or industrial zones.
  - Future iterations require integration of municipal land-use data to "mask" areas where commercial activity is legally prohibited.
- **Tract-Boundary Rigidity (The "Edge" Problem)**
  - By using strict census tract boundaries, the model may ignore a competitor located just across the street if they fall into a neighboring tract.
  - This can lead to an overestimation of "Market Gap" for locations near tract borders.
- **Real-Time Market Volatility**
  - Supply data is dependent on the update frequency of OpenStreetMap (OSM)

## 5. Future Enhancement

- Include Transit Data
- Include Zoning Data
- Refine Model with better features
- Different models specific to different business type
- More advanced Geospatial analysis that include features for competition around the radius of point clicked on the map
- Overlay average price-per-square-foot data to help users identify areas where high demand meets affordable rent
