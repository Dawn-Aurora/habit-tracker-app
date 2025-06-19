import React, { useState } from 'react';
import api from '../api';

function EditHabitForm({ habit, onHabitUpdated }) {
  const [name, setName] = useState(habit.name);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }
    setLoading(true);
    setError('');
    api.put(`/habits/${habit.id}`, { name })
      .then(res => {
        setLoading(false);
        if (onHabitUpdated) onHabitUpdated();
      })
      .catch(err => {
        console.error('Error updating habit:', err);
        setLoading(false);
        setError('Error updating habit');
      });
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>Update Habit</button>
      {error && <span style={{ color: 'red', marginLeft: 8 }}>{error}</span>}
    </form>
  );
}

export default EditHabitForm;