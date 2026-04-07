import React from "react";
import { IonPage, IonContent } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  TruckIcon,
  ArrowRightIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const DriverLanding: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonContent
        style={{ "--background": "#000000" } as any}
        className="ion-padding"
      >
        <div className="min-h-screen w-full flex flex-col px-5 py-8 text-white relative">
          
          {/* Background Gradient Accent */}
          <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-gray-900/50 to-transparent pointer-events-none" />
          
          {/* Top Section with Animation */}
          <div className="flex flex-col items-center mt-8 animate-fadeInUp">
            
            {/* App Icon with Glow Effect */}
            <div className="w-28 h-28 rounded-full bg-linear-to-br from-white to-gray-300 flex items-center justify-center shadow-2xl shadow-white/10">
              <TruckIcon className="w-14 h-14 text-black" />
            </div>

            {/* Title with Gradient */}
            <h1 className="mt-6 text-4xl font-bold tracking-tight bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Shuttle Driver
            </h1>

            {/* Tagline */}
            <p className="mt-3 text-gray-400 text-sm text-center max-w-xs leading-relaxed">
              Your trusted partner for seamless rides, higher earnings, and professional driving experience.
            </p>

            {/* Rating Badge */}
            <div className="mt-4 flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <SparklesIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-300">4.9 • 10,000+ Active Drivers</span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid grid-cols-3 gap-3 animate-fadeInUp animation-delay-200">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-medium">Flexible Hours</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-medium">Higher Earnings</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/10">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-medium">24/7 Support</p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 animate-fadeInUp animation-delay-400">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-white">₹50K+</p>
                <p className="text-xs text-gray-400 mt-1">Monthly Earnings</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-white">2K+</p>
                <p className="text-xs text-gray-400 mt-1">Daily Rides</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center flex-1">
                <p className="text-2xl font-bold text-white">99%</p>
                <p className="text-xs text-gray-400 mt-1">Satisfaction</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-auto pt-8 pb-6 space-y-3 animate-fadeInUp animation-delay-600">
            
            {/* Login Button with Gradient */}
            <button
              onClick={() => history.push("/login")}
              className="relative w-full h-14 rounded-2xl bg-linear-to-r from-white to-gray-200 text-black font-semibold flex items-center justify-center gap-2 shadow-lg shadow-white/20 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 overflow-hidden group"
            >
              <span className="relative z-10">Login to Your Account</span>
              <ArrowRightIcon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-linear-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Signup Button with Border Animation */}
            <button
              onClick={() => history.push("/signup")}
              className="relative w-full h-14 rounded-2xl border-2 border-white/30 text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/50 transition-all duration-300 group overflow-hidden"
            >
              <UserPlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Create New Account</span>
            </button>

          </div>

          {/* Footer Text */}
          <p className="text-center text-gray-500 text-xs mt-4">
            By continuing, you agree to our Terms & Conditions
          </p>

        </div>
      </IonContent>

      {/* Custom CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </IonPage>
  );
};

export default DriverLanding;