from typing import Literal, Optional
from pydantic import BaseModel


class GeographyResolution(BaseModel):
    """Result of resolving free-text neighbourhood name(s) to DB rows.

    Only used for `neighbourhood` — city/state/country are JSON-schema enums,
    so Claude can only send an already-valid exact match; there's nothing to
    resolve and ambiguity is structurally impossible for those three.
    """

    # "found": every query matched exactly one row -> neighbourhood_ids is populated.
    # "ambiguous": one query matched more than one row -> query + candidates set.
    # "not_found": one query matched no rows -> query set, candidates empty.
    status: Literal["found", "ambiguous", "not_found"]
    neighbourhood_ids: list[int] = []
    # The specific input string that failed resolution (ambiguous/not_found only).
    # Resolution short-circuits on the first failure, so this pinpoints which of
    # possibly several requested neighbourhood names Claude should ask about.
    query: Optional[str] = None
    # Populated only when status == "ambiguous". Each entry is formatted as
    # "{neighbourhood name} ({city name})", e.g. "Downtown (Vancouver)" /
    # "Downtown (Surrey)" — the bare name alone can't disambiguate duplicate
    # neighbourhood names across different cities.
    candidates: list[str] = []
