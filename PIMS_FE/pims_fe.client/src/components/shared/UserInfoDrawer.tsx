import React, { useState, useEffect } from "react";
import {
  X,
  Info,
  User,
  CheckCircle,
  Loader2,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import type { UserInfo } from "../../types";
import { userService } from "../../services/userService";

interface UserInfoDrawerProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
  isLeader?: boolean;
}

const UserInfoDrawer: React.FC<UserInfoDrawerProps> = ({
  userId,
  isOpen,
  onClose,
  isLeader,
}) => {
  const [userData, setUserData] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      userService
        .getUserById(userId)
        .then((res) => {
          if (res.success) {
            setUserData(res.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching user data:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!isOpen) {
      // Clear data when closed to avoid showing old data next time
      setUserData(null);
    }
  }, [isOpen, userId]);

  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Info size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              User Information
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-sm font-medium">Loading user details...</p>
            </div>
          ) : userData ? (
            <div className="p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="size-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-lg shadow-primary/20">
                  {userData.fullName?.charAt(0).toUpperCase() || "?"}
                </div>
                <h4 className="text-xl font-bold text-gray-900 text-center">
                  {userData.fullName}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {userData.role || (isLeader ? "Group Leader" : "Member")}
                </p>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                    Account Details
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        <User size={16} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                          Full Name
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {userData.fullName}
                        </p>
                      </div>
                    </div>
                    {isLeader !== undefined && (
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                          <CheckCircle size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-medium">
                            Group Role
                          </p>
                          <p
                            className={`text-sm font-semibold ${isLeader ? "text-orange-600" : "text-blue-600"}`}
                          >
                            {isLeader ? "Group Leader" : "Member"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                    Contact Information
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        <Mail size={16} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 font-medium">
                          Email Address
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {userData.email}
                        </p>
                      </div>
                    </div>
                    {userData.phoneNumber && (
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100">
                          <Phone size={16} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-500 font-medium">
                            Phone Number
                          </p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userData.phoneNumber}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio/Additional Info */}
                {userData.bio && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">
                      Biography
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="size-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                        <FileText size={16} className="text-primary" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {userData.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center mt-10">
              <User size={48} className="mb-4 opacity-20" />
              <p>No user data available.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoDrawer;
