// Configuração do Supabase
const SUPABASE_URL = 'https://vzfhsfrfucqoloecnvvu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6ZmhzZnJmdWNxb2xvZWNudnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4NzUyMDcsImV4cCI6MjA0OTQ1MTIwN30.7fwWc-W5GKLvBVg1Hhq1nqZ1A2Xk3K8m9p5L6Q7R8s8';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
