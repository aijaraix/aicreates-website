import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Send, Loader2 } from "lucide-react";
import contactVisual from "@/assets/contact.png";

const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/sholom@aicreates.ai";

export default function Contact() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const payload: Record<string, string> = {
      _subject: `New AIcreatesAI inquiry from ${fd.get("name") || "Anonymous"}`,
      _captcha: "false",
      _template: "table",
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      company: String(fd.get("company") || ""),
      message: String(fd.get("message") || ""),
      _honey: String(fd.get("_honey") || ""),
    };

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({
        title: "Message sent.",
        description: "Thank you. We will be in touch shortly at the email you provided.",
        className: "glass-card border-white/20 text-white",
      });
      form.reset();
    } catch (err) {
      toast({
        title: "Something went wrong.",
        description: "Please email us directly at sholom@aicreates.ai and we will respond promptly.",
        className: "glass-card border-red-400/30 text-white",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex-1 flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={contactVisual} 
            alt="Abstract Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-6xl mx-auto">
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                Initiate a <br/>conversation.
              </h1>
              <p className="text-xl text-white/60 leading-relaxed mb-12 max-w-md">
                Reach out to discuss partnerships, custom infrastructure development, or access to our flagship products.
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Mail className="w-4 h-4 text-white/70" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/50 mb-1 uppercase tracking-wider">Direct Inquiry</h4>
                    <a href="mailto:sholom@aicreates.ai" className="text-lg text-white hover:text-primary transition-colors">
                      sholom@aicreates.ai
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <MapPin className="w-4 h-4 text-white/70" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/50 mb-1 uppercase tracking-wider">Global Headquarters</h4>
                    <p className="text-lg text-white">Miami, Florida<br/>United States</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            >
              <div className="glass-card p-8 md:p-10 border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 pointer-events-none" />
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10" noValidate>
                  {/* Honeypot for bots */}
                  <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/70 text-xs uppercase tracking-wider">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      required 
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-primary"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/70 text-xs uppercase tracking-wider">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        required 
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-primary"
                        placeholder="jane@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-white/70 text-xs uppercase tracking-wider">Company</Label>
                      <Input 
                        id="company" 
                        name="company"
                        required 
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-primary"
                        placeholder="Organization"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white/70 text-xs uppercase tracking-wider">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message"
                      required 
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-[120px] resize-none focus-visible:ring-primary"
                      placeholder="How can we collaborate?"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-white text-black hover:bg-white/90 h-14 text-base mt-4 group disabled:opacity-70"
                  >
                    {submitting ? (
                      <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      <>Submit Inquiry <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </Button>
                  <p className="text-xs text-white/40 text-center pt-2">
                    Or email us directly at <a href="mailto:sholom@aicreates.ai" className="text-white/70 hover:text-primary">sholom@aicreates.ai</a>.
                  </p>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
