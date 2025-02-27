import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yxdohrhtcpbhmasbuwhn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4ZG9ocmh0Y3BiaG1hc2J1d2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2NjY4MjMsImV4cCI6MjA1MzI0MjgyM30.FNrSOR1hR0YrXR6TWL9NVZEBkLWs8BfofsZ-rJvlRhg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 