import React, { useState } from 'react';

function AddHabitForm({ onAddHabit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    category: 'health'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddHabit(formData);
      setFormData({ name: '', description: '', frequency: 'daily', category: 'health' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="habit-form">
      <div className="form-group">
        <label htmlFor="habit-name" className="form-label">Habit Name *</label>
        <input
          id="habit-name"
          name="name"
          type="text"
          className="form-input"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Exercise, Read, Meditate"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="habit-description" className="form-label">Description</label>
        <textarea
          id="habit-description"
          name="description"
          className="form-textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your habit..."
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="habit-frequency" className="form-label">Frequency</label>
        <select
          id="habit-frequency"
          name="frequency"
          className="form-select"
          value={formData.frequency}
          onChange={handleChange}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="habit-category" className="form-label">Category</label>
        <select
          id="habit-category"
          name="category"
          className="form-select"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="health">Health</option>
          <option value="fitness">Fitness</option>
          <option value="productivity">Productivity</option>
          <option value="learning">Learning</option>
          <option value="social">Social</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Add Habit
        </button>
      </div>
    </form>
  );
}

export default AddHabitForm;