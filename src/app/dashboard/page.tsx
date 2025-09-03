"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
} from "@mui/material";
import {
  Dashboard,
  Assessment,
  Chat,
  Subscriptions,
  ArrowForward,
  Psychology,
  TrendingUp,
  Star,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
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
                backgroundColor: "#ffffff",

                border: "1px solid #e5e7eb",
                borderRadius: 4,
                p: 6,
                textAlign: "center",
              }}
            >
              <CardContent>
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    color: "#1f2937",
                    mb: 2,
                  }}
                >
                  Loading...
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  Please wait while we load your dashboard
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-100">
        <Container
          maxWidth="md"
          className="flex items-center justify-center min-h-screen"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full text-center"
          >
            <Card
              elevation={0}
              sx={{
                backgroundColor: "#ffffff",

                border: "1px solid #e5e7eb",
                borderRadius: 4,
                p: 6,
              }}
            >
              <CardContent>
                <Typography
                  variant="h3"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: "#1f2937",
                    mb: 4,
                  }}
                >
                  Sign In Required
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#1f2937",
                    mb: 6,
                    lineHeight: 1.7,
                  }}
                >
                  You need to sign in to access your dashboard.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/auth")}
                  sx={{
                    backgroundColor: "#2c5530",
                    color: "#1f2937",
                    borderRadius: "50px",
                    px: 6,
                    py: 2,
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    "&:hover": {
                      backgroundColor: "#3a6b3e",
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  Sign In
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full"
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
          className="absolute bottom-20 right-10 w-32 h-32 bg-pink-300/20 rounded-full"
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
        <motion.div
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300/20 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </div>

      <Container maxWidth="xl" className="relative z-10 pb-20 pt-40">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "#1f2937",
              mb: 6,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            Welcome to Your Dashboard
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "#1f2937",
              maxWidth: 800,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Manage your Dating DNA journey and track your progress toward
            lasting love
          </Typography>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <Card
            elevation={0}
            sx={{
              background: "rgba(255, 255, 255, 0.1)",

              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 4,
              p: 4,
              maxWidth: 800,
              mx: "auto",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#1f2937",
                      mb: 1,
                    }}
                  >
                    Welcome back,
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    {session?.user?.name || session?.user?.email}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {(session?.user as any)?.subscription?.plan && (
                    <Chip
                      label={(session?.user as any)?.subscription?.plan?.toUpperCase()}
                      sx={{
                        backgroundColor: "#2c5530",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    />
                  )}
                  {(session?.user as any)?.subscription?.status && (
                    <Chip
                      label={(session?.user as any)?.subscription?.status?.toUpperCase()}
                      color={
                        (session?.user as any)?.subscription?.status === "active"
                          ? "success"
                          : "warning"
                      }
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    />
                  )}
                  {(session?.user as any)?.subscription?.status &&
                    (session?.user as any)?.subscription?.status === "active" && (
                      <Button
                        variant="contained"
                        color={"error"}
                        sx={{
                          fontWeight: 600,
                          color: "#fff",
                          fontSize: "0.9rem",
                        }}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <Grid container spacing={4}>
            {[
              {
                title: "Take Assessment",
                description: "Discover your Dating DNA patterns",
                icon: <Assessment />,
                color: "#667eea",
                action: () => router.push("/snapshot"),
                buttonText: "Start Assessment",
              },
              {
                title: "AI Coaching",
                description: "Chat with, your relationship coach",
                icon: <Chat />,
                color: "#f093fb",
                action: () => router.push("/mydatingdna"),
                buttonText: "Start Chat",
              },
              {
                title: "Manage Subscriptions",
                description: "Upgrade or manage your plans",
                icon: <Subscriptions />,
                color: "#4facfe",
                action: () => router.push("/subscriptions"),
                buttonText: "View Plans",
              },
              {
                title: "View Results",
                description: "Review your assessment outcomes",
                icon: <Psychology />,
                color: "#43e97b",
                action: () => router.push("/snapshot"),
                buttonText: "View Results",
              },
            ].map((action, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      backgroundColor: "#ffffff",

                      border: "1px solid #e5e7eb",
                      borderRadius: 3,
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        background: "rgba(255, 255, 255, 0.15)",
                        borderColor: action.color,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 4,
                        textAlign: "center",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${action.color}20 0%, ${action.color}40 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          color: action.color,
                        }}
                      >
                        {action.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: "#1f2937",
                          mb: 2,
                        }}
                      >
                        {action.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#1f2937",
                          lineHeight: 1.6,
                          mb: 3,
                          flex: 1,
                        }}
                      >
                        {action.description}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={action.action}
                        endIcon={<ArrowForward />}
                        sx={{
                          backgroundColor: "#2c5530",
                          color: "#fff",
                          borderRadius: "50px",
                          px: 3,
                          py: 1.5,
                          fontWeight: 600,
                          "&:hover": {
                            backgroundColor: "#3a6b3e",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        {action.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Progress Section */}
        {(session?.user as any)?.type && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="mb-16"
          >
            <Card
              elevation={0}
              sx={{
                backgroundColor: "#ffffff",

                border: "1px solid #e5e7eb",
                borderRadius: 4,
                p: 6,
                maxWidth: 800,
                mx: "auto",
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: "#1f2937",
                    mb: 4,
                    textAlign: "center",
                  }}
                >
                  Your Progress
                </Typography>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: "#1f2937",
                          mb: 1,
                        }}
                      >
                        {(session?.user as any)?.type}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#1f2937",
                        }}
                      >
                        Assessment Type
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: "#1f2937",
                          mb: 1,
                        }}
                      >
                        {(session?.user as any)?.attempts || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#1f2937",
                        }}
                      >
                        Attempts Left
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: "#1f2937",
                          mb: 1,
                        }}
                      >
                        {(session?.user as any)?.validity ? "Active" : "Expired"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#1f2937",
                        }}
                      >
                        Status
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="text-center"
        >
          <Card
            elevation={0}
            sx={{
              background: "rgba(255, 255, 255, 0.1)",

              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 4,
              p: 6,
              maxWidth: 800,
              mx: "auto",
            }}
          >
            <CardContent>
              <Typography
                variant="h4"
                component="h2"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: "#1f2937",
                  mb: 4,
                }}
              >
                Ready to Continue Your Journey?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#1f2937",
                  mb: 6,
                  lineHeight: 1.7,
                }}
              >
                Take the next step toward understanding your Dating DNA and
                finding lasting love
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/snapshot")}
                  endIcon={<ArrowForward />}
                  sx={{
                    backgroundColor: "#2c5530",
                    color: "#fff",
                    borderRadius: "50px",
                    px: 6,
                    py: 2,
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    "&:hover": {
                      backgroundColor: "#3a6b3e",
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  Start Assessment
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/mydatingdna")}
                  endIcon={<ArrowForward />}
                  sx={{
                    borderColor: "#1f2937",
                    color: "#1f2937",
                    borderRadius: "50px",
                    px: 6,
                    py: 2,
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    "&:hover": {
                      borderColor: "#2c5530",
                      color: "#fff",
                      backgroundColor: "#2c5530",
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  Chat with Grace
                </Button>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
