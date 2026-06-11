from sqlmodel import SQLModel, Field
from typing import Optional

class Country(SQLModel, table=True):
    __tablename__ = "countries"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    code: str = Field(unique=True)

class State(SQLModel, table=True):
    __tablename__ = "states"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)

class City(SQLModel, table=True):
    __tablename__ = "cities"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    state_id: Optional[int] = Field(default=None, foreign_key="states.id")

class Neighbourhood(SQLModel, table=True):
    __tablename__ = "neighbourhoods"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    city_id: Optional[int] = Field(default=None, foreign_key="cities.id")