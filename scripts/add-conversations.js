const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addConversations() {
  console.log('💬 Adding sample conversations...\n');
  
  // Get college coaches
  const { data: coaches } = await supabase.from('coaches').select('id, full_name').eq('coach_type', 'college').limit(2);
  // Get some players
  const { data: players } = await supabase.from('players').select('id, first_name, last_name').eq('onboarding_completed', true).limit(5);
  
  if (!coaches?.length || !players?.length) {
    console.log('No coaches or players found');
    return;
  }
  
  const messages = [
    { coach: true, text: 'Hi! I saw your profile and I\'m impressed with your skills. We\'re looking for players like you.' },
    { coach: false, text: 'Thank you Coach! I\'ve been following your program and I\'m very interested.' },
    { coach: true, text: 'Great! Would you be interested in attending our prospect camp next month?' },
    { coach: false, text: 'Absolutely! I\'ll check my schedule and get back to you.' },
    { coach: true, text: 'Looking forward to seeing you there. Feel free to reach out if you have any questions.' },
  ];
  
  let convsAdded = 0;
  let msgsAdded = 0;
  
  for (const coach of coaches) {
    for (const player of players.slice(0, 3)) {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('player_id', player.id)
        .eq('program_id', coach.id)
        .maybeSingle();
      
      let convId = existing?.id;
      
      if (!convId) {
        // Create conversation
        const { data: conv, error } = await supabase
          .from('conversations')
          .insert({
            player_id: player.id,
            program_id: coach.id,
            last_message_text: messages[messages.length - 1].text,
            last_message_at: new Date().toISOString(),
            last_sender: 'coach',
          })
          .select('id')
          .single();
        
        if (error) {
          console.log('Error creating conversation:', error.message);
          continue;
        }
        convId = conv.id;
        convsAdded++;
      }
      
      // Add messages
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const timestamp = new Date(Date.now() - (messages.length - i) * 60 * 60 * 1000);
        
        const { error } = await supabase.from('messages').insert({
          conversation_id: convId,
          sender_type: msg.coach ? 'coach' : 'player',
          sender_id: msg.coach ? coach.id : player.id,
          message_text: msg.text,
          created_at: timestamp.toISOString(),
        });
        
        if (!error) msgsAdded++;
      }
      
      console.log('   ✓ Conversation: ' + coach.full_name + ' <-> ' + player.first_name + ' ' + player.last_name);
    }
  }
  
  console.log('\n✅ Added ' + convsAdded + ' conversations, ' + msgsAdded + ' messages');
}

addConversations();

