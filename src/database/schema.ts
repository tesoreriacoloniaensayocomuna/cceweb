import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- Better Auth Required Tables ---
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  role: text("role").notNull().default('editor'),
  status: text("status").notNull().default('active'),
  banned: integer("banned", { mode: "boolean" }),
  banReason: text("banReason"),
  banExpires: integer("banExpires", { mode: "timestamp" }),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

// --- Entities ---

export const news = sqliteTable("news", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  imageUrl: text("imageUrl"),
  additionalImages: text("additionalImages", { mode: "json" }).$type<string[]>().default([]),
  category: text("category").notNull().default('Institucional'),
  status: text("status", { enum: ['draft', 'published'] }).notNull().default('published'),
  publishedAt: integer("publishedAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const authorities = sqliteTable("authorities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  category: text("category").notNull(),
  photoUrl: text("photoUrl"),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(new Date(0)),
});

export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  iconUrl: text("iconUrl"),
  tariffTable: text("tariffTable"),
  requestInstructions: text("requestInstructions"),
  // Array of related news IDs or regulation IDs
  relatedNewsIds: text("relatedNewsIds", { mode: "json" }).$type<string[]>(),
  relatedRegulationIds: text("relatedRegulationIds", { mode: "json" }).$type<string[]>(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(new Date(0)),
});

export const procedures = sqliteTable("procedures", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  howToPerform: text("howToPerform").notNull(),
  documentation: text("documentation"), // List of documents
  materials: text("materials"), // Necessary materials
  attachmentUrl: text("attachmentUrl"), // Link to PDF form
  serviceId: text("serviceId").references(() => services.id),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(new Date(0)),
});


export const regulations = sqliteTable("regulations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  regulationNumber: text("regulationNumber").notNull(),
  content: text("content").notNull(),
  pdfUrl: text("pdfUrl"),
  sanctionDate: integer("sanctionDate", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(new Date(0)),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(new Date(0)),
});

export const claims = sqliteTable("claims", {
  id: text("id").primaryKey(),
  fullName: text("fullName").notNull(),
  dni: text("dni").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  homeAddress: text("homeAddress").notNull(),
  homeLat: real("homeLat"),
  homeLng: real("homeLng"),
  problemAddress: text("problemAddress").notNull(),
  problemLat: real("problemLat"),
  problemLng: real("problemLng"),
  description: text("description").notNull(),
  status: text("status").notNull().default("Pendiente"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export const identityMilestones = sqliteTable("identity_milestones", {
  id: text("id").primaryKey(),
  year: text("year").notNull(), // El año o fecha del hito (ej: "1924" o "Octubre 1950")
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const tenders = sqliteTable("tenders", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  tenderNumber: text("tenderNumber").notNull(),
  description: text("description"),
  pdfUrl: text("pdfUrl"),
  openingDate: integer("openingDate", { mode: "timestamp" }), // Fecha de apertura
  status: text("status", { enum: ['open', 'closed', 'awarded'] }).notNull().default('open'),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const tourismItems = sqliteTable("tourism_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  category: text("category", { enum: ['event', 'place'] }).notNull().default('place'),
  eventDate: integer("eventDate", { mode: "timestamp" }),
  locationName: text("locationName"),
  mapUrl: text("mapUrl"),
  entryFee: text("entryFee"),
  openingHours: text("openingHours"), // Para lugares que no son eventos
  highlights: text("highlights"), // Artistas, servicios, etc.
  imageUrls: text("imageUrls", { mode: "json" }).$type<string[]>(),
  videoUrl: text("videoUrl"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const siteConfig = sqliteTable("site_config", {
  id: text("id").primaryKey(), // "main"
  logoUrl: text("logoUrl"),
  showPortalButton: integer("showPortalButton", { mode: "boolean" }).notNull().default(true),
  portalButtonUrl: text("portalButtonUrl").notNull().default("https://coloniaensayo.gob.ar/portal"),
  providerRegistryUrl: text("providerRegistryUrl"), // PDF del Registro de Proveedores
  providerEmail: text("providerEmail").notNull().default("suministros.coloniaensayocomuna@gmail.com"),
  // Array of links: e.g. [{ label: 'Noticias', path: '/noticias/', visible: true }, ...]
  navbarLinks: text("navbarLinks", { mode: "json" }).$type<{ label: string, path: string, visible?: boolean }[]>(),

  heroConfig: text("heroConfig", { mode: "json" }).$type<{
    title: string,
    subtitle: string,
    imageUrl: string,
    buttons: { label: string, url: string, style: string, visible: boolean }[]
  }>(),

  contactConfig: text("contactConfig", { mode: "json" }).$type<{
    address: string,
    phone: string,
    email: string,
    schedule: string,
    mapUrl?: string
  }>(),

  footerConfig: text("footerConfig", { mode: "json" }).$type<{
    description: string,
    socialLinks: { platform: string, url: string, visible: boolean }[],
    quickLinks: { label: string, url: string, visible: boolean }[]
  }>(),

  tourismConfig: text("tourismConfig", { mode: "json" }).$type<{
    heroImageUrl: string,
    heroTitle: string,
    heroSubtitle: string
  }>(),

  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const pageViews = sqliteTable("page_views", {
  id: text("id").primaryKey(),
  path: text("path").notNull(),
  category: text("category"), // ej: 'news', 'tourism', 'regulation'
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});
