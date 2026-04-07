import React, { useEffect, useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import NavbarSidebar from "../../users/pages/Navbar";
import {
  CurrencyRupeeIcon,
  TruckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  DocumentTextIcon,
  PrinterIcon
} from "@heroicons/react/24/outline";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  RocketLaunchIcon,
  TrophyIcon,
  PresentationChartLineIcon
} from "@heroicons/react/24/solid";

const BASE_URL = "https://be.shuttleapp.transev.site";

interface AnalyticsData {
  driver_id: string;
  total_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  trips: Array<{
    trip_id: string;
    status: string;
    passenger_count: number;
    earning: number;
  }>;
}

interface PayoutData {
  summary: {
    trip_count: number;
    booking_count: number;
    total_fare_amount: number;
    total_commission_amount: number;
    total_driver_payout_amount: number;
    total_paid_out_amount: number;
    total_pending_payout_amount: number;
  };
  items: any[];
  driver_payout_profile: any;
}

interface AnalyticsSummary {
  totalEarnings: number;
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  pendingAmount: number;
  paidAmount: number;
  totalBookings: number;
  completionRate: number;
  avgEarningPerTrip: number;
  cancellationRate: number;
  statusDistribution: {
    completed: number;
    cancelled: number;
    in_progress: number;
    scheduled: number;
    premature_end: number;
  };
}

const DriverAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("week");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [analyticsRes, payoutRes] = await Promise.all([
        fetch(`${BASE_URL}/driver/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/driver/trips/payout-details`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const analytics = await analyticsRes.json();
      const payout = await payoutRes.json();

      if (analyticsRes.ok) setAnalyticsData(analytics);
      if (payoutRes.ok) setPayoutData(payout);
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      analytics: analyticsData,
      payout: payoutData,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver-analytics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateAnalytics = (): AnalyticsSummary | null => {
    if (!analyticsData && !payoutData) return null;

    const totalEarnings = payoutData?.summary?.total_driver_payout_amount ?? 0;
    const totalTrips = analyticsData?.total_trips ?? payoutData?.summary?.trip_count ?? 0;
    const completedTrips = analyticsData?.completed_trips ?? 0;
    const cancelledTrips = analyticsData?.cancelled_trips ?? 0;
    const pendingAmount = payoutData?.summary?.total_pending_payout_amount ?? 0;
    const paidAmount = payoutData?.summary?.total_paid_out_amount ?? 0;
    const totalBookings = payoutData?.summary?.booking_count ?? 0;
    
    const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
    const avgEarningPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;
    const cancellationRate = totalTrips > 0 ? (cancelledTrips / totalTrips) * 100 : 0;
    
    const statusDistribution = {
      completed: analyticsData?.trips?.filter(t => t.status === 'completed').length ?? 0,
      cancelled: analyticsData?.trips?.filter(t => t.status === 'cancelled').length ?? 0,
      in_progress: payoutData?.items?.filter(t => t.trip_status === 'in_progress').length ?? 0,
      scheduled: payoutData?.items?.filter(t => t.trip_status === 'scheduled').length ?? 0,
      premature_end: payoutData?.items?.filter(t => t.trip_status === 'premature_end').length ?? 0
    };

    return {
      totalEarnings,
      totalTrips,
      completedTrips,
      cancelledTrips,
      pendingAmount,
      paidAmount,
      totalBookings,
      completionRate,
      avgEarningPerTrip,
      cancellationRate,
      statusDistribution
    };
  };

  const analytics = calculateAnalytics();
  const styles = getStyles(isDarkMode);

  // Helper function to safely get analytics values
  const getAnalyticsValue = <K extends keyof AnalyticsSummary>(key: K): AnalyticsSummary[K] => {
    return analytics?.[key] ?? (key === 'completionRate' ? 0 : 
           key === 'avgEarningPerTrip' ? 0 :
           key === 'cancellationRate' ? 0 :
           key === 'totalEarnings' ? 0 :
           key === 'totalTrips' ? 0 :
           key === 'completedTrips' ? 0 :
           key === 'cancelledTrips' ? 0 :
           key === 'pendingAmount' ? 0 :
           key === 'paidAmount' ? 0 :
           key === 'totalBookings' ? 0 :
           { completed: 0, cancelled: 0, in_progress: 0, scheduled: 0, premature_end: 0 }) as AnalyticsSummary[K];
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent style={{ '--background': isDarkMode ? '#0A0A0A' : '#F3F4F6' } as any}>
        <div style={styles.container}>
          
          {/* Header Section */}
          <div style={styles.header}>
            <div>
              <div style={styles.headerIcon}>
                <PresentationChartLineIcon style={{ width: '28px', height: '28px', color: '#FFFFFF' }} />
              </div>
              <h1 style={styles.title}>Analytics Dashboard</h1>
              <p style={styles.subtitle}>Track your performance, earnings & insights</p>
            </div>
            
            <div style={styles.headerActions}>
              <button onClick={exportData} style={styles.exportButton}>
                <DocumentArrowDownIcon style={{ width: '18px', height: '18px' }} />
                Export
              </button>
              <button onClick={() => setIsDarkMode(!isDarkMode)} style={styles.themeToggle}>
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <p style={styles.loadingText}>Loading analytics data...</p>
            </div>
          ) : (
            <>
              {/* Filter Section */}
            <div style={styles.filterSection}>
  <div style={styles.filterGroup}>
    <FunnelIcon style={{ width: '18px', height: '18px', color: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
    <select 
      value={selectedFilter} 
      onChange={(e) => setSelectedFilter(e.target.value)}
      style={styles.select}
    >
      <option value="week" style={{ color: isDarkMode ? '#FFFFFF' : '#000000', background: isDarkMode ? '#1F1F1F' : '#FFFFFF' }}>Last 7 Days</option>
      <option value="month" style={{ color: isDarkMode ? '#FFFFFF' : '#000000', background: isDarkMode ? '#1F1F1F' : '#FFFFFF' }}>Last 30 Days</option>
      <option value="quarter" style={{ color: isDarkMode ? '#FFFFFF' : '#000000', background: isDarkMode ? '#1F1F1F' : '#FFFFFF' }}>Last 90 Days</option>
      <option value="year" style={{ color: isDarkMode ? '#FFFFFF' : '#000000', background: isDarkMode ? '#1F1F1F' : '#FFFFFF' }}>Last Year</option>
    </select>
  </div>
  
  <div style={styles.filterGroup}>
    <ClockIcon style={{ width: '18px', height: '18px', color: isDarkMode ? '#9CA3AF' : '#6B7280' }} />
    <select 
      value={selectedStatus} 
      onChange={(e) => setSelectedStatus(e.target.value)}
      style={styles.select}
    >
      <option value="all" style={{ color: isDarkMode ? '#FFFFFF' : '#000000', background: isDarkMode ? '#1F1F1F' : '#FFFFFF' }}>All Trips</option>
      <option value="completed" style={{ color: isDarkMode ? '#FFFFFF' : '#000000', background: isDarkMode ? '#1F1F1F' : '#FFFFFF' }}>Completed</option>
      <option value="cancelled" style={{ color: isDarkMode ? '#FFFFFF' : '#000000', background: isDarkMode ? '#1F1F1F' : '#FFFFFF' }}>Cancelled</option>
      <option value="in_progress" style={{ color: isDarkMode ? '#FFFFFF' : '#000000', background: isDarkMode ? '#1F1F1F' : '#FFFFFF' }}>In Progress</option>
    </select>
  </div>
</div>
              

              {/* Key Metrics Grid */}
              <div style={styles.metricsGrid}>
                <MetricCard
                  title="Total Earnings"
                  value={`₹${getAnalyticsValue('totalEarnings').toFixed(2)}`}
                  icon={<CurrencyRupeeIcon style={{ width: '24px', height: '24px' }} />}
                  trend="+12.5%"
                  trendUp={true}
                  gradient="linear-gradient(135deg, #10B981, #059669)"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Total Trips"
                  value={getAnalyticsValue('totalTrips')}
                  icon={<TruckIcon style={{ width: '24px', height: '24px' }} />}
                  trend="+8.2%"
                  trendUp={true}
                  gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Completion Rate"
                  value={`${getAnalyticsValue('completionRate').toFixed(1)}%`}
                  icon={<CheckCircleIcon style={{ width: '24px', height: '24px' }} />}
                  trend={getAnalyticsValue('completionRate') > 80 ? "Excellent" : "Good"}
                  trendUp={getAnalyticsValue('completionRate') > 70}
                  gradient="linear-gradient(135deg, #8B5CF6, #7C3AED)"
                  isDarkMode={isDarkMode}
                />
                <MetricCard
                  title="Avg Earning/Trip"
                  value={`₹${getAnalyticsValue('avgEarningPerTrip').toFixed(2)}`}
                  icon={<ArrowTrendingUpIcon style={{ width: '24px', height: '24px' }} />}
                  trend="+5.3%"
                  trendUp={true}
                  gradient="linear-gradient(135deg, #F59E0B, #D97706)"
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Performance Stats */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <ChartBarIcon style={{ width: '20px', height: '20px', color: '#10B981' }} />
                  <h2 style={styles.sectionTitle}>Performance Overview</h2>
                </div>
                <div style={styles.statsGrid}>
                  <StatCard 
                    label="Completed Trips" 
                    value={getAnalyticsValue('completedTrips')} 
                    total={getAnalyticsValue('totalTrips')}
                    color="#10B981"
                    isDarkMode={isDarkMode}
                  />
                  <StatCard 
                    label="Cancelled Trips" 
                    value={getAnalyticsValue('cancelledTrips')} 
                    total={getAnalyticsValue('totalTrips')}
                    color="#EF4444"
                    isDarkMode={isDarkMode}
                  />
                  <StatCard 
                    label="Total Bookings" 
                    value={getAnalyticsValue('totalBookings')} 
                    total={getAnalyticsValue('totalBookings')}
                    color="#8B5CF6"
                    isDarkMode={isDarkMode}
                  />
                  <StatCard 
                    label="Pending Payout" 
                    value={`₹${getAnalyticsValue('pendingAmount').toFixed(2)}`} 
                    total={getAnalyticsValue('totalEarnings')}
                    color="#F59E0B"
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* Status Distribution */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <TrophyIcon style={{ width: '20px', height: '20px', color: '#10B981' }} />
                  <h2 style={styles.sectionTitle}>Trip Status Distribution</h2>
                </div>
                <div style={styles.statusGrid}>
                  <StatusItem 
                    label="Completed" 
                    value={getAnalyticsValue('statusDistribution').completed}
                    total={getAnalyticsValue('totalTrips')}
                    color="#10B981"
                    isDarkMode={isDarkMode}
                  />
                  <StatusItem 
                    label="Cancelled" 
                    value={getAnalyticsValue('statusDistribution').cancelled}
                    total={getAnalyticsValue('totalTrips')}
                    color="#EF4444"
                    isDarkMode={isDarkMode}
                  />
                  <StatusItem 
                    label="In Progress" 
                    value={getAnalyticsValue('statusDistribution').in_progress}
                    total={getAnalyticsValue('totalTrips')}
                    color="#3B82F6"
                    isDarkMode={isDarkMode}
                  />
                  <StatusItem 
                    label="Scheduled" 
                    value={getAnalyticsValue('statusDistribution').scheduled}
                    total={getAnalyticsValue('totalTrips')}
                    color="#8B5CF6"
                    isDarkMode={isDarkMode}
                  />
                  <StatusItem 
                    label="Premature End" 
                    value={getAnalyticsValue('statusDistribution').premature_end}
                    total={getAnalyticsValue('totalTrips')}
                    color="#F59E0B"
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* Recent Trips Table */}
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <DocumentTextIcon style={{ width: '20px', height: '20px', color: '#10B981' }} />
                  <h2 style={styles.sectionTitle}>Recent Trips</h2>
                  <button style={styles.printButton} onClick={() => window.print()}>
                    <PrinterIcon style={{ width: '16px', height: '16px' }} />
                    Print
                  </button>
                </div>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>Trip ID</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Passengers</th>
                        <th style={styles.th}>Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData?.trips && analyticsData.trips.length > 0 ? (
                        analyticsData.trips.slice(0, 10).map((trip) => (
                          <tr key={trip.trip_id} style={styles.tableRow}>
                            <td style={styles.td}>{trip.trip_id.slice(0, 8)}...</td>
                            <td style={styles.td}>
                              <span style={{
                                ...styles.statusBadge,
                                background: trip.status === 'completed' ? '#10B98120' : '#EF444420',
                                color: trip.status === 'completed' ? '#10B981' : '#EF4444'
                              }}>
                                {trip.status}
                              </span>
                            </td>
                            <td style={styles.td}>{trip.passenger_count || 0}</td>
                            <td style={styles.td}>₹{trip.earning || 0}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ ...styles.td, textAlign: 'center' }}>
                            No trips found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Insights Section */}
              <div style={styles.insightsSection}>
                <div style={styles.insightCard}>
                  <RocketLaunchIcon style={{ width: '24px', height: '24px', color: '#10B981' }} />
                  <div>
                    <h3 style={styles.insightTitle}>Performance Insight</h3>
                    <p style={styles.insightText}>
                      {getAnalyticsValue('completionRate') > 80 
                        ? "Excellent! Your completion rate is above average. Keep up the great work!"
                        : "Focus on improving your trip completion rate to maximize earnings."}
                    </p>
                  </div>
                </div>
                <div style={styles.insightCard}>
                  <ArrowTrendingUpIcon style={{ width: '24px', height: '24px', color: '#F59E0B' }} />
                  <div>
                    <h3 style={styles.insightTitle}>Earning Opportunity</h3>
                    <p style={styles.insightText}>
                      Complete {Math.max(0, 10 - getAnalyticsValue('completedTrips'))} more trips this week to unlock bonus rewards!
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon, trend, trendUp, gradient, isDarkMode }: any) => (
  <div style={{
    background: isDarkMode ? '#111111' : '#FFFFFF',
    borderRadius: '20px',
    padding: '20px',
    border: `1px solid ${isDarkMode ? '#1F1F1F' : '#E5E7EB'}`,
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = isDarkMode ? '0 8px 20px rgba(0,0,0,0.3)' : '0 8px 20px rgba(0,0,0,0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '16px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '16px'
    }}>
      {React.cloneElement(icon, { style: { width: '24px', height: '24px', color: '#FFFFFF' } })}
    </div>
    <p style={{ fontSize: '13px', color: isDarkMode ? '#9CA3AF' : '#6B7280', marginBottom: '8px' }}>{title}</p>
    <p style={{ fontSize: '28px', fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#111827', marginBottom: '8px' }}>{value}</p>
    {trend && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {trendUp ? 
          <ArrowTrendingUpIcon style={{ width: '14px', height: '14px', color: '#10B981' }} /> : 
          <ArrowTrendingDownIcon style={{ width: '14px', height: '14px', color: '#EF4444' }} />
        }
        <span style={{ fontSize: '12px', color: trendUp ? '#10B981' : '#EF4444' }}>{trend}</span>
      </div>
    )}
  </div>
);

// Stat Card Component
const StatCard = ({ label, value, total, color, isDarkMode }: any) => {
  const percentage = total > 0 ? (typeof value === 'number' ? (value / total) * 100 : 0) : 0;
  return (
    <div style={{
      background: isDarkMode ? '#0A0A0A' : '#F9FAFB',
      borderRadius: '16px',
      padding: '16px',
      border: `1px solid ${isDarkMode ? '#1F1F1F' : '#E5E7EB'}`
    }}>
      <p style={{ fontSize: '12px', color: isDarkMode ? '#9CA3AF' : '#6B7280', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: 'bold', color: isDarkMode ? '#FFFFFF' : '#111827', marginBottom: '8px' }}>{value}</p>
      {typeof value === 'number' && (
        <div style={{ width: '100%', height: '4px', background: isDarkMode ? '#1F1F1F' : '#E5E7EB', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '2px' }} />
        </div>
      )}
    </div>
  );
};

// Status Item Component
const StatusItem = ({ label, value, total, color, isDarkMode }: any) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '13px', color: isDarkMode ? '#D1D5DB' : '#374151' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: isDarkMode ? '#FFFFFF' : '#111827' }}>{value}</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: isDarkMode ? '#1F1F1F' : '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.3s' }} />
      </div>
    </div>
  );
};

