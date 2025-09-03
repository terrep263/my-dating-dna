export interface FastSpringProduct {
  product: string;
  quantity?: number;
  pricing?: {
    price?: number;
    quantityBehavior?: "allow" | "disallow";
    quantityDefault?: number;
  };
}

export interface FastSpringCustomer {
  first: string;
  last: string;
  email: string;
  company?: string;
  phone?: string;
}

export interface CreateAccountRequest {
  contact?: Partial<FastSpringCustomer>;
  language?: string;
  country?: string;
  currency?: string;
  tags?: Record<string, string>;
}
export interface CreateSessionRequest {
  account?: string; // Your store ID
  products: FastSpringProduct[];
  contact?: Partial<FastSpringCustomer>;
  language?: string;
  country?: string;
  currency?: string;
  tags?: Record<string, string>;
}

export interface SessionResponse {
  id: string;
  url: string;
  account: string;
  language: string;
  country: string;
  currency: string;
  customer?: FastSpringCustomer;
  products: FastSpringProduct[];
}
export interface AccontResponse {
  account: string;
}

export interface FastSpringSubscription {
  subscription: string;
  state: "active" | "canceled" | "deactivated" | "trial" | "overdue";
  product: string;
  customer: string;
  customerUrl: string;
  begin: string;
  end?: string;
  canceledDate?: string;
  deactivationDate?: string;
  sequence: number;
  periods?: number;
  periodStartDate: string;
  periodEndDate: string;
  nextChargeDate?: string;
  totalValue: number;
  totalValueUSD: number;
  currency: string;
  instructions: string[];
}

export interface WebhookEvent {
  id: string;
  type: string;
  live: boolean;
  processed: boolean;
  created: number;
  data: {
    subscription?: FastSpringSubscription;
    order?: Order;
    account?: string;
  };
}

export interface OrderItem {
  product: string;
  quantity: number;
  display: string;
  sku?: string;
  subtotal: number;
  subtotalUSD: number;
  discount: number;
  discountUSD: number;
  subscription?: string;
}

export interface Order {
  id: string;
  reference: string;
  buyerReference?: string;
  ipAddress: string;
  completed: boolean;
  changed: string;
  changedValue: number;
  changedDisplay: string;
  changedInPayoutCurrency: number;
  language: string;
  live: boolean;
  currency: string;
  payoutCurrency: string;
  invoiceUrl: string;
  account: string;
  total: number;
  totalUSD: number;
  totalInPayoutCurrency: number;
  tax: number;
  taxUSD: number;
  taxInPayoutCurrency: number;
  subtotal: number;
  subtotalUSD: number;
  subtotalInPayoutCurrency: number;
  discount: number;
  discountUSD: number;
  discountInPayoutCurrency: number;
  discountWithTax: number;
  discountWithTaxUSD: number;
  discountWithTaxInPayoutCurrency: number;
  billDescriptor: string;
  payment: {
    type: string;
    cardEnding?: string;
  };
  customer: FastSpringCustomer & {
    customerUrl: string;
  };
  address: {
    city: string;
    regionCode: string;
    regionDisplay: string;
    postalCode: string;
    country: string;
    display: string;
  };
  recipients: string[];
  notes: string[];
  tags: Record<string, string>;
  items: OrderItem[];
}
