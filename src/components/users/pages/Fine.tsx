// src/components/users/pages/Fine.tsx
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
  IonAlert
} from '@ionic/react';
import {
  barChartOutline,
  cardOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  timeOutline,
  cashOutline,
  carSportOutline,
  locationOutline,
  calendarOutline,
  documentTextOutline,
  closeCircleOutline,
  downloadOutline,
  trendingUpOutline,
  warningOutline,
  checkmarkDoneCircleOutline
} from 'ionicons/icons';
import NavbarSidebar from './Navbar';

// ==================== টাইপ ডিফিনেশন ====================
interface Fine {
  id: string;
  amount: number;
  reason: string;
  reasonCode: string;
  status: 'PENDING' | 'PAID' | 'DISPUTED' | 'OVERDUE';
  category: 'TRAFFIC' | 'PARKING' | 'SPEEDING' | 'DOCUMENT' | 'OTHER';
  source: 'BOOKING' | 'TRIP' | 'INSPECTION' | 'COMPLAINT' | 'SYSTEM';
  sourceId: string;
  sourceName: string;
  date: string;
  dueDate: string;
  paidAt?: string;
  location?: string;
  officerName?: string;
  notes?: string;
  imageUrl?: string;
}

interface FineStats {
  totalFines: number;
  totalAmount: number;
  pendingAmount: number;
  paidAmount: number;
  overdueCount: number;
  disputedCount: number;
}

interface ChartData {
  name: string;
  amount: number;
  count: number;
  color: string;
}

// ==================== ডামি ডাটা ====================
const dummyFines: Fine[] = [
  {
    id: 'F001',
    amount: 1500,
    reason: 'Over Speeding (80 km/h in 50 km/h zone)',
    reasonCode: 'SPD-001',
    status: 'PENDING',
    category: 'SPEEDING',
    source: 'TRIP',
    sourceId: 'TRIP-2024-001',
    sourceName: 'Kolkata to Durgapur Trip',
    date: '2024-12-15T10:30:00Z',
    dueDate: '2025-01-15T00:00:00Z',
    location: 'NH-19, Dankuni',
    officerName: 'SI A. Kumar',
    notes: 'Radar gun reading confirmed - Speed: 80km/h in 50km/h zone'
  },
  {
    id: 'F002',
    amount: 500,
    reason: 'Wrong Parking',
    reasonCode: 'PRK-002',
    status: 'PENDING',
    category: 'PARKING',
    source: 'BOOKING',
    sourceId: 'BK-2024-089',
    sourceName: 'City Center Mall Booking',
    date: '2024-12-18T14:15:00Z',
    dueDate: '2025-01-18T00:00:00Z',
    location: 'City Center Mall, Salt Lake',
    officerName: 'Traffic Guard'
  },
  {
    id: 'F003',
    amount: 2000,
    reason: 'Driving Without Valid License',
    reasonCode: 'DOC-001',
    status: 'DISPUTED',
    category: 'DOCUMENT',
    source: 'INSPECTION',
    sourceId: 'INSP-2024-056',
    sourceName: 'Random Vehicle Check',
    date: '2024-12-10T09:45:00Z',
    dueDate: '2025-01-10T00:00:00Z',
    location: 'Airport Gate No. 2',
    officerName: 'Inspector S. Roy',
    notes: 'License expired on 01-12-2024'
  },
  {
    id: 'F004',
    amount: 3000,
    reason: 'Red Light Violation',
    reasonCode: 'TRF-003',
    status: 'OVERDUE',
    category: 'TRAFFIC',
    source: 'SYSTEM',
    sourceId: 'CAM-2024-234',
    sourceName: 'Traffic Camera System',
    date: '2024-11-20T18:20:00Z',
    dueDate: '2024-12-20T00:00:00Z',
    location: 'Salt Lake Sector V Crossing',
    imageUrl: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 'F005',
    amount: 1000,
    reason: 'No Helmet',
    reasonCode: 'SAF-001',
    status: 'PAID',
    category: 'TRAFFIC',
    source: 'COMPLAINT',
    sourceId: 'CMP-2024-012',
    sourceName: 'Public Complaint',
    date: '2024-11-25T08:00:00Z',
    dueDate: '2024-12-25T00:00:00Z',
    paidAt: '2024-12-01T00:00:00Z',
    location: 'Howrah Bridge'
  },
  {
    id: 'F006',
    amount: 2500,
    reason: 'Using Mobile Phone While Driving',
    reasonCode: 'TRF-006',
    status: 'PENDING',
    category: 'TRAFFIC',
    source: 'TRIP',
    sourceId: 'TRIP-2024-089',
    sourceName: 'Airport Drop Trip',
    date: '2024-12-19T11:00:00Z',
    dueDate: '2025-01-19T00:00:00Z',
    location: 'VIP Road, Kolkata'
  },
  {
    id: 'F007',
    amount: 800,
    reason: 'Dirty Number Plate',
    reasonCode: 'GEN-002',
    status: 'PENDING',
    category: 'OTHER',
    source: 'INSPECTION',
    sourceId: 'INSP-2024-078',
    sourceName: 'Regular Checkpoint',
    date: '2024-12-20T09:30:00Z',
    dueDate: '2025-01-20T00:00:00Z',
    location: 'Esplanade Crossing',
    officerName: 'CT S. Das'
  },
  {
    id: 'F008',
    amount: 5000,
    reason: 'Drunk Driving',
    reasonCode: 'TRF-010',
    status: 'DISPUTED',
    category: 'TRAFFIC',
    source: 'TRIP',
    sourceId: 'TRIP-2024-156',
    sourceName: 'Late Night Trip',
    date: '2024-12-05T23:45:00Z',
    dueDate: '2025-01-05T00:00:00Z',
    location: 'Park Street',
    officerName: 'SI M. Rahman',
    notes: 'Breathalyzer test positive'
  }
];

