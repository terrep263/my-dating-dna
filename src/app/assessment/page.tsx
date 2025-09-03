"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Button,
  Typography,
  Container,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import DatingDNAAssessment from "@/components/DatingDNAAssessment";

interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string;
}

function AssessmentPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const [accessStatus, setAccessStatus] = useState<string>("");
  const [isChecking, setIsChecking] = useState(true);

  const checkAccess = useCallback(async () => {
    console.log(session?.user);
    if (!session?.user || !(session.user as ExtendedUser)?.id) return;
    try {
      const user = (await getSession())?.user as ExtendedUser;
      console.log(user)
      const response = await fetch("/api/verify-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, type }),
      });
      const data = await response.json();
      if (!data.hasAccess) {
        setAccessStatus("denied");
      } else {
        setAccessStatus('allowed');
      }
    } catch (error) {
      console.error("Access verification error:", error);
      setAccessStatus("error");
    } finally {
      setIsChecking(false);
    }
  }, [session, type]);

  useEffect(() => {
    checkAccess();
  }, [status, checkAccess]);

  if (status === "loading" || isChecking) {
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
                <CircularProgress size={60} sx={{ color: "white", mb: 3 }} />
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    color: "white",
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
                    color: "white",
                    mb: 4,
                  }}
                >
                  Access Required
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ffffff9)",
                    mb: 6,
                    lineHeight: 1.7,
                  }}
                >
                  You need to sign in to access the Dating DNA assessment.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/auth")}
                  sx={{
                    background: "#ffffff2)",
                    color: "white",
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

  if (accessStatus === "denied") {
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
                    color: "white",
                    mb: 4,
                  }}
                >
                  Purchase Required
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#ffffff9)",
                    mb: 6,
                    lineHeight: 1.7,
                  }}
                >
                  You need to purchase access to the{" "}
                  {type === "couple" ? "Couples" : "Singles"} assessment.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/subscriptions")}
                  sx={{
                    background: "#ffffff2)",
                    color: "white",
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
                  Upgrade Access
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </div>
    );
  }

  return <DatingDNAAssessment />;
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <AssessmentPageContent />
    </Suspense>
  );
}
