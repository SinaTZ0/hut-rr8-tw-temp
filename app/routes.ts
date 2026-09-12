import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("complaints-and-feedback", "routes/complaints-and-feedback.tsx"),
  route("online-consultation", "routes/online-consultation.tsx"),
] satisfies RouteConfig;
