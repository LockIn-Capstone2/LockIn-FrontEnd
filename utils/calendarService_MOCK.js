// Google Calendar Integration Service - WITH MOCK TESTING
import api from "./api";

class CalendarService {
  // Create a calendar event for a task deadline
  static async createTaskReminder(task) {
    try {
      // 🧪 TEMPORARY: Mock for testing without backend
      if (process.env.NODE_ENV === "development") {
        console.log("🧪 MOCK: Creating calendar reminder for task:", task);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay
        return {
          id: "mock_event_" + Date.now(),
          htmlLink: "https://calendar.google.com/calendar/u/0/r/event?eid=mock",
        };
      }

      const eventData = {
        summary: `Assignment Due: ${task.assignment}`,
        description: `Class: ${task.className}\nAssignment: ${task.assignment}\nDescription: ${task.description}\nPriority: ${task.priority}`,
        start: {
          dateTime: new Date(task.deadline + "T09:00:00").toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(task.deadline + "T10:00:00").toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 1 day before
            { method: "popup", minutes: 60 }, // 1 hour before
            { method: "email", minutes: 10 }, // 10 minutes before
          ],
        },
        colorId: this.getPriorityColor(task.priority),
      };

      const response = await api.post("/api/calendar/events", {
        taskId: task.id,
        eventData,
      });

      return response.data;
    } catch (error) {
      console.error("Error creating calendar reminder:", error);
      throw error;
    }
  }

  // Update calendar event when task is modified
  static async updateTaskReminder(task, calendarEventId) {
    try {
      // 🧪 TEMPORARY: Mock for testing without backend
      if (process.env.NODE_ENV === "development") {
        console.log("🧪 MOCK: Updating calendar reminder for task:", task);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          id: calendarEventId,
          htmlLink: "https://calendar.google.com/calendar/u/0/r/event?eid=mock",
        };
      }

      const eventData = {
        summary: `Assignment Due: ${task.assignment}`,
        description: `Class: ${task.className}\nAssignment: ${task.assignment}\nDescription: ${task.description}\nPriority: ${task.priority}`,
        start: {
          dateTime: new Date(task.deadline + "T09:00:00").toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(task.deadline + "T10:00:00").toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: this.getPriorityColor(task.priority),
      };

      const response = await api.put(
        `/api/calendar/events/${calendarEventId}`,
        {
          taskId: task.id,
          eventData,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating calendar reminder:", error);
      throw error;
    }
  }

  // Delete calendar event when task is deleted
  static async deleteTaskReminder(calendarEventId) {
    try {
      // 🧪 TEMPORARY: Mock for testing without backend
      if (process.env.NODE_ENV === "development") {
        console.log("🧪 MOCK: Deleting calendar reminder:", calendarEventId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      }

      await api.delete(`/api/calendar/events/${calendarEventId}`);
    } catch (error) {
      console.error("Error deleting calendar reminder:", error);
      throw error;
    }
  }

  // Get color based on task priority
  static getPriorityColor(priority) {
    const colorMap = {
      high: "11", // Red
      medium: "5", // Yellow
      low: "10", // Green
    };
    return colorMap[priority] || "1"; // Default blue
  }

  // Check if user has granted calendar permissions
  static async checkCalendarPermissions() {
    try {
      // 🧪 TEMPORARY: Mock for testing without backend
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🧪 MOCK: Checking calendar permissions (backend not implemented)"
        );
        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay
        return false; // Change to true to test "connected" state
      }

      const response = await api.get("/api/calendar/permissions");
      return response.data.hasPermissions;
    } catch (error) {
      console.error("Error checking calendar permissions:", error);
      return false;
    }
  }

  // Request additional calendar permissions
  static requestCalendarPermissions() {
    // 🧪 TEMPORARY: Mock for testing without backend
    if (process.env.NODE_ENV === "development") {
      console.log("🧪 MOCK: Would request calendar permissions here");
      const proceed = confirm(
        "🧪 MOCK MODE: This would normally redirect to Google OAuth.\n\n" +
          "Backend route /auth/google/calendar not implemented yet.\n\n" +
          "Click OK to simulate successful connection (page will reload)."
      );
      if (proceed) {
        // Simulate successful connection by reloading
        window.location.reload();
      }
      return;
    }

    window.location.href = "http://localhost:8080/auth/google/calendar";
  }
}

export default CalendarService;
