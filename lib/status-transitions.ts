import { User } from './use-user-management';

const transitions = {
  'Front Desk': {
    'Completed': ['Ready for Pickup'],
    'Ready for Pickup': ['Picked Up'],
    'Pending': ['Cancelled'],
    'In Progress': ['Cancelled'],
    'Awaiting Parts': ['Cancelled'],
  },
  'Technician': {
    'Pending': ['In Progress'],
    'In Progress': ['Awaiting Parts', 'Completed'],
    'Awaiting Parts': ['In Progress'],
  },
  'Manager': {
  },
};

export const getAllowedStatusTransitions = (role: User["role"], currentStatus: string): string[] => {
  if (role === 'Manager') {
    // Managers can transition to any status
    return Object.values(transitions).reduce((acc, val) => acc.concat(Object.keys(val)), []);
  }

  const roleTransitions = transitions[role];
  if (!roleTransitions) {
    return [];
  }

  return roleTransitions[currentStatus] || [];
};
