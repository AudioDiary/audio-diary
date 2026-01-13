// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eobkuurdmojkoikcmybw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYmt1dXJkbW9qa29pa2NteWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNzM1NTYsImV4cCI6MjA4Mzg0OTU1Nn0.p7cThlonsZUHCA2FpdU7dYuwxClpuTAiq5yQHpfFoio'

export const supabase = createClient(supabaseUrl, supabaseKey)