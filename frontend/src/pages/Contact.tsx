import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import Layout from '../components/Layout/Layout';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset submission status after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <Layout>
      <div className="container-custom py-12 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted">
            Have questions about ParkXigo? We're here to help! Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Our Office</h3>
                    <p className="text-muted">123 Parking Avenue, Cityville, State 12345</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email Us</h3>
                    <p className="text-muted">support@parkxigo.com</p>
                    <p className="text-muted">info@parkxigo.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Call Us</h3>
                    <p className="text-muted">+1 (555) 123-4567</p>
                    <p className="text-muted">Mon-Fri, 9am-6pm EST</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">How do I cancel a booking?</h3>
                  <p className="text-sm text-muted">
                    You can cancel bookings through your profile page. Go to "My Parkings" and click the cancel button next to your reservation.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">Can I extend my parking time?</h3>
                  <p className="text-sm text-muted">
                    Yes, you can extend your parking session through the app if there's availability. Go to your active booking and select "Extend Time".
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">How do I list my parking space?</h3>
                  <p className="text-sm text-muted">
                    Register an account, then navigate to the "List Your Space" section. You'll need to provide details about your parking location and availability.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">What payment methods do you accept?</h3>
                  <p className="text-sm text-muted">
                    We accept all major credit cards, PayPal, and Apple Pay. All transactions are processed securely.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="card p-6">
              <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="bg-success/10 border border-success/30 rounded-md p-4 text-center">
                  <h3 className="font-medium text-success mb-2">Message Sent!</h3>
                  <p className="text-sm">
                    Thank you for contacting us. We'll get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Your Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        className="input w-full"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="input w-full"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-1">
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        className="input w-full"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="billing">Billing Question</option>
                        <option value="partnership">Partnership Opportunity</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        placeholder="How can we help you?"
                        className="input w-full min-h-[120px]"
                        value={formData.message}
                        onChange={handleChange}
                        disabled={isSubmitting}
                      ></textarea>
                    </div>
                    
                    <button
                      type="submit"
                      className="btn btn-primary w-full flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
              
              <p className="text-sm text-muted mt-6">
                By submitting this form, you agree to our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and consent to us contacting you regarding your inquiry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}