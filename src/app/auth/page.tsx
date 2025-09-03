"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isValidEmail } from "@/utils/validator";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onBlur() {
    setError(isValidEmail(email) ? null : "Please enter a valid email.");
  }
  const { data: session } = useSession();
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Password reset instructions sent to your email!");
        setForgotPassword(false);
        setEmail("");
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        if (response.ok) {
          const res = await signIn("credentials", {
            email,
            password,
          });
          if (res?.error) {
            // show error in UI instead of redirecting
            if (res.error === "CredentialsSignin") {
              toast.error("Invalid email or password"); // friendly message
            } else {
              toast.error("Something went wrong, please try again");
            }
          } else {
            router.push("/");
            toast.success("Signed in successfully");
          }
        } else {
          const error = await response.json();
          toast.error(error.message || "Registration failed");
        }
      } else {
        console.log("here we have been");
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        console.log(res);
        if (res?.error) {
          // show error in UI instead of redirecting
          if (res.error === "CredentialsSignin") {
            toast.error("Invalid email or password"); // friendly message
          } else {
            toast.error("Something went wrong, please try again");
          }
        } else {
          // success
          router.push("/");
          toast.success("Signed in successfully");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (session) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Container
          maxWidth="sm"
          className="flex items-center justify-center min-h-screen"
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
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                borderRadius: 4,
                p: 4,
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: "#1f2937",
                    mb: 3,
                  }}
                >
                  Welcome back!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#4b5563",
                    mb: 4,
                  }}
                >
                  You&apos;re already signed in as {session.user?.email}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    onClick={() => router.push("/dashboard")}
                    sx={{
                      background: "#e5e7eb",
                      color: "#1f2937",
                      borderRadius: "50px",
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "#3a6b3e",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => signOut()}
                    sx={{
                      borderColor: "#9ca3af",
                      color: "#1f2937",
                      borderRadius: "50px",
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "white",
                        backgroundColor: "#ffffff",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Sign Out
                  </Button>
                </Box>
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

      <Container
        maxWidth="sm"
        className="flex items-center justify-center min-h-screen relative z-10"
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
                  {forgotPassword
                    ? "Reset Password"
                    : isSignUp
                    ? "Create Account"
                    : "Welcome Back"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#4b5563",
                    mb: 4,
                  }}
                >
                  {forgotPassword
                    ? "Enter your email address and we'll send you instructions to reset your password"
                    : isSignUp
                    ? "Join MY Dating DNA™ to discover your relationship patterns"
                    : "Sign in to continue your journey"}
                </Typography>
              </motion.div>

              {forgotPassword ? (
                <motion.form
                  onSubmit={handleForgotPassword}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    onBlur={onBlur}
                    error={!!error}
                    helperText={error}
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
                          borderColor: "green",
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
                    disabled={isLoading}
                    className="!bg-[#2c5530] hover:!bg-green-600"
                    sx={{
                      color: "#fff",
                      borderRadius: "50px",
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      mb: 3,
                      "&:hover": {
                        background: "#d1d5db",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        backgroundColor: "#2c5530",
                        color: "#9ca3af",
                      },
                    }}
                  >
                    {isLoading ? "Sending..." : "Send Reset Instructions"}
                  </Button>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-center"
                  >
                    <Button
                      onClick={() => setForgotPassword(false)}
                      sx={{
                        color: "#1f2937",
                        textDecoration: "underline",
                        "&:hover": {
                          backgroundColor: "#ffffff",
                        },
                      }}
                    >
                      Back to Sign In
                    </Button>
                  </motion.div>
                </motion.form>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {isSignUp && (
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      sx={{
                        mb: 3,
                        "& .MuiOutlinedInput-root": {
                          color: "#1f2937",
                          "& fieldset": {
                            borderRadius: "14px",
                          },
                          "&:hover fieldset": {
                            borderColor: "#9ca3af",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "green",
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
                  )}
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    onBlur={onBlur}
                    error={!!error}
                    helperText={error}
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
                          borderColor: "green",
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
                  {/* {error && <p style={{ fontSize: 12 }}>{error}</p>} */}
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: "#6b7280" }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
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
                          borderColor: "green",
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

                  {!isSignUp && (
                    <Button
                      onClick={() => setForgotPassword(true)}
                      className="!text-xs"
                      sx={{
                        color: "#1f2937",
                        textDecoration: "underline",
                        mb: 2,
                        p: 0,
                        minWidth: "auto",
                        "&:hover": {
                          backgroundColor: "transparent",
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Forgot Password?
                    </Button>
                  )}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    className="!bg-[#2c5530] hover:!bg-green-600"
                    sx={{
                      color: "#fff",
                      borderRadius: "50px",
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      mb: 3,
                      "&:hover": {
                        background: "#d1d5db",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        backgroundColor: "#2c5530",
                        color: "#9ca3af",
                      },
                    }}
                  >
                    {isLoading
                      ? "Loading..."
                      : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                  </Button>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-center"
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        mb: 2,
                      }}
                    >
                      {isSignUp
                        ? "Already have an account?"
                        : "Don't have an account?"}
                    </Typography>
                    <Button
                      onClick={() => setIsSignUp(!isSignUp)}
                      sx={{
                        color: "#1f2937",
                        textDecoration: "underline",
                        "&:hover": {
                          backgroundColor: "#ffffff",
                        },
                      }}
                    >
                      {isSignUp ? "Sign In" : "Create Account"}
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
}
