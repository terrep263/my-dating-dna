"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import React from "react";
import UserProfile from "./UserProfile";
import { Box, Button } from "@mui/material";
import Link from "next/link";

const NavAuth = () => {
  const { data: session } = useSession();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {session ? (
        <UserProfile />
      ) : (
        <Box display="flex" gap={2}>
          <Button
            component={Link}
            href="/auth"
            variant="contained"
            sx={{
              backgroundColor: "#2c5530",
              "&:hover": {
                backgroundColor: "#3a6b3e",
              },
            }}
          >
            Get Started
          </Button>
        </Box>
      )}
    </motion.div>
  );
};

export default NavAuth;
