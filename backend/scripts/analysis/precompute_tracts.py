from sqlmodel import Session
from db import engine
from service.CensusService import CensusService
from service.BusinessService import BusinessService
from service.PredictionService import PredictionService
import joblib
from pathlib import Path

def main():
    with Session(engine) as session:
        census_service = CensusService(session)
        business_service = BusinessService(session)
        base = Path(__file__).resolve().parents[2]
        model_path = base / "models" / "production_model.pkl"
        model = joblib.load(model_path)

        prediction_service = PredictionService(
            session=session,
            model=model,
            business_service=business_service,
            census_service=census_service,
        )

        predictions = prediction_service.precompute_all_predictions()

        if not predictions:
            print("No predictions to save.")
            return

        print(f"Saving {len(predictions)} predictions...")
        prediction_service.save_predictions(predictions)

    print("Done.")

if __name__ == "__main__":
    main()