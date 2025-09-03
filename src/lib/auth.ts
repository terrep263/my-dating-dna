import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request);

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

export function requireRole(request: NextRequest, roles: string[]): AuthUser {
  const user = requireAuth(request);

  if (!roles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }

  return user;
}
