from sqlmodel import Session, delete
from db import engine
from service.CensusService import CensusService
from service.BusinessService import BusinessService
from service.AnalysisService import AnalysisService
from models.model_outputs import ModelPrediction
import joblib
from pathlib import Path

def main():
    with Session(engine) as session:
        census_service = CensusService(session)
        business_service = BusinessService(session)
        base = Path(__file__).resolve().parents[2]
        model_path = base / "models" / "production_model.pkl"
        model = joblib.load(model_path)

        analysis_service = AnalysisService(
            business_service=business_service,
            census_service=census_service,
            model=model
        )

        predictions = analysis_service.precompute_all_predictions()

        if not predictions:
            print("No predictions to save.")
            return

        print("Clearing old predictions...")
        session.exec(delete(ModelPrediction))
        session.commit()

        print(f"Inserting {len(predictions)} predictions...")
        session.add_all(predictions)
        session.commit()

    print("Done.")

if __name__ == "__main__":
    main()