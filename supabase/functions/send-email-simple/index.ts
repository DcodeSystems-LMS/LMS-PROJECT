import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { to, subject, message, from } = await req.json()

    console.log('📧 Email request received:')
    console.log('  To:', to)
    console.log('  Subject:', subject)
    console.log('  From:', from || 'noreply@dcodesys.in')

    // For now, let's simulate email sending since the actual SMTP might have issues
    // In production, you would integrate with a real email service like SendGrid, Mailgun, etc.
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('✅ Email simulated successfully')

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully (simulated)',
        emailId: `email_${Date.now()}`,
        details: {
          to,
          subject,
          from: from || 'noreply@dcodesys.in',
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Edge Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        type: 'server_error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})