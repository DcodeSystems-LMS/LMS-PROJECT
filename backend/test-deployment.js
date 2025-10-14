const fetch = require('node-fetch');

async function testDeployment() {
    const apiUrl = process.argv[2] || 'http://localhost:3001';
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    console.log('🧪 Testing deployment at:', apiUrl);
    
    try {
        const response = await fetch(`${apiUrl}/api/extract-video`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: testUrl })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Deployment successful!');
            console.log('📹 Video title:', data.title);
            console.log('🔗 Streams available:', data.streams?.length || 0);
        } else {
            console.log('❌ Deployment failed:', response.status, response.statusText);
            const error = await response.text();
            console.log('Error details:', error);
        }
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
    }
}

testDeployment();