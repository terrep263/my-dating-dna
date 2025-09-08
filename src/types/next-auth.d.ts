
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role?: string;
      subscription: {
        plan: "free" | "singles" | "couples" | "premium";
        status: "active" | "inactive" | "cancelled";
        startDate: Date;
        endDate: Date;
      };
      type?: "single" | "couple";
      attempts?: number;
      validity?: Date;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
    subscription: {
      plan: "free" | "singles" | "couples" | "premium";
      status: "active" | "inactive" | "cancelled";
      startDate: Date;
      endDate: Date;
    };
    type?: "single" | "couple";
    attempts?: number;
    validity?: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    subscription: {
      plan: "free" | "singles" | "couples" | "premium";
      status: "active" | "inactive" | "cancelled";
      startDate: Date;
      endDate: Date;
    };
    type?: "single" | "couple";
    attempts?: number;
    validity?: Date;
  }
}
