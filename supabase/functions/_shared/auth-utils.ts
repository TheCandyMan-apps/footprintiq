/**
 * Enhanced authentication utilities for edge functions
 * Provides JWT validation, role checking, and request context
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

export interface AuthContext {
  userId: string;
  email?: string;
  role?: string;
  subscriptionTier?: string;
  ipAddress?: string;
  userAgent?: string;
  workspaceId?: string;
}

/**
 * Extract client IP from request
 */
export function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Extract user agent from request
 */
export function getUserAgent(req: Request): string {
  return req.headers.get("user-agent") || "unknown";
}

/**
 * Validate JWT and extract user context
 */
export async function validateAuth(req: Request): Promise<{
  valid: boolean;
  context?: AuthContext;
  error?: string;
}> {
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  // Extract JWT from Authorization header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid Authorization header" };
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    // Validate token and get user
    const {
      data: { user },
      error: userError,
    } = await supabaseAnon.auth.getUser(token);

    if (userError || !user) {
      return { valid: false, error: "Invalid or expired token" };
    }

    // Use service role to query user_roles (RLS protected)
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user role and subscription info
    const { data: userRole } = await supabaseService
      .from("user_roles")
      .select("role, subscription_tier")
      .eq("user_id", user.id)
      .single();

    const context: AuthContext = {
      userId: user.id,
      email: user.email,
      role: userRole?.role || "free",
      subscriptionTier: userRole?.subscription_tier || "free",
      ipAddress: getClientIP(req),
      userAgent: getUserAgent(req),
    };

    return { valid: true, context };
  } catch (error) {
    console.error("Auth validation error:", error);
    return { valid: false, error: "Authentication failed" };
  }
}

/**
 * Check if user has required role
 */
export async function requireRole(
  userId: string,
  requiredRole: "admin" | "analyst" | "free"
): Promise<{ authorized: boolean; error?: string }> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!userRole) {
      return { authorized: false, error: "User role not found" };
    }

    // Role hierarchy: admin > analyst > free
    const roleHierarchy: Record<string, number> = {
      admin: 3,
      analyst: 2,
      free: 1,
    };

    const userLevel = roleHierarchy[userRole.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return {
        authorized: false,
        error: `Insufficient permissions. Required: ${requiredRole}`,
      };
    }

    return { authorized: true };
  } catch (error) {
    console.error("Role check error:", error);
    return { authorized: false, error: "Authorization check failed" };
  }
}

/**
 * Check if user has access to workspace
 */
export async function requireWorkspaceAccess(
  userId: string,
  workspaceId: string,
  requiredRole?: "admin" | "analyst" | "viewer"
): Promise<{ authorized: boolean; role?: string; error?: string }> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("user_id", userId)
      .eq("workspace_id", workspaceId)
      .single();

    if (!member) {
      return { authorized: false, error: "Not a member of this workspace" };
    }

    if (requiredRole) {
      const roleHierarchy: Record<string, number> = {
        admin: 3,
        analyst: 2,
        viewer: 1,
      };

      const memberLevel = roleHierarchy[member.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;

      if (memberLevel < requiredLevel) {
        return {
          authorized: false,
          error: `Insufficient workspace permissions. Required: ${requiredRole}`,
        };
      }
    }

    return { authorized: true, role: member.role };
  } catch (error) {
    console.error("Workspace access check error:", error);
    return { authorized: false, error: "Access check failed" };
  }
}

/**
 * Check if user has premium features
 */
export async function requirePremiumTier(
  userId: string,
  requiredTier: "basic" | "premium" | "enterprise"
): Promise<{ authorized: boolean; error?: string }> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("subscription_tier, subscription_expires_at")
      .eq("user_id", userId)
      .single();

    if (!userRole) {
      return { authorized: false, error: "User subscription not found" };
    }

    // Check if subscription is expired
    if (
      userRole.subscription_expires_at &&
      new Date(userRole.subscription_expires_at) < new Date()
    ) {
      return { authorized: false, error: "Subscription expired" };
    }

    // Tier hierarchy: enterprise > premium > basic > free
    const tierHierarchy: Record<string, number> = {
      enterprise: 4,
      premium: 3,
      basic: 2,
      free: 1,
    };

    const userLevel = tierHierarchy[userRole.subscription_tier] || 0;
    const requiredLevel = tierHierarchy[requiredTier] || 0;

    if (userLevel < requiredLevel) {
      return {
        authorized: false,
        error: `Premium feature requires ${requiredTier} subscription`,
      };
    }

    return { authorized: true };
  } catch (error) {
    console.error("Tier check error:", error);
    return { authorized: false, error: "Subscription check failed" };
  }
}

/**
 * Log authentication event
 */
export async function logAuthEvent(
  supabase: any,
  event: {
    type: "login_success" | "login_failure" | "token_refresh" | "logout" | "unauthorized_access";
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    endpoint: string;
    success: boolean;
    message?: string;
  }
) {
  try {
    await supabase.from("activity_logs").insert({
      user_id: event.userId,
      action: event.type,
      entity_type: "auth",
      metadata: {
        endpoint: event.endpoint,
        success: event.success,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        message: event.message,
      },
    });
  } catch (error) {
    console.error("Failed to log auth event:", error);
  }
}

/**
 * Create standardized auth error response
 */
export function authErrorResponse(
  message: string,
  statusCode: 401 | 403 = 401
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      code: statusCode === 401 ? "unauthorized" : "forbidden",
    }),
    {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

/**
 * Comprehensive auth middleware
 */
export async function authenticateRequest(
  req: Request,
  options: {
    requireAdmin?: boolean;
    requireAnalyst?: boolean;
    requirePremium?: boolean;
    workspaceId?: string;
    workspaceRole?: "admin" | "analyst" | "viewer";
  } = {}
): Promise<{ success: boolean; context?: AuthContext; response?: Response }> {
  // Validate JWT
  const authResult = await validateAuth(req);
  if (!authResult.valid || !authResult.context) {
    return {
      success: false,
      response: authErrorResponse(authResult.error || "Authentication required"),
    };
  }

  const context = authResult.context;

  // Check admin requirement
  if (options.requireAdmin) {
    const roleCheck = await requireRole(context.userId, "admin");
    if (!roleCheck.authorized) {
      return {
        success: false,
        response: authErrorResponse(roleCheck.error || "Admin access required", 403),
      };
    }
  }

  // Check analyst requirement
  if (options.requireAnalyst) {
    const roleCheck = await requireRole(context.userId, "analyst");
    if (!roleCheck.authorized) {
      return {
        success: false,
        response: authErrorResponse(roleCheck.error || "Analyst access required", 403),
      };
    }
  }

  // Check workspace access
  if (options.workspaceId) {
    const workspaceCheck = await requireWorkspaceAccess(
      context.userId,
      options.workspaceId,
      options.workspaceRole
    );
    if (!workspaceCheck.authorized) {
      return {
        success: false,
        response: authErrorResponse(workspaceCheck.error || "Workspace access denied", 403),
      };
    }
    context.workspaceId = options.workspaceId;
  }

  // Check premium tier
  if (options.requirePremium) {
    const tierCheck = await requirePremiumTier(context.userId, "premium");
    if (!tierCheck.authorized) {
      return {
        success: false,
        response: authErrorResponse(tierCheck.error || "Premium subscription required", 403),
      };
    }
  }

  return { success: true, context };
}
