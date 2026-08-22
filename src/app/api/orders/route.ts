import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const productId = String(form.get('product_id') || '')
    const customerName = String(form.get('customer_name') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const email = String(form.get('email') || '').trim()
    const address = String(form.get('address') || '').trim()
    const district = String(form.get('district') || '').trim()
    const area = String(form.get('area') || '').trim()
    const quantity = Number(form.get('quantity') || 1)
    const notes = String(form.get('notes') || '').trim()

    if (!productId || !customerName || !phone || !address) {
      return NextResponse.json({ error: 'Name, phone, address and product are required.' }, { status: 400 })
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Invalid quantity.' }, { status: 400 })
    }

    const s = await createClient()
    const { data: product, error: productError } = await s
      .from('products')
      .select('id,user_id,price,status')
      .eq('id', productId)
      .eq('status', 'published')
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product is no longer available.' }, { status: 404 })
    }

    const { data: settings, error: settingsError } = await s
      .from('store_settings')
      .select('cod_enabled')
      .eq('user_id', product.user_id)
      .maybeSingle()

    if (settingsError) throw settingsError
    if (settings?.cod_enabled === false) {
      return NextResponse.json({ error: 'Cash on delivery is currently unavailable.' }, { status: 400 })
    }

    const { data, error } = await s.rpc('create_public_order', {
      p_product_id: productId,
      p_customer_name: customerName,
      p_phone: phone,
      p_email: email || null,
      p_address: address,
      p_district: district || null,
      p_area: area || null,
      p_quantity: quantity,
      p_payment_method: 'cod',
      p_transaction_id: null,
      p_notes: notes || null,
    })

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Order could not be created' }, { status: 400 })
    }

    return NextResponse.redirect(new URL(`/order-success/${data.order_number}`, req.url), 303)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Order failed' }, { status: 500 })
  }
}
