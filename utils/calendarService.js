// Google Calendar Integration Service - PRODUCTION MODE
import api from "./api";

class CalendarService {
  // Helper function to validate if a date is valid
  static isValidDate(dateString) {
    if (!dateString) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Helper function to format date properly for calendar events
  static formatDateForCalendar(deadline, timeString) {
    try {
      if (!deadline) {
        throw new Error("No deadline provided");
      }

      // Get the date part (YYYY-MM-DD format)
      let dateOnly;
      if (deadline instanceof Date) {
        dateOnly = deadline.toISOString().split("T")[0];
      } else if (typeof deadline === "string") {
        dateOnly = deadline.split("T")[0]; // Get just the date part
      } else {
        dateOnly = new Date(deadline).toISOString().split("T")[0];
      }

      // Parse the time (format: "HH:MM:SS" or "HH:MM")
      const timeParts = timeString.split(":");
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

      // Create a proper Date object in local time
      const [year, month, day] = dateOnly
        .split("-")
        .map((num) => parseInt(num, 10));
      const date = new Date(year, month - 1, day, hours, minutes, seconds); // month is 0-indexed

      // Validate the date
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${deadline} with time ${timeString}`);
      }

      return date.toISOString();
    } catch (error) {
      console.error("Error formatting date for calendar:", error);
      // Return a default date (tomorrow at the specified time) as fallback
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const timeParts = timeString.split(":");
      const hours = parseInt(timeParts[0], 10) || 9;
      const minutes = parseInt(timeParts[1], 10) || 0;
      tomorrow.setHours(hours, minutes, 0, 0);
      return tomorrow.toISOString();
    }
  }

  // Create a calendar event for a task deadline
  static async createTaskReminder(task) {
    try {
      // Validate that task has required fields
      if (!task) {
        throw new Error("Task object is required");
      }

      if (!task.deadline) {
        throw new Error("Task deadline is required for calendar reminder");
      }

      if (!this.isValidDate(task.deadline)) {
        throw new Error(`Invalid deadline format: ${task.deadline}`);
      }

      if (!task.assignment) {
        throw new Error("Task assignment is required for calendar reminder");
      }

      console.log("Creating calendar reminder for task:", task);
      console.log("Task deadline input:", task.deadline);
      console.log("Making API call to:", `/api/calendar/sync-task/${task.id}`);

      // Prepare calendar event data for the backend
      const startTime = this.formatDateForCalendar(task.deadline, "09:00:00");
      const endTime = this.formatDateForCalendar(task.deadline, "10:00:00");

      console.log("Formatted startTime:", startTime);
      console.log("Formatted endTime:", endTime);

      const calendarEventData = {
        summary: `📝 Task Due: ${task.assignment}`,
        description: `Task: ${task.assignment}\nDue: ${
          task.deadline
        }\nPriority: ${
          task.priority || "medium"
        }\n\nCreated via LockIn Task Manager`,
        startTime: startTime,
        endTime: endTime,
        colorId: this.getPriorityColor(task.priority),
        // Google Calendar notification settings
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 1440 }, // 1 day before
            { method: "email", minutes: 10 }, // 10 minutes before
            { method: "popup", minutes: 60 }, // 1 hour before
          ],
        },
      };

      console.log("Sending calendar event data:", calendarEventData);

      // Use the backend's sync-task endpoint with proper request body
      const response = await api.post(
        `/api/calendar/sync-task/${task.id}`,
        calendarEventData
      );

      console.log("Calendar sync successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Full calendar error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
      });

      // Check if this is a 404 or 400 error (backend endpoint not implemented)
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log(
          "📅 Calendar API endpoints not implemented yet - skipping calendar reminder"
        );
        throw new Error("Calendar API not available");
      }

      // Handle 500 errors (backend internal error)
      if (error.response?.status === 500) {
        console.error(
          "📅 Backend calendar service error - calendar reminder skipped"
        );
        throw new Error("Calendar service temporarily unavailable");
      }

      console.error("Error creating calendar reminder:", error);
      throw error;
    }
  }

  // Update calendar event when task is modified
  static async updateTaskReminder(task, calendarEventId) {
    try {
      // Prepare updated calendar event data
      const startTime = this.formatDateForCalendar(task.deadline, "09:00:00");
      const endTime = this.formatDateForCalendar(task.deadline, "10:00:00");

      const calendarEventData = {
        summary: `📝 Task Due: ${task.assignment}`,
        description: `Task: ${task.assignment}\nDue: ${
          task.deadline
        }\nPriority: ${
          task.priority || "medium"
        }\n\nUpdated via LockIn Task Manager`,
        startTime: startTime,
        endTime: endTime,
        colorId: this.getPriorityColor(task.priority),
        // Google Calendar notification settings
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 1440 }, // 1 day before
            { method: "email", minutes: 10 }, // 10 minutes before
            { method: "popup", minutes: 60 }, // 1 hour before
          ],
        },
      };

      console.log("Updating calendar event with data:", calendarEventData);

      // For updates, we use the same sync endpoint with updated data
      const response = await api.post(
        `/api/calendar/sync-task/${task.id}`,
        calendarEventData
      );

      return response.data;
    } catch (error) {
      // Check if this is a 404 or 400 error (backend endpoint not implemented)
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log(
          "📅 Calendar API endpoints not implemented yet - skipping calendar update"
        );
        throw new Error("Calendar API not available");
      }

      console.error("Error updating calendar reminder:", error);
      throw error;
    }
  }

  // Delete calendar event when task is deleted
  static async deleteTaskReminder(task) {
    try {
      // Use the task ID for the delete endpoint
      await api.delete(`/api/calendar/sync-task/${task.id}`);
    } catch (error) {
      // Check if this is a 404 or 400 error (backend endpoint not implemented)
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log(
          "📅 Calendar API endpoints not implemented yet - skipping calendar deletion"
        );
        return; // Don't throw error for delete operations when API not available
      }

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
      const response = await api.get("/api/calendar/permissions");
      return response.data.hasPermissions;
    } catch (error) {
      // Check if this is a 404 or 400 error (backend endpoint not implemented)
      if (error.response?.status === 404 || error.response?.status === 400) {
        console.log(
          "📅 Calendar API endpoints not implemented yet - calendar features disabled"
        );
        return false;
      }

      console.error("Error checking calendar permissions:", error);
      return false;
    }
  }

  // Request additional calendar permissions
  static requestCalendarPermissions() {
    // Redirect to backend calendar OAuth with a calendar-specific parameter
    window.location.href =
      "http://localhost:8080/auth/google/calendar?redirect=tasks";
  }
}

export default CalendarService;
