document.getElementById('emailForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const to = document.getElementById('to').value;
    const subject = document.getElementById('subject').value;
    const body = document.getElementById('body').value;
    const statusDiv = document.getElementById('status');
    const sendBtn = document.getElementById('sendBtn');
    
    sendBtn.disabled = true;
    statusDiv.textContent = 'Sending email...';

    const email = {
        id: `${to}-${Date.now()}`, // Unique email ID
        to,
        subject,
        body
    };

    try {
        const result = await emailService.sendEmail(email);
        statusDiv.textContent = result;
    } catch (error) {
        statusDiv.textContent = `Error: ${error.message}`;
    } finally {
        sendBtn.disabled = false;
    }
});
