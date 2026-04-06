import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import NavbarSidebar from "./Navbar";
import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";

const API_BASE = "https://be.shuttleapp.transev.site";

const HelpSupport: React.FC = () => {
  const token = localStorage.getItem("access_token");

  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    attachment: null as File | null,
  });

  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

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

      // Backend might return an array directly
      if (Array.isArray(data)) {
        setTickets(data);
      } else if (data.tickets) {
        setTickets(data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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

      fetchTickets(); // refresh after creating
      setNewTicket({ subject: "", description: "", attachment: null });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Status color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#facc15"; // yellow
      case "pending":
        return "#fb923c"; // orange
      case "closed":
        return "#22c55e"; // green
      case "cancelled":
        return "#ef4444"; // red
      case "premature_end":
        return "#a855f7"; // purple
      default:
        return "#6b7280"; // gray
    }
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent
        style={{
          backgroundColor: isDark ? "#0f172a" : "#f4f4f5",
          paddingTop: "64px",
          color: isDark ? "#fff" : "#000",
        }}
      >
        <IonLoading isOpen={loading} message={"Processing..."} />
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginTop: "50px", marginBottom: "30px", textAlign: "center" }}>
            <h1 style={{ fontSize: "30px", fontWeight: "800", letterSpacing: "0.5px" }}>
              Help & Support
            </h1>
            <p style={{ fontSize: "14px", marginTop: "6px", color: isDark ? "#9ca3af" : "#6b7280" }}>
              Get help with your trips, earnings, or app issues
            </p>
          </div>

          {/* Create Ticket */}
        <div
  style={{
    marginBottom: "28px",
    padding: "22px",
    borderRadius: "18px",
    backgroundColor: isDark ? "#1e293b" : "#ffffff", // dark vs light background
    boxShadow: isDark
      ? "0 6px 18px rgba(0,0,0,0.3)" // slightly stronger shadow in dark mode
      : "0 6px 18px rgba(0,0,0,0.08)",
  }}
>
  <h2
    style={{
      fontSize: "18px",
      fontWeight: 700,
      marginBottom: "18px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: isDark ? "#f3f4f6" : "#111827", // white-ish text in dark mode, dark gray in light
    }}
  >
    <QuestionMarkCircleIcon
      style={{
        width: "22px",
        height: "22px",
        color: isDark ? "#f3f4f6" : "#111827", // icon color matches text
      }}
    />
    Create New Support Ticket
  </h2>


            <input
              type="text"
              placeholder="Enter subject..."
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                backgroundColor: isDark ? "#0f172a" : "#fff",
                color: isDark ? "#fff" : "#000",
                fontSize: "14px",
                outline: "none",
              }}
            />

            <textarea
              placeholder="Describe your issue..."
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              style={{
                width: "100%",
                padding: "14px 16px",
                marginBottom: "14px",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                backgroundColor: isDark ? "#0f172a" : "#fff",
                color: isDark ? "#fff" : "#000",
                fontSize: "14px",
                minHeight: "110px",
                resize: "vertical",
                outline: "none",
              }}
            />

           <div style={{ marginBottom: "14px" }}>
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      padding: "12px 16px",
      borderRadius: "12px",
      backgroundColor: isDark ? "#0f172a" : "#f9fafb", // dark/light background
      border: `1px solid ${isDark ? "#334155" : "#d1d5db"}`, // subtle border for dark mode
      fontSize: "14px",
      color: isDark ? "#f3f4f6" : "#111827", // dark mode text white-ish, light mode dark gray
    }}
  >
    <PaperClipIcon
      style={{
        width: "20px",
        height: "20px",
        color: isDark ? "#f3f4f6" : "#111827", // icon color matches text
      }}
    />
    Attach File
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
    <p
      style={{
        marginTop: "6px",
        fontSize: "13px",
        color: isDark ? "#9ca3af" : "#374151", // light gray in dark mode, darker gray in light
      }}
    >
      Attached: {newTicket.attachment.name}
    </p>
  )}
</div>

            <button
              onClick={createTicket}
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "12px",
                backgroundColor: isDark ? "#fff" : "#000",
                color: isDark ? "#000" : "#fff",
                fontWeight: "700",
                fontSize: "15px",
                letterSpacing: "0.3px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <PaperAirplaneIcon style={{ width: "20px", height: "20px" }} />
              Submit Ticket
            </button>
          </div>

    {/* Ticket List */}
<div className="mb-7">
  <h2 className="text-lg font-bold mb-4">Your Tickets</h2>

  {tickets.length === 0 && (
    <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
      No tickets submitted yet.
    </p>
  )}

  <div className="space-y-4">
    {tickets.map((t) => (
      <div
        key={t.id}
        className={`relative p-5 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Status Badge top-right */}
        <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
          <span
            className="px-3 py-1 text-xs font-semibold rounded-full"
            style={{ backgroundColor: getStatusColor(t.status), color: "#000" }}
          >
            {t.status.toUpperCase()}
          </span>
          <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {new Date(t.created_at).toLocaleString()}
          </span>
        </div>

        {/* Subject */}
    
<p
  className={`font-semibold text-base mb-2 ${
    isDark ? "text-indigo-400" : "text-indigo-600"
  }`}
>
  Subject: {t.subject}
</p>

<p className="text-sm mb-1 font-medium text-indigo-500">
  Description:
</p>
<p className={`text-base ${isDark ? "text-gray-200" : "text-gray-700"} leading-relaxed`}>
  {t.description}
</p>
        {/* Attachment */}
        {t.attachment && (
          <a
            href={`${API_BASE}/${t.attachment}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-3 text-blue-500 text-xs hover:underline"
          >
            📎 View Attachment
          </a>
        )}

        {/* Resolved */}
        {t.resolved_at && (
          <div className={`mt-1 text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            ✅ Resolved: {new Date(t.resolved_at).toLocaleString()}
          </div>
        )}

        {/* Rejection Reason */}
        {t.rejection_reason && (
          <div
            className={`mt-2 p-3 border-l-4 rounded-md text-sm ${
              isDark
                ? "bg-red-900/20 border-red-500 text-red-400"
                : "bg-red-100 border-red-500 text-red-700"
            }`}
          >
            <strong>Rejection Reason:</strong> {t.rejection_reason}
          </div>
        )}
      </div>
    ))}
  </div>
</div>
     
          {/* Contact Support */}
      <div
  style={{
    padding: "20px",
    borderRadius: "18px",
    backgroundColor: isDark ? "#1e293b" : "#fff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  }}
>
  <h2
    style={{
      fontSize: "18px",
      fontWeight: 700,
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: isDark ? "#f3f4f6" : "#111827", // dark mode text white-ish, light mode dark gray
    }}
  >
    <ChatBubbleLeftRightIcon
      style={{
        width: "22px",
        height: "22px",
        color: isDark ? "#f3f4f6" : "#111827", // icon matches text
      }}
    />
    Contact Support
  </h2>


            <p style={{ fontSize: "13px", color: isDark ? "#9ca3af" : "#6b7280", lineHeight: "1.6" }}>
              📧 Email: <span style={{ color: "#3b82f6", fontWeight: 600 }}>support@shuttleapp.com</span>
              <br />
              📞 Phone: <span style={{ color: "#3b82f6", fontWeight: 600 }}>+880 1234 567890</span>
            </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HelpSupport;