SCHEMA.SQL FILE CONTENTS
========================

The complete SQL schema file is located at: SQL/database.sql

File Size: 868 lines
Version: 2.0 (Refactored)

Key Sections:
1. DROP EXISTING TABLES (lines 17-32)
2. CREATE TABLES (lines 34-289)
3. SEED DATA - CATEGORIES (lines 291-313)
4. SEED DATA - ADMINS (lines 315-329)
5. SEED DATA - DEALERS (lines 331-449)
6. SEED DATA - CUSTOMERS (lines 451-549)
7. SEED DATA - PRODUCTS (lines 551-868)

The schema includes:
- 10 CREATE TABLE statements
- 15 CREATE INDEX statements
- UNIQUE constraints on all email columns
- CHECK constraints on numeric fields
- FOREIGN KEY constraints with proper ON DELETE rules
- INSERT statements for all seed data

To reseed the database:
psql "host=aws-0-ap-south-1.pooler.supabase.com port=6543 dbname=postgres user=postgres.pqkgfmbnvvrsntoqhhoo password=L8hgSMS$zD-6.2w sslmode=require" -f SQL/database.sql
