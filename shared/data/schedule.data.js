// Schedule & Calendar Data
// Static data for teacher schedule management

export const viewOptions = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' }
]

export const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

export const defaultScheduleStats = [
  {
    id: 'today',
    label: "Today's Events",
    value: 3,
    icon: 'calendar'
  },
  {
    id: 'weekly',
    label: 'This Week',
    value: 12,
    icon: 'users'
  },
  {
    id: 'office',
    label: 'Office Hours',
    value: 8,
    icon: 'clock'
  },
  {
    id: 'requests',
    label: 'Pending Requests',
    value: 5,
    icon: 'phone'
  }
]

export const sampleEvents = [
  {
    id: 1,
    title: 'Web Development Fundamentals',
    type: 'class',
    date: '2024-10-27',
    startTime: '09:00',
    endTime: '11:00',
    participants: 25,
    location: 'Room 101',
    status: 'confirmed'
  },
  {
    id: 2,
    title: 'Office Hours',
    type: 'office-hours',
    date: '2024-10-27',
    startTime: '14:00',
    endTime: '16:00',
    participants: null,
    location: 'Office 205',
    status: 'available'
  },
  {
    id: 3,
    title: 'Student Project Review',
    type: 'meeting',
    date: '2024-10-28',
    startTime: '10:30',
    endTime: '11:30',
    participants: 3,
    location: 'Online - Zoom',
    status: 'confirmed'
  },
  {
    id: 4,
    title: 'JavaScript Advanced Concepts',
    type: 'class',
    date: '2024-10-29',
    startTime: '09:00',
    endTime: '11:00',
    participants: 20,
    location: 'Lab 102',
    status: 'confirmed'
  },
  {
    id: 5,
    title: 'Team Meeting',
    type: 'meeting',
    date: '2024-10-30',
    startTime: '15:00',
    endTime: '16:00',
    participants: 8,
    location: 'Conference Room A',
    status: 'confirmed'
  }
]

export const officeHoursTemplate = [
  { day: 'Monday', startTime: '14:00', endTime: '16:00', enabled: true },
  { day: 'Tuesday', startTime: '14:00', endTime: '16:00', enabled: true },
  { day: 'Wednesday', startTime: '14:00', endTime: '16:00', enabled: false },
  { day: 'Thursday', startTime: '14:00', endTime: '16:00', enabled: true },
  { day: 'Friday', startTime: '14:00', endTime: '16:00', enabled: true }
]

export const meetingTypes = [
  {
    id: 'office-hours',
    name: 'Office Hours',
    color: '#10b981',
    defaultDuration: 30,
    maxParticipants: 1
  },
  {
    id: 'class',
    name: 'Class Session',
    color: '#8b5cf6',
    defaultDuration: 120,
    maxParticipants: 50
  },
  {
    id: 'meeting',
    name: 'Meeting',
    color: '#3b82f6',
    defaultDuration: 60,
    maxParticipants: 10
  },
  {
    id: 'consultation',
    name: 'Student Consultation',
    color: '#f59e0b',
    defaultDuration: 45,
    maxParticipants: 5
  }
]