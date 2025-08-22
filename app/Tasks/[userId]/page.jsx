"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar } from "@/components/ui/calender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import "../tasks.css";

export default function TasksPage({ params }) {
  // Unwrap params using React.use() for Next.js compatibility
  const { userId } = use(params);
  const router = useRouter();

  // FIXED: Use AuthContext instead of local auth state
  const { user, loading: authLoading } = useAuth();

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

  // Filter states
  const [filterClassName, setFilterClassName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // UI states
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // API configuration
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  // Configure axios to include credentials
  const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching tasks for user:", userId);
      const res = await api.get("/tasks");

      console.log("Tasks fetched successfully:", res.data);
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);

      if (error.response?.status === 401) {
        setError("Please log in to view your tasks.");
      } else {
        setError("Failed to fetch tasks. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🔥 FIXED: Only fetch tasks when user is authenticated and userId is available
    if (userId && user && !authLoading) {
      fetchTasks();
    }
  }, [userId, user, authLoading]);

  const handleDelete = async (taskId) => {
    try {
      setError("");
      console.log("Deleting task:", taskId);

      await api.delete(`/tasks/${taskId}`);
      console.log("Task deleted successfully");

      // Remove task from local state
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      if (error.response?.status === 401) {
        setError("Please log in to delete tasks.");
      } else {
        setError("Failed to delete task. Please try again.");
      }
    }
  };

  const handleAddTask = async () => {
    try {
      setError("");
      console.log("🚀 Starting task creation...");

      // Validate required fields
      if (!newTask.className.trim() || !newTask.assignment.trim()) {
        setError("Class name and assignment are required.");
        return;
      }

      // Prepare task data with proper date handling
      const taskData = {
        ...newTask,
        deadline: newTask.deadline
          ? new Date(newTask.deadline).toISOString().split("T")[0] // Send only the date part
          : null,
      };

      console.log("📝 Original newTask:", newTask);
      console.log("�� Processed taskData:", taskData);

      const res = await api.post("/tasks", taskData);

      console.log("✅ Task added successfully:", res.data);
      setTasks((prev) => [res.data, ...prev]);

      // Reset form
      setShowNewRow(false);
      setNewTask({
        className: "",
        assignment: "",
        description: "",
        status: "pending",
        deadline: "",
        priority: "medium",
      });

      console.log("🎉 Task creation completed successfully");
    } catch (error) {
      console.error("❌ Error adding task:", error);
      console.error("🔍 Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        setError("Please log in to create tasks.");
      } else if (error.response?.status === 400) {
        setError(
          error.response.data.error ||
            "Invalid task data. Please check your input."
        );
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR") {
        setError("Network error. Please check your connection.");
      } else {
        setError(`Failed to add task: ${error.message || "Unknown error"}`);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditTask({ ...editTask, [name]: value });
  };

  const handleEditTask = async () => {
    try {
      setError("");

      // Validate required fields
      if (!editTask.className.trim() || !editTask.assignment.trim()) {
        setError("Class name and assignment are required.");
        return;
      }

      // Prepare task data with proper date handling
      const taskData = {
        ...editTask,
        deadline: editTask.deadline
          ? new Date(editTask.deadline).toISOString()
          : null,
      };

      console.log("Updating task:", editTask.id, taskData);
      const res = await api.put(`/tasks/${editTask.id}`, taskData);

      console.log("Task updated successfully:", res.data);

      // Update task in local state
      setTasks((prev) =>
        prev.map((task) => (task.id === editTask.id ? res.data : task))
      );

      setEditTask(null);
    } catch (error) {
      console.error("Error editing task:", error);

      if (error.response?.status === 401) {
        setError("Please log in to edit tasks.");
      } else if (error.response?.status === 400) {
        setError(
          error.response.data.error ||
            "Invalid task data. Please check your input."
        );
      } else {
        setError("Failed to update task. Please try again.");
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setError("");
      console.log("Updating status for task:", taskId, "to:", newStatus);

      const res = await api.patch(`/tasks/${taskId}`, { status: newStatus });

      console.log("Status updated successfully:", res.data);

      // Update task in local state
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? res.data : task))
      );
    } catch (error) {
      console.error("Error updating status:", error);

      if (error.response?.status === 401) {
        setError("Please log in to update task status.");
      } else {
        setError("Failed to update status. Please try again.");
      }
    }
  };

  // Filtering logic
  const filteredTasks = tasks.filter(
    (task) =>
      task.className.toLowerCase().includes(filterClassName.toLowerCase()) &&
      (filterStatus ? task.status === filterStatus : true) &&
      (filterPriority ? task.priority === filterPriority : true)
  );

  // Clear filters
  const clearFilters = () => {
    setFilterClassName("");
    setFilterStatus("");
    setFilterPriority("");
  };

  // 🔥 FIXED: Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="task-container">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // 🔥 FIXED: Show authentication required message only when auth is done and no user
  if (!authLoading && !user) {
    return (
      <div className="task-container">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              Please log in to access your tasks.
            </p>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <button
              onClick={() => router.push("/LogIn")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && tasks.length === 0) {
    return (
      <div className="task-container">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading your tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Your Tasks</h1>
          <div className="text-sm text-gray-600">User ID: {userId}</div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <Button
              variant="outline"
              onClick={() => router.push(`/DashBoard/${user.id}`)}
              className="flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter UI */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <Input
          placeholder="Filter by class name"
          value={filterClassName}
          onChange={(e) => setFilterClassName(e.target.value)}
          className="max-w-xs"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filterStatus
                ? filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)
                : "Status"}
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterStatus("")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("in-progress")}>
              In-Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filterPriority
                ? filterPriority.charAt(0).toUpperCase() +
                  filterPriority.slice(1)
                : "Priority"}
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilterPriority("")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority("low")}>
              Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterPriority("high")}>
              High
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {(filterClassName || filterStatus || filterPriority) && (
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 && !showNewRow ? (
        <div className="text-center py-8 text-gray-500">
          {tasks.length === 0
            ? "No tasks yet. Create your first task!"
            : "No tasks match your filters."}
        </div>
      ) : (
        <div className="overflow-x-auto">
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
              {filteredTasks.map((task) =>
                editTask && editTask.id === task.id ? (
                  <tr key={task.id}>
                    <td>
                      <input
                        name="className"
                        value={editTask.className}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                      />
                    </td>
                    <td>
                      <input
                        name="assignment"
                        value={editTask.assignment}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                      />
                    </td>
                    <td>
                      <input
                        name="description"
                        value={editTask.description}
                        onChange={handleEditChange}
                        className="w-full p-2 border rounded"
                      />
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-36 justify-between font-normal"
                            type="button"
                          >
                            {editTask.status.charAt(0).toUpperCase() +
                              editTask.status.slice(1)}
                            <ChevronDownIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() =>
                              setEditTask({ ...editTask, status: "pending" })
                            }
                          >
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setEditTask({
                                ...editTask,
                                status: "in-progress",
                              })
                            }
                          >
                            In-Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setEditTask({ ...editTask, status: "completed" })
                            }
                          >
                            Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td>
                      <Popover
                        open={editCalendarOpen}
                        onOpenChange={setEditCalendarOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-36 justify-between font-normal"
                            type="button"
                          >
                            {editTask.deadline
                              ? new Date(editTask.deadline).toLocaleDateString()
                              : "Select deadline"}
                            <ChevronDownIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto overflow-hidden p-0"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={
                              editTask.deadline
                                ? new Date(editTask.deadline)
                                : undefined
                            }
                            captionLayout="dropdown"
                            onSelect={(date) => {
                              setEditTask({
                                ...editTask,
                                deadline: date
                                  ? date.toISOString().split("T")[0]
                                  : "",
                              });
                              setEditCalendarOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-36 justify-between font-normal"
                            type="button"
                          >
                            {editTask.priority.charAt(0).toUpperCase() +
                              editTask.priority.slice(1)}
                            <ChevronDownIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() =>
                              setEditTask({ ...editTask, priority: "low" })
                            }
                          >
                            Low
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setEditTask({ ...editTask, priority: "medium" })
                            }
                          >
                            Medium
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setEditTask({ ...editTask, priority: "high" })
                            }
                          >
                            High
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="task-actions">
                      <button
                        onClick={handleEditTask}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditTask(null)}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={task.id}>
                    <td>{task.className}</td>
                    <td>{task.assignment}</td>
                    <td>{task.description}</td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-24 justify-between font-normal text-sm"
                            type="button"
                          >
                            {task.status.charAt(0).toUpperCase() +
                              task.status.slice(1)}
                            <ChevronDownIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(task.id, "pending")
                            }
                          >
                            Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(task.id, "in-progress")
                            }
                          >
                            In-Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(task.id, "completed")
                            }
                          >
                            Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td>
                      {task.deadline
                        ? new Date(task.deadline).toLocaleDateString()
                        : ""}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </span>
                    </td>
                    <td className="task-actions">
                      <button
                        onClick={() => setEditTask(task)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 delete-btn"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}

              {/* New Task Row */}
              {showNewRow && (
                <tr>
                  <td>
                    <input
                      type="text"
                      value={newTask.className}
                      onChange={(e) => {
                        console.log("Updating className:", e.target.value);
                        setNewTask({ ...newTask, className: e.target.value });
                      }}
                      placeholder="Class Name"
                      className="w-full p-2 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newTask.assignment}
                      onChange={(e) => {
                        console.log("Updating assignment:", e.target.value);
                        setNewTask({ ...newTask, assignment: e.target.value });
                      }}
                      placeholder="Assignment"
                      className="w-full p-2 border rounded"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newTask.description}
                      onChange={(e) => {
                        console.log("Updating description:", e.target.value);
                        setNewTask({ ...newTask, description: e.target.value });
                      }}
                      placeholder="Description"
                      className="w-full p-2 border rounded"
                    />
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-36 justify-between font-normal"
                          type="button"
                        >
                          {newTask.status.charAt(0).toUpperCase() +
                            newTask.status.slice(1)}
                          <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() =>
                            setNewTask({ ...newTask, status: "pending" })
                          }
                        >
                          Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setNewTask({ ...newTask, status: "in-progress" })
                          }
                        >
                          In-Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setNewTask({ ...newTask, status: "completed" })
                          }
                        >
                          Completed
                        </DropdownMenuItem>
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
                          <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            newTask.deadline
                              ? new Date(newTask.deadline)
                              : undefined
                          }
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            setNewTask({
                              ...newTask,
                              deadline: date
                                ? date.toISOString().split("T")[0]
                                : "",
                            });
                            setCalendarOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-36 justify-between font-normal"
                          type="button"
                        >
                          {newTask.priority.charAt(0).toUpperCase() +
                            newTask.priority.slice(1)}
                          <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() =>
                            setNewTask({ ...newTask, priority: "low" })
                          }
                        >
                          Low
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setNewTask({ ...newTask, priority: "medium" })
                          }
                        >
                          Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setNewTask({ ...newTask, priority: "high" })
                          }
                        >
                          High
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="task-actions">
                    <button
                      onClick={() => {
                        console.log("Add button clicked!");
                        console.log("Current newTask state:", newTask);
                        handleAddTask();
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowNewRow(false)}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Task Button */}
      {!showNewRow && (
        <button
          className="new-task-button mt-6"
          onClick={() => {
            console.log("🔘 New Task button clicked!");
            console.log("Current showNewRow state:", showNewRow);
            setShowNewRow(true);
            console.log("Set showNewRow to true");
          }}
        >
          + New Task
        </button>
      )}
    </div>
  );
}
