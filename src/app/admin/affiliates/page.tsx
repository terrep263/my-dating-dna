"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Download,
  Add,
  Visibility,
  CheckCircle,
  AttachMoney,
  People,
  TrendingUp,
} from "@mui/icons-material";
import { toast } from "sonner";

interface Payout {
  _id: string;
  periodStart: string;
  periodEnd: string;
  totalCents: number;
  status: string;
  createdAt: string;
  payoutItems?: PayoutItem[];
}

interface PayoutItem {
  _id: string;
  affiliateCode: string;
  amountCents: number;
  commissionIds: string[];
}

interface Commission {
  _id: string;
  orderId: string;
  affiliateCode: string;
  baseAmountCents: number;
  commissionCents: number;
  status: string;
  lockAt: string;
  createdAt: string;
}

interface Affiliate {
  _id: string;
  code: string;
  name: string;
  email: string;
  payoutMethod: {
    type: string;
    details: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminAffiliatePanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingPayout, setCreatingPayout] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [payoutForm, setPayoutForm] = useState({
    periodStart: "",
    periodEnd: "",
  });
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [selectedPayoutItems, setSelectedPayoutItems] = useState<any[]>([]);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth");
      return;
    }
    // TODO: Add admin role check here
    fetchData();
  }, [session, status]);

  const fetchData = async () => {
    try {
      const [payoutsRes, commissionsRes, affiliatesRes] = await Promise.all([
        fetch("/api/affiliate/admin?action=payouts"),
        fetch("/api/affiliate/admin?action=commissions"),
        fetch("/api/affiliate/admin?action=affiliates"),
      ]);

      const [payoutsData, commissionsData, affiliatesData] = await Promise.all([
        payoutsRes.json(),
        commissionsRes.json(),
        affiliatesRes.json(),
      ]);

      console.log("API Responses:", {
        payoutsData,
        commissionsData,
        affiliatesData,
      });

      if (payoutsData.success) {
        console.log("Setting payouts:", payoutsData.payouts);
        setPayouts(payoutsData.payouts);
      }
      if (commissionsData.success) {
        console.log("Setting commissions:", commissionsData.commissions);
        setCommissions(commissionsData.commissions);
      }
      if (affiliatesData.success) {
        console.log("Setting affiliates:", affiliatesData.affiliates);
        setAffiliates(affiliatesData.affiliates);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutItems = async (payoutId: string) => {
    try {
      const response = await fetch(
        "/api/affiliate/admin?action=payoutItems&payoutId=" + payoutId
      );
      const data = await response.json();
      if (data.success) {
        setSelectedPayoutItems(data.payoutItems);
      }
    } catch (error) {
      console.error("Error fetching payout items:", error);
      setSelectedPayoutItems([]);
    }
  };

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingPayout(true);

    try {
      const response = await fetch("/api/affiliate/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create_payout",
          ...payoutForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payout created successfully!");
        setPayoutForm({ periodStart: "", periodEnd: "" });
        setShowCreateDialog(false);
        fetchData();
      } else {
        toast.error(data.error || "Failed to create payout");
      }
    } catch (error) {
      console.error("Error creating payout:", error);
      toast.error("Failed to create payout");
    } finally {
      setCreatingPayout(false);
    }
  };

  const handleExportPayout = async (payoutId: string) => {
    try {
      const response = await fetch("/api/affiliate/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "export_payout",
          payoutId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Create CSV content
        const csvContent = [
          [
            "Affiliate Code",
            "Name",
            "Email",
            "Method",
            "PayInfo",
            "Amount",
            "Currency",
          ],
          ...data.csvData.map((item: any) => [
            item.affiliateCode,
            item.affiliateName,
            item.affiliateEmail,
            item.paymentMethod,
            item.payInfo,
            item.amount,
            "USD",
          ]),
        ]
          .map((row) => row.join(","))
          .join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payout-${payoutId}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Payout exported successfully!");
        fetchData();
      } else {
        toast.error(data.error || "Failed to export payout");
      }
    } catch (error) {
      console.error("Error exporting payout:", error);
      toast.error("Failed to export payout");
    }
  };

  const handleMarkPaid = async (payoutId: string) => {
    try {
      const response = await fetch("/api/affiliate/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "mark_paid",
          payoutId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payout marked as paid!");
        fetchData();
      } else {
        toast.error(data.error || "Failed to mark payout as paid");
      }
    } catch (error) {
      console.error("Error marking payout as paid:", error);
      toast.error("Failed to mark payout as paid");
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChip = (status: string) => {
    const statusColors = {
      draft: "warning",
      exported: "info",
      paid: "success",
      pending: "warning",
      locked: "info",
      void: "error",
    } as const;

    return (
      <Chip
        label={status.replace("_", " ").toUpperCase()}
        color={statusColors[status as keyof typeof statusColors] || "default"}
        size="small"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Container
          maxWidth="lg"
          className="flex items-center justify-center min-h-screen"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Typography variant="h6" sx={{ color: "#6b7280", mb: 2 }}>
              Loading admin panel...
            </Typography>
            <Box
              sx={{
                width: 40,
                height: 40,
                border: "3px solid #e5e7eb",
                borderTop: "3px solid #2c5530",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                mx: "auto",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-32">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "#1f2937",
              mb: 1,
            }}
          >
            Affiliate Admin Panel
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6b7280",
              mb: 4,
            }}
          >
            Manage affiliate payouts and commissions
          </Typography>

          {/* Tabs */}
          <Card
            elevation={0}
            sx={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 3,
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, py: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={(event, newValue) => setTabValue(newValue)}
                  sx={{
                    "& .MuiTab-root": {
                      color: "#6b7280",
                      fontWeight: 500,
                      "&.Mui-selected": {
                        color: "#2c5530",
                      },
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#2c5530",
                    },
                  }}
                >
                  <Tab label="Payouts" />
                  <Tab label="Commissions" />
                  <Tab label="Affiliates" />
                </Tabs>

                {tabValue === 0 && (
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setShowCreateDialog(true)}
                    className="!bg-[#2c5530] hover:!bg-green-600 "
                    sx={{
                      borderRadius: "50px",
                      px: 2,
                      py: 1,
                      fontWeight: 600,
                    }}
                  >
                    Create Payout
                  </Button>
                )}
              </Box>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1f2937", mb: 3 }}
              >
                Payouts Management
              </Typography>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e5e7eb" }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Period
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Total Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Created
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout._id}>
                        <TableCell>
                          {formatDate(payout.periodStart)} -{" "}
                          {formatDate(payout.periodEnd)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {formatCurrency(payout.totalCents)}
                        </TableCell>
                        <TableCell>{getStatusChip(payout.status)}</TableCell>
                        <TableCell>{formatDate(payout.createdAt)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedPayout(payout);
                                fetchPayoutItems(payout._id);
                                setShowPayoutDialog(true);
                              }}
                              sx={{ color: "#6b7280" }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            {payout.status === "draft" && (
                              <IconButton
                                size="small"
                                onClick={() => handleExportPayout(payout._id)}
                                sx={{ color: "#2c5530" }}
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            )}
                            {payout.status === "exported" && (
                              <IconButton
                                size="small"
                                onClick={() => handleMarkPaid(payout._id)}
                                sx={{ color: "#10b981" }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1f2937", mb: 3 }}
              >
                All Commissions
              </Typography>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e5e7eb" }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Order ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Affiliate
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Base Amount
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Commission
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Lock Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Created
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission._id}>
                        <TableCell
                          sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                        >
                          {commission.orderId || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={commission.affiliateCode}
                            variant="outlined"
                            size="small"
                            sx={{ borderColor: "#2c5530", color: "#2c5530" }}
                          />
                        </TableCell>
                        <TableCell>
                          {formatCurrency(commission.baseAmountCents)}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {formatCurrency(commission.commissionCents)}
                        </TableCell>
                        <TableCell>
                          {getStatusChip(commission.status)}
                        </TableCell>
                        <TableCell>{formatDate(commission.lockAt)}</TableCell>
                        <TableCell>
                          {formatDate(commission.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1f2937", mb: 3 }}
              >
                Registered Affiliates
              </Typography>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e5e7eb" }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Code
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Payout Method
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                        Created
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {affiliates.map((affiliate) => (
                      <TableRow key={affiliate._id}>
                        <TableCell>
                          <Chip
                            label={affiliate.code}
                            variant="outlined"
                            size="small"
                            sx={{ borderColor: "#2c5530", color: "#2c5530" }}
                          />
                        </TableCell>
                        <TableCell>{affiliate.name}</TableCell>
                        <TableCell>{affiliate.email}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {affiliate.payoutMethod.type}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#6b7280" }}
                            >
                              {affiliate.payoutMethod.details}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={affiliate.isActive ? "Active" : "Inactive"}
                            color={affiliate.isActive ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(affiliate.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Card>
        </motion.div>
      </Container>

      {/* Create Payout Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Payout</DialogTitle>
        <form onSubmit={handleCreatePayout}>
          <DialogContent>
            <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
              Create a payout for locked commissions in a specific period
            </Typography>
            <TextField
              fullWidth
              label="Period Start"
              type="date"
              value={payoutForm.periodStart}
              onChange={(e) =>
                setPayoutForm({ ...payoutForm, periodStart: e.target.value })
              }
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#d1d5db",
                    borderRadius: "14px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#9ca3af",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2c5530",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Period End"
              type="date"
              value={payoutForm.periodEnd}
              onChange={(e) =>
                setPayoutForm({ ...payoutForm, periodEnd: e.target.value })
              }
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#d1d5db",
                    borderRadius: "14px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#9ca3af",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#2c5530",
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setShowCreateDialog(false)}
              sx={{ color: "#6b7280" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creatingPayout}
              className="!bg-[#2c5530] hover:!bg-green-600"
              sx={{ borderRadius: "50px", px: 3 }}
            >
              {creatingPayout ? "Creating..." : "Create Payout"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Payout Details Dialog */}
      <Dialog
        open={showPayoutDialog}
        onClose={() => setShowPayoutDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payout Details</DialogTitle>
        <DialogContent>
          {selectedPayout && (
            <Box>
              <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
                Payout for period{" "}
                {`${formatDate(selectedPayout.periodStart)} - ${formatDate(
                  selectedPayout.periodEnd
                )}`}
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Total Amount
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1f2937" }}
                  >
                    {formatCurrency(selectedPayout.totalCents)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#6b7280" }}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {getStatusChip(selectedPayout.status)}
                  </Box>
                </Grid>
              </Grid>
              {selectedPayoutItems.length > 0 && (
                <>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1f2937", mb: 2 }}
                  >
                    Payout Items
                  </Typography>
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{ border: "1px solid #e5e7eb" }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                          <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                            Affiliate Code
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                            Amount
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#374151" }}>
                            Commissions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPayoutItems.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <Chip
                                label={item.affiliateCode}
                                variant="outlined"
                                size="small"
                                sx={{
                                  borderColor: "#2c5530",
                                  color: "#2c5530",
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {formatCurrency(item.amountCents)}
                            </TableCell>
                            <TableCell>
                              {Array.isArray(item.commissionIds)
                                ? item.commissionIds.length
                                : 0}{" "}
                              commissions
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowPayoutDialog(false)}
            sx={{ color: "#6b7280" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
