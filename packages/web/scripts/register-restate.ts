import { env } from "../src/lib/env";

async function doRegister(): Promise<void> {
  const adminBaseUrl = env.RESTATE_ADMIN_URL.replace(/\/$/, "");
  const response = await fetch(`${adminBaseUrl}/deployments`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      uri: env.RESTATE_DEPLOYMENT_URL,
      use_http_11: true,
    }),
  });

  if (response.ok) {
    const payload = await response.json().catch(() => undefined);
    console.log(
      `Restate deployment registered for ${env.RESTATE_DEPLOYMENT_URL}.${
        payload?.deploymentId ? ` Deployment ID: ${payload.deploymentId}.` : ""
      }`,
    );
    return;
  }

  if (response.status === 409) {
    console.log(
      `Restate deployment at ${env.RESTATE_DEPLOYMENT_URL} is already registered.`,
    );
    return;
  }

  const errorText = await response.text();
  throw new Error(
    `Failed to register Restate deployment (status ${response.status}): ${errorText}`,
  );
}

export async function registerRestateDeployment(): Promise<void> {
  const maxAttempts = 5;
  const baseDelayMs = 500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await doRegister();
      return;
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `[restate-deploy] Attempt ${attempt} failed: ${message}. Retrying...`,
      );

      const delay = baseDelayMs * attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

if (import.meta.main) {
  await registerRestateDeployment().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
