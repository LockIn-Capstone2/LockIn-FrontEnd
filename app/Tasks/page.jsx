"use client";
import { useEffect, useState } from "react";
import axios from "axios";
// import TaskCard from "@/components/TaskCard";
// import TaskForm from "@/components/TaskForm";

const userId = 1; 

export default function TasksPage() {
    //Stores the list of tasks 
    //Its empty at first but will be filled once the tasks are fetched by the API
  const [tasks, setTasks] = useState([]);

  //Calls the back end api GET /api/tasks/:userId
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
  }, []);

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`http://localhost:8080/api/tasks/${userId}/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Your Tasks</h1>

      {tasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%", borderCollapse: "collapse" }}>
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
              <tr key={task.id}>
                <td>{task.className}</td>
                <td>{task.assignment}</td>
                <td>{task.description}</td>
                <td>{task.status}</td>
                <td>{task.deadline}</td>
                <td>{task.priority}</td>
                <td>
                  <button onClick={() => handleDelete(task.id)} style={{ color: "red" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}