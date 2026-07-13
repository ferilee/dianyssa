/**
 * Konfigurasi untuk integasi dengan website IdeTech
 * Digunakan oleh semua action yang memanggil API idetechapp
 */

export const IDETECH_BASE_URL =
  process.env.IDETECH_BASE_URL ?? "https://idetech.ferilee.gurumuda.eu.org";

export const IDETECH_API_KEY = process.env.IDETECH_API_KEY ?? "";

export const IDETECH_ENDPOINTS = {
  announcements: {
    list: () => `${IDETECH_BASE_URL}/api/admin/announcements`,
    create: () => `${IDETECH_BASE_URL}/api/admin/announcements`,
    delete: (id: string) => `${IDETECH_BASE_URL}/api/admin/announcements/${id}`,
  },
  blogs: {
    list: () => `${IDETECH_BASE_URL}/api/admin/blogs`,
    create: () => `${IDETECH_BASE_URL}/api/admin/blogs`,
    update: (id: string) => `${IDETECH_BASE_URL}/api/admin/blogs/${id}`,
    delete: (id: string) => `${IDETECH_BASE_URL}/api/admin/blogs/${id}`,
  },
};