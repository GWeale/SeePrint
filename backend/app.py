import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models.nlp_model import load_model, optimize_store
from models.data_processor import process_cash_register_data
from data.database import db_session, init_db
from sqlalchemy import Column, Integer, String, Float, DateTime

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///seeprint.db'
db = SQLAlchemy(app)

class StoreItem(db_session):
    __tablename__ = 'store_items'
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)
    placement = Column(String, nullable=False)
    restock_level = Column(Float, nullable=False)
    last_restocked = Column(DateTime, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'placement': self.placement,
            'restock_level': self.restock_level,
            'last_restocked': self.last_restocked.isoformat()
        }

db.create_all()

model = load_model()

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route('/api/items', methods=['GET'])
def get_items():
    items = StoreItem.query.all()
    return jsonify([item.to_dict() for item in items]), 200

@app.route('/api/items', methods=['POST'])
def add_item():
    data = request.json
    item = StoreItem(
        name=data['name'],
        category=data['category'],
        placement=data['placement'],
        restock_level=data['restock_level'],
        last_restocked=data['last_restocked']
    )
    db_session.add(item)
    db_session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/api/optimize', methods=['POST'])
def optimize():
    data = request.files['cash_register_data']
    processed_data = process_cash_register_data(data)
    optimization_results = optimize_store(model, processed_data)
    return jsonify(optimization_results), 200

if __name__ == '__main__':
    if not os.path.exists('seeprint.db'):
        init_db()
    app.run(debug=True)
