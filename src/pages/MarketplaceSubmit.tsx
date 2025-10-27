import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";

const pluginSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Version must be in format X.Y.Z"),
  entry_url: z.string().url("Must be a valid URL"),
  manifest: z.string().min(1, "Manifest JSON is required"),
  tags: z.string().min(1, "At least one tag is required"),
  icon_url: z.string().url().optional().or(z.literal("")),
  documentation_url: z.string().url().optional().or(z.literal("")),
  support_url: z.string().url().optional().or(z.literal("")),
});

type PluginFormData = z.infer<typeof pluginSchema>;

export default function MarketplaceSubmit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PluginFormData>({
    resolver: zodResolver(pluginSchema),
    defaultValues: {
      title: "",
      description: "",
      version: "1.0.0",
      entry_url: "",
      manifest: JSON.stringify(
        {
          id: "my-plugin",
          name: "My Plugin",
          version: "1.0.0",
          description: "Plugin description",
          author: "Your Name",
          permissions: [],
          methods: [],
        },
        null,
        2
      ),
      tags: "",
      icon_url: "",
      documentation_url: "",
      support_url: "",
    },
  });

  const onSubmit = async (data: PluginFormData) => {
    setIsSubmitting(true);
    try {
      // Parse and validate manifest JSON
      let manifest;
      try {
        manifest = JSON.parse(data.manifest);
      } catch (e) {
        toast({
          title: "Invalid Manifest",
          description: "Manifest must be valid JSON",
          variant: "destructive",
        });
        return;
      }

      const tags = data.tags.split(",").map((t) => t.trim()).filter(Boolean);

      const { data: result, error } = await supabase.functions.invoke("plugin-submit", {
        body: {
          title: data.title,
          description: data.description,
          version: data.version,
          entry_url: data.entry_url,
          manifest,
          tags,
          icon_url: data.icon_url || undefined,
          documentation_url: data.documentation_url || undefined,
          support_url: data.support_url || undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Plugin Submitted",
        description: "Your plugin has been submitted for review",
      });

      navigate(`/marketplace/plugin/${result.plugin.id}`);
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit plugin",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Submit Plugin"
        description="Submit your plugin to the FootprintIQ marketplace"
      />
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/marketplace")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Submit Plugin</CardTitle>
            <CardDescription>
              Share your plugin with the FootprintIQ community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plugin Title</FormLabel>
                      <FormControl>
                        <Input placeholder="My Awesome Plugin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what your plugin does..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="entry_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="manifest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manifest JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Plugin manifest..."
                          rows={12}
                          className="font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Must include id, name, version, and methods array
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="osint, enrichment, social" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags for discoverability
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="icon_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentation_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documentation URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="support_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Plugin"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
