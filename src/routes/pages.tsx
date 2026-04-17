import { Hono } from "hono";
import type { Bindings } from "../types";
import { CreateForm } from "../components/CreateForm";
import { ViewPaste } from "../components/ViewPaste";

export const pageRoutes = new Hono<{ Bindings: Bindings }>();

// UUID v4 regex pattern
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET / - Create paste page
 */
pageRoutes.get("/", (c) => {
  return c.render(<CreateForm />);
});

/**
 * GET /:id - View paste page
 * Validates UUID format to avoid collision with other routes
 */
pageRoutes.get("/:id", (c) => {
  const id = c.req.param("id");
  
  // Validate UUID format
  if (!uuidRegex.test(id)) {
    return c.notFound();
  }
  
  return c.render(<ViewPaste id={id} />);
});
