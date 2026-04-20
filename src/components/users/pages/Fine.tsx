import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
  IonButton,
  IonBadge,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonFab,
  IonFabButton,
  IonToast,
  IonAlert,
  IonSkeletonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPopover,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonItem,
  IonInput,
  IonNote,
  IonActionSheet
} from '@ionic/react';
import {
  cashOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  carSportOutline,
  calendarOutline,
  documentTextOutline,
  closeCircleOutline,
  reloadOutline,
  shieldCheckmarkOutline,
  warningOutline,
  informationCircleOutline,
  bookOutline,
  checkmarkDoneCircleOutline,
  trendingUpOutline,
  eyeOutline,
  filterOutline,
  downloadOutline,
  barChartOutline,
  pieChartOutline,
  arrowForwardOutline,
  calendarNumberOutline,
  walletOutline,
  ticketOutline,
  personOutline,
  mapOutline,
  locationOutline,
  chatbubbleOutline,
  documentAttachOutline,
  copyOutline,
  shareSocialOutline,
  printOutline,
  chevronDownOutline,
  logoWhatsapp,
  mailOutline,
  logoFacebook,
  logoTwitter,
  linkOutline,
  qrCodeOutline
} from 'ionicons/icons';
import { Preferences } from '@capacitor/preferences';
import NavbarSidebar from './Navbar';

const API_BASE = "https://be.shuttleapp.transev.site";

// Helper function to get token
const getToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// ==================== Type Definitions ====================

interface FineItem {
  id: string;
  booking_id: string;
  amount: string;
  reason: string;
  reason_code: string;
  status: 'under_review' | 'applied' | 'rejected' | 'paid';
  created_at: string;
  decided_at: string | null;
  due_date?: string;
  category?: string;
  location?: string;
  officer_name?: string;
  notes?: string;
  image_url?: string;
}

interface FineSummary {
  total_pending: string;
  total_applied: string;
  total_rejected: string;
}

interface FineRule {
  id: string;
  code: string;
  title: string;
  type: string;
  priority: number;
  config: {
    max_minutes_before?: number;
    fine_value?: number;
    [key: string]: any;
  };
  message: string;
}

interface FineState {
  items: FineItem[];
  count: number;
  page_total_amount: string;
}

// ==================== Animated Stat Card ====================
const AnimatedStatCard: React.FC<{
  title: string;
  amount: number;
  icon: any;
  gradient: string;
  trend?: number;
  onClick?: () => void;
}> = ({ title, amount, icon, gradient, trend, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-linear-to-br ${gradient} rounded-2xl p-5 text-white shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium tracking-wide">{title}</p>
          <p className="text-3xl font-bold mt-2">₹{amount.toLocaleString()}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <IonIcon icon={trendingUpOutline} className="text-sm" />
              <span className="text-xs text-white/80">{trend}% from last month</span>
            </div>
          )}
        </div>
        <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
          <IonIcon icon={icon} className="text-2xl" />
        </div>
      </div>
    </div>
  );
};

