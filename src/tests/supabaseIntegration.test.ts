import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { isSupabaseConfigured, getSupabaseClient } from '../services/supabaseClient';
import { SupabaseService, DEFAULT_SCENARIO_ID } from '../services/supabaseService';

describe('Supabase Integration & Architecture Verification Suite', () => {
  // Test 1: Client Environment Handling & Safe Unconfigured Fallback
  it('Test 1: should safely detect unconfigured/placeholder Supabase environment without crashing', () => {
    // In local demo environment without real API keys, isConfigured must be false
    expect(typeof isSupabaseConfigured).toBe('boolean');
    expect(SupabaseService.isConfigured()).toBe(isSupabaseConfigured);

    if (!isSupabaseConfigured) {
      expect(() => getSupabaseClient()).toThrow(/Supabase client is not configured/);
    }
  });

  // Test 2: Unauthenticated / Local Demo Mode Graceful Operations
  it('Test 2: should handle unauthenticated sessions gracefully without uncaught rejections', async () => {
    const session = await SupabaseService.getCurrentSession();
    expect(session).toBeNull();

    const profile = await SupabaseService.getCurrentUserProfile();
    expect(profile).toBeNull();
  });

  // Test 3: SQL Migration File Integrity & Entities Check
  it('Test 3: migration 20261113000000_routeless_schema.sql must exist and define all core tables & functions', () => {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/20261113000000_routeless_schema.sql');
    expect(fs.existsSync(migrationPath)).toBe(true);

    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

    // Verify all essential entities
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.profiles');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.scenarios');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.scenario_memberships');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.villages');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.institutions');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.route_connections');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.vehicle_trips');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.transport_requests');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.allocation_runs');
    expect(sqlContent).toContain('CREATE TABLE IF NOT EXISTS public.assignments');
  });

  // Test 4: Row Level Security (RLS) Policy Verification in Schema
  it('Test 4: migration must explicitly enable RLS and create security definer functions', () => {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/20261113000000_routeless_schema.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

    // RLS enabled on all tables
    expect(sqlContent).toContain('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY');
    expect(sqlContent).toContain('ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY');
    expect(sqlContent).toContain('ALTER TABLE public.scenario_memberships ENABLE ROW LEVEL SECURITY');
    expect(sqlContent).toContain('ALTER TABLE public.transport_requests ENABLE ROW LEVEL SECURITY');
    expect(sqlContent).toContain('ALTER TABLE public.vehicle_trips ENABLE ROW LEVEL SECURITY');
    expect(sqlContent).toContain('ALTER TABLE public.route_connections ENABLE ROW LEVEL SECURITY');
    expect(sqlContent).toContain('ALTER TABLE public.allocation_runs ENABLE ROW LEVEL SECURITY');
    expect(sqlContent).toContain('ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY');

    // Security definer role checking function
    expect(sqlContent).toContain('CREATE OR REPLACE FUNCTION public.is_scenario_coordinator');
    expect(sqlContent).toContain('SECURITY DEFINER');
    expect(sqlContent).toContain('SET search_path = public, auth');

    // Student privacy: students only see their own requests
    expect(sqlContent).toContain('CREATE POLICY "Students can view own requests, coordinators view all"');
  });

  // Test 5: Atomic Stored Procedures / RPCs for Crisis & Allocation
  it('Test 5: migration must include atomic procedures for crisis activation, reset, and allocation saving', () => {
    const migrationPath = path.resolve(__dirname, '../../supabase/migrations/20261113000000_routeless_schema.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');

    expect(sqlContent).toContain('CREATE OR REPLACE FUNCTION public.activate_exam_crisis_rpc');
    expect(sqlContent).toContain('CREATE OR REPLACE FUNCTION public.reset_scenario_rpc');
    expect(sqlContent).toContain('CREATE OR REPLACE FUNCTION public.save_allocation_run_rpc');

    // Concurrency / Stale check in save_allocation_run_rpc
    expect(sqlContent).toContain('Stale State Conflict');
    expect(sqlContent).toContain('v_current_version <> p_expected_version');
  });

  // Test 6: Seed Data File Verification
  it('Test 6: supabase/seed.sql must seed the default Mangaluru scenario, institutions, and baseline requests', () => {
    const seedPath = path.resolve(__dirname, '../../supabase/seed.sql');
    expect(fs.existsSync(seedPath)).toBe(true);

    const seedContent = fs.readFileSync(seedPath, 'utf-8');

    expect(seedContent).toContain(DEFAULT_SCENARIO_ID);
    expect(seedContent).toContain('St. Aloysius High School & PU College');
    expect(seedContent).toContain('Karnataka (Govt) Polytechnic (KPT)');
    expect(seedContent).toContain('Pavoor Riverine Fringe');
    expect(seedContent).toContain('Kalladka Foothills');
    expect(seedContent).toContain('Ganjimutt Valley');
    expect(seedContent).toContain('Gurupura Riverbank');
    expect(seedContent).toContain('Adyar Ridge Waypoint');
    expect(seedContent).toContain('Bus 01 — KSRTC Rural Sarige (Govt Mini-Bus)');
    expect(seedContent).toContain('Bus 02 — KSRTC JnNURM Suburban (Govt Bus)');
    expect(seedContent).toContain('Van 03 — Dakshina Kannada ZP Feeder (Govt/ZP Van)');
    expect(seedContent).toContain('Cruiser 04 — Kudla Community Rural Cruiser');
  });
});
