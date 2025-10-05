
# Role-Based Access Control Documentation

This document outlines the roles and permissions for the A-express application. The application utilizes a role-based access control (RBAC) system to ensure that users only have access to the functionalities necessary for their roles.

The primary roles are:

- **Manager**
- **Front Desk**
- **Technician**

## Manager

Managers have the highest level of access in the application, aside from the administrator. They have full control over all aspects of the system, including user management, task management, and financial oversight.

### Key Responsibilities and Capabilities:

- **User Management:**
    - Add, edit, and remove users from the system.
    - Assign roles to users.
- **Task Management:**
    - Create, assign, and reassign tasks.
    - View all tasks, regardless of their status or assignee.
    - Approve or reject completed tasks.
    - Mark tasks as paid.
    - Terminate tasks.
    - Process task pickups.
- **Brand Management:**
    - Add, edit, and remove brands from the system.
- **Financial Oversight:**
    - View and manage payment statuses for tasks.
- **Dashboard Access:**
    - Access to the Manager Dashboard, which provides a comprehensive overview of all system activities.

## Front Desk

The Front Desk role is responsible for managing the customer-facing aspects of the workshop. They are the first point of contact for customers and are responsible for managing the flow of tasks into and out of the workshop.

### Key Responsibilities and Capabilities:

- **Task Creation:**
    - Create new tasks for customers.
- **Task Management:**
    - View all tasks that are not yet completed.
    - View tasks that are ready for pickup.
    - Approve completed tasks.
    - Reject completed tasks and send them back to the technician with notes.
    - Notify customers when their tasks are ready for pickup.
    - Mark tasks as "Picked Up".
- **Dashboard Access:**
    - Access to the Front Desk Dashboard, which provides an overview of tasks that need to be managed.

## Technician

Technicians are responsible for carrying out the repair and maintenance tasks. They have a focused view of the system, which is limited to the tasks that are assigned to them.

### Key Responsibilities and Capabilities:

- **Task Management:**
    - View tasks that are assigned to them.
    - View tasks that are currently in the workshop.
    - View their completed tasks.
    - Update the status of their tasks (e.g., "In Progress", "Completed").
- **Dashboard Access:**
    - Access to the Technician Dashboard, which displays their assigned tasks and their status.
