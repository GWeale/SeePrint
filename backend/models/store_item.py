from sqlalchemy import Column, Integer, String, Float, DateTime
from data.database import Base

class StoreItem(Base):
    __tablename__ = 'store_items'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    placement = Column(String, nullable=False)
    restock_level = Column(Float, nullable=False)
    last_restocked = Column(DateTime, nullable=False)
