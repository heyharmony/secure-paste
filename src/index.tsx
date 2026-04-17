import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { apiRoutes } from "./routes/api";
import { pageRoutes } from "./routes/pages";
import { Layout } from "./components/Layout";
import type { Bindings } from "./types";

const app = new Hono<{ Bindings: Bindings }>();

// Security headers middleware
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "no-referrer");
  c.header("Content-Security-Policy", 
    "default-src 'self'; " +
    "script-src 'self' https://cdnjs.cloudflare.com; " +
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self'"
  );
});

// JSX renderer middleware
app.use("*", jsxRenderer(({ children }) => <Layout>{children}</Layout>));

// Mount API routes
app.route("/api", apiRoutes);

// Mount page routes
app.route("/", pageRoutes);

// 404 handler
app.notFound((c) => {
  c.status(404);
  return c.render(<div id="error">Not Found</div>);
});

export default app;
