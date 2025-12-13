require('dotenv').config({path:'.env.local'});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n📋 Supabase Environment Check:\n');
console.log('URL:', url ? '✅ SET' : '❌ MISSING');
if (url) console.log('   Value:', url);

console.log('\nANON_KEY:', key ? '✅ SET' : '❌ MISSING');
if (key) {
  if (key.includes('PASTE_YOUR') || key.includes('your-')) {
    console.log('   ⚠️  Still has placeholder - needs replacement');
  } else if (key.startsWith('eyJ') && key.length > 100) {
    console.log('   ✅ Looks valid (JWT token)');
  } else {
    console.log('   ⚠️  Key format may be incorrect');
  }
  console.log('   Preview:', key.substring(0, 30) + '...');
}

if (!url || !key || key.includes('PASTE_YOUR')) {
  console.log('\n❌ Configuration incomplete!');
  console.log('\nGet your keys from: https://supabase.com/dashboard → Settings → API\n');
  process.exit(1);
} else {
  console.log('\n✅ Configuration looks good!\n');
}
