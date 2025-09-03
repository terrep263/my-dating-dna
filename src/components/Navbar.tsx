'use client'
import {
  Button,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
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
            <Link href="/" style={{ textDecoration: "none" }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    backgroundColor: "#2c5530",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  DNA
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#2c5530" }}
                >
                  Dating DNA
                </Typography>
              </Box>
            </Link>

            <Box display="flex" gap={2}>
              <Button
                component={Link}
                href="/snapshot"
                variant={
                  pathname === "/snapshot" ? "contained" : "text"
                }
                sx={{
                  borderRadius: 2,
                  ...(pathname === "/snapshot" && {
                    backgroundColor: "#2c5530",
                    color: "white",
                  }),
                }}
              >
                Quick Snapshot
              </Button>
              <Button
                component={Link}
                href="/assessment"
                variant={
                  pathname === "/assessment" ? "contained" : "text"
                }
                sx={{
                  borderRadius: 2,
                  ...(pathname === "/assessment" && {
                    backgroundColor: "#2c5530",
                    color: "white",
                  }),
                }}
              >
                Full Assessment
              </Button>
            </Box>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
