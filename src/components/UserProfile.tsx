"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  User,
  Calendar,
  Crown,
  Settings,
  LogOut,
  CreditCard,
  Users,
  LucideLayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dashboard } from "@mui/icons-material";

export default function UserProfile() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!session?.user) {
    return null;
  }
  console.log(session.user);
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "couple":
        return "bg-orange-500";
      case "single":
        return "bg-green-600";
      default:
        return "bg-gray-400";
    }
  };

  const isSubscriptionActive =
    (session?.user as any)?.subscription?.status === "active";

  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex cursor-pointer items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {session.user.name}
          </p>
          {/* <p className="text-xs text-gray-500">{session.user.email}</p> */}
        </div>
        {session.user.image ? (
          <Image
            width={32}
            height={32}
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {session.user.name}
                </p>
                <p className="text-sm text-gray-500">{session.user.email}</p>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {isSubscriptionActive && (
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Subscription</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(
                      (session?.user as any)?.subscription?.plan || "free"
                    )} text-white`}
                  >
                    {(session?.user as any)?.subscription?.plan}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isSubscriptionActive
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {isSubscriptionActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              {(session?.user as any)?.subscription?.status === "active" && (
                <p className="text-xs text-gray-500 mt-1">
                  Expires:{" "}
                  {new Date(
                    (session?.user as any)?.subscription?.endDate
                  ).toLocaleDateString()}
                </p>
              )}
              {/* {(session?.user as any)?.attempts && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Assessment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(
                      (session?.user as any)?.type || "N/A"
                    )} text-white`}
                  >
                    {(session?.user as any)?.type}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isSubscriptionActive
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {isSubscriptionActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            )} */}
            </div>
          )}

          {/* Menu Items */}
          <div className="py-2">
            {/* {(session?.user as any)?.role === "admin" && (
              <Link
                href="/admin/affiliates"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <LucideLayoutDashboard className="w-4 h-4 mr-3" />
                Affiliate Dashboard
              </Link>
            )} */}
            {/* {(session?.user as any)?.role === "user" && (
              <Link
                href="/affiliates"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Users className="w-4 h-4 mr-3" />
                Referrals
              </Link>
            )} */}

            <Link
              href="/subscriptions"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <CreditCard className="w-4 h-4 mr-3" />
              Manage Subscription
            </Link>

            <Link
              href="/assessment"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar className="w-4 h-4 mr-3" />
              Take Assessment
            </Link>
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                signOut({
                  redirect: false,
                });
                router.push("/auth");
                toast.success("Signed out successfully");
              }}
              className="flex items-center cursor-pointer w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
}
