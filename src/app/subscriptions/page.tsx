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
} from "@mui/material";
import {
  CheckCircle,
  Star,
  Favorite,
  Psychology,
  TrendingUp,
} from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import SubscriptionManager from "@/components/SubscriptionManager";

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();

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
                background: "#ffffff1)",

                border: "1px solid #ffffff2)",
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
                    color: "#ffffff8)",
                  }}
                >
                  Please wait while we load your subscription options
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
                background: "#ffffff1)",

                border: "1px solid #ffffff2)",
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
                    color: "#ffffff9)",
                    mb: 6,
                    lineHeight: 1.7,
                  }}
                >
                  You need to sign in to view and manage your subscriptions.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  href="/auth"
                  sx={{
                    background: "#ffffff2)",
                    color: "#1f2937",
                    borderRadius: "50px",
                    px: 6,
                    py: 2,
                    fontWeight: 600,
                    fontSize: "1.2rem",
                    "&:hover": {
                      background: "#ffffff3)",
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
            Choose Your Path to Love
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "#ffffff9)",
              maxWidth: 800,
              mx: "auto",
              lineHeight: 1.7,
            }}
          >
            Break the cycle of dating disasters with science-backed assessments
            and AI-powered coaching
          </Typography>
        </motion.div>

        {/* Current Subscription Status */}
        {(session?.user as any)?.subscription?.plan && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <Card
              elevation={0}
              sx={{
                background: "#ffffff1)",

                border: "1px solid #ffffff2)",
                borderRadius: 4,
                p: 4,
                maxWidth: 600,
                mx: "auto",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ffffff9)",
                    mb: 2,
                  }}
                >
                  Current Subscription
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Chip
                    label={(session?.user as any)?.subscription?.plan?.toUpperCase()}
                    sx={{
                      background: "#ffffff2)",
                      color: "#1f2937",
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  />
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
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Subscription Plans */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <SubscriptionManager />
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Grid container spacing={4}>
            {[
              {
                title: "Science-Backed",
                description:
                  "Research-informed assessments based on relationship psychology",
                icon: <Psychology />,
                color: "#667eea",
              },
              {
                title: "AI Coaching",
                description:
                  "Personalized guidance from Grace, your AI relationship coach",
                icon: <Star />,
                color: "#f093fb",
              },
              {
                title: "Pattern Recognition",
                description: "Identify and break destructive dating patterns",
                icon: <TrendingUp />,
                color: "#4facfe",
              },
              {
                title: "Actionable Results",
                description: "Get practical steps to improve your love life",
                icon: <CheckCircle />,
                color: "#43e97b",
              },
            ].map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      background: "#ffffff1)",

                      border: "1px solid #ffffff2)",
                      borderRadius: 3,
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        background: "#ffffff15)",
                        borderColor: feature.color,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${feature.color}20 0%, ${feature.color}40 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          color: feature.color,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: "#1f2937",
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#ffffff8)",
                          lineHeight: 1.6,
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </div>
  );
}
