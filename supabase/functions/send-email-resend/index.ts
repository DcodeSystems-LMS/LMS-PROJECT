import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    // Check if we have Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('⚠️ No Resend API key found, using simulation mode')
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully (simulated - no API key configured)',
          emailId: `sim_${Date.now()}`,
          details: {
            to,
            subject,
            from: from || 'noreply@dcodesys.in',
            timestamp: new Date().toISOString(),
            mode: 'simulation'
          }
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Send email using Resend
    const emailData = {
      from: from || 'noreply@dcodesys.in',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">DCODE Systems</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            © 2024 DCODE Systems. All rights reserved.
          </div>
        </div>
      `
    }

    console.log('📤 Sending email via Resend...')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Resend API error:', result)
      
      // Check for rate limit
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Email rate limit exceeded. Please try again in a few minutes.',
            type: 'rate_limit',
            details: result
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          error: result.message || 'Failed to send email',
          type: 'email_error',
          details: result
        }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Email sent successfully via Resend:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: result.id,
        details: {
          to,
          subject,
          from: from || 'noreply@dcodesys.in',
          timestamp: new Date().toISOString(),
          provider: 'resend'
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