// সিম্পল কাস্টম চার্ট কম্পোনেন্ট (recharts ছাড়া)
const SimpleCategoryChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percentage = (item.amount / total) * 100;
        return (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
              <span className="text-gray-600 dark:text-gray-400">
                ₹{item.amount.toLocaleString()} ({item.count})
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: item.color 
                }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {percentage.toFixed(1)}% of total
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SimpleBarChart: React.FC<{ data: ChartData[] }> = ({ data }) => {
  const maxAmount = Math.max(...data.map(item => item.amount));
  
  return (
    <div className="flex items-end justify-around h-64 gap-2">
      {data.map((item, index) => {
        const height = (item.amount / maxAmount) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
              style={{ 
                height: `${height}%`,
                backgroundColor: item.color,
                minHeight: '20px'
              }}
            />
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">₹{item.amount}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==================== মেইন কম্পোনেন্ট ====================
const Fine: React.FC = () => {
  // স্টেট
  const [fines, setFines] = useState<Fine[]>([]);
  const [stats, setStats] = useState<FineStats>({
    totalFines: 0,
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
    overdueCount: 0,
    disputedCount: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<'overview' | 'fines'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedFine, setSelectedFine] = useState<Fine | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // লোড ডাটা
  useEffect(() => {
    loadDummyData();
  }, []);

  const loadDummyData = () => {
    setFines(dummyFines);
    
    // স্ট্যাটাস ক্যালকুলেশন
    const totalAmount = dummyFines.reduce((sum, fine) => sum + fine.amount, 0);
    const pendingAmount = dummyFines
      .filter(f => f.status === 'PENDING')
      .reduce((sum, fine) => sum + fine.amount, 0);
    const paidAmount = dummyFines
      .filter(f => f.status === 'PAID')
      .reduce((sum, fine) => sum + fine.amount, 0);
    const overdueCount = dummyFines.filter(f => f.status === 'OVERDUE').length;
    const disputedCount = dummyFines.filter(f => f.status === 'DISPUTED').length;

    setStats({
      totalFines: dummyFines.length,
      totalAmount,
      pendingAmount,
      paidAmount,
      overdueCount,
      disputedCount
    });

    // চার্ট ডাটা
    const categoryMap = new Map<string, ChartData>();
    const colors: Record<string, string> = {
      TRAFFIC: '#EF4444',
      PARKING: '#F59E0B',
      SPEEDING: '#3B82F6',
      DOCUMENT: '#8B5CF6',
      OTHER: '#6B7280'
    };
    
    dummyFines.forEach(fine => {
      const existing = categoryMap.get(fine.category);
      if (existing) {
        existing.amount += fine.amount;
        existing.count += 1;
      } else {
        categoryMap.set(fine.category, {
          name: fine.category,
          amount: fine.amount,
          count: 1,
          color: colors[fine.category]
        });
      }
    });
    
    setChartData(Array.from(categoryMap.values()));
    setLoading(false);
  };

  // ফাইন পে করা
  const payFine = (fineId: string) => {
    setFines(prev => prev.map(fine => 
      fine.id === fineId 
        ? { ...fine, status: 'PAID', paidAt: new Date().toISOString() }
        : fine
    ));
    setToastMessage('Fine paid successfully!');
    setShowToast(true);
    loadDummyData();
  };

  // ফাইন ডিসপিউট করা
  const disputeFine = (fineId: string) => {
    setFines(prev => prev.map(fine => 
      fine.id === fineId ? { ...fine, status: 'DISPUTED' } : fine
    ));
    setToastMessage('Dispute filed successfully!');
    setShowToast(true);
    loadDummyData();
  };

  // ফাইন রিমাইন্ডার
  const sendReminder = (fine: Fine) => {
    setAlertMessage(`Reminder sent to ${fine.sourceName} for fine ₹${fine.amount}`);
    setShowAlert(true);
  };

  // ফিল্টার এবং সার্চ
  const filteredFines = fines.filter(fine => {
    if (filterStatus !== 'all' && fine.status !== filterStatus) return false;
    if (searchText) {
      const search = searchText.toLowerCase();
      return fine.reason.toLowerCase().includes(search) ||
             fine.sourceName.toLowerCase().includes(search) ||
             fine.reasonCode.toLowerCase().includes(search) ||
             (fine.location && fine.location.toLowerCase().includes(search));
    }
    return true;
  });

  // স্ট্যাটাস কালার
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'warning';
      case 'PAID': return 'success';
      case 'DISPUTED': return 'danger';
      case 'OVERDUE': return 'danger';
      default: return 'medium';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return timeOutline;
      case 'PAID': return checkmarkCircleOutline;
      case 'DISPUTED': return closeCircleOutline;
      case 'OVERDUE': return alertCircleOutline;
      default: return alertCircleOutline;
    }
  };

  const pendingFines = fines.filter(f => f.status === 'PENDING');

  return (
    <IonPage>
      <NavbarSidebar />
      <IonHeader className="ion-no-border mt-20">
        <IonToolbar className="bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <IonTitle className="text-xl font-bold flex items-center gap-2">
            <IonIcon icon={carSportOutline} className="text-2xl" />
            Fine Management
          </IonTitle>
        </IonToolbar>
        <IonToolbar className="ion-padding-horizontal">
          <IonSegment 
            value={segment} 
            onIonChange={(e: { detail: { value: any; }; }) => setSegment(e.detail.value as any)}
            className="segment-rounded"
          >
            <IonSegmentButton value="overview">
              <IonIcon icon={barChartOutline} />
              <IonLabel>Dashboard</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="fines">
              <IonIcon icon={cardOutline} />
              <IonLabel>My Fines</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding-bottom">
        <IonRefresher slot="fixed" onIonRefresh={(e: { detail: { complete: () => any; }; }) => {
          loadDummyData();
          setTimeout(() => e.detail.complete(), 1500);
        }}>
          <IonRefresherContent />
        </IonRefresher>

        {segment === 'overview' ? (
         
          <div className="p-4">
           
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm">Total Fines Amount</p>
                  <p className="text-3xl font-bold mt-1">₹{stats.totalAmount.toLocaleString()}</p>
                  <p className="text-blue-100 text-xs mt-2">Total {stats.totalFines} fines issued</p>
                </div>
                <div className="bg-white/20 rounded-full p-3 backdrop-blur">
                  <IonIcon icon={trendingUpOutline} className="text-2xl" />
                </div>
              </div>
            </div>

           
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-linear-to-br from-yellow-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg transform transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <IonIcon icon={timeOutline} className="text-2xl" />
                  <span className="text-2xl font-bold">{pendingFines.length}</span>
                </div>
                <p className="text-sm opacity-90">Pending Fines</p>
                <p className="text-lg font-semibold mt-1">₹{stats.pendingAmount.toLocaleString()}</p>
              </div>
              
              <div className="bg-linear-to-br from-red-500 to-rose-500 rounded-2xl p-4 text-white shadow-lg transform transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <IonIcon icon={warningOutline} className="text-2xl" />
                  <span className="text-2xl font-bold">{stats.overdueCount}</span>
                </div>
                <p className="text-sm opacity-90">Overdue Fines</p>
                <p className="text-xs mt-1">Urgent Action Required!</p>
              </div>
              
              <div className="bg-linear-to-br from-green-500 to-emerald-500 rounded-2xl p-4 text-white shadow-lg transform transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <IonIcon icon={checkmarkDoneCircleOutline} className="text-2xl" />
                  <span className="text-2xl font-bold">{fines.filter(f => f.status === 'PAID').length}</span>
                </div>
                <p className="text-sm opacity-90">Paid Fines</p>
                <p className="text-lg font-semibold mt-1">₹{stats.paidAmount.toLocaleString()}</p>
              </div>
              
              <div className="bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg transform transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <IonIcon icon={alertCircleOutline} className="text-2xl" />
                  <span className="text-2xl font-bold">{stats.disputedCount}</span>
                </div>
                <p className="text-sm opacity-90">Disputed</p>
                <p className="text-xs mt-1">Under Review</p>
              </div>
            </div>

            
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg mb-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  Fine Distribution by Category
                </h3>
                <SimpleCategoryChart data={chartData} />
              </div>
            )}

           
            {chartData.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg mb-6">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  Fine Amount by Category
                </h3>
                <SimpleBarChart data={chartData} />
              </div>
            )}

           
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  Recent Fines
                </h3>
                <button 
                  onClick={() => setSegment('fines')}
                  className="text-blue-600 text-sm font-medium"
                >
                  View All →
                </button>
              </div>
              {fines.slice(0, 3).map(fine => (
                <IonCard key={fine.id} className="rounded-xl shadow-lg mb-4">
                  <IonCardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <IonIcon icon={getStatusIcon(fine.status)} className="text-lg" />
                          <IonBadge color={getStatusColor(fine.status)} className="px-3 py-1 rounded-full">
                            {fine.status}
                          </IonBadge>
                        </div>
                        <p className="text-xl font-bold text-gray-800 dark:text-white">
                          ₹{fine.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{fine.reason}</p>
                      </div>
                      <IonChip color="light" className="text-xs">
                        {fine.reasonCode}
                      </IonChip>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <IonIcon icon={carSportOutline} />
                      <span>{fine.sourceName}</span>
                    </div>
                    <IonButton 
                      expand="block" 
                      fill="outline" 
                      color="primary" 
                      size="small"
                      onClick={() => {
                        setSelectedFine(fine);
                        setShowModal(true);
                      }}
                    >
                      View Details
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          </div>
        ) : (
         
          <div className="p-4">
         
            <div className="mb-5 space-y-3">
              <IonSearchbar
                placeholder="Search by reason, trip, location..."
                value={searchText}
                onIonInput={(e: CustomEvent) => setSearchText(e.detail.value!)}
                className="rounded-xl shadow-md"
                animated
              />
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'PENDING', 'PAID', 'DISPUTED', 'OVERDUE'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap shadow-sm
                      ${filterStatus === status 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    {status === 'all' ? 'All' : status}
                    {status !== 'all' && (
                      <span className="ml-1 text-xs">
                        ({fines.filter(f => f.status === status).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

      
            <div className="mb-3 px-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredFines.length} of {fines.length} fines
              </p>
            </div>

          
            {loading ? (
              <div className="flex justify-center py-12">
                <IonSpinner name="crescent" className="text-4xl" />
              </div>
            ) : filteredFines.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <IonIcon icon={checkmarkCircleOutline} className="text-4xl text-gray-400" />
                </div>
                <IonText color="medium">
                  <p className="text-lg font-medium">No fines found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filter</p>
                </IonText>
              </div>
            ) : (
              filteredFines.map(fine => (
                <IonCard key={fine.id} className="rounded-xl shadow-lg mb-4 overflow-hidden">
               
                  <div className={`h-1 ${
                    fine.status === 'PENDING' ? 'bg-yellow-500' :
                    fine.status === 'PAID' ? 'bg-green-500' :
                    fine.status === 'OVERDUE' ? 'bg-red-500' : 'bg-purple-500'
                  }`} />
                  
                  <IonCardContent className="p-4">
                   
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <IonBadge color={getStatusColor(fine.status)} className="px-3 py-1 rounded-full">
                            <div className="flex items-center gap-1">
                              <IonIcon icon={getStatusIcon(fine.status)} className="text-sm" />
                              <span className="text-xs font-semibold">{fine.status}</span>
                            </div>
                          </IonBadge>
                          <IonBadge color="light" className="px-3 py-1 rounded-full">
                            {fine.category}
                          </IonBadge>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          ₹{fine.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                          {fine.reason}
                        </p>
                      </div>
                      <IonChip color="medium" className="text-xs font-mono">
                        {fine.reasonCode}
                      </IonChip>
                    </div>

                   
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
                        <IonIcon icon={carSportOutline} className="text-blue-500" />
                        <span className="font-medium">Source:</span>
                        <span>{fine.sourceName}</span>
                        <span className="text-xs text-gray-200">({fine.sourceId})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
                        <IonIcon icon={calendarOutline} className="text-green-500" />
                        <span className="font-medium">Date:</span>
                        <span>{new Date(fine.date).toLocaleDateString()}</span>
                      </div>
                      {fine.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
                          <IonIcon icon={locationOutline} className="text-red-500" />
                          <span className="font-medium">Location:</span>
                          <span>{fine.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-200">
                        <IonIcon icon={cashOutline} className="text-yellow-500" />
                        <span className="font-medium">Due Date:</span>
                        <span className={new Date(fine.dueDate) < new Date() && fine.status !== 'PAID' ? 'text-red-500 font-semibold' : ''}>
                          {new Date(fine.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                  
                    <div className="flex gap-2 mt-2">
                      <IonButton
                        expand="block"
                        fill="outline"
                        color="primary"
                        size="small"
                        onClick={() => {
                          setSelectedFine(fine);
                          setShowModal(true);
                        }}
                        className="flex-1"
                      >
                        <IonIcon icon={documentTextOutline} slot="start" />
                        Details
                      </IonButton>
                      {fine.status === 'PENDING' && (
                        <>
                          <IonButton
                            expand="block"
                            color="success"
                            size="small"
                            onClick={() => payFine(fine.id)}
                            className="flex-1"
                          >
                            <IonIcon icon={cashOutline} slot="start" />
                            Pay Now
                          </IonButton>
                          <IonButton
                            expand="block"
                            fill="outline"
                            color="danger"
                            size="small"
                            onClick={() => disputeFine(fine.id)}
                            className="flex-1"
                          >
                            Dispute
                          </IonButton>
                        </>
                      )}
                      {fine.status === 'OVERDUE' && (
                        <IonButton
                          expand="block"
                          color="danger"
                          size="small"
                          onClick={() => sendReminder(fine)}
                          className="flex-1"
                        >
                          <IonIcon icon={alertCircleOutline} slot="start" />
                          Action Required
                        </IonButton>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        )}
      </IonContent>


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
              <IonGrid>
            
                <IonRow>
                  <IonCol size="12">
                    <div className="bg-linear-to-r from-red-500 to-orange-500 rounded-2xl p-6 text-white mb-6">
                      <p className="text-sm opacity-90">Fine Amount</p>
                      <p className="text-4xl font-bold mt-1">₹{selectedFine.amount.toLocaleString()}</p>
                      <p className="text-xs mt-2">Fine ID: {selectedFine.id}</p>
                    </div>
                  </IonCol>
                </IonRow>

               
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonLabel className="text-gray-500 text-sm">Violation Code</IonLabel>
                    <p className="font-mono text-lg font-semibold mt-1">{selectedFine.reasonCode}</p>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonLabel className="text-gray-500 text-sm">Status</IonLabel>
                    <div className="mt-1">
                      <IonBadge color={getStatusColor(selectedFine.status)} className="px-3 py-1">
                        {selectedFine.status}
                      </IonBadge>
                    </div>
                  </IonCol>
                </IonRow>

              
                <IonRow className="mt-3">
                  <IonCol size="12">
                    <IonLabel className="text-gray-500 text-sm">Violation Reason</IonLabel>
                    <p className="text-gray-800 dark:text-white mt-1 font-medium">{selectedFine.reason}</p>
                  </IonCol>
                </IonRow>

           
                <IonRow className="mt-4">
                  <IonCol size="12">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Source Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Source Type:</span>
                          <span className="font-semibold">{selectedFine.source}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Source Name:</span>
                          <span className="font-semibold">{selectedFine.sourceName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Source ID:</span>
                          <span className="font-mono text-sm">{selectedFine.sourceId}</span>
                        </div>
                      </div>
                    </div>
                  </IonCol>
                </IonRow>

               
                <IonRow className="mt-4">
                  <IonCol size="12" sizeMd="6">
                    <IonLabel className="text-gray-500 text-sm">Date & Time</IonLabel>
                    <p className="mt-1">{new Date(selectedFine.date).toLocaleString()}</p>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonLabel className="text-gray-200 text-sm">Due Date</IonLabel>
                    <p className={`mt-1 ${new Date(selectedFine.dueDate) < new Date() && selectedFine.status !== 'PAID' ? 'text-red-500 font-semibold' : ''}`}>
                      {new Date(selectedFine.dueDate).toLocaleDateString()}
                    </p>
                  </IonCol>
                </IonRow>

                {selectedFine.location && (
                  <IonRow className="mt-3">
                    <IonCol size="12">
                      <IonLabel className="text-gray-500 text-sm">Location</IonLabel>
                      <div className="flex items-center gap-2 mt-1">
                        <IonIcon icon={locationOutline} className="text-red-500" />
                        <span>{selectedFine.location}</span>
                      </div>
                    </IonCol>
                  </IonRow>
                )}

                {selectedFine.officerName && (
                  <IonRow className="mt-3">
                    <IonCol size="12">
                      <IonLabel className="text-gray-500 text-sm">Issuing Officer</IonLabel>
                      <p className="mt-1 font-medium">{selectedFine.officerName}</p>
                    </IonCol>
                  </IonRow>
                )}

                {selectedFine.notes && (
                  <IonRow className="mt-3">
                    <IonCol size="12">
                      <IonLabel className="text-gray-500 text-sm">Additional Notes</IonLabel>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 mt-1">
                        <p className="text-sm italic">{selectedFine.notes}</p>
                      </div>
                    </IonCol>
                  </IonRow>
                )}

                {selectedFine.imageUrl && (
                  <IonRow className="mt-4">
                    <IonCol size="12">
                      <IonLabel className="text-gray-500 text-sm">Evidence Image</IonLabel>
                      <img 
                        src={selectedFine.imageUrl} 
                        alt="Evidence" 
                        className="rounded-xl mt-2 w-full h-48 object-cover shadow-lg"
                      />
                    </IonCol>
                  </IonRow>
                )}

               
                <IonRow className="mt-6">
                  <IonCol size="12">
                    <div className="flex gap-3">
                      {selectedFine.status === 'PENDING' && (
                        <>
                          <IonButton 
                            expand="block" 
                            color="success" 
                            onClick={() => {
                              payFine(selectedFine.id);
                              setShowModal(false);
                            }}
                            className="flex-1"
                          >
                            Pay Fine
                          </IonButton>
                          <IonButton 
                            expand="block" 
                            fill="outline" 
                            color="danger" 
                            onClick={() => {
                              disputeFine(selectedFine.id);
                              setShowModal(false);
                            }}
                            className="flex-1"
                          >
                            Dispute
                          </IonButton>
                        </>
                      )}
                      <IonButton 
                        expand="block" 
                        fill="outline" 
                        onClick={() => setShowModal(false)}
                        className="flex-1"
                      >
                        Close
                      </IonButton>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonContent>
          </>
        )}
      </IonModal>

    
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
        color="success"
      />

   
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Notification"
        message={alertMessage}
        buttons={['OK']}
      />

    
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton className="bg-linear-to-r from-blue-600 to-indigo-600 shadow-lg">
          <IonIcon icon={downloadOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

export default Fine;