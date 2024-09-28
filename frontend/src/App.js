import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [items, setItems] = useState([]);
  const [cashRegisterData, setCashRegisterData] = useState(null);
  const [optimization, setOptimization] = useState({});
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await axios.get('http://localhost:5000/api/items');
    setItems(res.data);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newItem = {
      name: form.name.value,
      category: form.category.value,
      placement: form.placement.value,
      restock_level: parseFloat(form.restock_level.value),
      last_restocked: new Date().toISOString()
    };
    const res = await axios.post('http://localhost:5000/api/items', newItem);
    setItems([...items, res.data]);
    form.reset();
  };

  const handleOptimize = async () => {
    if (!cashRegisterData) return;
    const formData = new FormData();
    formData.append('cash_register_data', cashRegisterData);
    const res = await axios.post('http://localhost:5000/api/optimize', formData);
    setOptimization(res.data);
  };

  const handleFileChange = (e) => {
    setCashRegisterData(e.target.files[0]);
  };

  const handleSalesData = () => {
    // Assuming optimization contains sales data
    const data = Object.keys(optimization).map(key => ({
      name: key,
      restock_level: optimization[key].new_restock_level
    }));
    setSalesData(data);
  };

  return (
    <div className="container">
      <h1 className="mt-4">SeePrint - Store Optimization</h1>
      
      <div className="mt-4">
        <h2>Add Store Item</h2>
        <form onSubmit={handleAddItem}>
          <div className="mb-3">
            <label className="form-label">Item Name</label>
            <input type="text" name="name" className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Category</label>
            <input type="text" name="category" className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Placement</label>
            <input type="text" name="placement" className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Restock Level</label>
            <input type="number" step="0.1" name="restock_level" className="form-control" required />
          </div>
          <button type="submit" className="btn btn-primary">Add Item</button>
        </form>
      </div>

      <div className="mt-5">
        <h2>Store Items</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Placement</th>
              <th>Restock Level</th>
              <th>Last Restocked</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.placement}</td>
                <td>{item.restock_level}</td>
                <td>{new Date(item.last_restocked).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5">
        <h2>Optimization</h2>
        <input type="file" onChange={handleFileChange} className="form-control mb-3" />
        <button className="btn btn-success" onClick={handleOptimize}>Run Optimization</button>
        <button className="btn btn-secondary ms-3" onClick={handleSalesData}>View Sales Data</button>
        <pre className="mt-3">{JSON.stringify(optimization, null, 2)}</pre>
      </div>

      <div className="mt-5">
        <h2>Sales Data</h2>
        <BarChart width={800} height={400} data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="restock_level" fill="#82ca9d" />
        </BarChart>
      </div>
    </div>
  );
}

export default App;
