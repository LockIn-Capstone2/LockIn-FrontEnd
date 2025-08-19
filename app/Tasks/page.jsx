"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
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
import CalendarService from "@/utils/calendarService";
import { CalendarNotification } from "@/components/CalendarNotification";
import "./tasks.css";

export default function TasksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewRow, setShowNewRow] = useState(false);
  const [editTask, setEditTask] = useState(null);
  // Calendar integration state
  const [calendarEnabled, setCalendarEnabled] = useState(false);
  const [calendarPermissions, setCalendarPermissions] = useState(false);
  const [showCalendarNotification, setShowCalendarNotification] = useState(true);
  
  const [newTask, setNewTask] = useState({
    className: "",
    assignment: "",
    description: "",
    status: "pending", // Match ENUM exactly
    deadline: "",
    priority: "medium",
    // Add calendar reminder option
    createReminder: true,
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
      checkCalendarPermissions();
    }
  }, [user]);

  // Handle calendar success parameter from OAuth redirect
  useEffect(() => {
    const calendarSuccess = searchParams.get('calendar_success');
    
    if (calendarSuccess === 'permissions_granted') {
      // Show success message
      alert('✅ Google Calendar connected successfully! You can now create calendar reminders for your tasks.');
      
      // Clear the URL parameter
      const url = new URL(window.location);
      url.searchParams.delete('calendar_success');
      window.history.replaceState({}, document.title, url.pathname);
      
      // Refresh calendar permissions
      checkCalendarPermissions();
    }
  }, [searchParams]);

  // Check if user has granted calendar permissions
  const checkCalendarPermissions = async () => {
    try {
      const hasPermissions = await CalendarService.checkCalendarPermissions();
      setCalendarPermissions(hasPermissions);
      setCalendarEnabled(hasPermissions);
    } catch (error) {
      console.log("Calendar permissions check failed:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError('Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const taskToDelete = tasks.find(task => task.id === taskId);
      
      // Delete calendar reminder if it exists and user has permissions
      if (calendarEnabled && calendarPermissions && taskToDelete?.calendarEventId) {
        try {
          await CalendarService.deleteTaskReminder(taskToDelete);
          console.log("Calendar reminder deleted");
        } catch (calendarError) {
          console.error("Failed to delete calendar reminder:", calendarError);
        }
      }
      
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
      const createdTask = response.data;
      
      // Create calendar reminder if enabled, permissions granted, and deadline is set
      if (calendarEnabled && 
          calendarPermissions && 
          newTask.createReminder && 
          newTask.deadline && 
          newTask.deadline.trim() !== "" && 
          createdTask.deadline && 
          createdTask.deadline.trim() !== "") {
        try {
          console.log('Creating calendar reminder for task:', createdTask);
          const calendarEvent = await CalendarService.createTaskReminder(createdTask);
          console.log("Calendar reminder created:", calendarEvent);
        } catch (calendarError) {
          console.error("Failed to create calendar reminder:", calendarError);
          
          // Show detailed error for debugging
          const errorDetails = calendarError.response ? 
            `Status: ${calendarError.response.status}, Message: ${calendarError.response.data?.error || calendarError.message}` :
            calendarError.message;
          
          // Show user-friendly message for calendar errors
          if (calendarError.message.includes("temporarily unavailable")) {
            setError(`Task created successfully, but calendar reminder failed. Backend Error: ${errorDetails}`);
          } else if (calendarError.message.includes("not available")) {
            console.log("Calendar API not available - continuing without reminder");
          } else {
            setError(`Task created successfully, but calendar reminder failed. Error: ${errorDetails}`);
          }
          
          // Clear error after 10 seconds for debugging
          setTimeout(() => setError(""), 10000);
        }
      }
      
      setTasks([...tasks, createdTask]);
      setShowNewRow(false);
      setNewTask({
        className: "",
        assignment: "",
        description: "",
        status: "pending",
        deadline: "",
        priority: "medium",
        createReminder: true,
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
      const updatedTask = response.data;
      
      // Update calendar reminder if task has one, deadline changed, and user has permissions
      if (calendarEnabled && calendarPermissions && updatedTask.calendarEventId && editTask.deadline) {
        try {
          await CalendarService.updateTaskReminder(updatedTask);
          console.log("Calendar reminder updated");
        } catch (calendarError) {
          console.error("Failed to update calendar reminder:", calendarError);
        }
      }
      
      setTasks(tasks.map(task => task.id === editTask.id ? updatedTask : task));
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
        
        {/* Calendar Integration Status */}
        <div className="mt-2 flex items-center gap-2">
          {calendarPermissions ? (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                📅 Google Calendar Connected
              </span>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={calendarEnabled}
                  onChange={(e) => setCalendarEnabled(e.target.checked)}
                  className="w-3 h-3"
                />
                Auto-create reminders
              </label>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => CalendarService.requestCalendarPermissions()}
              className="text-xs"
            >
              🔗 Connect Google Calendar for Reminders
            </Button>
          )}
        </div>
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

      {/* Calendar Integration Notification */}
      {showCalendarNotification && !calendarPermissions && (
        <CalendarNotification onDismiss={() => setShowCalendarNotification(false)} />
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
                                // Set deadline to end of day (11:59 PM) to make it clear this is a full-day deadline
                                const deadlineWithTime = date ? 
                                  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString() : 
                                  "";
                                setEditTask({ ...editTask, deadline: deadlineWithTime });
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
                      <td>
                        <div className="flex items-center gap-1">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                          {task.calendarEventId && (
                            <span title="Calendar reminder set">📅</span>
                          )}
                        </div>
                      </td>
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
                              // Set deadline to end of day (11:59 PM) to make it clear this is a full-day deadline
                              const deadlineWithTime = date ? 
                                new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString() : 
                                "";
                              setNewTask({ ...newTask, deadline: deadlineWithTime });
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
                      <div className="flex flex-col gap-2">
                        {calendarEnabled && newTask.deadline && (
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={newTask.createReminder}
                              onChange={(e) => setNewTask({ ...newTask, createReminder: e.target.checked })}
                              className="w-3 h-3"
                            />
                            📅 Reminder
                          </label>
                        )}
                        <div className="flex gap-1">
                          <button onClick={handleAddTask}>Add</button>
                          <button onClick={() => setShowNewRow(false)}>Cancel</button>
                        </div>
                      </div>
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

