import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  try {
    // Check if we can insert an order_item with null product_id
    console.log('Testing order_items schema...')
    
    // First, let's check the table structure
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'order_items' })
    
    if (columnError) {
      console.error('Error getting columns:', columnError)
    } else {
      console.log('order_items columns:', columns)
    }
    
    // Test creating a dummy order first
    const testOrderData = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      total_amount: 100.00,
      status: 'test',
      delivery_address: { test: true }
    }
    
    const { data: testOrder, error: orderError } = await supabase
      .from('orders')
      .insert(testOrderData)
      .select()
      .single()
    
    if (orderError) {
      console.log('Order creation failed (expected):', orderError.message)
    } else {
      console.log('Test order created:', testOrder.id)
      
      // Now test order item with null product_id
      const testItemData = {
        order_id: testOrder.id,
        product_id: null,
        quantity: 1,
        unit_price: 50.00,
        total_price: 50.00,
        metadata: { test: true }
      }
      
      const { data: testItem, error: itemError } = await supabase
        .from('order_items')
        .insert(testItemData)
        .select()
        .single()
      
      if (itemError) {
        console.log('Order item creation failed:', itemError.message)
      } else {
        console.log('Order item created successfully with null product_id!')
        
        // Clean up
        await supabase.from('order_items').delete().eq('id', testItem.id)
      }
      
      // Clean up test order
      await supabase.from('orders').delete().eq('id', testOrder.id)
    }
    
  } catch (error) {
    console.error('Test error:', error)
  }
}

checkSchema()