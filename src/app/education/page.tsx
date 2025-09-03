"use client";

import { motion } from "framer-motion";
import {
  Button,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
} from "@mui/material";
import {
  MenuBook,
  Psychology,
  Favorite,
  TrendingUp,
  ArrowForward,
  Star,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import relationshipArticles from "@/data/articles";

export default function EducationPage() {
  const router = useRouter();

  // Get all available articles
  const articles = relationshipArticles;

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
            Dating DNA Education Center
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
            Whether you&apos;re single, in a relationship, or navigating the
            dating world, our research-backed articles will help you understand
            yourself and others better.
          </Typography>
        </motion.div>

        {/* All Articles */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <Typography
            variant="h4"
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "#1f2937",
              mb: 8,
              textAlign: "center",
            }}
          >
            All Articles
          </Typography>
          <Grid container spacing={4}>
            {articles.map((article, index) => (
              <Grid item xs={12} md={4} key={article.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid #1f2937",
                      borderRadius: 3,
                      height: "100%",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        background: "rgba(255, 255, 255, 0.15)",
                        borderColor: "#667eea",
                      },
                    }}
                    onClick={() => router.push(`/education/${article.slug}`)}
                  >
                    <CardContent
                      sx={{
                        p: 4,
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
                          background:
                            "linear-gradient(135deg, #667eea20 0%, #667eea40 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          color: "#667eea",
                        }}
                      >
                        <MenuBook />
                      </Box>

                      {/* Category Badge */}
                      <Box sx={{ textAlign: "center", mb: 2 }}>
                        <Chip
                          label={article.category}
                          size="small"
                          sx={{
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "#1f2937",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                          }}
                        />
                      </Box>

                      <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: "#1f2937",
                          mb: 2,
                          textAlign: "center",
                        }}
                      >
                        {article.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#1f2937",
                          lineHeight: 1.6,
                          mb: 3,
                          flex: 1,
                          textAlign: "center",
                        }}
                      >
                        {article.excerpt}
                      </Typography>

                      {/* Article Tags */}
                      <Box
                        sx={{
                          mb: 3,
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        {article.tags?.slice(0, 2).map((tag, tagIndex) => (
                          <Chip
                            key={tagIndex}
                            label={tag}
                            size="small"
                            sx={{
                              background: "rgba(255, 255, 255, 0.3)",
                              color: "#1f2937",
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              border: "1px solid rgba(31, 41, 55, 0.2)",
                            }}
                          />
                        ))}
                      </Box>

                      <Button
                        variant="outlined"
                        endIcon={<ArrowForward />}
                        sx={{
                          borderColor: "#1f2937",
                          color: "#1f2937",
                          borderRadius: "50px",
                          px: 3,
                          py: 1.5,
                          fontWeight: 600,
                          mt: "auto",
                          "&:hover": {
                            borderColor: "white",
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        Read Article
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Topics Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <Typography
            variant="h4"
            component="h3"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: "#1f2937",
              mb: 8,
              textAlign: "center",
            }}
          >
            Explore Topics
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: "Attachment Styles",
                description:
                  "Understand, your early relationships shape your current patterns",
                icon: <Psychology />,
                color: "#667eea",
              },
              {
                title: "Communication",
                description:
                  "Learn effective ways to express needs and resolve conflicts",
                icon: <Favorite />,
                color: "#f093fb",
              },
              {
                title: "Dating Patterns",
                description: "Identify and break destructive dating cycles",
                icon: <TrendingUp />,
                color: "#4facfe",
              },
              {
                title: "Self-Love",
                description:
                  "Build confidence and self-worth for healthier relationships",
                icon: <Star />,
                color: "#43e97b",
              },
            ].map((topic, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid #1f2937",
                      borderRadius: 3,
                      height: "100%",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        background: "rgba(255, 255, 255, 0.15)",
                        borderColor: topic.color,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${topic.color}20 0%, ${topic.color}40 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                          color: topic.color,
                        }}
                      >
                        {topic.icon}
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
                        {topic.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#1f2937",
                          lineHeight: 1.6,
                        }}
                      >
                        {topic.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center"
        >
          <Card
            elevation={0}
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(20px)",
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
                Ready to Apply What You&apos;ve Learned?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: "#1f2937",
                  mb: 6,
                  lineHeight: 1.7,
                }}
              >
                Take your Dating DNA assessment to get personalized insights
                based on your unique patterns
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
