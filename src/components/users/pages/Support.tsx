import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import NavbarSidebar from './Navbar';
import { QuestionMarkCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface Ticket {
  id: number;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  message: string;
}

const HelpSupport: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 1, subject: 'Payment not received', status: 'open', message: 'Driver not received last week earnings' },
    { id: 2, subject: 'App crash', status: 'closed', message: 'App crashes on booking page' },
  ]);

  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });

  const createTicket = () => {
    if (!newTicket.subject || !newTicket.message) return;
    const id = tickets.length + 1;
    setTickets([...tickets, { id, ...newTicket, status: 'open' }]);
    setNewTicket({ subject: '', message: '' });
  };

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent style={{ backgroundColor: isDark ? '#111827' : '#f9f9f9', paddingTop: '64px', color: isDark ? '#fff' : '#000' }}>
        <div style={{ padding: '20px' }}>

          {/* HEADER */}
        <div style={{ marginTop: '40px', marginBottom: '24px', textAlign: 'center' }}>
  <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Help & Support</h1>
  <p style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
    Get help with your trips, earnings, or app issues
  </p>
</div>

          {/* CREATE NEW TICKET */}
          <div style={{ marginBottom: '24px', padding: '20px', borderRadius: '16px', backgroundColor: isDark ? '#1f2937' : '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QuestionMarkCircleIcon style={{ width: '24px', height: '24px' }} /> Create New Support Ticket
            </h2>

            <input
              type="text"
              placeholder="Subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              style={{
                width: '100%',
                padding: '16px 20px',
                marginBottom: '16px',
                borderRadius: '12px',
                border: '1px solid #ccc',
                backgroundColor: isDark ? '#111827' : '#fff',
                color: isDark ? '#fff' : '#000',
                fontSize: '14px',
                outline: 'none',
              }}
            />

            <textarea
              placeholder="Describe your issue"
              value={newTicket.message}
              onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
              style={{
                width: '100%',
                padding: '16px 20px',
                marginBottom: '16px',
                borderRadius: '12px',
                border: '1px solid #ccc',
                backgroundColor: isDark ? '#111827' : '#fff',
                color: isDark ? '#fff' : '#000',
                fontSize: '14px',
                minHeight: '120px',
                resize: 'vertical',
                outline: 'none',
              }}
            />

            <button
              onClick={createTicket}
              style={{
                width: '100%',
                padding: '16px 0',
                borderRadius: '12px',
                backgroundColor: isDark ? '#fff' : '#000',
                color: isDark ? '#000' : '#fff',
                fontWeight: 600,
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Submit Ticket
            </button>
          </div>

          {/* TICKET LIST */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>Your Tickets</h2>
            {tickets.map((t) => (
              <div
                key={t.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  backgroundColor: t.status === 'open' ? (isDark ? '#1f2937' : '#f3f4f6') : (isDark ? '#374151' : '#d1d5db'),
                }}
              >
                <div>
                  <p style={{ fontWeight: '600' }}>{t.subject}</p>
                  <p style={{ fontSize: '0.875rem', color: isDark ? '#9ca3af' : '#6b7280' }}>{t.message}</p>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor:
                      t.status === 'open' ? '#facc15' :
                      t.status === 'pending' ? '#f97316' :
                      '#22c55e',
                    color: t.status === 'closed' ? '#fff' : '#000',
                  }}
                >
                  {t.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>

          {/* CONTACT SUPPORT */}
          <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: isDark ? '#1f2937' : '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ChatBubbleLeftRightIcon style={{ width: '24px', height: '24px' }} /> Contact Support
            </h2>
            <p style={{ fontSize: '0.875rem', color: isDark ? '#9ca3af' : '#6b7280' }}>
              Email: <span style={{ color: '#3b82f6' }}>support@shuttleapp.com</span> <br />
              Phone: <span style={{ color: '#3b82f6' }}>+880 1234 567890</span>
            </p>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default HelpSupport;