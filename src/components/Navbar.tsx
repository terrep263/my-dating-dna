'use client'
import {
  Button,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
} from "@mui/material";
import Image from "next/image";
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
             <Image src="/logo.png" alt="logo" width={100} height={100} />
            </Link>

            <Box display="flex" gap={2}>
            
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
                 Assessment
              </Button>
            </Box>
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
