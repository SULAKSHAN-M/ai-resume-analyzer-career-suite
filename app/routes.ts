import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth", "routes/auth.tsx"),
  route("upload", "routes/upload.tsx"),
  route("resume/:id", "routes/resume.tsx"),
  route("career", "routes/career.tsx"),
  route("wipe", "routes/wipe.tsx"),
  route("faq", "routes/faq.tsx"),
  route("privacy", "routes/privacy.tsx"),
  route("terms", "routes/terms.tsx"),
  route("developer", "routes/developer.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
