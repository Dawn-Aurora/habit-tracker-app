import React from 'react';

function HabitList({ habits, onEdit, onDelete }) {
  if (!habits || habits.length === 0) {
    return <div>No habits found.</div>;
  }
  return (
    <ul>
      {habits.map(habit => (
        <li key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{habit.name}</span>
          <button onClick={() => onEdit(habit)}>Edit</button>
          <button onClick={() => onDelete(habit.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export default HabitList;