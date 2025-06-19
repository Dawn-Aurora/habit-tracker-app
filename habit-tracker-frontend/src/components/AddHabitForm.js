import React, { useState } from 'react';
import api from '../api';

function AddHabitForm({ onHabitAdded }) {
  const [name, setName] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    api.post('/habits', { name })
      .then(res => {
        setName('');
        if (onHabitAdded) onHabitAdded();
      })
      .catch(err => {
        console.error('Error adding habit:', err);
        alert('Error adding habit');
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="New habit"
        required
      />
      <button type="submit">Add Habit</button>
    </form>
  );
}

export default AddHabitForm;