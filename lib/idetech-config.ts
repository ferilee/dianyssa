import "dotenv/config";

export const IDETECH_BASE_URL =
  process.env.IDETECH_BASE_URL ?? "https://idetech.ferilee.gurumuda.eu.org";

export const IDETECH_API_KEY = process.env.IDETECH_API_KEY ?? "";

export const IDETECH_ENDPOINTS = {
  announcements: {
    list: "/api/admin/announcements",
    create: "/api/admin/announcements",
    delete: (id: string) => `/api/admin/announcements/${id}`,
  },
  blogs: {
    list: "/api/admin/blogs",
    create: "/api/admin/blogs",
    update: (id: string) => `/api/admin/blogs/${id}`,
    delete: (id: string) => `/api/admin/blogs/${id}`,
  },
};