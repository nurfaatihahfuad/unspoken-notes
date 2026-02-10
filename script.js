// INITIALIZE SUPABASE
const SUPABASE_URL = 'https://yzmkqyrkkzobmpufdaae.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bWtxeXJra3pvYm1wdWZkYWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTQ0MDEsImV4cCI6MjA4NjI3MDQwMX0.BipsJiV7gr4nF39xmA8etbv0yrQ0hUvinjB_oE5vS2Q';

// Guna 'supabaseClient' supaya tidak keliru dengan library 'supabase'
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const messageForm = document.getElementById('messageForm');
const messageFeed = document.getElementById('messageFeed');
const searchInput = document.getElementById('searchInput');

// 1. FETCH MESSAGES
async function fetchMessages(searchTerm = '') {
    let query = supabaseClient
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

    if (searchTerm) {
        query = query.ilike('receiver', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching:', error);
        return;
    }
    renderMessages(data || []);
}

// 2. RENDER MESSAGES TO HTML
function renderMessages(notes) {
    if (!notes || notes.length === 0) {
        messageFeed.innerHTML = '<p class="loading">No echoes found...</p>';
        return;
    }

    messageFeed.innerHTML = notes.map(note => `
        <div class="note">
            <p class="to">To: ${note.receiver}</p>
            <p class="text">${note.message}</p>
            <span class="date">${new Date(note.created_at).toLocaleDateString()}</span>
        </div>
    `).join('');
}

// 3. POST NEW MESSAGE
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    
    const receiver = document.getElementById('receiver').value;
    const message = document.getElementById('message').value;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    // Gunakan supabaseClient di sini juga
    const { error } = await supabaseClient
        .from('notes')
        .insert([{ receiver, message }]);

    if (error) {
        alert('Error sending message: ' + error.message);
        console.error(error);
    } else {
        messageForm.reset();
        fetchMessages();
        alert('Message posted successfully!');
    }
    
    submitBtn.disabled = false;
    submitBtn.innerText = 'Post to the Void';
});

// 4. SEARCH FILTER
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        fetchMessages(e.target.value);
    });
}

// Initial Load
fetchMessages();
