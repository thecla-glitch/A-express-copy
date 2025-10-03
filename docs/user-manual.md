# A-express User Manual

Welcome to the A-express application! This manual will guide you through the features and functionalities available to you based on your assigned role.

## Table of Contents

1.  [Introduction](#introduction)
2.  [Getting Started](#getting-started)
3.  [Roles and Responsibilities](#roles-and-responsibilities)
    - [Front Desk](#front-desk)
    - [Manager](#manager)
    - [Technician](#technician)
4.  [Use Cases and Workflows](#use-cases-and-workflows)
    - [Front Desk Workflows](#front-desk-workflows)
    - [Technician Workflows](#technician-workflows)
    - [Manager Workflows](#manager-workflows)

---

## Introduction

A-express is a comprehensive workshop management solution designed to streamline your workflow, from customer intake to task completion. This manual details the responsibilities and capabilities of each role within the system: **Front Desk**, **Manager**, and **Technician**.

---

## Getting Started

To begin, log in to the application using your provided credentials. Your dashboard will be tailored to your specific role, providing you with the tools and information you need to perform your duties efficiently.

---

## Roles and Responsibilities

### Front Desk

As the first point of contact for customers, the Front Desk role is crucial for managing the flow of tasks and ensuring a smooth customer experience.

#### Key Responsibilities:

- **Customer and Task Intake:**
    - Greet customers and accurately record their service requests.
    - Create new tasks in the system, assigning them to the appropriate customer and capturing all necessary details.
- **Task Management:**
    - Monitor the status of all tasks, from creation to completion.
    - Keep customers informed about the progress of their tasks.
- **Customer Communication:**
    - Notify customers when their items are ready for pickup.
    - Handle customer inquiries and provide updates on their service requests.

#### Navigating the Front Desk Dashboard:

Your dashboard provides a real-time overview of all tasks, with a focus on those requiring your attention. You can:

- **Create a New Task:** Navigate to the "New Task" section to create a new service request.
- **View All Tasks:** See a comprehensive list of all tasks in the system, with filtering options to view tasks by status (e.g., "In Progress," "Completed," "Ready for Pickup").
- **Manage Pickups:** Access the "Ready for Pickup" list to manage customer pickups and mark tasks as "Picked Up" once the customer has collected their item.
- **Send Customer Updates:** Use the integrated communication tools to send notifications and updates to customers directly from the task details page.

---

### Manager

The Manager role has the highest level of access and is responsible for overseeing all aspects of the workshop's operations, from user management to financial tracking.

#### Key Responsibilities:

- **User Management:**
    - Add, edit, and remove user accounts for all roles (Front Desk, Technician, and other Managers).
    - Assign and update roles and permissions for all users.
- **Task Oversight:**
    - View and manage all tasks within the system, regardless of their status or assignee.
    - Assign and reassign tasks to Technicians as needed.
    - Approve or reject completed tasks, with the ability to send tasks back to Technicians for further work.
    - Terminate tasks if necessary.
- **Brand and Location Management:**
    - Add, edit, and remove brands and locations from the system.
- **Financial and Reporting Oversight:**
    - Monitor the financial status of all tasks, including marking tasks as paid.
    - Access detailed reports on various aspects of the workshop's performance.

#### Navigating the Manager Dashboard:

The Manager Dashboard offers a comprehensive view of the entire system. From here, you can:

- **Manage Users:** Access the "Users" section to manage all user accounts.
- **Oversee Tasks:** Use the "Tasks" section to view and manage all tasks, with advanced filtering and search capabilities.
- **Manage Brands and Locations:** Navigate to the "Brands" and "Locations" sections to manage these system-wide settings.
- **View Reports:** Access the "Reports" section to view detailed analytics and generate custom reports on the workshop's performance.

---

### Technician

The Technician role is focused on the hands-on work of completing service requests. The Technician's view is tailored to display only the information relevant to their assigned tasks.

#### Key Responsibilities:

- **Task Execution:**
    - Complete assigned tasks efficiently and to a high standard of quality.
    - Update the status of tasks as they progress (e.g., from "Assigned" to "In Progress" to "Completed").
- **Task Management:**
    - View a personalized list of all tasks assigned to you.
    - Access detailed information for each task, including customer notes and service history.
- **Communication:**
    - Add notes to tasks to document your work and communicate with other team members.

#### Navigating the Technician Dashboard:

Your dashboard is designed to help you manage your workload effectively. You can:

- **View Assigned Tasks:** See a clear list of all tasks that are currently assigned to you.
- **Update Task Status:** Easily update the status of your tasks as you work on them.
- **View Completed Tasks:** Access a history of all the tasks you have completed.
- **Access Task Details:** Click on any task to view all the relevant details, including customer information, service requirements, and any notes from the Front Desk or Manager.

---

## Use Cases and Workflows

### Front Desk Workflows

**Use Case 1: New Customer Task Creation**

1.  **Customer Arrival**: A customer arrives at the workshop with an item for service.
2.  **Open New Task Form**: The Front Desk user navigates to the "New Task" page.
3.  **Enter Customer and Item Details**: The user fills in the customer's information (or selects an existing customer) and the details of the item requiring service, including the make and model.
4.  **Describe the Issue**: The user records the customer's description of the problem or the service requested.
5.  **Create Task**: The user saves the form, which creates a new task in the "Unassigned" or "Awaiting Triage" state.

**Use Case 2: Managing Task Handoff to Technician**

1.  **Monitor Unassigned Tasks**: The Front Desk user monitors the list of unassigned tasks.
2.  **Assign Task**: The Front Desk user (or Manager) assigns the task to a specific Technician based on their workload and expertise.
3.  **Notify Technician**: The system automatically notifies the Technician of the new assignment.

**Use Case 3: Customer Communication and Pickup**

1.  **Monitor Task Status**: The Front Desk user monitors the status of tasks and sees when a Technician has marked a task as "Completed."
2.  **Verify Completion**: The user may perform a quality check or verify the work done.
3.  **Notify Customer**: The user notifies the customer that their item is ready for pickup.
4.  **Process Pickup**: When the customer arrives, the user finds the task, confirms the customer's identity, and hands over the item.
5.  **Mark as Picked Up**: The user updates the task status to "Picked Up" in the system.

### Technician Workflows

**Use Case 1: Starting a New Task**

1.  **View Assigned Tasks**: The Technician logs in and views their dashboard, which shows a list of tasks assigned to them.
2.  **Select a Task**: The Technician selects a task from the list to begin working on it.
3.  **Review Task Details**: The Technician reviews the task details, including the customer's reported issue and any notes from the Front Desk.
4.  **Update Status to "In Progress"**: The Technician updates the task status to "In Progress" to indicate that they have started the work.

**Use Case 2: Completing a Task**

1.  **Perform Service**: The Technician performs the necessary service or repair on the item.
2.  **Add Notes**: The Technician adds notes to the task, detailing the work performed, any parts used, and any other relevant information.
3.  **Update Status to "Completed"**: Once the work is finished, the Technician updates the task status to "Completed."
4.  **Await Approval**: The task is now ready for review by the Front Desk or Manager.

**Use Case 3: Handling a Returned Task**

1.  **Receive Returned Task**: If the Front Desk or Manager rejects a completed task, the Technician receives a notification.
2.  **Review Feedback**: The Technician reviews the feedback and notes from the Front Desk or Manager explaining why the task was returned.
3.  **Perform Additional Work**: The Technician performs the required additional work.
4.  **Resubmit for Approval**: The Technician updates the task status back to "Completed" for re-approval.

### Manager Workflows

**Use Case 1: User Management**

1.  **Access User Management**: The Manager navigates to the "User Management" section of the application.
2.  **Add a New User**: The Manager clicks "Add User" and fills in the new user's details, including their name, email, and role (Front Desk, Technician, or Manager).
3.  **Edit or Remove User**: The Manager can select an existing user to edit their details or remove them from the system.

**Use Case 2: Task Oversight and Assignment**

1.  **View All Tasks**: The Manager accesses the main task dashboard to view all tasks in the system, regardless of status or assignee.
2.  **Filter and Search**: The Manager uses filters to view specific subsets of tasks (e.g., all tasks for a particular Technician, all overdue tasks).
3.  **Assign/Reassign Tasks**: The Manager can assign unassigned tasks to Technicians or reassign tasks between Technicians as needed to balance workloads.

**Use Case 3: Financial and Performance Reporting**

1.  **Access Reports**: The Manager navigates to the "Reports" section.
2.  **View Standard Reports**: The Manager can view standard reports, such as revenue reports, task completion rates, and technician performance metrics.
3.  **Generate Custom Reports**: The Manager can use the custom report builder to create reports with specific data points and filters to gain deeper insights into the workshop's operations.

**Use Case 4: Brand Management**

1.  **Access Brand Management**: The Manager navigates to the "Brand Management" section.
2.  **Add a New Brand**: The Manager clicks "Add Brand" and enters the name of a new brand that the workshop services.
3.  **Edit or Remove Brand**: The Manager can select an existing brand to edit its name or remove it from the system.