-- Add an optional password hash without replacing existing users.
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;