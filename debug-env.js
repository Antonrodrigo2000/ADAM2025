// Debug environment variables
console.log('🔍 Environment Variables Check:')
console.log('CONSULTATION_PRODUCT_ID:', process.env.CONSULTATION_PRODUCT_ID ? '✅ SET' : '❌ MISSING')
console.log('GENIE_SHOP_ID:', process.env.GENIE_SHOP_ID ? '✅ SET' : '❌ MISSING') 
console.log('GENIE_API_URL:', process.env.GENIE_API_URL ? '✅ SET' : '❌ MISSING')
console.log('GENIE_BUSINESS_API_KEY:', process.env.GENIE_BUSINESS_API_KEY ? '✅ SET' : '❌ MISSING')
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL ? '✅ SET' : '❌ MISSING')

console.log('\n📋 Current Values:')
if (process.env.CONSULTATION_PRODUCT_ID) {
  console.log('CONSULTATION_PRODUCT_ID:', process.env.CONSULTATION_PRODUCT_ID)
}
if (process.env.GENIE_SHOP_ID) {
  console.log('GENIE_SHOP_ID:', process.env.GENIE_SHOP_ID)
}
if (process.env.GENIE_API_URL) {
  console.log('GENIE_API_URL:', process.env.GENIE_API_URL)
}

console.log('\n⚠️ Set missing variables in your .env.local file')