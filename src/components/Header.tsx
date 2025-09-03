'use client'
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Favorite } from "@mui/icons-material";
import Link from "next/link";
import NavAuth from "@/components/NavAuth";
import Image from "next/image";

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <AppBar
      position="fixed"
      elevation={isScrolled ? 4 : 0}
      sx={{
        backgroundColor: "#ffffff",
        transition: "all 0.3s ease",
        borderBottom: isScrolled ? "1px solid #e5e7eb" : "none",
      }}
    >
      <Toolbar>
        <Container maxWidth="xl">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/"
                style={{ textDecoration: "none" }}
              >
               <Image src="/logo.png" alt="logo" width={100} height={100} />
              </Link>
            </motion.div>

            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Box display="flex" gap={3}>
                  {/* <Button
                  onClick={() => smoothScroll("solution")}
                  sx={{
                    color: "text.primary",
                    background: "transparent",
                    "&:hover": { color: "#667eea" },
                  }}
                >
                  How It Works
                </Button>
                <Button
                  onClick={() => smoothScroll("pricing")}
                  sx={{
                    color: "text.primary",
                    background: "transparent",
                    "&:hover": { color: "#667eea" },
                  }}
                >
                  Pricing
                </Button>
                <Button
                  onClick={() => smoothScroll("testimonials")}
                  sx={{
                    color: "text.primary",
                    background: "transparent",
                    "&:hover": { color: "#667eea" },
                  }}
                >
                  Success Stories
                </Button> */}
                  <Button
                    component={Link}
                    variant="text"
                    href="/education"
                    sx={{
                      color: "#2c5530",
                      background: "transparent",
                      "&:hover": { color: "#e76f51" },
                    }}
                  >
                    Education
                  </Button>
                  <Button
                    variant="text"
                    component={Link}
                    href="/mydatingdna"
                    sx={{
                      color: "#2c5530",
                      background: "transparent",
                      "&:hover": { color: "#e76f51" },
                    }}
                  >
                    Chat with Grace
                  </Button>
                </Box>
              </motion.div>
            )}

            {/* Authentication Section */}
            <NavAuth />
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
