import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const DoctorSchedule = () => {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/doctors?userId=${user.id}`);
      const doctors = await response.json();
      
      if (doctors.length > 0) {
        const doctorData = doctors[0];
        setDoctor(doctorData);
        setAvailableSlots(doctorData.availableSlots || []);
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaySchedule = (day) => {
    return availableSlots.find(slot => slot.day === day);
  };

  const toggleTimeSlot = (day, time) => {
    const updatedSlots = [...availableSlots];
    const dayIndex = updatedSlots.findIndex(slot => slot.day === day);
    
    if (dayIndex === -1) {
      // Add new day
      updatedSlots.push({
        day,
        times: [time]
      });
    } else {
      // Toggle time for existing day
      const times = [...updatedSlots[dayIndex].times];
      const timeIndex = times.indexOf(time);
      
      if (timeIndex === -1) {
        times.push(time);
        times.sort(); // Keep times sorted
      } else {
        times.splice(timeIndex, 1);
      }
      
      if (times.length === 0) {
        // Remove day if no times selected
        updatedSlots.splice(dayIndex, 1);
      } else {
        updatedSlots[dayIndex].times = times;
      }
    }
    
    setAvailableSlots(updatedSlots);
  };

  const isTimeSelected = (day, time) => {
    const daySchedule = getDaySchedule(day);
    return daySchedule ? daySchedule.times.includes(time) : false;
  };

  const saveSchedule = async () => {
    try {
      const response = await fetch(`http://localhost:5000/doctors/${doctor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availableSlots: availableSlots
        }),
      });

      if (response.ok) {
        setMessage('Schedule saved successfully!');
        fetchDoctorData(); // Refresh data
      } else {
        setMessage('Failed to save schedule. Please try again.');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      setMessage('Failed to save schedule. Please try again.');
    }
  };

  const selectAllTimes = (day) => {
    const updatedSlots = [...availableSlots];
    const dayIndex = updatedSlots.findIndex(slot => slot.day === day);
    
    if (dayIndex === -1) {
      updatedSlots.push({
        day,
        times: [...timeSlots]
      });
    } else {
      updatedSlots[dayIndex].times = [...timeSlots];
    }
    
    setAvailableSlots(updatedSlots);
  };

  const clearDay = (day) => {
    const updatedSlots = availableSlots.filter(slot => slot.day !== day);
    setAvailableSlots(updatedSlots);
  };

  if (loading) {
    return (
      <div style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            width: '32px',
            height: '32px',
            border: '2px solid #e5e7eb',
            borderBottom: '2px solid #2563eb',
            borderRadius: '50%'
          }}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Manage Schedule</h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Set your availability and time slots for appointments.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          marginBottom: '16px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: message.includes('success') ? '#ecfdf5' : '#fef2f2',
          color: message.includes('success') ? '#065f46' : '#991b1b',
          border: `1px solid ${message.includes('success') ? '#a7f3d0' : '#fecaca'}`
        }}>
          {message}
        </div>
      )}

      {/* Quick Actions */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>Schedule Overview</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Manage your weekly availability</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" size="small" onClick={saveSchedule}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Weekly Schedule */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {days.map((day) => (
          <Card key={day.key}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{day.label}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => selectAllTimes(day.key)}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => clearDay(day.key)}
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: '8px'
            }}>
              {timeSlots.map((time) => {
                const isSelected = isTimeSelected(day.key, time);
                return (
                  <button
                    key={time}
                    onClick={() => toggleTimeSlot(day.key, time)}
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: `1px solid ${isSelected ? '#2563eb' : '#d1d5db'}`,
                      backgroundColor: isSelected ? '#2563eb' : 'white',
                      color: isSelected ? 'white' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#9ca3af';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            
            <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
              Selected: {getDaySchedule(day.key)?.times?.length || 0} time slots
            </div>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
        <Button onClick={saveSchedule} size="large">
          Save Complete Schedule
        </Button>
      </div>
    </div>
  );
};

export default DoctorSchedule;