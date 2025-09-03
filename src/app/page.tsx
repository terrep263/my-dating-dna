"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import {
  Favorite,
  Psychology,
  TrendingUp,
  Star,
  ArrowForward,
  PlayArrow,
  CheckCircle,
} from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { status } = useSession();
  // Hero slider images
  const heroImages = [
    "/header1.jpg",
    "/header2.jpg",
    "/header3.jpg",
    "/header4.jpg",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navigation */}

      {/* Enhanced Hero Section */}
      <motion.section
        className="min-h-screen flex items-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${image})` }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: index === currentImageIndex ? 1 : 0,
              }}
              transition={{ duration: 1 }}
            />
          ))}
        </div>

        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/60 via-green-700/60 to-green-800/70" />

        {/* Slider Indicators */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {heroImages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </motion.div>

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

        <Container maxWidth="xl" className="relative z-10">
          <motion.div
            className="text-center text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Break the Cycle.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-400">
                Find Love That Lasts.
              </span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl mb-8 text-green-100 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              Your MY Dating DNA™ reveals the hidden patterns sabotaging your
              love life — and gives you the plan to finally choose differently.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/assessment")}
                startIcon={<PlayArrow />}
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#2c5530",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  padding: "12px 32px",
                  borderRadius: "50px",
                  boxShadow: "0 8px 25px rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    backgroundColor: "#f8f9fa",
                    transform: "translateY(-3px)",
                    boxShadow: "0 12px 35px rgba(255, 255, 255, 0.4)",
                  },
                }}
              >
                Start Singles — $49
              </Button>

              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/assessment?type=couple")}
                startIcon={<Favorite />}
                sx={{
                  borderColor: "#e76f51",
                  color: "#e76f51",
                  backgroundColor: "#ffffff",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  padding: "12px 32px",
                  borderRadius: "50px",
                  "&:hover": {
                    borderColor: "#ea8066",
                    backgroundColor: "#fef2f2",
                    transform: "translateY(-3px)",
                  },
                }}
              >
                Start Couples — $79
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </motion.section>

      {/* Enhanced Solution Section */}
      <motion.section
        id="how-it-works"
        className="py-24 bg-gradient-to-br from-gray-50 to-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ lg: 6, xs: 12 }}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Typography
                  variant="h2"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 700, mb: 3 }}
                >
                  The four strands that drive compatibility
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  paragraph
                  sx={{ mb: 4, lineHeight: 1.7 }}
                >
                  MY Dating DNA™ makes your patterns visible, understandable,
                  and changeable through four core compatibility dimensions that
                  predict relationship success.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/assessment")}
                  endIcon={<ArrowForward />}
                  sx={{
                    backgroundColor: "#2c5530",
                    borderRadius: "50px",
                    padding: "12px 32px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#3a6b3e",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(44, 85, 48, 0.3)",
                    },
                  }}
                >
                  Get Your MY Dating DNA™
                </Button>
              </motion.div>
            </Grid>

            <Grid size={{ lg: 6, xs: 12 }}>
              <Grid container spacing={3}>
                {[
                  {
                    title: "Social Energy",
                    description:
                      "Who energizes you vs. drains you — core to day-to-day compatibility.",
                    icon: <TrendingUp />,
                    color: "#2c5530",
                  },
                  {
                    title: "Attraction Style",
                    description:
                      'What reliably pulls you in — including patterns that masquerade as "chemistry."',
                    icon: <Favorite />,
                    color: "#e76f51",
                  },
                  {
                    title: "Decision Filter",
                    description:
                      "How you choose (or avoid choosing) a partner — and where it backfires.",
                    icon: <Psychology />,
                    color: "#2c5530",
                  },
                  {
                    title: "Relationship Pace",
                    description:
                      "How fast or slow you move — timing that makes or breaks connection.",
                    icon: <Star />,
                    color: "#e76f51",
                  },
                ].map((strand, index) => (
                  <Grid size={{ xs: 6, sm: 6 }} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
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
                            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                            borderColor: strand.color,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3, textAlign: "center" }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: "50%",
                              backgroundColor: `${strand.color}15`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto 16px",
                              color: strand.color,
                            }}
                          >
                            {strand.icon}
                          </Box>
                          <Typography
                            variant="h6"
                            component="h3"
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                          >
                            {strand.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ lineHeight: 1.6 }}
                          >
                            {strand.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </motion.section>

      {/* Enhanced Problem Section */}
      <motion.section
        className="py-24 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Typography
              variant="h2"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Why you keep ending up here
            </Typography>
            <Typography
              variant="h6"
              sx={{ maxWidth: 800, mx: "auto", opacity: 0.9, lineHeight: 1.7 }}
            >
              The same unconscious patterns keep pulling you into relationships
              that drain you. Here&apos;s how we break the cycle.
            </Typography>
          </motion.div>

          <div className="grid grid-cols-12 gap-6">
            {[
              {
                title: 'The "Different" Person Trap',
                description:
                  'Meet someone "different" that feels exciting at first, but the same unconscious attraction patterns pull you in again.',
                icon: <Psychology />,
                color: "#e76f51",
              },
              {
                title: "Chemistry Over Compatibility",
                description:
                  "Ignore red flags because chemistry masquerades as compatibility, so warning signs get overlooked.",
                icon: <Favorite />,
                color: "#2c5530",
              },
              {
                title: "The Emotional Drain",
                description:
                  "Invest months or years in My Dating DNA while the relationship drains you emotionally and feels hard to leave.",
                icon: <TrendingUp />,
                color: "#e76f51",
              },
              {
                title: "Break the cycle with MY Dating DNA™",
                description:
                  "Break the cycle with MY Dating DNA™ by making your patterns visible, understandable, and changeable.",
                icon: <CheckCircle />,
                color: "#2c5530",
              },
            ].map((card, index) => (
              <div
                className="col-span-1 xs:col-span-1 lg:col-span-6"
                key={index}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 3,
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        borderColor: card.color,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          backgroundColor: `${card.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          color: card.color,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{ fontWeight: 600, color: "#1f2937" }}
                      >
                        {card.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ opacity: 0.9, lineHeight: 1.6, color: "#4b5563" }}
                      >
                        {card.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            ))}
          </div>
        </Container>
      </motion.section>

      {/* Enhanced Pricing Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        id="pricing"
        className="py-20 bg-gray-50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
            What you gain with MY Dating DNA™
          </h2>
          <p className="text-xl text-center text-gray-600 mb-16">
            $49 vs. another year of heartbreak
          </p>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div className="bg-white p-8 rounded-2xl border border-gray-200 hover:-translate-y-2 transition-all shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Singles Assessment
              </h3>
              <div
                className="text-4xl font-bold mb-4"
                style={{ color: "#2c5530" }}
              >
                $49
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                32-question, research-informed assessment. Your personal
                compatibility blueprint across four strands. Action steps to
                spot red flags early and choose better.
              </p>
              <button
                onClick={() => {
                  if (status === "authenticated") {
                    router.push("/subscriptions");
                  } else {
                    router.push("/auth");
                  }
                }}
                className="cursor-pointer  block w-full text-center py-3 px-6 rounded-full font-semibold transition-colors"
                style={{ backgroundColor: "#2c5530", color: "#ffffff" }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.backgroundColor = "#3a6b3e")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.backgroundColor = "#2c5530")
                }
              >
                Get Started
              </button>
            </motion.div>

            <motion.div className="bg-white p-8 rounded-2xl border border-gray-200 hover:-translate-y-2 transition-all shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Couples Assessment
              </h3>
              <div
                className="text-4xl font-bold mb-4"
                style={{ color: "#2c5530" }}
              >
                $79
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Each partner completes the same 32-question assessment. Shared
                view of alignment and clear guidance on strengths, friction
                points, and pacing.
              </p>
              <button
                onClick={() => {
                  if (status === "authenticated") {
                    router.push("/subscriptions");
                  } else {
                    router.push("/auth");
                  }
                }}
                className="cursor-pointer block w-full text-center py-3 px-6 rounded-full font-semibold transition-colors"
                style={{ backgroundColor: "#2c5530", color: "#ffffff" }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.backgroundColor = "#3a6b3e")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.backgroundColor = "#2c5530")
                }
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Testimonial Section */}
      <motion.section
        id="testimonials"
        className="py-24 bg-gradient-to-br from-gray-50 to-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card
              elevation={0}
              sx={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                p: 6,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -20,
                  left: -20,
                  width: 100,
                  height: 100,
                  backgroundColor: "#2c553015",
                  borderRadius: "50%",
                  zIndex: 0,
                }}
              />
              <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                  variant="h4"
                  component="blockquote"
                  sx={{
                    fontStyle: "italic",
                    mb: 4,
                    lineHeight: 1.7,
                    color: "text.primary",
                  }}
                >
                  &quot;I went from serial dating disasters to meeting my
                  partner in 3 months. I thought I was just unlucky in love.
                  Turns out, I had a &apos;Rescuer&apos; pattern — always
                  attracted to people who had a &apos;Rescuer&apos; pattern —
                  always attracted to people who needed fixing. My Dating DNA
                  results were uncomfortably accurate. Within weeks of following
                  my custom plan, I started noticing completely different types
                  of people. We&apos;re engaged.&quot;
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#2c5530",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    S
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#2c5530" }}
                  >
                    Sarah M., 32
                  </Typography>
                </Box>
              </Box>
            </Card>
          </motion.div>
        </Container>
      </motion.section>

      {/* Enhanced Sticky Footer */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <Box
          sx={{
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e5e7eb",
            py: 2,
            boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Container maxWidth="xl">
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: "#1f2937" }}
              >
                Break the cycle with MY Dating DNA™ today.
              </Typography>
              <Box
                display="flex"
                gap={2}
                flexWrap="wrap"
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  onClick={() => router.push("/assessment")}
                  startIcon={<PlayArrow />}
                  sx={{
                    backgroundColor: "#2c5530",
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
                  Start Singles — $49
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/assessment?type=couples")}
                  startIcon={<Favorite />}
                  sx={{
                    borderColor: "#e76f51",
                    color: "#e76f51",
                    borderRadius: "50px",
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "#ea8066",
                      backgroundColor: "rgba(231, 111, 81, 0.05)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Start Couples — $79
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </motion.div>

      {/* Bottom padding to account for sticky footer */}
      <div className="h-24"></div>
    </div>
  );
}
