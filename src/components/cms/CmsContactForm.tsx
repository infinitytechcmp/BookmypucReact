import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Phone, MapPin } from 'lucide-react';
import { apiRequest, API_ENDPOINTS } from '@/config/api';
import { GradientHeading } from '@/components/ui/gradient-heading';

interface CmsContactFormProps {
  title?: string;
  description?: string;
  addressTitle?: string;
  address?: string;
  phoneTitle?: string;
  phone?: string;
  emailTitle?: string;
  email?: string;
  form_title?: string;
  form_description?: string;
  form_button_label?: string;
  title_1?: string;
  description_1?: string;
  title_2?: string;
  description_2?: string;
  title_3?: string;
  description_3?: string;
}
export function CmsContactForm({
  title,
  description,
  form_title,
  form_description,
  form_button_label,
  title_1,
  description_1,
  title_2,
  description_2,
  title_3,
  description_3,
}: CmsContactFormProps) {
  const formatDesc = (text?: string) => {
    if (!text) return null;
    return text.split('{{NEWLINE}}').map((str, i) => (
      <span key={i}>
        {str}
        <br />
      </span>
    ));
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.mobile || !formData.subject || !formData.message) {
      toast.error('Please fill all fields');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Validate mobile (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSubmitting(true);

    try {
      // WORKAROUND for backend bug: 
      // The PHP backend has a bug where it fails if ALL fields are present `if (!validateRequired())`.
      // To bypass it, we must make one field "empty". We set `subject: "0"` (which PHP considers empty),
      // and we prepend the real subject to the message so it's not lost.
      const apiPayload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        subject: "0",
        message: `Subject: ${formData.subject}\n\n${formData.message}`
      };

      const result = await apiRequest(API_ENDPOINTS.CONTACT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (result.success) {
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', mobile: '', subject: '', message: '' });
      } else {
        toast.error(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-12 text-center py-20">
        <GradientHeading level={1} className="mb-4 text-4xl font-bold md:text-5xl">{title || 'Contact Us'}</GradientHeading>
        {description && (
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{formatDesc(description)}</p>
        )}
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 my-12">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>{form_title || 'Send us a Message'}</CardTitle>
            {form_description && <p className="text-sm text-muted-foreground">{form_description}</p>}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="What is this regarding?"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you?"
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : form_button_label || 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <GradientHeading level={3} className="mb-2 text-lg font-semibold">{title_1 || 'Email'}</GradientHeading>
              <p className="text-muted-foreground">{formatDesc(description_1) || 'carburantepuc@gmail.com'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <GradientHeading level={3} className="mb-2 text-lg font-semibold">{title_2 || 'Phone'}</GradientHeading>
              <p className="text-muted-foreground">{formatDesc(description_2) || '+91 8180820024'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <GradientHeading level={3} className="mb-2 text-lg font-semibold">{title_3 || 'Address'}</GradientHeading>
              <p className="text-muted-foreground">
                {formatDesc(description_3) || 'Book your appointment now for a hassle-free experience.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
