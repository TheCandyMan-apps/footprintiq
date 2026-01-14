import { SEO, organizationSchema } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Lock, Eye, UserX, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function SocialMediaPrivacy() {
  const heroImage = getBlogHeroImage("social-media-privacy");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "Social Media Privacy" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org" as const,
    "@type": "Article" as const,
    headline: "Social Media Privacy: Complete Security Guide for 2024",
    description: "Comprehensive guide to protecting your privacy on Facebook, Instagram, Twitter, LinkedIn, and other social platforms.",
    author: { "@type": "Organization" as const, name: "FootprintIQ" },
    publisher: { "@type": "Organization" as const, name: "FootprintIQ", logo: { "@type": "ImageObject" as const, url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <SEO
        title="Social Media Privacy Guide 2024 | Protect Your Data"
        description="Learn how to secure your social media accounts on Facebook, Instagram, Twitter, and LinkedIn. Complete privacy settings guide with actionable steps."
        canonical="https://footprintiq.app/blog/social-media-privacy"
        ogImage={heroImage}
        article={{ publishedTime: "2024-01-15", modifiedTime: "2024-01-15", author: "FootprintIQ" }}
        schema={{
          article: articleSchema,
          breadcrumbs: breadcrumbSchema,
          organization: organizationSchema
        }}
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
        <Header />
        
        <main className="flex-1">
          <article className="container mx-auto px-4 py-12 max-w-4xl">
            <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>

            {heroImage && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Social media privacy and security illustration"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                Social Media Privacy: Complete Security Guide for 2024
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>15 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Social media platforms collect massive amounts of personal data. This guide shows you exactly how to lock down your privacy settings across all major platforms.
              </p>

              <BlogCallout type="warning" title="Privacy Wake-Up Call">
                The average person has 8.6 social media accounts, each collecting data about your behavior, relationships, and interests. Most people have never reviewed their privacy settings.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  Why Social Media Privacy Matters
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Data Collection
                      </h3>
                      <p className="text-muted-foreground">
                        Platforms track every click, like, and comment to build detailed behavioral profiles for advertising.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <UserX className="h-5 w-5 text-primary" />
                        Identity Theft
                      </h3>
                      <p className="text-muted-foreground">
                        Personal details shared online are used for phishing, account takeovers, and fraud.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        Employment Screening
                      </h3>
                      <p className="text-muted-foreground">
                        90% of employers check social media. Public posts can impact job opportunities.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Third-Party Apps
                      </h3>
                      <p className="text-muted-foreground">
                        Connected apps and games harvest your data and your friends' information.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="Pew Research Center">
                79% of Americans are concerned about how companies use their data, yet only 9% feel they have control over the information collected about them.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Lock className="h-8 w-8 text-primary" />
                  Facebook Privacy Settings
                </h2>
                
                <div className="space-y-6">
                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-4">Profile Privacy</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Set "Who can see your future posts?" to <strong>Friends Only</strong></li>
                        <li>• Limit past posts visibility: Settings → Privacy → Limit Past Posts</li>
                        <li>• Review profile information visibility (email, phone, birthday)</li>
                        <li>• Disable face recognition: Settings → Face Recognition → No</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-4">Search & Discovery</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Who can search for you by email/phone? Set to <strong>Friends</strong></li>
                        <li>• Allow search engines to link to your profile? Set to <strong>No</strong></li>
                        <li>• Who can send friend requests? Set to <strong>Friends of Friends</strong></li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-4">Apps & Websites</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Review and remove old apps: Settings → Apps and Websites</li>
                        <li>• Turn off "Apps others use" to protect your data when friends use apps</li>
                        <li>• Disable instant personalization</li>
                        <li>• Review business integrations and remove unused ones</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-4">Ad Preferences</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Ad Settings → Hide ad topics you don't want to see</li>
                        <li>• Limit data from partners: Ad Preferences → Your information</li>
                        <li>• Review advertisers with your contact info</li>
                        <li>• Opt out of ads based on activity from partners</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Lock className="h-8 w-8 text-primary" />
                  Instagram Privacy Settings
                </h2>
                
                <Card className="border-2 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Essential Settings</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Private Account:</strong> Settings → Privacy → Private Account (ON)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Activity Status:</strong> Settings → Privacy → Activity Status (OFF)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Story Sharing:</strong> Disable "Allow Sharing" to prevent story resharing</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Comments:</strong> Settings → Privacy → Comments → Filter offensive comments</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Tags:</strong> Require manual approval for tagged posts and stories</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <BlogCallout type="tip" title="Instagram Close Friends">
                  Use the Close Friends list for Stories to share with a select group. This limits exposure while maintaining engagement with trusted connections.
                </BlogCallout>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Lock className="h-8 w-8 text-primary" />
                  Twitter/X Privacy Settings
                </h2>
                
                <Card className="border-2 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Protected Tweets:</strong> Settings → Privacy and Safety → Protect your posts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Photo Tagging:</strong> Disable "Allow others to tag you"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Discoverability:</strong> Uncheck "Let others find you by email/phone"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Location:</strong> Disable "Add location information to Tweets"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Data Sharing:</strong> Opt out of personalization and data sharing</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Lock className="h-8 w-8 text-primary" />
                  LinkedIn Privacy Settings
                </h2>
                
                <Card className="border-2 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Profile Viewing:</strong> Settings → Visibility → Private mode when viewing profiles</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Activity Broadcasts:</strong> Turn off "Share profile updates with network"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Connections:</strong> Hide connection list from public</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Research:</strong> Opt out of social, economic, and educational research</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Advertising:</strong> Limit ad targeting based on profile data</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogPullQuote>
                The best privacy setting is the one you actually implement. Start with your most-used platform and work through these settings one at a time.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Universal Social Media Privacy Tips</h2>
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Enable Two-Factor Authentication (2FA)</strong> on every platform</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Review logged-in devices</strong> and remove old sessions regularly</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Use unique, strong passwords</strong> for each platform (password manager recommended)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Limit location sharing</strong> and disable geotagging on photos</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Google yourself regularly</strong> to monitor your public presence</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Think before you post</strong> - everything online is permanent</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogCallout type="warning" title="Data Download Reminder">
                Most platforms allow you to download your data. Do this annually to see what information they've collected about you. Often it's far more than you realized.
              </BlogCallout>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Monitor Your Social Media Exposure</h2>
                <p className="text-lg mb-6">
                  FootprintIQ scans your social media profiles to identify privacy risks and oversharing.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Check Your Exposure</Link>
                </Button>
              </div>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/what-is-digital-footprint" className="text-primary hover:underline">
                          What is a Digital Footprint?
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Understanding your complete online presence
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/remove-data-brokers" className="text-primary hover:underline">
                          Remove Data from Data Brokers
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Stop companies from selling your information
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
