"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calender";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import api from "@/utils/api";
import "./tasks.css";

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewRow, setShowNewRow] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [newTask, setNewTask] = useState({
    className: "",
    assignment: "",
    description: "",
    status: "pending", // Match ENUM exactly
    deadline: "",
    priority: "medium",
  });
  // Filter states
  const [filterClassName, setFilterClassName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/LogIn');
    }
  }, [user, loading, router]);

  // Fetch tasks when user is authenticated
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      console.error("Error details:", error.response?.data);
      setError('Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      setError('Failed to delete task');
    }
  };

  const handleAddTask = async () => {
    try {
      const response = await api.post('/api/tasks', newTask);
      setTasks([...tasks, response.data]);
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
      setError(`Failed to create task: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTask({ ...editTask, [name]: value });
  };

  const handleEditTask = async () => {
    try {
      const response = await api.put(`/api/tasks/${editTask.id}`, editTask);
      setTasks(tasks.map(task => task.id === editTask.id ? response.data : task));
      setEditTask(null);
    } catch (error) {
      console.error("Error editing task:", error);
      setError('Failed to update task');
    }
  };

  // Authentication loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // Will redirect to login
  }

  // Filtering logic
  const filteredTasks = tasks.filter(task =>
    task.className.toLowerCase().includes(filterClassName.toLowerCase()) &&
    (filterStatus ? task.status === filterStatus : true) &&
    (filterPriority ? task.priority === filterPriority : true)
  );

  return (
    <div className="task-container">
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: '2rem 0 2.5rem 0',
        letterSpacing: '0.04em',
        color: '#fff',
        textShadow: '0 2px 16px #0008'
      }}>
        Assignment Tracker
      </h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">Welcome back, <strong>{user.username}</strong>!</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError("")} 
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter UI */}
      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Filter by class name"
          value={filterClassName}
          onChange={e => setFilterClassName(e.target.value)}
          className="max-w-xs"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filterStatus ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1) : "Status"}
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus("")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("in-progress")}>In Progress</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("completed")}>Completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filterPriority ? filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1) : "Priority"}
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterPriority("")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority("low")}>Low</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority("medium")}>Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority("high")}>High</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tasks Loading */}
      {tasksLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading tasks...</p>
        </div>
      ) : (
        <>
          {filteredTasks.length === 0 && !showNewRow ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tasks found. Create your first task!</p>
            </div>
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
                {filteredTasks.map((task) => (
                  editTask && editTask.id === task.id ? (
                    <tr key={task.id}>
                      <td><input name="className" value={editTask.className} onChange={handleEditChange} /></td>
                      <td><input name="assignment" value={editTask.assignment} onChange={handleEditChange} /></td>
                      <td><input name="description" value={editTask.description} onChange={handleEditChange} /></td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-36 justify-between font-normal" type="button">
                              {editTask.status.charAt(0).toUpperCase() + editTask.status.slice(1)}
                              <ChevronDownIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setEditTask({ ...editTask, status: "pending" })}>Pending</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditTask({ ...editTask, status: "in-progress" })}>In Progress</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditTask({ ...editTask, status: "completed" })}>Completed</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td>
                        <Popover open={editCalendarOpen} onOpenChange={setEditCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-36 justify-between font-normal"
                              type="button"
                            >
                              {editTask.deadline
                                ? new Date(editTask.deadline).toLocaleDateString()
                                : "Select deadline"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={editTask.deadline ? new Date(editTask.deadline) : undefined}
                              captionLayout="dropdown"
                              onSelect={(date) => {
                                setEditTask({ ...editTask, deadline: date ? date.toISOString().split("T")[0] : "" });
                                setEditCalendarOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-36 justify-between font-normal" type="button">
                              {editTask.priority.charAt(0).toUpperCase() + editTask.priority.slice(1)}
                              <ChevronDownIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setEditTask({ ...editTask, priority: "low" })}>Low</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditTask({ ...editTask, priority: "medium" })}>Medium</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditTask({ ...editTask, priority: "high" })}>High</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                      <td>
                        <span className={`status-badge status-${task.status.toLowerCase()}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}</td>
                      <td>
                        <span className={`priority-badge priority-${task.priority}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="task-actions">
                        <button onClick={() => setEditTask(task)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(task.id)}>Delete</button>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-36 justify-between font-normal" type="button">
                            {newTask.status.charAt(0).toUpperCase() + newTask.status.slice(1)}
                            <ChevronDownIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setNewTask({ ...newTask, status: "pending" })}>Pending</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewTask({ ...newTask, status: "in-progress" })}>In Progress</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewTask({ ...newTask, status: "completed" })}>Completed</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-36 justify-between font-normal"
                            type="button"
                          >
                            {newTask.deadline
                              ? new Date(newTask.deadline).toLocaleDateString()
                              : "Select deadline"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newTask.deadline ? new Date(newTask.deadline) : undefined}
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              setNewTask({ ...newTask, deadline: date ? date.toISOString().split("T")[0] : "" });
                              setCalendarOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-36 justify-between font-normal" type="button">
                            {newTask.priority.charAt(0).toUpperCase() + newTask.priority.slice(1)}
                            <ChevronDownIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => setNewTask({ ...newTask, priority: "low" })}>Low</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewTask({ ...newTask, priority: "medium" })}>Medium</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setNewTask({ ...newTask, priority: "high" })}>High</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        </>
      )}
    </div>
  );
}

