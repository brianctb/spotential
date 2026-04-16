from pydantic import BaseModel

class ModelFeatures(BaseModel):
    population: float
    population_density: float
    median_household_income: float
    pct_working_age: float
    pct_highly_educated: float
    avg_household_size: float
    other_business_count: float
    business_type_id: int

    @classmethod
    def feature_columns(cls):
        return [
            "population",
            "population_density",
            "median_household_income",
            "pct_working_age",
            "pct_highly_educated",
            "avg_household_size",
            "other_business_count",
            "business_type_id",
        ]
