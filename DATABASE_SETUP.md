# Database Setup Guide

This guide will help you set up all the necessary database tables for your blood donation platform.

## Prerequisites

1. Make sure you have Supabase CLI installed
2. Your Supabase project is running locally or you have access to your remote project

## Running the Migrations

### Option 1: Using Supabase CLI (Recommended)

1. **Start your local Supabase instance:**

   ```bash
   supabase start
   ```

2. **Apply all migrations:**

   ```bash
   supabase db reset
   ```

   This will apply all migrations in the correct order.

3. **Or apply just the new migration:**
   ```bash
   supabase migration up
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250103000000_create_missing_tables.sql`
4. Run the SQL script

## What This Migration Creates

### New Tables:

1. **`blood_donation_camps`** - For managing blood donation camps
2. **`camp_registrations`** - For tracking camp registrations
3. **`donor_certificates`** - For generating donor certificates
4. **`donation_records`** - For tracking actual blood donations
5. **`emergency_locations`** - For emergency locations on the map
6. **`admin_audit_logs`** - For admin activity tracking

### Updated Tables:

1. **`blood_banks`** - Added fields for license, services, status, etc.

### Features Added:

- Row Level Security (RLS) policies for all tables
- Proper indexes for performance
- Triggers for automatic updates
- Sample data for testing
- Functions for certificate generation and participant counting

## Testing the Setup

After running the migrations, you can test by:

1. **Check if tables exist:**

   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('blood_donation_camps', 'camp_registrations', 'donor_certificates', 'donation_records', 'emergency_locations', 'admin_audit_logs');
   ```

2. **Check sample data:**
   ```sql
   SELECT COUNT(*) FROM emergency_locations;
   SELECT COUNT(*) FROM blood_donation_camps;
   ```

## Troubleshooting

### If migrations fail:

1. **Check Supabase status:**

   ```bash
   supabase status
   ```

2. **View logs:**

   ```bash
   supabase logs
   ```

3. **Reset database:**
   ```bash
   supabase db reset
   ```

### Common Issues:

1. **Permission errors:** Make sure your Supabase project has the correct permissions
2. **Migration conflicts:** Try running `supabase db reset` to start fresh
3. **RLS issues:** Check that your authentication is working properly

## Next Steps

After running the migrations:

1. Update your frontend code to use the new tables
2. Test all the pages that depend on these tables
3. Add more sample data as needed
4. Set up proper user roles and permissions

## Support

If you encounter any issues:

1. Check the Supabase documentation
2. Review the migration files for syntax errors
3. Ensure all dependencies are installed