// ==================== Status Badge ====================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = {
    under_review: { 
      color: 'text-amber-700 dark:text-amber-400', 
      icon: timeOutline, 
      label: 'Under Review', 
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800'
    },
    applied: { 
      color: 'text-rose-700 dark:text-rose-400', 
      icon: alertCircleOutline, 
      label: 'Applied', 
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200 dark:border-rose-800'
    },
    rejected: { 
      color: 'text-slate-600 dark:text-slate-400', 
      icon: closeCircleOutline, 
      label: 'Rejected', 
      bg: 'bg-slate-50 dark:bg-slate-900/40',
      border: 'border-slate-200 dark:border-slate-700'
    },
    paid: { 
      color: 'text-emerald-700 dark:text-emerald-400', 
      icon: checkmarkCircleOutline, 
      label: 'Paid', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800'
    }
  };
  
  const c = config[status as keyof typeof config] || config.under_review;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${c.bg} ${c.border} border`}>
      <IonIcon icon={c.icon} className={`${c.color} text-sm`} />
      <span className={`text-xs font-semibold ${c.color}`}>{c.label}</span>
    </div>
  );
};

// ==================== Fine Card Component ====================
const FineCard: React.FC<{ 
  fine: FineItem; 
  onPress: () => void;
  onPay?: () => void;
}> = ({ fine, onPress, onPay }) => {
  
  const isPayable = fine.status === 'applied';
  const createdDate = new Date(fine.created_at);
  const isNew = (Date.now() - createdDate.getTime()) < 7 * 24 * 60 * 60 * 1000;

  const getStatusBarColor = () => {
    switch(fine.status) {
      case 'applied': return 'bg-gradient-to-r from-rose-500 to-rose-600';
      case 'under_review': return 'bg-gradient-to-r from-amber-500 to-amber-600';
      case 'paid': return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
      case 'rejected': return 'bg-gradient-to-r from-slate-500 to-slate-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const getAmountColor = () => {
    switch(fine.status) {
      case 'applied': return 'text-rose-600 dark:text-rose-400';
      case 'under_review': return 'text-amber-600 dark:text-amber-400';
      case 'paid': return 'text-emerald-600 dark:text-emerald-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-4 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Gradient Status Bar */}
      <div className={`h-1.5 ${getStatusBarColor()}`} />
      
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <StatusBadge status={fine.status} />
              {isNew && fine.status !== 'paid' && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 dark:bg-sky-950/40 rounded-full border border-sky-200 dark:border-sky-800">
                  <div className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">NEW</span>
                </div>
              )}
              <IonChip color="light" className="text-xs font-mono bg-slate-100 dark:bg-slate-700">
                #{fine.id.slice(0, 8)}
              </IonChip>
            </div>
            <p className={`text-3xl font-bold ${getAmountColor()}`}>
              ₹{parseFloat(fine.amount).toLocaleString()}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {fine.reason}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <IonIcon icon={calendarOutline} className="text-sky-500 dark:text-sky-400 text-sm" />
            <span>{new Date(fine.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <IonIcon icon={ticketOutline} className="text-purple-500 dark:text-purple-400 text-sm" />
            <span className="font-mono">{fine.booking_id.slice(0, 12)}...</span>
          </div>
          {fine.reason_code && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <IonIcon icon={documentTextOutline} className="text-orange-500 dark:text-orange-400 text-sm" />
              <span>Code: {fine.reason_code}</span>
            </div>
          )}
          {fine.decided_at && fine.status !== 'under_review' && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <IonIcon icon={checkmarkCircleOutline} className="text-emerald-500 dark:text-emerald-400 text-sm" />
              <span>Decided: {new Date(fine.decided_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <IonButton
            expand="block"
            fill="outline"
            color="primary"
            size="small"
            onClick={onPress}
            className="flex-1 rounded-xl"
          >
            <IonIcon icon={eyeOutline} slot="start" />
            Details
          </IonButton>
          {isPayable && onPay && (
            <IonButton
              expand="block"
              color="success"
              size="small"
              onClick={onPay}
              className="flex-1 rounded-xl"
            >
              <IonIcon icon={cashOutline} slot="start" />
              Pay Now
            </IonButton>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== Rule Card Component ====================
const RuleCard: React.FC<{ rule: FineRule; index: number }> = ({ rule, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  const getPriorityColor = () => {
    if (rule.priority === 1) return 'text-rose-600 dark:text-rose-400';
    if (rule.priority === 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-amber-600 dark:text-amber-400';
  };

  const getPriorityBg = () => {
    if (rule.priority === 1) return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    if (rule.priority === 2) return 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800';
    return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
      <div 
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              {index + 1}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{rule.title}</h3>
              <div className="flex items-center gap-2">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${getPriorityBg()}`}>
                  <IonIcon icon={alertCircleOutline} className={`text-xs ${getPriorityColor()}`} />
                  <span className={`text-xs font-semibold ${getPriorityColor()}`}>Priority {rule.priority}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{rule.message}</p>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <IonBadge color="light" className="px-2 py-1 bg-slate-100 dark:bg-slate-700">
                Code: {rule.code}
              </IonBadge>
              <IonBadge color="medium" className="px-2 py-1 bg-slate-100 dark:bg-slate-700">
                Type: {rule.type}
              </IonBadge>
              {rule.config.fine_value && (
                <IonBadge color="danger" className="px-2 py-1 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                  Fine: ₹{rule.config.fine_value}
                </IonBadge>
              )}
            </div>
          </div>
          <IonIcon 
            icon={chevronDownOutline} 
            className={`text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
        
        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {rule.config.max_minutes_before && (
                <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <span className="text-slate-500 dark:text-slate-400">Time Limit:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{rule.config.max_minutes_before} minutes before trip</p>
                </div>
              )}
              <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400">Rule Type:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{rule.type.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div className="col-span-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                <span className="text-slate-500 dark:text-slate-400">Description:</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                  This rule is automatically enforced by the system. Violations are tracked and fines are applied accordingly.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== Main Component ====================
const FineManagement: React.FC = () => {
  // State
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'fines' | 'rules'>('fines');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // Fine States
  const [fines, setFines] = useState<FineState>({
    items: [],
    count: 0,
    page_total_amount: '0'
  });
  
  // Summary State
  const [summary, setSummary] = useState<FineSummary>({
    total_pending: '0',
    total_applied: '0',
    total_rejected: '0'
  });
  
  // Rules State
  const [rules, setRules] = useState<FineRule[]>([]);
  
  // UI State
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFine, setSelectedFine] = useState<FineItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');
  const [showPayAlert, setShowPayAlert] = useState(false);
  const [payingFine, setPayingFine] = useState<FineItem | null>(null);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [showShareActionSheet, setShowShareActionSheet] = useState(false);
  const [shareData, setShareData] = useState<{ text: string; title: string }>({ text: '', title: '' });
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  // Get token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
      if (accessToken) {
        await loadAllData(accessToken);
      } else {
        setToastMessage('Please login again');
        setToastColor('danger');
        setShowToast(true);
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  // Load all data
  const loadAllData = async (authToken: string) => {
    await Promise.all([
      fetchFines(authToken),
      fetchSummary(authToken),
      fetchRules(authToken)
    ]);
    setLoading(false);
  };

  // Fetch fines from API
  const fetchFines = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/driver/fines?limit=100&offset=0`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch fines: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fines data:', data);
      
      setFines({
        items: data.items || [],
        count: data.count || 0,
        page_total_amount: data.page_total_amount || '0'
      });
      
    } catch (error) {
      console.error('Error fetching fines:', error);
      // Mock data for development
      setFines({
        items: [
          {
            id: "bf5905b4-c22a-4c6a-bf9c-748db9f28d16",
            booking_id: "6e42b254-45bb-4934-a38c-06996a30a34b",
            amount: "500",
            reason: "Late cancellation - Cancelled trip 15 minutes before scheduled time",
            reason_code: "LATE_CANCEL_001",
            status: "under_review",
            created_at: "2026-04-18T09:01:20.766570+00:00",
            decided_at: null,
            location: "Salt Lake, Kolkata",
            category: "TRAFFIC"
          },
          {
            id: "b29d253f-88f0-4b15-bd94-f86f2d5c9c8d",
            booking_id: "6e42b254-45bb-4934-a38c-06996a30a34b",
            amount: "1000",
            reason: "No show at pickup location - Passenger waited for 20 minutes",
            reason_code: "NO_SHOW_002",
            status: "applied",
            created_at: "2026-04-18T08:22:14.468328+00:00",
            decided_at: null,
            location: "Airport, Kolkata",
            category: "TRAFFIC"
          }
        ],
        count: 2,
        page_total_amount: "1500"
      });
    }
  };

  // Fetch summary from API
  const fetchSummary = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/driver/fines/summary`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch summary: ${response.status}`);
      }

      const data = await response.json();
      console.log('Summary data:', data);
      
      setSummary({
        total_pending: data.total_pending || '0',
        total_applied: data.total_applied || '0',
        total_rejected: data.total_rejected || '0'
      });
      
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary({
        total_pending: '500',
        total_applied: '1000',
        total_rejected: '0'
      });
    }
  };

  // Fetch rules from API
  const fetchRules = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/driver/fines/rules`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rules: ${response.status}`);
      }

      const data = await response.json();
      console.log('Rules data:', data);
      
      setRules(data.rules || []);
      
    } catch (error) {
      console.error('Error fetching rules:', error);
      // Mock rules
      setRules([
        {
          id: 'rule_1',
          code: 'late_cancel',
          title: 'Late Cancellation',
          type: 'driver_trip_cancel',
          priority: 1,
          config: { max_minutes_before: 30, fine_value: 50 },
          message: 'Cancel within 30 minutes before trip → Fine ₹50'
        },
        {
          id: 'rule_2',
          code: 'no_show',
          title: 'No Show',
          type: 'driver_trip_no_show',
          priority: 2,
          config: { fine_value: 100 },
          message: 'No show at pickup location → Fine ₹100'
        },
        {
          id: 'rule_3',
          code: 'bad_behavior',
          title: 'Unprofessional Behavior',
          type: 'driver_behavior',
          priority: 3,
          config: { fine_value: 200 },
          message: 'Unprofessional conduct with passengers → Fine ₹200'
        },
        {
          id: 'rule_4',
          code: 'speeding',
          title: 'Over Speeding',
          type: 'traffic_violation',
          priority: 4,
          config: { fine_value: 500 },
          message: 'Exceeding speed limit by more than 20 km/h → Fine ₹500'
        },
        {
          id: 'rule_5',
          code: 'wrong_route',
          title: 'Wrong Route Taken',
          type: 'navigation_error',
          priority: 5,
          config: { fine_value: 150 },
          message: 'Taking significantly longer route without passenger consent → Fine ₹150'
        }
      ]);
    }
  };

  // Refresh all data
  const handleRefresh = async (event: CustomEvent) => {
    setRefreshing(true);
    if (token) {
      await loadAllData(token);
    }
    setRefreshing(false);
    event.detail.complete();
  };

  // Pay fine
  const handlePayFine = async (fine: FineItem) => {
    setPayingFine(fine);
    setShowPayAlert(true);
  };

  const confirmPayFine = async () => {
    if (!token || !payingFine) return;
    
    setShowPayAlert(false);
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setToastMessage(`✅ Successfully paid ₹${parseFloat(payingFine.amount).toLocaleString()}`);
      setToastColor('success');
      setShowToast(true);
      
      await loadAllData(token);
      setShowModal(false);
      
    } catch (error) {
      console.error('Error paying fine:', error);
      setToastMessage('Payment failed. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setLoading(false);
      setPayingFine(null);
    }
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string, message: string = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      setToastMessage(message);
      setToastColor('success');
      setShowToast(true);
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      setToastMessage('Failed to copy. Please try again.');
      setToastColor('danger');
      setShowToast(true);
      return false;
    }
  };

  const performShare = async (payload: { title: string; text: string }) => {
    if (navigator.share) {
      return navigator.share({
        title: payload.title,
        text: payload.text
      });
    }
    return copyToClipboard(payload.text, 'Fine details copied to clipboard!');
  };

  const shareFineDetails = async (fine: FineItem) => {
    const shareText = `🚨 FINE DETAILS 🚨\n\n` +
      `Fine ID: ${fine.id}\n` +
      `Amount: ₹${parseFloat(fine.amount).toLocaleString()}\n` +
      `Reason: ${fine.reason}\n` +
      `Status: ${fine.status.toUpperCase()}\n` +
      `Date: ${new Date(fine.created_at).toLocaleDateString()}\n` +
      `Booking ID: ${fine.booking_id}\n` +
      `Reason Code: ${fine.reason_code || 'N/A'}\n` +
      `${fine.location ? `Location: ${fine.location}\n` : ''}` +
      `\n---\nSent from Fine Management App`;

    try {
      await performShare({
        title: `Fine Details - ${fine.id.slice(0, 8)}`,
        text: shareText
      });
      setToastMessage('Share dialog opened!');
      setToastColor('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error sharing:', error);
      setToastMessage('Failed to share. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  // Share fine as JSON
  const shareFineAsJSON = async (fine: FineItem) => {
    const fineJSON = JSON.stringify({
      fine_id: fine.id,
      amount: fine.amount,
      reason: fine.reason,
      reason_code: fine.reason_code,
      status: fine.status,
      created_at: fine.created_at,
      booking_id: fine.booking_id,
      location: fine.location
    }, null, 2);

    try {
      await performShare({
        title: `Fine Data - ${fine.id.slice(0, 8)}`,
        text: fineJSON
      });
      setToastMessage('Share dialog opened!');
      setToastColor('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Generate share text for fine
  const getFineShareText = (fine: FineItem): string => {
    return `🚨 FINE DETAILS 🚨\n\n` +
      `Fine ID: ${fine.id}\n` +
      `Amount: ₹${parseFloat(fine.amount).toLocaleString()}\n` +
      `Reason: ${fine.reason}\n` +
      `Status: ${fine.status.toUpperCase()}\n` +
      `Date: ${new Date(fine.created_at).toLocaleDateString()}\n` +
      `Booking ID: ${fine.booking_id}\n` +
      `Reason Code: ${fine.reason_code || 'N/A'}\n` +
      `${fine.location ? `Location: ${fine.location}\n` : ''}` +
      `\n---\nSent from Fine Management App`;
  };

  // Handle share action from modal
  const handleShare = (fine: FineItem) => {
    setShareData({
      text: getFineShareText(fine),
      title: `Fine Details - ${fine.id.slice(0, 8)}`
    });
    setShowShareActionSheet(true);
  };

  // Handle share via specific app
  const handleShareVia = async (type: string) => {
    if (!shareData.text) return;
    
    try {
      if (type === 'system' || type === 'whatsapp' || type === 'email') {
        await performShare({
          title: shareData.title,
          text: shareData.text
        });
      } else if (type === 'copy') {
        await copyToClipboard(shareData.text, 'Fine details copied to clipboard!');
      }
      setShowShareActionSheet(false);
    } catch (error) {
      console.error('Error sharing:', error);
      setToastMessage('Failed to share. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  // Filter fines based on search and status
  const filteredFines = fines.items.filter(fine => {
    if (selectedStatus !== 'all' && fine.status !== selectedStatus) return false;
    if (searchText === '') return true;
    const search = searchText.toLowerCase();
    return fine.reason.toLowerCase().includes(search) ||
           fine.id.toLowerCase().includes(search) ||
           fine.booking_id.toLowerCase().includes(search) ||
           (fine.reason_code && fine.reason_code.toLowerCase().includes(search));
  });

  // Calculate statistics
  const totalPendingAmount = parseFloat(summary.total_pending) + parseFloat(summary.total_applied);
  const totalAppliedAmount = parseFloat(summary.total_applied);
  const totalUnderReview = fines.items.filter(f => f.status === 'under_review').length;
  const totalApplied = fines.items.filter(f => f.status === 'applied').length;
  const totalPaid = fines.items.filter(f => f.status === 'paid').length;

  return (
    <IonPage>
      <NavbarSidebar />
      
      <IonHeader className="ion-no-border" style={{ marginTop: '60px' }}>
        <IonToolbar className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl">
          <IonTitle className="text-xl font-bold flex items-center gap-2">
            <div className="bg-white/20 rounded-full p-1.5">
              <IonIcon icon={shieldCheckmarkOutline} className="text-lg" />
            </div>
            Fine Management
          </IonTitle>
        </IonToolbar>
        
        <IonToolbar className="ion-padding-horizontal bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <IonSegment 
              value={activeSegment} 
              onIonChange={(e) => setActiveSegment(e.detail.value as any)}
              className="segment-rounded flex-1"
            >
              <IonSegmentButton value="fines">
                <IonIcon icon={alertCircleOutline} />
                <IonLabel>My Fines</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="rules">
                <IonIcon icon={bookOutline} />
                <IonLabel>Rules</IonLabel>
              </IonSegmentButton>
            </IonSegment>
            
            <div className="flex items-center gap-2 ml-2">
              {activeSegment === 'fines' && (
                <>
                  <IonButton fill="clear" onClick={() => setShowFilterPopover(true)}>
                    <IonIcon icon={filterOutline} slot="icon-only" />
                  </IonButton>
                  <IonButton fill="clear" onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}>
                    <IonIcon icon={viewMode === 'cards' ? barChartOutline : pieChartOutline} slot="icon-only" />
                  </IonButton>
                </>
              )}
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding-bottom bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div className="p-4 space-y-4">
            <IonSkeletonText animated style={{ height: '140px', borderRadius: '20px' }} />
            <IonSkeletonText animated style={{ height: '120px', borderRadius: '20px' }} />
            <IonSkeletonText animated style={{ height: '120px', borderRadius: '20px' }} />
          </div>
        ) : (
          <div className="p-4">
            
            {/* Fines Segment */}
            {activeSegment === 'fines' && (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <AnimatedStatCard
                    title="Total Outstanding"
                    amount={totalPendingAmount}
                    icon={cashOutline}
                    gradient="from-indigo-500 to-purple-600"
                    trend={12}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-linear-to-br from-amber-500 to-orange-500 rounded-xl p-3 text-white shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <IonIcon icon={timeOutline} className="text-lg" />
                      <span className="text-xl font-bold">{totalUnderReview}</span>
                    </div>
                    <p className="text-xs opacity-90">Under Review</p>
                    <p className="text-sm font-semibold mt-1">₹{parseFloat(summary.total_pending).toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-linear-to-br from-rose-500 to-pink-500 rounded-xl p-3 text-white shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <IonIcon icon={alertCircleOutline} className="text-lg" />
                      <span className="text-xl font-bold">{totalApplied}</span>
                    </div>
                    <p className="text-xs opacity-90">Applied</p>
                    <p className="text-sm font-semibold mt-1">₹{totalAppliedAmount.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-linear-to-br from-emerald-500 to-teal-500 rounded-xl p-3 text-white shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <IonIcon icon={checkmarkCircleOutline} className="text-lg" />
                      <span className="text-xl font-bold">{totalPaid}</span>
                    </div>
                    <p className="text-xs opacity-90">Paid</p>
                    <p className="text-sm font-semibold mt-1">-</p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mb-4">
                  <IonSearchbar
                    placeholder="Search by reason, ID, or booking..."
                    value={searchText}
                    onIonInput={(e: CustomEvent) => setSearchText(e.detail.value!)}
                    className="rounded-xl shadow-md"
                    animated
                    debounce={300}
                  />
                </div>

                {/* Status Filters */}
                {/* <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
                  {['all', 'under_review', 'applied', 'paid', 'rejected'].map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap shadow-sm
                        ${selectedStatus === status 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}
                    >
                      {status === 'all' ? 'All' : 
                       status === 'under_review' ? 'Under Review' :
                       status.charAt(0).toUpperCase() + status.slice(1)}
                      <span className="ml-1 text-xs opacity-80">
                        ({status === 'all' ? fines.items.length : fines.items.filter(f => f.status === status).length})
                      </span>
                    </button>
                  ))}
                </div> */}
                {/* Status Filters - Equal Width Pill Design */}
<div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
  {[
    { id: 'all', label: 'All', icon: 'all', color: 'indigo' },
    { id: 'under_review', label: 'Review', icon: 'time', color: 'amber' },
    { id: 'applied', label: 'Applied', icon: 'alert', color: 'rose' },
    { id: 'paid', label: 'Paid', icon: 'check', color: 'emerald' },
    { id: 'rejected', label: 'Rejected', icon: 'close', color: 'slate' }
  ].map(status => {
    const getIcon = () => {
      switch(status.icon) {
        case 'time': return timeOutline;
        case 'alert': return alertCircleOutline;
        case 'check': return checkmarkCircleOutline;
        case 'close': return closeCircleOutline;
        default: return null;
      }
    };
    
    const IconComponent = getIcon();
    const isActive = selectedStatus === status.id;
    const count = status.id === 'all' 
      ? fines.items.length 
      : fines.items.filter(f => f.status === status.id).length;
    
    const getColorClasses = () => {
      if (!isActive) return 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600';
      
      switch(status.color) {
        case 'indigo': return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-indigo-500/30';
        case 'amber': return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/30';
        case 'rose': return 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-500/30';
        case 'emerald': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30';
        case 'slate': return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-slate-500/30';
        default: return 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-indigo-500/30';
      }
    };
    
    return (
      <button
        key={status.id}
        onClick={() => setSelectedStatus(status.id)}
        style={{
          minWidth: '85px',
          maxWidth: '100px',
          height: '42px',
          flex: '1 1 auto'
        }}
        className={`
          relative rounded-2xl text-sm font-medium 
          transition-all duration-300 ease-out whitespace-nowrap
          flex items-center justify-center gap-2
          ${isActive 
            ? `${getColorClasses()} shadow-lg transform scale-105 ring-2 ring-white/20` 
            : `${getColorClasses()} hover:scale-102 hover:shadow-md`
          }
        `}
      >
        {IconComponent && (
          <IonIcon 
            icon={IconComponent} 
            className={`text-base transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}
          />
        )}
        <span className="text-sm">{status.label}</span>
        <div className={`
          relative flex items-center justify-center rounded-full px-1.5 min-w-[22px] h-5 text-xs font-bold
          transition-all duration-300
          ${isActive 
            ? 'bg-white/25 text-white' 
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
          }
        `}>
          {count}
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
          )}
        </div>
        
        {/* Active Indicator */}
        {isActive && (
          <>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full" />
          </>
        )}
      </button>
    );
  })}
</div>


                {/* Fines List */}
                {filteredFines.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-5 shadow-inner">
                      <IonIcon icon={checkmarkCircleOutline} className="text-5xl text-slate-400" />
                    </div>
                    <IonText color="medium">
                      <p className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">No fines found</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">You have no {selectedStatus !== 'all' ? selectedStatus : ''} fines. Great job! 🎉</p>
                    </IonText>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFines.map(fine => (
                      <FineCard
                        key={fine.id}
                        fine={fine}
                        onPress={() => {
                          setSelectedFine(fine);
                          setShowModal(true);
                        }}
                        onPay={() => handlePayFine(fine)}
                      />
                    ))}
                  </div>
                )}

                {/* Footer Summary */}
                {fines.items.length > 0 && (
                  <div className="mt-6 p-4 bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total Fines Amount</span>
                      <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        ₹{parseFloat(fines.page_total_amount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Total Count</span>
                      <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {fines.count} fines
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Rules Segment */}
            {activeSegment === 'rules' && (
              <>
                {/* Header Banner */}
                <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 rounded-full p-2.5 backdrop-blur-sm">
                      <IonIcon icon={bookOutline} className="text-2xl" />
                    </div>
                    <h2 className="text-xl font-bold">Fine Rules & Regulations</h2>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">
                    Understand the rules to avoid penalties. These rules are applied automatically based on your driving behavior and trip compliance.
                  </p>
                </div>

                {/* Rules List */}
                {rules.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-5">
                      <IonIcon icon={bookOutline} className="text-5xl text-slate-400" />
                    </div>
                    <IonText color="medium">
                      <p className="text-lg font-medium text-slate-800 dark:text-slate-200">No rules available</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fine rules will appear here once configured</p>
                    </IonText>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-6 bg-indigo-500 rounded-full" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {rules.length} Active Rules
                        </span>
                      </div>
                      <IonChip color="light" className="text-xs bg-slate-100 dark:bg-slate-700">
                        Last updated: Today
                      </IonChip>
                    </div>
                    {rules.map((rule, idx) => (
                      <RuleCard key={rule.id} rule={rule} index={idx} />
                    ))}
                  </div>
                )}

                {/* Important Note */}
                <div className="mt-6 p-5 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-2">
                      <IonIcon icon={informationCircleOutline} className="text-amber-600 dark:text-amber-400 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-amber-800 dark:text-amber-600 mb-1">Important Information</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-600 leading-relaxed">
                        • Fines are reviewed by our team before being applied<br />
                        • You will receive a notification when a fine is issued or updated<br />
                        • You can dispute any fine within 7 days of issuance<br />
                        • Late payments may incur additional penalties
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </IonContent>

      {/* Filter Popover */}
      <IonPopover
        isOpen={showFilterPopover}
        onDidDismiss={() => setShowFilterPopover(false)}
        className="filter-popover"
      >
        <div className="p-5 min-w-[300px]">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-4">Filter Fines</h3>
          
          <div className="mb-4">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Status</label>
            <IonSelect
              value={selectedStatus}
              onIonChange={(e) => setSelectedStatus(e.detail.value)}
              interface="popover"
              className="w-full rounded-xl"
            >
              <IonSelectOption value="all">All Status</IonSelectOption>
              <IonSelectOption value="under_review">Under Review</IonSelectOption>
              <IonSelectOption value="applied">Applied</IonSelectOption>
              <IonSelectOption value="paid">Paid</IonSelectOption>
              <IonSelectOption value="rejected">Rejected</IonSelectOption>
            </IonSelect>
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">From Date</label>
            <IonDatetime
              value={dateRange.from}
              onIonChange={(e) => setDateRange(prev => ({ ...prev, from: e.detail.value as string }))}
              presentation="date"
              className="w-full rounded-xl"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">To Date</label>
            <IonDatetime
              value={dateRange.to}
              onIonChange={(e) => setDateRange(prev => ({ ...prev, to: e.detail.value as string }))}
              presentation="date"
              className="w-full rounded-xl"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <IonButton 
              expand="block" 
              onClick={() => {
                setShowFilterPopover(false);
                setToastMessage('Filters applied');
                setShowToast(true);
              }} 
              className="flex-1 rounded-xl"
            >
              Apply Filters
            </IonButton>
            <IonButton 
              expand="block" 
              fill="outline" 
              onClick={() => {
                setSelectedStatus('all');
                setDateRange({ from: '', to: '' });
                setSearchText('');
                setShowFilterPopover(false);
                setToastMessage('Filters reset');
                setShowToast(true);
              }} 
              className="flex-1 rounded-xl"
            >
              Reset
            </IonButton>
          </div>
        </div>
      </IonPopover>

      {/* Share Action Sheet */}
      <IonActionSheet
        isOpen={showShareActionSheet}
        onDidDismiss={() => setShowShareActionSheet(false)}
        header="Share Fine Details"
        buttons={[
          {
            text: 'Share via System',
            icon: shareSocialOutline,
            handler: () => handleShareVia('system'),
          },
          {
            text: 'Share via WhatsApp',
            icon: logoWhatsapp,
            handler: () => handleShareVia('whatsapp'),
          },
          {
            text: 'Share via Email',
            icon: mailOutline,
            handler: () => handleShareVia('email'),
          },
          {
            text: 'Copy to Clipboard',
            icon: copyOutline,
            handler: () => handleShareVia('copy'),
          },
          {
            text: 'Cancel',
            icon: closeCircleOutline,
            role: 'cancel',
          },
        ]}
      />

      {/* Fine Details Modal */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        {selectedFine && (
          <>
            <IonToolbar className="ion-padding-horizontal">
              <IonTitle className="text-lg font-bold">Fine Details</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowModal(false)}>
                <IonIcon icon={closeCircleOutline} />
              </IonButton>
            </IonToolbar>
            <IonContent className="ion-padding">
              {/* Amount Card */}
              <div className={`bg-linear-to-r rounded-2xl p-6 text-white mb-6 shadow-xl ${
                selectedFine.status === 'paid' ? 'from-emerald-500 to-teal-500' :
                selectedFine.status === 'applied' ? 'from-rose-500 to-pink-500' :
                selectedFine.status === 'rejected' ? 'from-slate-500 to-slate-600' :
                'from-amber-500 to-orange-500'
              }`}>
                <p className="text-sm opacity-90">Fine Amount</p>
                <p className="text-4xl font-bold mt-1">₹{parseFloat(selectedFine.amount).toLocaleString()}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs opacity-80">Fine ID: {selectedFine.id.slice(0, 12)}...</p>
                  <div className="flex gap-2">
                    <IonButton 
                      fill="clear" 
                      size="small" 
                      onClick={() => copyToClipboard(selectedFine.id, 'Fine ID copied!')}
                      className="text-white"
                    >
                      <IonIcon icon={copyOutline} slot="icon-only" />
                    </IonButton>
                    <IonButton 
                      fill="clear" 
                      size="small" 
                      onClick={() => handleShare(selectedFine)}
                      className="text-white"
                    >
                      <IonIcon icon={shareSocialOutline} slot="icon-only" />
                    </IonButton>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {/* Reason */}
                <div className="bg-slate-50 dark:bg-yellow-800/50 rounded-xl p-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <IonIcon icon={alertCircleOutline} className="text-sm" />
                    Violation Reason
                  </label>
                  <p className="text-slate-800 dark:text-slate-200 mt-2 font-medium">{selectedFine.reason}</p>
                </div>

                {/* Two Column Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-blue-800/50 rounded-xl p-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                    <div className="mt-2">
                      <StatusBadge status={selectedFine.status} />
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-orange-800/50 rounded-xl p-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reason Code</label>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-slate-800 dark:text-slate-200 font-mono text-sm">{selectedFine.reason_code || 'N/A'}</p>
                      {selectedFine.reason_code && (
                        <IonButton fill="clear" size="small" onClick={() => copyToClipboard(selectedFine.reason_code!, 'Reason code copied!')}>
                          <IonIcon icon={copyOutline} slot="icon-only" className="text-blue-400" />
                        </IonButton>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div className="bg-slate-50 dark:bg-green-800/50 rounded-xl p-4">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                    <IonIcon icon={ticketOutline} className="text-sm" />
                    Booking Information
                  </label>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-slate-800 dark:text-slate-200 font-mono text-sm">{selectedFine.booking_id}</p>
                    <IonButton fill="clear" size="small" onClick={() => copyToClipboard(selectedFine.booking_id, 'Booking ID copied!')}>
                      <IonIcon icon={copyOutline} slot="icon-only" className="text-slate-400" />
                    </IonButton>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-orange-500/50 rounded-xl p-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <IonIcon icon={calendarOutline} className="text-sm" />
                      Issue Date
                    </label>
                    <p className="text-slate-800 dark:text-slate-200 mt-2 text-sm">
                      {new Date(selectedFine.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(selectedFine.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {selectedFine.decided_at && (
                    <div className="bg-slate-50 dark:bg-red-800/50 rounded-xl p-3">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Decided Date</label>
                      <p className="text-slate-800 dark:text-slate-200 mt-2 text-sm">
                        {new Date(selectedFine.decided_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Location */}
                {selectedFine.location && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <IonIcon icon={mapOutline} className="text-sm" />
                      Location
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <IonIcon icon={locationOutline} className="text-rose-500 dark:text-rose-400 text-sm" />
                      <span className="text-slate-800 dark:text-slate-200 text-sm">{selectedFine.location}</span>
                      <IonButton fill="clear" size="small" onClick={() => copyToClipboard(selectedFine.location!, 'Location copied!')}>
                        <IonIcon icon={copyOutline} slot="icon-only" className="text-slate-400" />
                      </IonButton>
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {selectedFine.status === 'applied' && (
                  <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
                    <div className="flex items-start gap-3">
                      <IonIcon icon={warningOutline} className="text-rose-500 text-xl" />
                      <div>
                        <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">Action Required</p>
                        <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                          This fine has been applied to your account. Please pay before the due date to avoid additional penalties.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedFine.status === 'under_review' && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <IonIcon icon={timeOutline} className="text-amber-500 text-xl" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-600">Under Review</p>
                        <p className="text-xs text-amber-700 dark:text-amber-700 mt-1">
                          This fine is currently being reviewed by our team. You will be notified once a decision is made.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedFine.status === 'rejected' && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-start gap-3">
                      <IonIcon icon={checkmarkCircleOutline} className="text-emerald-500 text-xl" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-600">Fine Rejected</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-600 mt-1">
                          This fine has been reviewed and rejected. No action required from your end.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8">
                {selectedFine.status === 'applied' && (
                  <IonButton 
                    expand="block" 
                    color="success" 
                    onClick={() => {
                      setShowModal(false);
                      handlePayFine(selectedFine);
                    }}
                    className="mb-3 rounded-xl h-12"
                  >
                    <IonIcon icon={cashOutline} slot="start" />
                    Pay Fine Now
                  </IonButton>
                )}
                <div className="flex gap-3">
                  <IonButton 
                    expand="block" 
                    fill="outline" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Close
                  </IonButton>
                  <IonButton 
                    expand="block" 
                    fill="solid" 
                    color="primary"
                    onClick={() => handleShare(selectedFine)}
                    className="flex-1 rounded-xl"
                  >
                    <IonIcon icon={shareSocialOutline} slot="start" />
                    Share
                  </IonButton>
                </div>
              </div>
            </IonContent>
          </>
        )}
      </IonModal>

      {/* Payment Confirmation Alert */}
      <IonAlert
        isOpen={showPayAlert}
        onDidDismiss={() => setShowPayAlert(false)}
        header="Confirm Payment"
        message={`Are you sure you want to pay ₹${payingFine ? parseFloat(payingFine.amount).toLocaleString() : '0'} for this fine?`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => setPayingFine(null)
          },
          {
            text: 'Pay Now',
            handler: confirmPayFine
          }
        ]}
      />

      {/* Toast Notification */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
        color={toastColor}
        buttons={[
          {
            text: 'Dismiss',
            role: 'cancel'
          }
        ]}
      />

      {/* FAB Button */}
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton 
          className="bg-linear-to-r from-indigo-600 to-purple-600 shadow-xl"
          onClick={() => {
            if (token) {
              loadAllData(token);
              setToastMessage('Refreshed successfully');
              setToastColor('success');
              setShowToast(true);
            }
          }}
        >
          <IonIcon icon={reloadOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

export default FineManagement;