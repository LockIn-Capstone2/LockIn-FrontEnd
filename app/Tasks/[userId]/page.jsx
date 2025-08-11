"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import "../tasks.css";

export default function TasksPage({ params }) {
  const userId = params.userId;
  const [tasks, setTasks] = useState([]);
  const [showNewRow, setShowNewRow] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [newTask, setNewTask] = useState({
    className: "",
    assignment: "",
    description: "",
    status: "pending",
    deadline: "",
    priority: "medium",
  });

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/tasks/${userId}`);
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8080/api/tasks/${userId}/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleAddTask = async () => {
    try {
      const res = await axios.post(`http://localhost:8080/api/tasks/${userId}`, newTask);
      setTasks((prev) => [...prev, res.data]);
      setShowNewRow(false);
      setNewTask({
        className: "",
        assignment: "",
        description: "",
        status: "pending",
        deadline: "",
        priority: "medium",
      });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTask({ ...editTask, [name]: value });
  };

  const handleEditTask = async () => {
    try {
      await axios.put(`http://localhost:8080/api/tasks/${userId}/${taskId}`, editTask);
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
  try {
    await axios.patch(`http://localhost:8080/api/tasks/${userId}/${taskId}`, { status: newStatus });
    fetchTasks(); // Refresh the list
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

  return (
    <div className="task-container">
      <h1>Your Tasks (User {userId})</h1>
      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <table className="task-table">
          <thead>
            <tr>
              <th>Class Name</th>
              <th>Assignment</th>
              <th>Description</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Priority</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              editTask && editTask.id === task.id ? (
                <tr key={task.id}>
                  <td><input name="className" value={editTask.className} onChange={handleEditChange} /></td>
                  <td><input name="assignment" value={editTask.assignment} onChange={handleEditChange} /></td>
                  <td><input name="description" value={editTask.description} onChange={handleEditChange} /></td>
                  <td>
                    <select
                        value={task.status}
                        onChange={e => handleStatusChange(task.id, e.target.value)}
                        >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="completed">Completed</option>
                        </select>
                  </td>
                  <td><input name="deadline" type="date" value={editTask.deadline} onChange={handleEditChange} /></td>
                  <td>
                    <select name="priority" value={editTask.priority} onChange={handleEditChange}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  <td className="task-actions">
                    <button onClick={handleEditTask}>Save</button>
                    <button onClick={() => setEditTask(null)}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={task.id}>
                  <td>{task.className}</td>
                  <td>{task.assignment}</td>
                  <td>{task.description}</td>
                  <td>{task.status}</td>
                  <td>{task.deadline}</td>
                  <td>{task.priority}</td>
                  <td className="task-actions">
                    <button onClick={() => setEditTask(task)}>Edit</button>
                    <button onClick={() => handleDelete(task.id)}>Delete</button>
                  </td>
                </tr>
              )
            ))}
            {showNewRow && (
              <tr>
                <td>
                  <input
                    type="text"
                    value={newTask.className}
                    onChange={(e) => setNewTask({ ...newTask, className: e.target.value })}
                    placeholder="Class Name"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newTask.assignment}
                    onChange={(e) => setNewTask({ ...newTask, assignment: e.target.value })}
                    placeholder="Assignment"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Description"
                  />
                </td>
                <td>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In-Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  />
                </td>
                <td>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </td>
                <td className="task-actions">
                  <button onClick={handleAddTask}>Add</button>
                  <button onClick={() => setShowNewRow(false)}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {!showNewRow && (
        <button className="new-task-button" onClick={() => setShowNewRow(true)}>
          + New Task
        </button>
      )}
    </div>
  );
}
