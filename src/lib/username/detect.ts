export interface UsernameCheckResult {
  platform: string;
  status: "found" | "suspicious" | "absent";
  url?: string;
  reason?: string;
}

export const checkUsername = async (
  username: string,
  url: string,
  timeout = 7000
): Promise<UsernameCheckResult> => {
  const platform = url.split("//")[1]?.split("/")[0] || "unknown";
  const fullUrl = url.replace("{username}", username);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(fullUrl, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    // Found: 200 OK
    if (response.status === 200) {
      return {
        platform,
        status: "found",
        url: fullUrl,
      };
    }

    // Suspicious: Login required, rate limit, captcha, etc.
    if ([401, 403, 429, 503].includes(response.status)) {
      return {
        platform,
        status: "suspicious",
        reason: `Status ${response.status} - may require login or rate-limited`,
      };
    }

    // Absent: 404 or other errors
    return {
      platform,
      status: "absent",
    };
  } catch (error: any) {
    // Timeout or network error = suspicious
    if (error.name === "AbortError") {
      return {
        platform,
        status: "suspicious",
        reason: "Request timeout",
      };
    }

    // Treat other errors as absent
    return {
      platform,
      status: "absent",
      reason: error.message,
    };
  }
};

export const checkUsernameBatch = async (
  username: string,
  urls: string[],
  concurrency = 10
): Promise<UsernameCheckResult[]> => {
  const results: UsernameCheckResult[] = [];
  const queue = [...urls];

  const worker = async () => {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;

      try {
        const result = await checkUsername(username, url);
        results.push(result);
      } catch (error) {
        console.error(`Error checking ${url}:`, error);
      }
    }
  };

  // Run workers concurrently
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return results;
};

// Heuristic detection with body checking (optional, more expensive)
export const checkUsernameWithBody = async (
  username: string,
  url: string,
  timeout = 7000
): Promise<UsernameCheckResult> => {
  const platform = url.split("//")[1]?.split("/")[0] || "unknown";
  const fullUrl = url.replace("{username}", username);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(fullUrl, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (response.status === 200) {
      // Optionally check body for "not found" indicators
      const text = await response.text();
      const notFoundIndicators = [
        "not found",
        "doesn't exist",
        "no user",
        "unavailable",
        "invalid username",
      ];

      const bodyLower = text.toLowerCase();
      const hasNotFoundIndicator = notFoundIndicators.some((indicator) =>
        bodyLower.includes(indicator)
      );

      if (hasNotFoundIndicator) {
        return {
          platform,
          status: "absent",
          reason: "Username not found in page content",
        };
      }

      // Check if username appears in page
      if (bodyLower.includes(username.toLowerCase())) {
        return {
          platform,
          status: "found",
          url: fullUrl,
        };
      }

      return {
        platform,
        status: "suspicious",
        reason: "Username not clearly present in page",
      };
    }

    if ([401, 403, 429, 503].includes(response.status)) {
      return {
        platform,
        status: "suspicious",
        reason: `Status ${response.status}`,
      };
    }

    return {
      platform,
      status: "absent",
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      return {
        platform,
        status: "suspicious",
        reason: "Timeout",
      };
    }

    return {
      platform,
      status: "absent",
      reason: error.message,
    };
  }
};
