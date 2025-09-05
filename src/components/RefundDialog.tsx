import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { toast } from "sonner";

interface RefundDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderAmount: number;
  customerEmail: string;
  onRefundSuccess: () => void;
}

export default function RefundDialog({
  open,
  onClose,
  orderId,
  orderAmount,
  customerEmail,
  onRefundSuccess,
}: RefundDialogProps) {
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundType, setRefundType] = useState("requested_by_customer");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRefund = async () => {
    if (!refundAmount || !refundReason) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(refundAmount);
    if (amount <= 0 || amount > orderAmount / 100) {
      toast.error("Invalid refund amount");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/affiliate/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          refundAmountCents: Math.floor(amount * 100),
          reason: refundReason,
          refundType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Refund processed successfully");
        onRefundSuccess();
        onClose();
        // Reset form
        setRefundAmount("");
        setRefundReason("");
        setRefundType("requested_by_customer");
      } else {
        toast.error(data.error || "Failed to process refund");
      }
    } catch (error) {
      console.error("Refund error:", error);
      toast.error("Failed to process refund");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setRefundAmount("");
      setRefundReason("");
      setRefundType("requested_by_customer");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937" }}>
          Process Refund
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Order ID:</strong> {orderId}
            </Typography>
            <Typography variant="body2">
              <strong>Customer:</strong> {customerEmail}
            </Typography>
            <Typography variant="body2">
              <strong>Order Amount:</strong> ${(orderAmount / 100).toFixed(2)}
            </Typography>
          </Alert>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Refund Amount ($)"
            type="number"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            placeholder={`Max: $${(orderAmount / 100).toFixed(2)}`}
            fullWidth
            required
            inputProps={{
              min: 0,
              max: orderAmount / 100,
              step: 0.01,
            }}
            helperText={`Enter amount to refund (max: $${(orderAmount / 100).toFixed(2)})`}
          />

          <FormControl fullWidth required>
            <InputLabel>Refund Type</InputLabel>
            <Select
              value={refundType}
              onChange={(e) => setRefundType(e.target.value)}
              label="Refund Type"
            >
              <MenuItem value="requested_by_customer">Requested by Customer</MenuItem>
              <MenuItem value="duplicate">Duplicate</MenuItem>
              <MenuItem value="fraudulent">Fraudulent</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Refund Reason"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="Enter reason for refund..."
            fullWidth
            required
            multiline
            rows={3}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: "#6b7280", mb: 1 }}>
              <strong>What happens after refund:</strong>
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label="1" size="small" color="primary" />
                <Typography variant="body2">
                  Stripe will process the refund to the customer
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label="2" size="small" color="primary" />
                <Typography variant="body2">
                  {parseFloat(refundAmount || "0") >= orderAmount / 100
                    ? "All commissions will be voided (full refund)"
                    : "Commission amounts will be adjusted (partial refund)"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip label="3" size="small" color="primary" />
                <Typography variant="body2">
                  Order will be marked as refunded
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isProcessing} sx={{ color: "#6b7280" }}>
          Cancel
        </Button>
        <Button
          onClick={handleRefund}
          disabled={isProcessing || !refundAmount || !refundReason}
          variant="contained"
          sx={{
            backgroundColor: "#dc2626",
            "&:hover": { backgroundColor: "#b91c1c" },
            borderRadius: "50px",
            px: 3,
          }}
        >
          {isProcessing ? "Processing..." : "Process Refund"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