// Styles function for dynamic theming
const getStyles = (isDark: boolean) => ({
  container: {
    paddingTop: '80px',
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '40px',
    maxWidth: '1200px',
    margin: '0 auto',
    background: isDark ? '#0A0A0A' : '#F3F4F6',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
    gap: '16px'
  },
  headerIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #10B981, #60A5FA)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280'
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: isDark ? '#1F1F1F' : '#FFFFFF',
    border: `1px solid ${isDark ? '#2D2D2D' : '#E5E7EB'}`,
    borderRadius: '40px',
    color: isDark ? '#FFFFFF' : '#111827',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  themeToggle: {
    padding: '10px 20px',
    background: isDark ? '#1F1F1F' : '#FFFFFF',
    border: `1px solid ${isDark ? '#2D2D2D' : '#E5E7EB'}`,
    borderRadius: '40px',
    cursor: 'pointer',
    fontSize: '18px'
  },
  loadingContainer: {
    textAlign: 'center' as const,
    padding: '80px 20px'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: `3px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
    borderTopColor: '#10B981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  loadingText: {
    color: isDark ? '#9CA3AF' : '#6B7280'
  },
  filterSection: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap' as const
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: isDark ? '#111111' : '#FFFFFF',
    border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
    borderRadius: '40px'
  },
  select: {
    background: 'transparent',
    border: 'none',
    color: isDark ? '#FFFFFF' : '#111827',
    fontSize: '14px',
    cursor: 'pointer',
    outline: 'none'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  section: {
    background: isDark ? '#111111' : '#FFFFFF',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
    border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#111827',
    flex: 1
  },
  printButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    background: 'transparent',
    border: `1px solid ${isDark ? '#2D2D2D' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    cursor: 'pointer',
    fontSize: '12px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statusGrid: {
    display: 'grid',
    gap: '16px'
  },
  tableContainer: {
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const
  },
  tableHeader: {
    borderBottom: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    fontSize: '12px',
    fontWeight: '500'
  },
  td: {
    padding: '12px',
    color: isDark ? '#D1D5DB' : '#374151',
    fontSize: '13px',
    borderBottom: `1px solid ${isDark ? '#1F1F1F' : '#F3F4F6'}`
  },
  tableRow: {
    transition: 'background 0.2s'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500'
  },
  insightsSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '24px'
  },
  insightCard: {
    display: 'flex',
    gap: '16px',
    padding: '20px',
    background: `linear-gradient(135deg, ${isDark ? '#111111' : '#FFFFFF'}, ${isDark ? '#0A0A0A' : '#F9FAFB'})`,
    borderRadius: '20px',
    border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`
  },
  insightTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: '6px'
  },
  insightText: {
    fontSize: '12px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    lineHeight: '1.5'
  }
});

// Add animation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default DriverAnalyticsPage;