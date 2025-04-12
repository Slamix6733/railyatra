'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const result = await response.json();
      
      if (result.success) {
        setTasks(result.data);
      } else {
        setError(result.error || 'Failed to fetch tasks');
      }
    } catch (error) {
      setError('Error connecting to the server');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Add new task
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh task list
        fetchTasks();
        // Clear form
        setNewTask({ title: '', description: '' });
      } else {
        setError(result.error || 'Failed to add task');
      }
    } catch (error) {
      setError('Error connecting to the server');
      console.error(error);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Task Manager</h1>
      
      {/* Add Task Form */}
      <form onSubmit={addTask} className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter task title"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter task description"
            rows={3}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Task
        </button>
      </form>
      
      {/* Tasks List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Tasks</h2>
        
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">No tasks yet. Add your first task above!</p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className="p-4 border rounded-md">
                <h3 className="font-medium">{task.title}</h3>
                {task.description && (
                  <p className="text-gray-600 mt-1">{task.description}</p>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  Created: {new Date(task.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 