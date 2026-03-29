import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from '../config/api';

const MeetCounselor = () => {
  const { isLoggedIn, userEmail } = useAuth();
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showBooking, setShowBooking] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const counselors = [
    {
      id: 1,
      name: 'Dr Babu Rangarajan t',
      title: 'Clinical Psychologis',
      specialty: 'anxiety',
      specialties: ['Anxiety & Stress', 'Depression', 'Mindfulness'],
      sessionTypes: ['video', 'phone', 'in-person'],
      availability: ['morning', 'afternoon'],
      rating: 4.9,
      reviews: 127,
      experience: '8 years',
      price: '$150/hour',
      bio: 'Specializes in anxiety disorders and stress management with a focus on evidence-based treatments.',
      image: 'counselor1.jpeg',
      languages: ['English', 'Tamil']
    },
    {
      id: 2,
      name: 'DrRoja Ramani',
      title: 'Clinical Psychologis',
      specialty: 'relationships',
      specialties: ['Relationships', 'Couples Therapy', 'Family Dynamics'],
      sessionTypes: ['video', 'chat', 'in-person'],
      availability: ['afternoon', 'evening'],
      rating: 4.8,
      reviews: 89,
      experience: '12 years',
      price: '$140/hour',
      bio: 'Expert in relationship counseling and helping couples build stronger connections.',
      image: 'counselor2.jpeg',
      languages: ['English', 'Tamil']
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      title: 'Trauma Specialist',
      specialty: 'trauma',
      specialties: ['Trauma & PTSD', 'EMDR Therapy', 'Grief Counseling'],
      sessionTypes: ['video', 'phone'],
      availability: ['morning', 'afternoon', 'evening'],
      rating: 4.9,
      reviews: 156,
      experience: '10 years',
      price: '$160/hour',
      bio: 'Certified EMDR therapist specializing in trauma recovery and healing.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      languages: ['English', 'Spanish']
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      title: 'Addiction Counselor',
      specialty: 'addiction',
      specialties: ['Addiction Recovery', 'Substance Abuse', 'Behavioral Therapy'],
      sessionTypes: ['video', 'phone', 'chat', 'in-person'],
      availability: ['morning', 'afternoon', 'evening', 'late-night'],
      rating: 4.7,
      reviews: 203,
      experience: '15 years',
      price: '$130/hour',
      bio: 'Experienced addiction counselor with 24/7 availability for crisis support.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
      languages: ['English']
    },
    {
      id: 5,
      name: 'Dr. Lisa Thompson',
      title: 'Cognitive Behavioral Therapist',
      specialty: 'depression',
      specialties: ['Depression', 'CBT', 'Anxiety & Stress'],
      sessionTypes: ['video', 'chat'],
      availability: ['morning', 'afternoon'],
      rating: 4.8,
      reviews: 94,
      experience: '6 years',
      price: '$145/hour',
      bio: 'Specializes in CBT techniques for depression and anxiety management.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      languages: ['English', 'French']
    },
    {
      id: 6,
      name: 'Dr. Michael Park',
      title: 'Child & Adolescent Psychologist',
      specialty: 'anxiety',
      specialties: ['Child Psychology', 'Teen Counseling', 'Family Therapy'],
      sessionTypes: ['video', 'in-person'],
      availability: ['afternoon', 'evening'],
      rating: 4.9,
      reviews: 78,
      experience: '9 years',
      price: '$155/hour',
      bio: 'Dedicated to helping children and teenagers navigate mental health challenges.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      languages: ['English', 'Korean']
    }
  ];

  const filteredCounselors = counselors.filter(counselor => {
    if (specialtyFilter && counselor.specialty !== specialtyFilter) return false;
    if (sessionTypeFilter && !counselor.sessionTypes.includes(sessionTypeFilter)) return false;
    if (availabilityFilter && !counselor.availability.includes(availabilityFilter)) return false;
    return true;
  });

  const handleBookSession = (counselor) => {
    if (!isLoggedIn) {
      alert('Please log in to book a session.');
      return;
    }
    setSelectedCounselor(counselor);
    setShowBooking(true);
  };

  const handleViewProfile = (counselor) => {
    setSelectedCounselor(counselor);
    setShowProfile(true);
  };

  // API functions
  const createBooking = async (bookingData) => {
    try {
      const response = await fetch(apiUrl('/api/bookings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  };

  const fetchUserBookings = async (email) => {
    try {
      const response = await fetch(apiUrl(`/api/bookings/${email}`));
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const response = await fetch(apiUrl(`/api/bookings/${bookingId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      const response = await fetch(apiUrl(`/api/bookings/${bookingId}`), {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      alert('Please log in to book a session.');
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData(e.target);
    const bookingData = {
      userEmail: userEmail,
      counselorId: selectedCounselor.id,
      counselorName: selectedCounselor.name,
      counselorTitle: selectedCounselor.title,
      counselorImage: selectedCounselor.image,
      preferredDate: formData.get('date'),
      preferredTime: formData.get('time'),
      contactEmail: formData.get('email'),
      contactPhone: formData.get('phone'),
      message: formData.get('message'),
      sessionType: 'video', // Default to video, can be made dynamic
      price: selectedCounselor.price
    };

    try {
      await createBooking(bookingData);
      alert('Booking confirmed! You will receive a confirmation email shortly.');
      setShowBooking(false);
      setSelectedCounselor(null);
      // Refresh bookings if showing my bookings
      if (showMyBookings) {
        const bookings = await fetchUserBookings(userEmail);
        setUserBookings(bookings);
      }
    } catch (error) {
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMyBookings = async () => {
    if (!isLoggedIn) {
      alert('Please log in to view your bookings.');
      return;
    }
    
    setLoading(true);
    try {
      const bookings = await fetchUserBookings(userEmail);
      setUserBookings(bookings);
      setShowMyBookings(true);
    } catch (error) {
      alert('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        const bookings = await fetchUserBookings(userEmail);
        setUserBookings(bookings);
        alert('Booking cancelled successfully.');
      } catch (error) {
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await deleteBooking(bookingId);
        const bookings = await fetchUserBookings(userEmail);
        setUserBookings(bookings);
        alert('Booking deleted successfully.');
      } catch (error) {
        alert('Failed to delete booking. Please try again.');
      }
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div style={{textAlign: 'center', marginBottom: '48px'}}>
          <h1 style={{fontSize: '48px', fontWeight: '700', marginBottom: '16px'}}>👨‍⚕️ Meet a Counselor</h1>
          <p style={{fontSize: '18px', color: 'var(--muted)'}}>
            Connect with licensed mental health professionals for personalized support
          </p>
          <div style={{marginTop: '24px'}}>
            <button 
              className="btn btn-primary"
              onClick={handleMyBookings}
              disabled={loading}
            >
              {loading ? 'Loading...' : '📅 My Bookings'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px'}}>
          <div>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Specialty</label>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '16px'
              }}
            >
              <option value="">All Specialties</option>
              <option value="anxiety">Anxiety & Stress</option>
              <option value="depression">Depression</option>
              <option value="trauma">Trauma & PTSD</option>
              <option value="relationships">Relationships</option>
              <option value="addiction">Addiction</option>
            </select>
          </div>

          <div>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Session Type</label>
            <select
              value={sessionTypeFilter}
              onChange={(e) => setSessionTypeFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '16px'
              }}
            >
              <option value="">All Types</option>
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="chat">Chat</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>

          <div>
            <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                background: 'var(--surface)',
                color: 'var(--text)',
                fontSize: '16px'
              }}
            >
              <option value="">All Times</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="late-night">Late Night</option>
            </select>
          </div>
        </div>

        {/* Counselor Cards */}
        <div className="cards" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'}}>
          {filteredCounselors.map((counselor) => (
            <div key={counselor.id} className="card" style={{padding: '20px', transition: 'all 0.3s ease', cursor: 'pointer'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                <img 
                  src={counselor.image} 
                  alt={counselor.name}
                  style={{width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--border)'}}
                />
                <div style={{flex: 1}}>
                  <h3 style={{margin: '0 0 4px', color: 'var(--text)'}}>{counselor.name}</h3>
                  <p style={{margin: '0 0 4px', color: 'var(--muted)', fontSize: '14px'}}>{counselor.title}</p>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px'}}>
                    <span style={{color: '#fbbf24'}}>⭐</span>
                    <span style={{fontWeight: '600'}}>{counselor.rating}</span>
                    <span style={{color: 'var(--muted)'}}>({counselor.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div style={{marginBottom: '12px'}}>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                  {counselor.specialties.map(spec => (
                    <span key={spec} style={{
                      background: 'var(--accent)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <p style={{margin: '0 0 12px', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.4'}}>
                {counselor.bio}
              </p>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '14px'}}>
                <div><strong>Experience:</strong> {counselor.experience}</div>
                <div><strong>Price:</strong> {counselor.price}</div>
                <div><strong>Languages:</strong> {counselor.languages.join(', ')}</div>
                <div><strong>Available:</strong> {counselor.availability.map(avail => avail.charAt(0).toUpperCase() + avail.slice(1)).join(', ')}</div>
              </div>

              <div style={{display: 'flex', gap: '8px'}}>
                <button 
                  className="btn btn-primary small"
                  style={{flex: 1, padding: '10px'}}
                  onClick={() => handleBookSession(counselor)}
                >
                  Book Session
                </button>
                <button 
                  className="btn btn-outline small"
                  style={{padding: '10px'}}
                  onClick={() => handleViewProfile(counselor)}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {showBooking && selectedCounselor && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            zIndex: 1000
          }}>
            <div style={{textAlign: 'center', marginBottom: '24px'}}>
              <h3 style={{margin: '0 0 8px'}}>Book Session with {selectedCounselor.name}</h3>
              <p style={{margin: 0, color: 'var(--muted)'}}>{selectedCounselor.specialization}</p>
            </div>

            <form onSubmit={submitBooking} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Preferred Date</label>
                <input
                  type="date"
                  name="date"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Preferred Time</label>
                <select
                  name="time"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Select a time</option>
                  <option value="morning">Morning (9AM-12PM)</option>
                  <option value="afternoon">Afternoon (12PM-5PM)</option>
                  <option value="evening">Evening (5PM-8PM)</option>
                </select>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Contact Information</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '16px',
                    marginBottom: '8px'
                  }}
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your phone number"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>Brief Message (Optional)</label>
                <textarea
                  name="message"
                  placeholder="Tell us about what you'd like to discuss..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating Booking...' : 'Send Booking Request'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => setShowBooking(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profile Modal */}
        {showProfile && selectedCounselor && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            overflowY: 'auto'
          }}>
            <div style={{
              position: 'relative',
              width: '90%',
              maxWidth: '800px',
              background: 'var(--surface)',
              borderRadius: '16px',
              padding: '24px',
              margin: '20px'
            }}>
              <button
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowProfile(false)}
              >
                &times;
              </button>

              <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px'}}>
                <img 
                  src={selectedCounselor.image} 
                  alt={selectedCounselor.name}
                  style={{width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--border)'}}
                />
                <div>
                  <h2 style={{margin: '0 0 8px', color: 'var(--text)'}}>{selectedCounselor.name}</h2>
                  <p style={{margin: '0 0 8px', color: 'var(--muted)', fontSize: '16px'}}>{selectedCounselor.title}</p>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <span style={{color: '#fbbf24', fontSize: '18px'}}>⭐</span>
                    <span style={{fontWeight: '600', fontSize: '18px'}}>{selectedCounselor.rating}</span>
                    <span style={{color: 'var(--muted)'}}>({selectedCounselor.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px'}}>
                <div>
                  <h3 style={{margin: '0 0 12px', color: 'var(--text)'}}>Specialties</h3>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                    {selectedCounselor.specialties.map(spec => (
                      <span key={spec} style={{
                        background: 'var(--accent)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '14px'
                      }}>
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{margin: '0 0 12px', color: 'var(--text)'}}>Session Types</h3>
                  <ul style={{margin: 0, paddingLeft: '20px'}}>
                    {selectedCounselor.sessionTypes.map(type => (
                      <li key={type} style={{marginBottom: '4px'}}>
                        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{marginBottom: '24px'}}>
                <h3 style={{margin: '0 0 12px', color: 'var(--text)'}}>About</h3>
                <p style={{margin: 0, color: 'var(--muted)', lineHeight: '1.6'}}>{selectedCounselor.bio}</p>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px'}}>
                <div><strong>Experience:</strong> {selectedCounselor.experience}</div>
                <div><strong>Price:</strong> {selectedCounselor.price}</div>
                <div><strong>Languages:</strong> {selectedCounselor.languages.join(', ')}</div>
                <div><strong>Availability:</strong> {selectedCounselor.availability.map(avail => avail.charAt(0).toUpperCase() + avail.slice(1)).join(', ')}</div>
              </div>

              <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowProfile(false);
                    setShowBooking(true);
                  }}
                >
                  Book Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Bookings Modal */}
        {showMyBookings && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            overflowY: 'auto'
          }}>
            <div style={{
              position: 'relative',
              width: '90%',
              maxWidth: '1000px',
              background: 'var(--surface)',
              borderRadius: '16px',
              padding: '24px',
              margin: '20px'
            }}>
              <button
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text)',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowMyBookings(false)}
              >
                &times;
              </button>

              <h2 style={{margin: '0 0 24px', color: 'var(--text)'}}>My Bookings</h2>
              
              {userBookings.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px', color: 'var(--muted)'}}>
                  <p>No bookings found. Book a session with a counselor to get started!</p>
                </div>
              ) : (
                <div style={{display: 'grid', gap: '16px'}}>
                  {userBookings.map((booking) => (
                    <div key={booking._id} style={{
                      background: 'var(--glass)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <img 
                        src={booking.counselorImage} 
                        alt={booking.counselorName}
                        style={{width: '60px', height: '60px', borderRadius: '50%', border: '2px solid var(--border)'}}
                      />
                      <div style={{flex: 1}}>
                        <h4 style={{margin: '0 0 8px', color: 'var(--text)'}}>{booking.counselorName}</h4>
                        <p style={{margin: '0 0 8px', color: 'var(--muted)', fontSize: '14px'}}>{booking.counselorTitle}</p>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', fontSize: '14px'}}>
                          <div><strong>Date:</strong> {new Date(booking.preferredDate).toLocaleDateString()}</div>
                          <div><strong>Time:</strong> {booking.preferredTime}</div>
                          <div><strong>Status:</strong> 
                            <span style={{
                              background: booking.status === 'confirmed' ? '#10b981' : 
                                        booking.status === 'pending' ? '#f59e0b' : 
                                        booking.status === 'cancelled' ? '#ef4444' : '#6b7280',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              marginLeft: '8px'
                            }}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <div><strong>Price:</strong> {booking.price}</div>
                        </div>
                        {booking.message && (
                          <p style={{margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px', fontStyle: 'italic'}}>
                            "{booking.message}"
                          </p>
                        )}
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {booking.status === 'pending' && (
                          <button 
                            className="btn btn-outline small"
                            onClick={() => handleCancelBooking(booking._id)}
                            style={{padding: '6px 12px', fontSize: '12px'}}
                          >
                            Cancel
                          </button>
                        )}
                        <button 
                          className="btn btn-ghost small"
                          onClick={() => handleDeleteBooking(booking._id)}
                          style={{padding: '6px 12px', fontSize: '12px', color: '#ef4444'}}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{textAlign: 'center', marginTop: '48px'}}>
          <Link to="/dashboard" className="btn btn-outline">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default MeetCounselor;
