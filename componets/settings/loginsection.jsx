import React, { useState } from "react";
import { User, LogIn } from "lucide-react";

export default function LoginSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (provider) => {
    // Mock login - in real app would use OAuth
    setIsLoggedIn(true);
    setUser({
      name: "Student User",
      email: provider === "google" ? "student@gmail.com" : "student@icloud.com",
      provider: provider
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  if (isLoggedIn && user) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Account</h2>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 capitalize">Signed in with {user.provider}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Account Benefits</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Calculation history saved automatically</li>
            <li>• Progress tracking and weak area identification</li>
            <li>• Sync across all your devices</li>
            <li>• Export calculation reports</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Account</h2>
      
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Sign In to CHEMI</h3>
        <p className="text-gray-600 mb-6">
          Sign in to save your calculation history, track your progress, and identify areas for improvement.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => handleLogin("google")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              G
            </div>
            Continue with Google
          </button>
          
          <button
            onClick={() => handleLogin("apple")}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <div className="w-5 h-5 bg-white rounded text-black flex items-center justify-center text-xs font-bold">
              🍎
            </div>
            Continue with Apple
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Why Sign In?</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Save your calculation history</li>
          <li>• Track your progress over time</li>
          <li>• Get insights into your weak areas</li>
          <li>• Export reports for study purposes</li>
          <li>• Sync across all devices</li>
        </ul>
      </div>
    </div>
  );
}
