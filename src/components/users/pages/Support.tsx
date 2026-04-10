import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import { Preferences } from '@capacitor/preferences';
import NavbarSidebar from "./Navbar";
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  LifebuoyIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const API_BASE = "https://be.shuttleapp.transev.site";

// Helper function to get token from Preferences
const getToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const HelpSupport: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    attachment: null as File | null,
  });
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
    };
    loadToken();
  }, []);

  // Detect dark mode changes dynamically
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Fetch tickets from API
  const fetchTickets = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/support/driver/view`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Failed to fetch tickets");

      if (Array.isArray(data)) {
        setTickets(data);
      } else if (data.tickets) {
        setTickets(data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  // Create ticket
  const createTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      alert("Please fill subject and description");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("subject", newTicket.subject);
      formData.append("description", newTicket.description);
      if (newTicket.attachment) formData.append("attachment", newTicket.attachment);

      const res = await fetch(`${API_BASE}/support/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create ticket");

      setSuccessMessage("✅ Support ticket created successfully! Our team will review it shortly.");
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 4000);
      
      fetchTickets();
      setNewTicket({ subject: "", description: "", attachment: null });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Status color and icon helper
  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return { color: "#F59E0B", bg: "#F59E0B20", icon: ClockIcon, text: "Open" };
      case "pending":
        return { color: "#F97316", bg: "#F9731620", icon: ArrowPathIcon, text: "Pending" };
      case "closed":
        return { color: "#10B981", bg: "#10B98120", icon: CheckCircleIcon, text: "Closed" };
      case "cancelled":
        return { color: "#EF4444", bg: "#EF444420", icon: XCircleIcon, text: "Cancelled" };
      case "resolved":
        return { color: "#10B981", bg: "#10B98120", icon: CheckCircleIcon, text: "Resolved" };
      default:
        return { color: "#6B7280", bg: "#6B728020", icon: ClockIcon, text: status || "Unknown" };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent
        style={{
          backgroundColor: isDark ? "#0A0A0A" : "#F8F9FA",
          paddingTop: "64px",
          color: isDark ? "#FFFFFF" : "#111827",
        }}
      >
        <IonLoading isOpen={loading} message={"Processing..."} />
        
        {/* Success Popup */}
        {showSuccessPopup && (
          <div style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            animation: 'slideDown 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: isDark ? '#064E3B' : '#D1FAE5',
              border: `1px solid ${isDark ? '#10B981' : '#10B981'}`,
              borderRadius: '16px',
              padding: '16px 24px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
              minWidth: '300px',
            }}>
              <CheckCircleIcon style={{ width: '24px', height: '24px', color: '#10B981' }} />
              <div>
                <p style={{ fontWeight: '600', color: isDark ? '#D1FAE5' : '#064E3B', margin: 0 }}>
                  Success!
                </p>
                <p style={{ fontSize: '13px', color: isDark ? '#A7F3D0' : '#047857', margin: 0 }}>
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
          
          {/* Header Section */}
          <div style={{ marginTop: "50px", marginBottom: "32px", textAlign: "center" }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '40px',
              background: isDark ? '#1F1F1F' : '#E5E7EB',
              marginBottom: '16px'
            }}>
              <LifebuoyIcon style={{ width: '18px', height: '18px', color: '#10B981' }} />
              <span style={{ fontSize: '13px', fontWeight: '500', color: isDark ? '#D1D5DB' : '#4B5563' }}>
                24/7 Support Available
              </span>
            </div>
            <h1 style={{
              fontSize: "36px",
              fontWeight: "800",
              background: "linear-gradient(135deg, #10B981, #3B82F6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "12px",
            }}>
              Help & Support
            </h1>
            <p style={{ fontSize: "15px", color: isDark ? "#9CA3AF" : "#6B7280", maxWidth: "400px", margin: "0 auto" }}>
              Get help with your trips, earnings, or app issues. Our support team is here for you.
            </p>
          </div>

          {/* Create Ticket Card */}
          <div style={{
            marginBottom: "32px",
            padding: "24px",
            borderRadius: "24px",
            background: isDark ? "#111111" : "#FFFFFF",
            border: `2px solid ${isDark ? "#FFFFFF" : "#E5E7EB"}`,
            boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QuestionMarkCircleIcon style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
              </div>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: isDark ? "#FFFFFF" : "#111827", margin: 0 }}>
                  Create New Support Ticket
                </h2>
                <p style={{ fontSize: "13px", color: isDark ? "#9CA3AF" : "#6B7280", marginTop: "4px" }}>
                  Submit your issue and we'll get back to you quickly
                </p>
              </div>
            </div>

            <input
              type="text"
              placeholder="Enter subject..."
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              style={{
                width: "100%",
                padding: "14px 18px",
                marginBottom: "16px",
                borderRadius: "14px",
                border: `2px solid ${isDark ? "#FFFFFF" : "#E5E7EB"}`,
                backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF",
                color: isDark ? "#FFFFFF" : "#111827",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#10B981";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDark ? "#FFFFFF" : "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <textarea
              placeholder="Describe your issue in detail..."
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              style={{
                width: "100%",
                padding: "14px 18px",
                marginBottom: "16px",
                borderRadius: "14px",
                border: `2px solid ${isDark ? "#FFFFFF" : "#E5E7EB"}`,
                backgroundColor: isDark ? "#0A0A0A" : "#FFFFFF",
                color: isDark ? "#FFFFFF" : "#111827",
                fontSize: "14px",
                minHeight: "120px",
                resize: "vertical",
                outline: "none",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#10B981";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = isDark ? "#FFFFFF" : "#E5E7EB";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  padding: "12px 18px",
                  borderRadius: "14px",
                  backgroundColor: isDark ? "#0A0A0A" : "#F9FAFB",
                  border: `2px solid ${isDark ? "#FFFFFF" : "#E5E7EB"}`,
                  fontSize: "14px",
                  fontWeight: "500",
                  color: isDark ? "#D1D5DB" : "#4B5563",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#10B981";
                  e.currentTarget.style.backgroundColor = isDark ? "#1A1A1A" : "#F3F4F6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? "#FFFFFF" : "#E5E7EB";
                  e.currentTarget.style.backgroundColor = isDark ? "#0A0A0A" : "#F9FAFB";
                }}
              >
                <PaperClipIcon style={{ width: "18px", height: "18px" }} />
                Attach File (Optional)
                <input
                  type="file"
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      attachment: e.target.files ? e.target.files[0] : null,
                    })
                  }
                  style={{ display: "none" }}
                />
              </label>

              {newTicket.attachment && (
                <div style={{
                  marginTop: "10px",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: isDark ? "#1F1F1F" : "#F3F4F6",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <DocumentTextIcon style={{ width: "16px", height: "16px", color: "#10B981" }} />
                  <span style={{ fontSize: "12px", color: isDark ? "#D1D5DB" : "#4B5563" }}>
                    {newTicket.attachment.name}
                  </span>
                  <button
                    onClick={() => setNewTicket({ ...newTicket, attachment: null })}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#EF4444",
                      fontSize: "14px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              <p style={{ fontSize: "11px", color: isDark ? "#6B7280" : "#9CA3AF", marginTop: "8px" }}>
                Supported formats: PDF, JPG, PNG (Max 5MB)
              </p>
            </div>

            <button
              onClick={createTicket}
              style={{
                width: "100%",
                height: "52px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: "15px",
                letterSpacing: "0.3px",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(16, 185, 129, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(16, 185, 129, 0.3)";
              }}
            >
              <PaperAirplaneIcon style={{ width: "20px", height: "20px" }} />
              Submit Support Ticket
            </button>
          </div>

          {/* Ticket List Section */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: "20px" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: "10px" }}>
                <DocumentTextIcon style={{ width: "24px", height: "24px", color: "#10B981" }} />
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: isDark ? "#FFFFFF" : "#111827", margin: 0 }}>
                  Your Support Tickets
                </h2>
              </div>
              <span style={{
                padding: "4px 12px",
                borderRadius: "20px",
                background: isDark ? "#1F1F1F" : "#E5E7EB",
                fontSize: "12px",
                fontWeight: "600",
                color: isDark ? "#D1D5DB" : "#4B5563"
              }}>
                {tickets.length} {tickets.length === 1 ? "Ticket" : "Tickets"}
              </span>
            </div>

            {tickets.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: isDark ? "#111111" : "#FFFFFF",
                borderRadius: "20px",
                border: `2px solid ${isDark ? "#FFFFFF" : "#E5E7EB"}`,
              }}>
                <LifebuoyIcon style={{ width: "48px", height: "48px", color: "#9CA3AF", margin: "0 auto 16px" }} />
                <p style={{ fontSize: "16px", fontWeight: "500", color: isDark ? "#D1D5DB" : "#4B5563", marginBottom: "8px" }}>
                  No tickets submitted yet
                </p>
                <p style={{ fontSize: "13px", color: isDark ? "#6B7280" : "#9CA3AF" }}>
                  Create your first support ticket using the form above
                </p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {tickets.map((t) => {
                const statusConfig = getStatusConfig(t.status);
                const StatusIcon = statusConfig.icon;
                const isExpanded = selectedTicket === t.id;
                
                return (
                  <div
                    key={t.id}
                    style={{
                      background: isDark ? "#111111" : "#FFFFFF",
                      borderRadius: "20px",
                      border: `2px solid ${isDark ? "#FFFFFF" : "#E5E7EB"}`,
                      overflow: "hidden",
                      transition: "all 0.3s",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      onClick={() => setSelectedTicket(isExpanded ? null : t.id)}
                      style={{ padding: "20px" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: isDark ? "#FFFFFF" : "#111827",
                            marginBottom: "6px",
                          }}>
                            {t.subject}
                          </h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 12px",
                              borderRadius: "20px",
                              background: statusConfig.bg,
                              color: statusConfig.color,
                              fontSize: "11px",
                              fontWeight: "600",
                            }}>
                              <StatusIcon style={{ width: "12px", height: "12px" }} />
                              {statusConfig.text}
                            </span>
                            <span style={{
                              fontSize: "11px",
                              color: isDark ? "#6B7280" : "#9CA3AF",
                            }}>
                              📅 {formatDate(t.created_at)}
                            </span>
                          </div>
                        </div>
                        {/* <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "16px",
                          background: isDark ? "#1F1F1F" : "#F3F4F6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <span style={{ fontSize: "16px" }}>{isExpanded ? "▲" : "▼"}</span>
                        </div> */}
                        <div style={{
  width: "32px",
  height: "32px",
  borderRadius: "16px",
  background: isDark ? "rgba(255, 255, 255, 0.15)" : "#F3F4F6",
  border: isDark ? "1px solid rgba(255, 255, 255, 0.3)" : "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
  cursor: "pointer",
}}
onMouseEnter={(e) => {
  if (isDark) {
    e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
    e.currentTarget.style.transform = "scale(1.05)";
  }
}}
onMouseLeave={(e) => {
  if (isDark) {
    e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
    e.currentTarget.style.transform = "scale(1)";
  }
}}>
  <span style={{ 
    fontSize: "16px", 
    color: isDark ? "#FFFFFF" : "#6B7280",
    fontWeight: "600",
  }}>
    {isExpanded ? "▲" : "▼"}
  </span>
</div>
                      </div>

                      <p style={{
                        fontSize: "13px",
                        color: isDark ? "#9CA3AF" : "#6B7280",
                        lineHeight: "1.5",
                        marginTop: "8px",
                      }}>
                        {t.description.length > 100 ? `${t.description.substring(0, 100)}...` : t.description}
                      </p>
                    </div>

                    {isExpanded && (
                      <div style={{
                        borderTop: `2px solid ${isDark ? "#FFFFFF" : "#E5E7EB"}`,
                        padding: "20px",
                        background: isDark ? "#0A0A0A" : "#F9FAFB",
                      }}>
                        <div style={{ marginBottom: "16px" }}>
                          <p style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: isDark ? "#D1D5DB" : "#4B5563",
                            marginBottom: "8px",
                          }}>
                            Full Description:
                          </p>
                          <p style={{
                            fontSize: "14px",
                            color: isDark ? "#FFFFFF" : "#111827",
                            lineHeight: "1.6",
                          }}>
                            {t.description}
                          </p>
                        </div>

                        {t.attachment && (
                          <div style={{ marginBottom: "16px" }}>
                            <p style={{
                              fontSize: "13px",
                              fontWeight: "600",
                              color: isDark ? "#D1D5DB" : "#4B5563",
                              marginBottom: "8px",
                            }}>
                              Attachment:
                            </p>
                            <a
                              href={`${API_BASE}/${t.attachment}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 16px",
                                borderRadius: "10px",
                                background: isDark ? "#1F1F1F" : "#E5E7EB",
                                color: "#3B82F6",
                                textDecoration: "none",
                                fontSize: "13px",
                                fontWeight: "500",
                              }}
                            >
                              <DocumentTextIcon style={{ width: "16px", height: "16px" }} />
                              View Attachment
                            </a>
                          </div>
                        )}

                        {t.rejection_reason && (
                          <div style={{
                            marginBottom: "16px",
                            padding: "12px",
                            borderRadius: "12px",
                            background: isDark ? "#7F1D1D20" : "#FEE2E2",
                            borderLeft: `3px solid #EF4444`,
                          }}>
                            <p style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#EF4444",
                              marginBottom: "4px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}>
                              <ExclamationTriangleIcon style={{ width: "14px", height: "14px" }} />
                              Rejection Reason
                            </p>
                            <p style={{
                              fontSize: "13px",
                              color: isDark ? "#FCA5A5" : "#991B1B",
                            }}>
                              {t.rejection_reason}
                            </p>
                          </div>
                        )}

                        {t.resolved_at && (
                          <div style={{
                            padding: "12px",
                            borderRadius: "12px",
                            background: isDark ? "#064E3B20" : "#D1FAE5",
                            borderLeft: `3px solid #10B981`,
                          }}>
                            <p style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#10B981",
                              marginBottom: "4px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}>
                              <CheckCircleIcon style={{ width: "14px", height: "14px" }} />
                              Resolved On
                            </p>
                            <p style={{
                              fontSize: "13px",
                              color: isDark ? "#A7F3D0" : "#064E3B",
                            }}>
                              {formatDate(t.resolved_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Support Card */}
          <div style={{
            padding: "24px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, #10B981, #059669)",
            boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)",
            textAlign: "center",
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "30px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <ChatBubbleLeftRightIcon style={{ width: "30px", height: "30px", color: "#FFFFFF" }} />
            </div>
            <h2 style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#FFFFFF",
              marginBottom: "12px",
            }}>
              Need Immediate Help?
            </h2>
            <p style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "20px",
              lineHeight: "1.5",
            }}>
              Our support team is available 24/7 to assist you
            </p>
            
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxWidth: "300px",
              margin: "0 auto",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "10px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}>
                <EnvelopeIcon style={{ width: "18px", height: "18px", color: "#FFFFFF" }} />
                <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: "500" }}>
                  support@shuttleapp.com
                </span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "10px",
                background: "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                backdropFilter: "blur(10px)",
              }}>
                <PhoneIcon style={{ width: "18px", height: "18px", color: "#FFFFFF" }} />
                <span style={{ color: "#FFFFFF", fontSize: "14px", fontWeight: "500" }}>
                  +91 12345 67890
                </span>
              </div>
            </div>
          </div>
        </div>
      </IonContent>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </IonPage>
  );
};

export default HelpSupport;