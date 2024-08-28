class MockEmailProvider {
    constructor(name) {
      this.name = name;
      this.successRate = 0.7; // Simulate a 70% success rate
    }
  
    async sendEmail(email) {
      return new Promise((resolve, reject) => {
        const success = Math.random() < this.successRate;
        setTimeout(() => {
          if (success) {
            resolve(`Email sent by ${this.name}`);
          } else {
            reject(new Error(`Failed to send email via ${this.name}`));
          }
        }, 100);
      });
    }
  }
  
  class EmailService {
    constructor(providers, maxRetries = 3, rateLimit = 5) {
      this.providers = providers;
      this.maxRetries = maxRetries;
      this.rateLimit = rateLimit;
      this.sentEmails = new Set(); // For idempotency
      this.emailQueue = []; // For rate limiting
      this.lastSentTime = Date.now();
    }
  
    async sendEmail(email) {
      if (this.sentEmails.has(email.id)) {
        console.log(`Email with ID ${email.id} has already been sent.`);
        return 'Email already sent';
      }
  
      let attempts = 0;
      let providerIndex = 0;
  
      while (attempts < this.maxRetries * this.providers.length) {
        const provider = this.providers[providerIndex];
        const delay = this.calculateExponentialBackoff(attempts);
  
        try {
          this.applyRateLimit();
          const result = await provider.sendEmail(email);
          this.sentEmails.add(email.id); // Mark email as sent
          this.updateLastSentTime();
          console.log(result);
          return result;
        } catch (error) {
          console.error(error.message);
          attempts++;
  
          if (attempts % this.maxRetries === 0) {
            providerIndex = (providerIndex + 1) % this.providers.length;
            console.log(`Switching to provider: ${this.providers[providerIndex].name}`);
          }
  
          await this.sleep(delay);
        }
      }
  
      throw new Error('All providers failed after multiple attempts');
    }
  
    calculateExponentialBackoff(attempt) {
      const baseDelay = 100; // 100ms base delay
      return baseDelay * Math.pow(2, attempt);
    }
  
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  
    applyRateLimit() {
      const now = Date.now();
      const timeElapsed = now - this.lastSentTime;
  
      if (this.emailQueue.length >= this.rateLimit && timeElapsed < 1000) {
        throw new Error('Rate limit exceeded, please try again later');
      }
  
      this.emailQueue.push(now);
      this.emailQueue = this.emailQueue.filter((time) => now - time < 1000);
    }
  
    updateLastSentTime() {
      this.lastSentTime = Date.now();
    }
  }
  
  // Initialize providers and EmailService
  const provider1 = new MockEmailProvider('Provider1');
  const provider2 = new MockEmailProvider('Provider2');
  
  const emailService = new EmailService([provider1, provider2]);
  