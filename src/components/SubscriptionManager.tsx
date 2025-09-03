"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Crown, Check, X, CreditCard, Calendar } from "lucide-react";
import { toast } from "sonner";

const subscriptionPlans = [
  {
    id: "single",
    name: "Singles Plan",
    price: "$49",
    period: "one-time",
    features: [
      "Complete Singles assessment",
      "Detailed personality insights",
      "Personalized recommendations",
      "30-day action plan",
      "Email support",
    ],
    limitations: [],
  },
  {
    id: "couple",
    name: "Couples Plan",
    price: "$79",
    period: "one-time",
    features: [
      "Complete Couples assessment",
      "Both partners included",
      "Relationship compatibility analysis",
      "Joint action plans",
      "Priority support",
    ],
    limitations: [],
  },
  {
    id: "grace",
    name: "Grace AI Coach",
    price: "$19.99",
    period: "month",
    features: [
      "Limitless conversations with AI Coach",
      "Personalized insights",
      "Progress tracking and goal setting",
      "Personalized coaching",
      "Monthly access",
    ],
    limitations: [],
  },
];

export default function SubscriptionManager() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: { id: string }) => {
    if (status === "unauthenticated" || status === "loading") {
      toast.error("Please login to subscribe");
      return;
    }
    setIsLoading(plan.id);
    setSelectedPlan(plan.id);

    try {
      // Create checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: plan.id,
          email: session?.user?.email,
          name: session?.user?.name,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      } else {
        toast.success("Redirecting to checkout...");
        window.open(data.session.url);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
      console.error("Checkout error:", err);
    } finally {
      setIsLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return (session?.user as any)?.subscription?.plan === planId;
  };


  // Check if user has Grace AI subscription
  const hasGraceSubscription = () => {
    return (session?.user as any)?.subscription?.plan === "premium" && 
           (session?.user as any)?.subscription?.status === "active";
  };

  // Check if user has valid single assessment
  const hasValidSingleAssessment = () => {
    return (session?.user as any)?.type === "single" && 
           ((session?.user as any)?.attempts || 0) > 0 && 
           (session?.user as any)?.validity && 
           new Date((session?.user as any)?.validity) > new Date();
  };

  // Check if user has valid couple assessment
  const hasValidCoupleAssessment = () => {
    return (session?.user as any)?.type === "couple" && 
           ((session?.user as any)?.attempts || 0) > 0 && 
           (session?.user as any)?.validity && 
           new Date((session?.user as any)?.validity) > new Date();
  };

  // Check if plan should be disabled
  const isPlanDisabled = (planId: string) => {
    switch (planId) {
      case "grace":
        return hasGraceSubscription();
      case "single":
        return hasValidSingleAssessment();
      case "couple":
        return hasValidCoupleAssessment();
      default:
        return false;
    }
  };

  // Get plan status text
  const getPlanStatusText = (planId: string) => {
    if (isCurrentPlan(planId)) {
      return "Current Plan";
    }
    
    switch (planId) {
      case "grace":
        return hasGraceSubscription() ? "Already Subscribed" : "Upgrade Now";
      case "single":
        return hasValidSingleAssessment() ? "Already Purchased" : "Upgrade Now";
      case "couple":
        return hasValidCoupleAssessment() ? "Already Purchased" : "Upgrade Now";
      default:
        return "Upgrade Now";
    }
  };

  // Get plan status description
  const getPlanStatusDescription = (planId: string) => {
    switch (planId) {
      case "grace":
        if (hasGraceSubscription()) {
          return "You already have an active Grace AI subscription";
        }
        break;
      case "single":
        if (hasValidSingleAssessment()) {
          const validityDate = new Date((session?.user as any)?.validity || "");
          return `You have ${(session?.user as any)?.attempts || 0} attempts remaining until ${validityDate.toLocaleDateString()}`;
        }
        break;
      case "couple":
        if (hasValidCoupleAssessment()) {
          const validityDate = new Date((session?.user as any)?.validity || "");
          return `You have ${(session?.user as any)?.attempts || 0} attempts remaining until ${validityDate.toLocaleDateString()}`;
        }
        break;
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Subscription Plans
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose the perfect plan for your relationship journey. Upgrade anytime
          to unlock more features and insights.
        </p>
      </div>



      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-xl shadow-lg p-6 border-2 transition-all duration-200 ${
              isCurrentPlan(plan.id)
                ? "border-violet-500 bg-violet-50"
                : "border-gray-200 hover:border-violet-300 hover:shadow-xl"
            }`}
          >
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-violet-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-500 ml-1">/{plan.period}</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
              {plan.limitations.map((limitation, index) => (
                <div key={index} className="flex items-start">
                  <X className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{limitation}</span>
                </div>
              ))}
            </div>
         
            {/* Action Button */}
            <button
              onClick={() => handleSubscribe(plan)}
              disabled={isLoading === plan.id || isCurrentPlan(plan.id) || isPlanDisabled(plan.id)}
              className={`w-full cursor-pointer hover:-translate-y-1 hover:shadow-xl font-semibold py-3 rounded-full block px-4 flex-1 mt-auto transition-all duration-200 ${
                isCurrentPlan(plan.id) || isLoading === plan.id || isPlanDisabled(plan.id)
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                  : "bg-black text-white"
              }`}
            >
              {isLoading && selectedPlan === plan.id ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                getPlanStatusText(plan.id)
              )}
            </button>

            {/* Status Description */}
            {getPlanStatusDescription(plan.id) && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                  {getPlanStatusDescription(plan.id)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <div className="bg-white shadow-lg white rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why Choose Dating DNA?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center">
              <Crown className="w-5 h-5 text-violet-600 mr-2" />
              <span>Science-based insights</span>
            </div>
            <div className="flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-violet-600 mr-2" />
              <span>Secure payments</span>
            </div>
            <div className="flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600 mr-2" />
              <span>Lifetime access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
