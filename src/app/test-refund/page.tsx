"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import { Refresh, Receipt } from "@mui/icons-material";
import RefundDialog from "@/components/RefundDialog";
import { toast } from "sonner";

interface Order {
  _id: string;
  stripePaymentIntent: string;
  customerEmail: string;
  amountTotalCents: number;
  affiliateCode?: string;
  paidAt: string;
  refundedAt?: string;
  refundAmountCents?: number;
  isFullRefund?: boolean;
  refundStatus?: string;
}

export default function TestRefundPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [refundDialog, setRefundDialog] = useState<{
    open: boolean;
    orderId: string;
    orderAmount: number;
    customerEmail: string;
  }>({
    open: false,
    orderId: "",
    orderAmount: 0,
    customerEmail: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth");
      return;
    }
    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/affiliate/admin?action=orders");
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleRefundClick = (order: Order) => {
    if (order.refundedAt) {
      toast.error("This order has already been refunded");
      return;
    }
    
    setRefundDialog({
      open: true,
      orderId: order._id,
      orderAmount: order.amountTotalCents,
      customerEmail: order.customerEmail,
    });
  };

  const handleRefundSuccess = () => {
    fetchOrders(); // Refresh the orders list
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (status === "loading" || loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
          Test Refund System
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchOrders}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Card elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937", mb: 3 }}>
            Orders ({orders.length})
          </Typography>

          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e5e7eb" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Affiliate</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Paid Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#374151" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                      {order._id.slice(-8)}
                    </TableCell>
                    <TableCell>{order.customerEmail}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatCurrency(order.amountTotalCents)}
                    </TableCell>
                    <TableCell>
                      {order.affiliateCode ? (
                        <Chip
                          label={order.affiliateCode}
                          variant="outlined"
                          size="small"
                          sx={{ borderColor: "#2c5530", color: "#2c5530" }}
                        />
                      ) : (
                        <Typography variant="body2" sx={{ color: "#6b7280" }}>
                          No affiliate
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(order.paidAt)}</TableCell>
                    <TableCell>
                      {order.refundedAt ? (
                        <Chip
                          label={order.isFullRefund ? "Fully Refunded" : "Partially Refunded"}
                          color="error"
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="Paid"
                          color="success"
                          size="small"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {!order.refundedAt && (
                        <IconButton
                          size="small"
                          onClick={() => handleRefundClick(order)}
                          sx={{ color: "#dc2626" }}
                          title="Process Refund"
                        >
                          <Receipt fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {orders.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" sx={{ color: "#6b7280" }}>
                No orders found. Create some test orders first.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <RefundDialog
        open={refundDialog.open}
        onClose={() => setRefundDialog({ ...refundDialog, open: false })}
        orderId={refundDialog.orderId}
        orderAmount={refundDialog.orderAmount}
        customerEmail={refundDialog.customerEmail}
        onRefundSuccess={handleRefundSuccess}
      />
    </Container>
  );
}
