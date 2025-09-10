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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  InputAdornment,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  ContentCopy,
  TrendingUp,
  People,
  AttachMoney,
  Schedule,
  Visibility,
  Dashboard,
  Settings,
  Assessment,
} from "@mui/icons-material";
import { toast } from "sonner";

interface AffiliateData {
  id: string;
  code: string;
  name: string;
  email: string;
  payoutMethod: {
    type: string;
    details: string;
  };
  isActive: boolean;
}

interface Stats {
  clicks: number;
  conversions: number;
  conversionRate: string;
  commissions: {
    pending: { count: number; totalCents: number };
    locked: { count: number; totalCents: number };
    paid: { count: number; totalCents: number };
    void: { count: number; totalCents: number };
  };
  nextPayoutDate: string | null;
}

interface Commission {
  id: string;
  orderId: string;
  baseAmountCents: number;
  commissionCents: number;
  status: string;
  lockAt: string;
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
      id={`affiliate-tabpanel-${index}`}
      aria-labelledby={`affiliate-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AffiliateDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCommissions, setRecentCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    code: "",
    invitationCode: "",
    payoutMethod: {
      type: "paypal",
      details: "",
    },
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth");
      return;
    }
    fetchAffiliateData();
  }, [session, status]);

  const fetchAffiliateData = async () => {
    try {
      const response = await fetch("/api/affiliate/dashboard");
      const data = await response.json();

      if (data.success) {
        setAffiliate(data.affiliate);
        setStats(data.stats);
        setRecentCommissions(data.recentCommissions);
        setShowRegisterForm(false);
      } else if (response.status === 404) {
        setShowRegisterForm(true);
      }
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
      toast.error("Failed to load affiliate data");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);

    try {
      const response = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Affiliate account created successfully!");
        fetchAffiliateData();
      } else {
        toast.error(data.error || "Failed to create affiliate account");
      }
    } catch (error) {
      console.error("Error registering affiliate:", error);
      toast.error("Failed to create affiliate account");
    } finally {
      setRegistering(false);
    }
  };

  const copyAffiliateLink = () => {
    if (!affiliate) return;
    const link = `${window.location.origin}/auth?ref=${affiliate.code}`;
    navigator.clipboard.writeText(link);
    toast.success("Affiliate link copied to clipboard!");
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusChip = (status: string) => {
    const statusColors = {
      pending: "warning",
      locked: "info",
      paid: "success",
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Container maxWidth="sm" className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card
              elevation={0}
              sx={{
                background: "#ffffff",
                border: "1px solid #ffffff",
                borderRadius: 4,
                p: 6,
                textAlign: "center",
              }}
            >
              <CardContent>
                <CircularProgress size={60} sx={{ color: "white", mb: 3 }} />
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 600,
                    color: "green",
                    mb: 2,
                  }}
                >
                  Checking Access...
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#ffffff8)",
                  }}
                >
                  Verifying your assessment access
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </div>
    );
  }

  if (showRegisterForm) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10 mt-32">
          <motion.div
            className="absolute top-20 left-10 w-20 h-20 bg-green-300/20 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-32 h-32 bg-blue-300/20 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <Container
          maxWidth="sm"
          className="flex items-center justify-center min-h-screen relative z-10 mt-32"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <Card
              elevation={0}
              sx={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                p: 4,
              }}
            >
              <CardContent>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-center mb-6"
                >
                  <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: "#1f2937",
                      mb: 2,
                    }}
                  >
                    Become an Affiliate
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#4b5563",
                      mb: 4,
                    }}
                  >
                    Join our affiliate program and earn 40% commission on every
                    sale you refer.
                  </Typography>
                </motion.div>

                <motion.form
                  onSubmit={handleRegister}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, name: e.target.value })
                    }
                    required
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        color: "#1f2937",
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
                      "& .MuiInputLabel-root": {
                        color: "#6b7280",
                        "&.Mui-focused": {
                          color: "#1f2937",
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Invitation Code"
                    value={registerForm.invitationCode}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        invitationCode: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., ABC123XYZ456"
                    required
                    helperText="Enter the invitation code provided to you"
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        color: "#1f2937",
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
                      "& .MuiInputLabel-root": {
                        color: "#6b7280",
                        "&.Mui-focused": {
                          color: "#1f2937",
                        },
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Affiliate Code"
                    value={registerForm.code}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g., TERRE55"
                    required
                    helperText="This will be your unique referral code"
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        color: "#1f2937",
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
                      "& .MuiInputLabel-root": {
                        color: "#6b7280",
                        "&.Mui-focused": {
                          color: "#1f2937",
                        },
                      },
                    }}
                  />

                  <FormControl
                    fullWidth
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
                      "& .MuiInputLabel-root": {
                        color: "#6b7280",
                        "&.Mui-focused": {
                          color: "#1f2937",
                        },
                      },
                    }}
                  >
                    <InputLabel>Payout Method</InputLabel>
                    <Select
                      value={registerForm.payoutMethod.type}
                      label="Payout Method"
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          payoutMethod: {
                            ...registerForm.payoutMethod,
                            type: e.target.value,
                          },
                        })
                      }
                    >
                      <MenuItem value="paypal">PayPal</MenuItem>
                      <MenuItem value="stripe">Stripe</MenuItem>
                      <MenuItem value="wise">Wise</MenuItem>
                      <MenuItem value="bank">Bank Transfer</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Payout Details"
                    value={registerForm.payoutMethod.details}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        payoutMethod: {
                          ...registerForm.payoutMethod,
                          details: e.target.value,
                        },
                      })
                    }
                    placeholder="Email address or account details"
                    required
                    sx={{
                      mb: 4,
                      "& .MuiOutlinedInput-root": {
                        color: "#1f2937",
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
                      "& .MuiInputLabel-root": {
                        color: "#6b7280",
                        "&.Mui-focused": {
                          color: "#1f2937",
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={registering}
                    className="!bg-[#2c5530] hover:!bg-green-600"
                    sx={{
                      color: "#fff",
                      borderRadius: "50px",
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      mb: 3,
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        backgroundColor: "#9ca3af",
                        color: "#fff",
                      },
                    }}
                  >
                    {registering ? "Registering..." : "Become Affiliate"}
                  </Button>
                </motion.form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="p-4 bg-blue-50 rounded-lg"
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1e40af", mb: 2 }}
                  >
                    Affiliate Program Terms
                  </Typography>
                  <Box
                    component="ul"
                    sx={{ color: "#1e40af", fontSize: "0.875rem", pl: 2 }}
                  >
                    <li>• 40% commission on all referred sales</li>
                    <li>• 30-day hold period before payout</li>
                    {/* <li>• 180-day cookie tracking</li> */}
                    {/* <li>• Last-click attribution model</li> */}
                    <li>• Monthly payout schedule</li>
                  </Box>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </div>
    );
  }

  if (!affiliate || !stats) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Container
          maxWidth="lg"
          className="flex items-center justify-center min-h-screen"
        >
          <Typography variant="h6" sx={{ color: "#6b7280" }}>
            No affiliate data found
          </Typography>
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
            Affiliate Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6b7280",
              mb: 4,
            }}
          >
            Welcome back, {affiliate.name}!
          </Typography>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", mb: 1 }}
                      >
                        Total Clicks
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#1f2937" }}
                      >
                        {stats.clicks}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                        <br />
                      </Typography>
                    </Box>
                    <People sx={{ color: "#9ca3af", fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", mb: 1 }}
                      >
                        Conversions
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#1f2937" }}
                      >
                        {stats.conversions}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                        {stats.conversionRate}% conversion rate
                      </Typography>
                    </Box>
                    <TrendingUp sx={{ color: "#9ca3af", fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", mb: 1 }}
                      >
                        Pending Commissions
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#1f2937" }}
                      >
                        {formatCurrency(stats.commissions.pending.totalCents)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                        {stats.commissions.pending.count} commissions
                      </Typography>
                    </Box>
                    <Schedule sx={{ color: "#9ca3af", fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 3,
                  p: 2,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6b7280", mb: 1 }}
                      >
                        Total Earned
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 700, color: "#1f2937" }}
                      >
                        {formatCurrency(stats.commissions.paid.totalCents)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                        {stats.commissions.paid.count} paid commissions
                      </Typography>
                    </Box>
                    <AttachMoney sx={{ color: "#9ca3af", fontSize: 32 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Card
            elevation={0}
            sx={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 3,
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
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
                <Tab label="Overview" />
                <Tab label="Commissions" />
                <Tab label="Share" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {/* Commission Status Overview */}
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1f2937", mb: 3 }}
              >
                Commission Status Overview
              </Typography>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#f59e0b" }}
                    >
                      {formatCurrency(stats.commissions.pending.totalCents)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Pending
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      {stats.commissions.pending.count} commissions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#3b82f6" }}
                    >
                      {formatCurrency(stats.commissions.locked.totalCents)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Locked
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      {stats.commissions.locked.count} commissions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#10b981" }}
                    >
                      {formatCurrency(stats.commissions.paid.totalCents)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Paid
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      {stats.commissions.paid.count} commissions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#ef4444" }}
                    >
                      {formatCurrency(stats.commissions.void.totalCents)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Void
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                      {stats.commissions.void.count} commissions
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Next Payout */}
              {stats.nextPayoutDate && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1f2937", mb: 2 }}
                  >
                    Next Payout
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Next payout date
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#1f2937" }}
                      >
                        {formatDate(stats.nextPayoutDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body2" sx={{ color: "#6b7280" }}>
                        Amount
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: "#1f2937" }}
                      >
                        {formatCurrency(stats.commissions.locked.totalCents)}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "#1f2937", mb: 3 }}
              >
                Recent Commissions
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
                    {recentCommissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell
                          sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}
                        >
                          {commission.orderId}
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
                Share Your Affiliate Link
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ color: "#6b7280", mb: 1 }}>
                  Your Affiliate Link
                </Typography>
                <TextField
                  fullWidth
                  value={`${window.location.origin}/auth?ref=${affiliate.code}`}
                  InputProps={{
                    readOnly: true,
                    style: { fontFamily: "monospace" },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={copyAffiliateLink}
                          sx={{ color: "#2c5530" }}
                        >
                          <ContentCopy />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#d1d5db",
                        borderRadius: "14px",
                      },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "#9ca3af", mt: 1, display: "block" }}
                >
                  Share this link to start earning commissions
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ color: "#6b7280", mb: 1 }}>
                  Affiliate Code
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Chip
                    label={affiliate.code}
                    variant="outlined"
                    sx={{
                      fontSize: "1.1rem",
                      py: 2,
                      px: 3,
                      borderColor: "#2c5530",
                      color: "#2c5530",
                    }}
                  />
                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(affiliate.code);
                      toast.success("Affiliate code copied!");
                    }}
                    sx={{ color: "#2c5530" }}
                  >
                    <ContentCopy />
                  </IconButton>
                </Box>
              </Box>

              <Box sx={{ p: 3, backgroundColor: "#eff6ff", borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#1e40af", mb: 2 }}
                >
                  Program Details
                </Typography>
                <Box
                  component="ul"
                  sx={{ color: "#1e40af", fontSize: "0.875rem", pl: 2, m: 0 }}
                >
                  <li>• Commission Rate: 40%</li>
                  <li>• Hold Period: 30 days</li>
                  <li>• Payout Method: {affiliate.payoutMethod.type}</li>
                  <li>• Payout Schedule: Monthly</li>
                </Box>
              </Box>
            </TabPanel>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
