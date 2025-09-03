"use client";

import { useState, useEffect, useCallback } from "react";
import { FastSpringSubscription, Order } from "@/types/fastspring";
import { toast } from "sonner";

interface UserDashboardProps {
  userEmail: string;
}

export default function UserDashboard({ userEmail }: UserDashboardProps) {
  const [subscriptions, setSubscriptions] = useState<FastSpringSubscription[]>(
    []
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/subscriptions?email=${encodeURIComponent(userEmail)}`
      );
      const data = await response.json();

      if (response.ok) {
        setSubscriptions(data.subscriptions || []);
        setOrders(data.orders || []);
      } else {
        console.error("Error fetching user data:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const cancelSubscription = async (subscriptionId: string) => {
    setCanceling(subscriptionId);

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh data
        await fetchUserData();
      } else {
        const data = await response.json();
        toast.error(`Failed to cancel subscription: ${data.error}`);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Failed to cancel subscription");
    } finally {
      setCanceling(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading your subscriptions...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Your Account Dashboard</h2>

      {/* Active Subscriptions */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Active Subscriptions</h3>

        {subscriptions.filter((sub) => sub.state === "active").length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">No active subscriptions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions
              .filter((sub) => sub.state === "active")
              .map((subscription) => (
                <div
                  key={subscription.subscription}
                  className="border rounded-lg p-4 bg-white shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {subscription.product}
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          Status:{" "}
                          <span className="font-medium text-green-600 capitalize">
                            {subscription.state}
                          </span>
                        </p>
                        <p>Started: {formatDate(subscription.begin)}</p>
                        <p>
                          Current Period:{" "}
                          {formatDate(subscription.periodStartDate)} -{" "}
                          {formatDate(subscription.periodEndDate)}
                        </p>
                        {subscription.nextChargeDate && (
                          <p>
                            Next Charge:{" "}
                            {formatDate(subscription.nextChargeDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {subscription.currency}{" "}
                        {subscription.totalValue.toFixed(2)}
                      </p>
                      <button
                        onClick={() =>
                          cancelSubscription(subscription.subscription)
                        }
                        disabled={canceling === subscription.subscription}
                        className="mt-2 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
                      >
                        {canceling === subscription.subscription
                          ? "Canceling..."
                          : "Cancel"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Canceled/Expired Subscriptions */}
      {subscriptions.filter((sub) => sub.state !== "active").length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Past Subscriptions</h3>
          <div className="space-y-4">
            {subscriptions
              .filter((sub) => sub.state !== "active")
              .map((subscription) => (
                <div
                  key={subscription.subscription}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{subscription.product}</h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                          Status:{" "}
                          <span className="capitalize">
                            {subscription.state}
                          </span>
                        </p>
                        <p>
                          Period: {formatDate(subscription.periodStartDate)} -{" "}
                          {formatDate(subscription.periodEndDate)}
                        </p>
                        {subscription.canceledDate && (
                          <p>
                            Canceled: {formatDate(subscription.canceledDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="font-semibold text-gray-600">
                      {subscription.currency}{" "}
                      {subscription.totalValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>

        {orders.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-600">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 bg-white shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">Order #{order.reference}</h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Date: {formatDate(order.changed)}</p>
                      <p>Status: {order.completed ? "Completed" : "Pending"}</p>
                      <div>
                        <p>Items:</p>
                        <ul className="ml-4 list-disc">
                          {order.items.map((item, index) => (
                            <li key={index}>
                              {item.display} (Qty: {item.quantity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {order.currency} {order.total.toFixed(2)}
                    </p>
                    <a
                      href={order.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Invoice
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
