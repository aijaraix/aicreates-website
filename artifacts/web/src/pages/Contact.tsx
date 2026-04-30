import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Send } from "lucide-react";
import contactVisual from "@/assets/contact.png";

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: connect form backend — Formspree (action="https://formspree.io/f/<id>"), Tally embed, Supabase REST/Edge Function, or a serverless email function (Resend/Postmark). Replace the simulated submit handler below.
    
    toast({
      title: "Message received.",
      description: "We will review your inquiry and be in touch shortly.",
      className: "glass-card border-white/20 text-white",
    });

    (e.target as HTMLFormElement).reset();
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
                    <p className="text-lg text-white">partners@aicreates.ai</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <MapPin className="w-4 h-4 text-white/70" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/50 mb-1 uppercase tracking-wider">Headquarters</h4>
                    <p className="text-lg text-white">San Francisco, CA<br/>Global Operations</p>
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
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/70 text-xs uppercase tracking-wider">Full Name</Label>
                    <Input 
                      id="name" 
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
                      required 
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 min-h-[120px] resize-none focus-visible:ring-primary"
                      placeholder="How can we collaborate?"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 h-14 text-base mt-4 group">
                    Submit Inquiry <Send className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
