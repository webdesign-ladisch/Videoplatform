import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  jwtSecret: process.env.JWT_SECRET || "changeme",
  serverUsername: process.env.SERVER_USERNAME || "admin",
  serverPassword: process.env.SERVER_PASSWORD || "changeme",
  databaseUrl: process.env.DATABASE_URL || "",
  uploadRoot: process.env.UPLOAD_ROOT || "/uploads"
};
