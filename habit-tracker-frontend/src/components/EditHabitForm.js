import React, { useState } from 'react';

function EditHabitForm({ habit, onEditHabit, onCancel }) {
  const [formData, setFormData] = useState({
    name: habit.name || '',
    description: habit.description || '',
    frequency: habit.frequency || 'daily',
    category: habit.category || 'health'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onEditHabit(habit.id, formData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-form">
      <div className="modal-header">
        <h3>Edit Habit</h3>
        <button type="button" className="btn-close" onClick={onCancel}>
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="habit-form">
        <div className="form-group">
          <label htmlFor="edit-habit-name" className="form-label">Habit Name *</label>
          <input
            id="edit-habit-name"
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
          <label htmlFor="edit-habit-description" className="form-label">Description</label>
          <textarea
            id="edit-habit-description"
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your habit..."
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="edit-habit-frequency" className="form-label">Frequency</label>
          <select
            id="edit-habit-frequency"
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
          <label htmlFor="edit-habit-category" className="form-label">Category</label>
          <select
            id="edit-habit-category"
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
            Update Habit
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditHabitForm;