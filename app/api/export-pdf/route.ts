// app/api/export-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import { createClient } from '@/utils/supabase/server'

async function getProfileSoils(soilProfileId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('soils')
      .select("id, soil_profile_id, soil, soil_name, soil_type, description, colour, start_depth, end_depth, n_value, y_moist, y_sat, h, su, t, shaft_capacity60, shaft_capacity100, bearing_capacity60, bearing_capacity100")
      .eq('soil_profile_id', soilProfileId)
      .order("start_depth", { ascending: true })

    if (error) {
      console.error('Error fetching profile soils:', error)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Error in getProfileSoils:', error)
    return []
  }
}

async function getProfiles() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("soil_profiles")
      .select("profile_name, id, water_depth, effective_pile_length, pile_stick_out")
      .order("created_at", { ascending: true })

    if (error) {
      console.error('Error fetching profiles:', error)
      return []
    }
    return data || []

  } catch (error) {
    console.error('Error in getProfiles:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  console.log('📥 Received request:', request)
  try {
    const formData = await request.json()
    console.log('📥 Received formData:', JSON.stringify(formData, null, 2))
    console.log('🔍 Soil profile ID:', formData.soil_profile)
    
    if (!formData.soil_profile) {
      return NextResponse.json(
        { error: 'No soil profile specified' }, 
        { status: 400 }
      )
    }
    
    // Fetch the data here where we have auth context
    console.log('📊 Fetching data with auth context...')
    const [profileSoils, profiles] = await Promise.all([
      getProfileSoils(formData.soil_profile),
      getProfiles()
    ])
    
    console.log('📊 Fetched profiles count:', profiles.length)
    console.log('📊 Fetched soils count:', profileSoils.length)
    
    const profile = profiles.find(p => p.id === formData.soil_profile)
    
    if (!profile) {
      console.error('❌ Profile not found. Available profiles:', profiles.map(p => p.id))
      return NextResponse.json(
        { error: 'Soil profile not found' }, 
        { status: 404 }
      )
    }
    
    console.log('✅ Found profile:', profile.profile_name)
    
    // Generate token and encode all the data
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Encode the data as base64 to handle special characters safely
    const exportData = {
      formData,
      profile,
      profileSoils
    }
    
    const encodedData = Buffer.from(JSON.stringify(exportData)).toString('base64')
    
    const params = new URLSearchParams({
      token,
      data: encodedData
    })
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    // Set viewport to 1920x1080
   
    
    // Navigate to the PDF page with form data
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL 
      : 'http://localhost:3000'
    
    const pdfUrl = `${baseUrl}/internal/pdf-export/${token}?${params.toString()}`
    console.log('🔗 Generated PDF URL length:', pdfUrl.length)
    
    await page.goto(pdfUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
    
    await browser.close()
    
    // Return PDF as response
    return new Response(pdf as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="soil-report-${formData.job_number || 'export'}.pdf"`
      }
    })
    
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' }, 
      { status: 500 }
    )
  }
}