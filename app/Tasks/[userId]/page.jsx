"use client";
import { useEffect, useState } from "react";
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
  // Filter states
  const [filterClassName, setFilterClassName] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editCalendarOpen, setEditCalendarOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `https://capstone-2-backend-seven.vercel.app/api/tasks/${userId}`
      );
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
      await axios.delete(
        `https://capstone-2-backend-seven.vercel.app/api/tasks/${userId}/${taskId}`
      );
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleAddTask = async () => {
    try {
      const res = await axios.post(
        `https://capstone-2-backend-seven.vercel.app/api/tasks/${userId}`,
        newTask
      );
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
      await axios.put(
        `https://capstone-2-backend-seven.vercel.app/api/tasks/${userId}/${editTask.id}`,
        editTask
      );
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  //   const handleStatusChange = async (taskId, newStatus) => {
  //   try {
  //     await axios.patch(`https://capstone-2-backend-seven.vercel.app/api/tasks/${userId}/${taskId}`, { status: newStatus });
  //     fetchTasks(); // Refresh the list
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //   }
  // };

  // Filtering logic
  const filteredTasks = tasks.filter(
    (task) =>
      task.className.toLowerCase().includes(filterClassName.toLowerCase()) &&
      (filterStatus ? task.status === filterStatus : true) &&
      (filterPriority ? task.priority === filterPriority : true)
  );

  return (
    <div className="task-container">
      <h1>Your Tasks (User {userId})</h1>
      {/* Filter UI */}
      <div className="flex gap-4 mb-4">
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
              <ChevronDownIcon />
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
              <ChevronDownIcon />
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
      </div>
      {filteredTasks.length === 0 ? (
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
            {filteredTasks.map((task) =>
              editTask && editTask.id === task.id ? (
                <tr key={task.id}>
                  <td>
                    <input
                      name="className"
                      value={editTask.className}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="assignment"
                      value={editTask.assignment}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      name="description"
                      value={editTask.description}
                      onChange={handleEditChange}
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
                          <ChevronDownIcon />
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
                            setEditTask({ ...editTask, status: "in-progress" })
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
                          <ChevronDownIcon />
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
                          <ChevronDownIcon />
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
                  <td>
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
                      : ""}
                  </td>
                  <td>{task.priority}</td>
                  <td className="task-actions">
                    <button onClick={() => setEditTask(task)}>Edit</button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
            {showNewRow && (
              <tr>
                <td>
                  <input
                    type="text"
                    value={newTask.className}
                    onChange={(e) =>
                      setNewTask({ ...newTask, className: e.target.value })
                    }
                    placeholder="Class Name"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newTask.assignment}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assignment: e.target.value })
                    }
                    placeholder="Assignment"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    placeholder="Description"
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
                        <ChevronDownIcon />
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
                        <ChevronDownIcon />
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
                        <ChevronDownIcon />
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
