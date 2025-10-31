import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getBlogHeroImage } from "@/lib/blogImages";
import { sanitizeHtml } from "@/lib/sanitize";

const blogPosts: Record<string, { title: string; date: string; readTime: string; category: string; content: string }> = {
  "what-is-digital-footprint": {
    title: "What Is a Digital Footprint? Complete Guide 2025",
    date: "January 15, 2025",
    readTime: "8 min read",
    category: "Privacy Basics",
    content: `
      <h2>Understanding Your Digital Footprint</h2>
      <p>A digital footprint is the trail of data you leave behind while using the internet. Every time you browse websites, post on social media, shop online, or use apps, you're creating digital traces that can be tracked, collected, and analyzed.</p>

      <h3>Types of Digital Footprints</h3>
      <p><strong>Active Digital Footprint:</strong> Information you deliberately share online, such as social media posts, blog comments, emails, and form submissions.</p>
      <p><strong>Passive Digital Footprint:</strong> Data collected about you without your direct input, including IP addresses, browsing history, cookies, and device information.</p>

      <h3>Why Your Digital Footprint Matters</h3>
      <ul>
        <li><strong>Privacy Risks:</strong> Personal information can be exposed to data brokers, advertisers, and malicious actors</li>
        <li><strong>Reputation Impact:</strong> Online content can affect job prospects, relationships, and professional opportunities</li>
        <li><strong>Security Threats:</strong> Exposed data can be used for identity theft, phishing, and social engineering attacks</li>
        <li><strong>Financial Implications:</strong> Data brokers sell your information to third parties without your consent</li>
      </ul>

      <h3>How to Manage Your Digital Footprint</h3>
      <ol>
        <li><strong>Audit Your Online Presence:</strong> Use OSINT tools like FootprintIQ to scan what information is publicly available about you</li>
        <li><strong>Remove Old Accounts:</strong> Delete unused social media profiles and accounts you no longer need</li>
        <li><strong>Adjust Privacy Settings:</strong> Review and tighten privacy controls on all your active accounts</li>
        <li><strong>Use Data Removal Services:</strong> Employ automated tools to request removal from data broker sites</li>
        <li><strong>Monitor Regularly:</strong> Set up continuous monitoring to catch new exposures early</li>
      </ol>

      <h3>Tools and Services</h3>
      <p>FootprintIQ provides comprehensive digital footprint scanning using trusted OSINT sources including:</p>
      <ul>
        <li>Have I Been Pwned - Email breach detection</li>
        <li>Shodan - IP and device exposure scanning</li>
        <li>VirusTotal - Domain and file reputation checks</li>
        <li>100+ data broker removal services</li>
      </ul>

      <h3>Taking Action Today</h3>
      <p>Start by running a free scan to see what information is currently exposed about you online. Once you understand your digital footprint, you can take concrete steps to reduce your exposure and protect your privacy.</p>
    `,
  },
  "check-email-breach": {
    title: "How to Check If Your Email Was Breached",
    date: "January 12, 2025",
    readTime: "6 min read",
    category: "Security",
    content: `
      <h2>Email Breach Detection Guide</h2>
      <p>Data breaches expose millions of email addresses and passwords every year. If your email was involved in a breach, your personal information may be available to hackers on the dark web.</p>

      <h3>What Happens in a Data Breach?</h3>
      <p>When companies experience security breaches, attackers often steal databases containing:</p>
      <ul>
        <li>Email addresses</li>
        <li>Hashed or plaintext passwords</li>
        <li>Phone numbers</li>
        <li>Physical addresses</li>
        <li>Credit card information</li>
        <li>Social security numbers</li>
      </ul>

      <h3>How to Check for Breaches</h3>
      <p><strong>1. Use Have I Been Pwned:</strong> The most trusted free service for checking if your email was exposed in known breaches.</p>
      <p><strong>2. Run OSINT Scans:</strong> Tools like FootprintIQ aggregate data from multiple breach databases to give you comprehensive results.</p>
      <p><strong>3. Check Dark Web Monitoring:</strong> Premium services monitor underground forums and marketplaces for your data.</p>

      <h3>What to Do If You're Compromised</h3>
      <ol>
        <li><strong>Change Your Passwords Immediately:</strong> Update passwords on all affected accounts</li>
        <li><strong>Enable Two-Factor Authentication:</strong> Add an extra layer of security to prevent unauthorized access</li>
        <li><strong>Monitor Your Accounts:</strong> Watch for suspicious activity on financial and important accounts</li>
        <li><strong>Consider Identity Theft Protection:</strong> Services that monitor credit reports and financial activity</li>
        <li><strong>Use Unique Passwords:</strong> Never reuse passwords across different services</li>
      </ol>

      <h3>Prevention Strategies</h3>
      <ul>
        <li>Use a password manager to generate and store unique, strong passwords</li>
        <li>Enable 2FA wherever available</li>
        <li>Be cautious about where you share your email address</li>
        <li>Use temporary/disposable email addresses for untrusted sites</li>
        <li>Regularly scan for breaches using FootprintIQ</li>
      </ul>

      <h3>Understanding Breach Severity</h3>
      <p>Not all breaches are equal. Consider:</p>
      <ul>
        <li><strong>Data Sensitivity:</strong> What type of information was exposed?</li>
        <li><strong>Password Protection:</strong> Were passwords hashed, salted, or plaintext?</li>
        <li><strong>Breach Date:</strong> Recent breaches pose higher immediate risk</li>
        <li><strong>Company Response:</strong> How quickly was the breach disclosed and patched?</li>
      </ul>

      <p>Stay proactive about your email security by running regular breach checks and updating your security practices accordingly.</p>
    `,
  },
  "osint-beginners-guide": {
    title: "OSINT for Beginners: Open-Source Intelligence Explained",
    date: "January 10, 2025",
    readTime: "10 min read",
    category: "OSINT",
    content: `
      <h2>Introduction to OSINT</h2>
      <p>OSINT (Open-Source Intelligence) refers to the collection and analysis of publicly available information. Originally a practice used by intelligence agencies, OSINT has become essential for cybersecurity professionals, journalists, researchers, and individuals concerned about their privacy.</p>

      <h3>What Counts as Open-Source Intelligence?</h3>
      <p>OSINT encompasses data from:</p>
      <ul>
        <li><strong>Public Records:</strong> Court documents, property records, business registrations</li>
        <li><strong>Social Media:</strong> Posts, photos, connections, and metadata from platforms</li>
        <li><strong>Search Engines:</strong> Google, Bing, specialized search engines</li>
        <li><strong>Technical Sources:</strong> DNS records, WHOIS data, IP addresses, open ports</li>
        <li><strong>Data Breaches:</strong> Exposed credentials from compromised databases</li>
        <li><strong>News and Media:</strong> Articles, press releases, interviews</li>
      </ul>

      <h3>Common OSINT Use Cases</h3>
      <p><strong>1. Personal Privacy Protection:</strong> Discovering what information about you is publicly accessible and taking steps to remove it.</p>
      <p><strong>2. Cybersecurity:</strong> Identifying vulnerabilities in networks and systems before attackers do.</p>
      <p><strong>3. Investigation:</strong> Researching companies, individuals, or suspicious activities.</p>
      <p><strong>4. Brand Protection:</strong> Monitoring mentions, impersonation attempts, and reputation threats.</p>

      <h3>Popular OSINT Tools</h3>
      <p><strong>For Email Intelligence:</strong></p>
      <ul>
        <li>Have I Been Pwned - Breach detection</li>
        <li>Hunter.io - Email discovery and verification</li>
        <li>EmailRep - Reputation scoring</li>
      </ul>

      <p><strong>For Domain/IP Research:</strong></p>
      <ul>
        <li>Shodan - Internet-connected device search engine</li>
        <li>VirusTotal - File and URL analysis</li>
        <li>WHOIS - Domain registration information</li>
      </ul>

      <p><strong>For Social Media:</strong></p>
      <ul>
        <li>Social-Searcher - Cross-platform monitoring</li>
        <li>Sherlock - Username search across platforms</li>
        <li>IntelTechniques - Comprehensive social media tools</li>
      </ul>

      <h3>OSINT Methodology</h3>
      <ol>
        <li><strong>Define Objectives:</strong> What information are you looking for?</li>
        <li><strong>Collect Data:</strong> Gather information from multiple sources</li>
        <li><strong>Process and Analyze:</strong> Filter, correlate, and validate findings</li>
        <li><strong>Verify Information:</strong> Cross-reference data to ensure accuracy</li>
        <li><strong>Report Findings:</strong> Document results and actionable insights</li>
      </ol>

      <h3>Legal and Ethical Considerations</h3>
      <p><strong>What's Legal:</strong></p>
      <ul>
        <li>Accessing publicly available information</li>
        <li>Using search engines and public databases</li>
        <li>Analyzing your own digital footprint</li>
      </ul>

      <p><strong>What's Not:</strong></p>
      <ul>
        <li>Hacking or unauthorized access to systems</li>
        <li>Using stolen credentials or breach data illegally</li>
        <li>Harassment or stalking individuals</li>
        <li>Violating terms of service or privacy laws</li>
      </ul>

      <h3>How FootprintIQ Uses OSINT</h3>
      <p>FootprintIQ aggregates data from trusted OSINT sources to provide comprehensive digital footprint scanning:</p>
      <ul>
        <li><strong>Email Scans:</strong> Check for breaches, identify associated accounts</li>
        <li><strong>Username Searches:</strong> Find profiles across major platforms</li>
        <li><strong>Domain Intelligence:</strong> Analyze reputation, tech stack, and DNS history</li>
        <li><strong>IP Exposure:</strong> Identify open ports and vulnerable services</li>
        <li><strong>Phone Number Lookup:</strong> Carrier information and public records</li>
      </ul>

      <h3>Getting Started with OSINT</h3>
      <p>Begin by running an OSINT scan on yourself using FootprintIQ. This will show you exactly what information is publicly available and help you understand the power and scope of open-source intelligence.</p>

      <p>Remember: The same tools that help protect your privacy can be used against you. Understanding OSINT is the first step in securing your digital footprint.</p>
    `,
  },
  "remove-data-brokers": {
    title: "How to Remove Your Personal Info from Data Brokers",
    date: "January 14, 2025",
    readTime: "12 min read",
    category: "Privacy",
    content: `
      <h2>Understanding Data Brokers</h2>
      <p>Data brokers are companies that collect, aggregate, and sell personal information about consumers without their direct knowledge or consent. These companies build detailed profiles on millions of people and sell this data to advertisers, employers, insurers, and anyone willing to pay.</p>

      <h3>What Information Do Data Brokers Have?</h3>
      <ul>
        <li><strong>Personal Details:</strong> Name, age, gender, photos</li>
        <li><strong>Contact Information:</strong> Email addresses, phone numbers, physical addresses (current and historical)</li>
        <li><strong>Family Connections:</strong> Relatives, associates, neighbors</li>
        <li><strong>Financial Data:</strong> Income estimates, property ownership, bankruptcy records</li>
        <li><strong>Online Activity:</strong> Browsing history, purchase behavior, interests</li>
        <li><strong>Professional Information:</strong> Employment history, education, licenses</li>
        <li><strong>Criminal Records:</strong> Arrests, court cases, traffic violations</li>
      </ul>

      <h3>Major Data Broker Sites</h3>
      <p>The most common people search engines include:</p>
      <ul>
        <li>Whitepages</li>
        <li>Spokeo</li>
        <li>BeenVerified</li>
        <li>PeopleFinders</li>
        <li>Intelius</li>
        <li>TruthFinder</li>
        <li>MyLife</li>
        <li>Radaris</li>
        <li>USSearch</li>
        <li>FastPeopleSearch</li>
      </ul>

      <h3>Manual Removal Process</h3>
      <p><strong>Step 1: Search for Yourself</strong></p>
      <p>Visit each data broker site and search for your name, phone number, and addresses to see what information they have.</p>

      <p><strong>Step 2: Find Opt-Out Pages</strong></p>
      <p>Most data brokers have opt-out pages (often buried in their privacy policies). Look for "Privacy" or "Do Not Sell My Info" links.</p>

      <p><strong>Step 3: Submit Removal Requests</strong></p>
      <p>Fill out removal forms for each site. This typically requires:</p>
      <ul>
        <li>Confirming your identity (ironically, providing more data)</li>
        <li>Providing the URL of your profile on their site</li>
        <li>Email verification</li>
        <li>Waiting 7-30 days for removal</li>
      </ul>

      <p><strong>Step 4: Verify Removal</strong></p>
      <p>After the waiting period, search again to confirm your information was removed.</p>

      <h3>The Challenge with Manual Removal</h3>
      <p>Manual removal is time-consuming and ineffective long-term because:</p>
      <ul>
        <li>There are hundreds of data broker sites</li>
        <li>New sites appear regularly</li>
        <li>Information reappears as brokers refresh their databases</li>
        <li>The process takes 40-60+ hours to complete thoroughly</li>
      </ul>

      <h3>Automated Removal Services</h3>
      <p>Services like FootprintIQ automate the removal process by:</p>
      <ul>
        <li>Scanning 100+ data broker sites automatically</li>
        <li>Submitting removal requests on your behalf</li>
        <li>Monitoring for reappearance of your data</li>
        <li>Sending follow-up requests as needed</li>
        <li>Providing monthly reports on removal status</li>
      </ul>

      <h3>Prevention Strategies</h3>
      <ol>
        <li><strong>Limit Public Records:</strong> Use a PO Box instead of home address when possible</li>
        <li><strong>Opt Out Early:</strong> Don't wait until your information is everywhere</li>
        <li><strong>Use Privacy Services:</strong> Consider a virtual mailbox or phone forwarding service</li>
        <li><strong>Remove Old Content:</strong> Delete old social media posts and profiles</li>
        <li><strong>Monitor Regularly:</strong> Set up automated monitoring to catch new exposures</li>
      </ol>

      <h3>Legal Rights</h3>
      <p><strong>CCPA (California):</strong> California residents have the right to request deletion of personal information.</p>
      <p><strong>GDPR (EU):</strong> European residents can request complete data deletion under "Right to be Forgotten."</p>
      <p><strong>Other States:</strong> Virginia, Colorado, Connecticut, and Utah have similar privacy laws.</p>

      <p>Taking control of your data requires ongoing effort, but removing your information from data brokers is one of the most effective ways to protect your privacy online.</p>
    `,
  },
  "dark-web-monitoring": {
    title: "Dark Web Monitoring: What You Need to Know",
    date: "January 11, 2025",
    readTime: "9 min read",
    category: "Security",
    content: `
      <h2>What Is the Dark Web?</h2>
      <p>The dark web is a part of the internet that requires special software (like Tor) to access. Unlike the surface web indexed by Google, the dark web hosts anonymous marketplaces, forums, and databases where stolen data is bought and sold.</p>

      <h3>What Criminals Look For</h3>
      <p><strong>Financial Data:</strong></p>
      <ul>
        <li>Credit card numbers and CVV codes</li>
        <li>Bank account credentials</li>
        <li>PayPal and cryptocurrency wallet access</li>
        <li>Tax returns and W-2 forms</li>
      </ul>

      <p><strong>Personal Information:</strong></p>
      <ul>
        <li>Social Security numbers</li>
        <li>Driver's license data</li>
        <li>Passport scans</li>
        <li>Medical records</li>
      </ul>

      <p><strong>Account Access:</strong></p>
      <ul>
        <li>Email credentials</li>
        <li>Social media logins</li>
        <li>Corporate VPN access</li>
        <li>Administrative passwords</li>
      </ul>

      <h3>How Data Ends Up on the Dark Web</h3>
      <p><strong>1. Data Breaches:</strong> When companies are hacked, stolen databases often end up for sale on dark web marketplaces.</p>
      <p><strong>2. Phishing Attacks:</strong> Credentials obtained through phishing campaigns are bundled and sold.</p>
      <p><strong>3. Malware:</strong> Info-stealing malware harvests passwords, cookies, and files from infected devices.</p>
      <p><strong>4. Insider Threats:</strong> Employees with access to sensitive data may sell it directly.</p>

      <h3>Common Dark Web Marketplaces</h3>
      <p>While marketplaces frequently get shut down and new ones emerge, common categories include:</p>
      <ul>
        <li><strong>Carding Forums:</strong> Buy/sell stolen credit cards</li>
        <li><strong>Credential Shops:</strong> Username/password combinations</li>
        <li><strong>Fullz Shops:</strong> Complete identity packages (SSN, DOB, address, etc.)</li>
        <li><strong>Combo Lists:</strong> Millions of email:password pairs from breaches</li>
      </ul>

      <h3>What Dark Web Monitoring Does</h3>
      <p>Dark web monitoring services scan underground forums, marketplaces, and paste sites for your information:</p>
      <ul>
        <li>Email addresses and associated passwords</li>
        <li>Credit card numbers</li>
        <li>Social Security numbers</li>
        <li>Phone numbers</li>
        <li>Bank account details</li>
        <li>Driver's license numbers</li>
      </ul>

      <h3>How to Respond to Dark Web Exposure</h3>
      <p><strong>If Your Email Is Found:</strong></p>
      <ol>
        <li>Change passwords immediately on all accounts</li>
        <li>Enable two-factor authentication everywhere possible</li>
        <li>Check for unauthorized account access or changes</li>
        <li>Monitor for phishing attempts (criminals know your email is active)</li>
      </ol>

      <p><strong>If Financial Data Is Found:</strong></p>
      <ol>
        <li>Contact your bank/credit card company immediately</li>
        <li>Request new cards with different numbers</li>
        <li>Place fraud alerts on your credit reports</li>
        <li>Consider a credit freeze</li>
        <li>Monitor accounts daily for unauthorized transactions</li>
      </ol>

      <p><strong>If SSN/Identity Data Is Found:</strong></p>
      <ol>
        <li>Place a credit freeze with all three bureaus (Equifax, Experian, TransUnion)</li>
        <li>File a report with the FTC at IdentityTheft.gov</li>
        <li>Consider identity theft protection services</li>
        <li>Monitor credit reports monthly</li>
        <li>Watch for signs of identity theft (unexpected bills, denied credit)</li>
      </ol>

      <h3>Prevention Strategies</h3>
      <ul>
        <li><strong>Use Unique Passwords:</strong> Password managers generate and store unique passwords for each account</li>
        <li><strong>Enable 2FA:</strong> Even if passwords leak, 2FA prevents unauthorized access</li>
        <li><strong>Monitor Regularly:</strong> Use dark web monitoring to catch exposures early</li>
        <li><strong>Limit Data Sharing:</strong> Only provide sensitive information when absolutely necessary</li>
        <li><strong>Check Breach Notifications:</strong> Sign up for alerts from services like FootprintIQ</li>
      </ul>

      <h3>FootprintIQ Dark Web Monitoring</h3>
      <p>FootprintIQ scans dark web sources for your exposed data and alerts you immediately when:</p>
      <ul>
        <li>Your email appears in a new breach</li>
        <li>Your credentials are posted on paste sites</li>
        <li>Your information is found in combo lists</li>
        <li>Your data appears in underground forums</li>
      </ul>

      <p>Early detection is critical. The faster you know about exposure, the faster you can take action to protect yourself.</p>
    `,
  },
  "social-media-privacy": {
    title: "Social Media Privacy Settings Guide 2025",
    date: "January 8, 2025",
    readTime: "11 min read",
    category: "Privacy",
    content: `
      <h2>Why Social Media Privacy Matters</h2>
      <p>Social media platforms collect vast amounts of personal data for advertising purposes. Default settings are designed to maximize data collection and content visibility, not to protect your privacy. Taking control of your privacy settings is essential.</p>

      <h3>Facebook Privacy Settings</h3>
      <p><strong>Profile Visibility:</strong></p>
      <ol>
        <li>Go to Settings & Privacy → Privacy</li>
        <li>Set "Who can see your future posts?" to Friends Only</li>
        <li>Limit past posts: "Limit Past Posts" button makes all public posts visible only to friends</li>
        <li>Review "Who can see your friends list?" - set to Only Me</li>
      </ol>

      <p><strong>Search and Contact:</strong></p>
      <ul>
        <li>Disable "Do you want search engines outside of Facebook to link to your profile?"</li>
        <li>Set "Who can look you up using email/phone?" to Friends</li>
        <li>Disable "Allow friend requests" if you only want to connect with people you know</li>
      </ul>

      <p><strong>Apps and Websites:</strong></p>
      <ul>
        <li>Review apps with access to your Facebook data</li>
        <li>Remove any apps you don't actively use</li>
        <li>Disable "Apps others use" to prevent friends' apps from accessing your data</li>
      </ul>

      <h3>Instagram Privacy Settings</h3>
      <p><strong>Account Privacy:</strong></p>
      <ol>
        <li>Settings → Privacy → Private Account (ON)</li>
        <li>This requires people to request to follow you</li>
        <li>Review and remove followers you don't know</li>
      </ol>

      <p><strong>Activity Status and Read Receipts:</strong></p>
      <ul>
        <li>Settings → Privacy → Activity Status (OFF)</li>
        <li>Disables "last seen" and read receipts in DMs</li>
      </ul>

      <p><strong>Story and Post Sharing:</strong></p>
      <ul>
        <li>Disable "Allow Sharing to Stories" for posts</li>
        <li>Control who can reply to stories (Everyone → Followers → Off)</li>
        <li>Hide stories from specific people</li>
      </ul>

      <h3>Twitter (X) Privacy Settings</h3>
      <p><strong>Protect Your Tweets:</strong></p>
      <ul>
        <li>Settings → Privacy and Safety → Protect your Tweets</li>
        <li>Makes all tweets visible only to approved followers</li>
        <li>Note: This limits discoverability significantly</li>
      </ul>

      <p><strong>Discoverability:</strong></p>
      <ul>
        <li>Disable "Let people who have your email address find you"</li>
        <li>Disable "Let people who have your phone number find you"</li>
        <li>Consider removing phone number and email from account entirely</li>
      </ul>

      <p><strong>Data Sharing:</strong></p>
      <ul>
        <li>Settings → Privacy and Safety → Data sharing with business partners (OFF)</li>
        <li>Ads → Disable personalized ads</li>
        <li>Download your Twitter archive to see what data they have</li>
      </ul>

      <h3>LinkedIn Privacy Settings</h3>
      <p><strong>Profile Visibility:</strong></p>
      <ol>
        <li>Settings → Visibility → Edit your public profile</li>
        <li>Toggle off sections you don't want public (connections, experience, etc.)</li>
        <li>Set "Who can see your connections" to Only You</li>
      </ol>

      <p><strong>Activity Broadcasts:</strong></p>
      <ul>
        <li>Disable "Share profile updates with your network"</li>
        <li>Disable "Notify connections when you're in the news"</li>
        <li>Turn off "Viewers of this profile also viewed" suggestions</li>
      </ul>

      <h3>TikTok Privacy Settings</h3>
      <p><strong>Account Privacy:</strong></p>
      <ol>
        <li>Settings → Privacy → Private Account (ON)</li>
        <li>Prevent others from downloading your videos</li>
        <li>Limit who can comment, duet, and stitch your content</li>
      </ol>

      <p><strong>Data Collection:</strong></p>
      <ul>
        <li>Settings → Privacy → Personalization and Data: Review and disable unnecessary permissions</li>
        <li>Request your data download to see what TikTok collects</li>
        <li>Be aware: TikTok has extensive data collection practices</li>
      </ul>

      <h3>General Best Practices</h3>
      <ul>
        <li><strong>Review Regularly:</strong> Privacy settings change frequently - audit quarterly</li>
        <li><strong>Limit Personal Info:</strong> Don't share phone numbers, addresses, or birthdays publicly</li>
        <li><strong>Use Strong Passwords:</strong> Unique password for each platform with 2FA enabled</li>
        <li><strong>Check Connected Apps:</strong> Remove third-party apps you don't use</li>
        <li><strong>Be Selective:</strong> Only accept connection requests from people you know</li>
        <li><strong>Think Before Posting:</strong> Everything online can be screenshot and shared</li>
      </ul>

      <h3>What to Remove</h3>
      <p>Consider deleting or making private:</p>
      <ul>
        <li>Photos showing your home, car, or identifiable locations</li>
        <li>Posts mentioning your workplace or school</li>
        <li>Check-ins and location tags</li>
        <li>Family member tags and relationships</li>
        <li>Personal contact information</li>
        <li>Travel plans or vacation posts (wait until you're back)</li>
      </ul>

      <p>Remember: Privacy settings only control visibility on the platform itself. Once something is shared with others, you lose control over how it's distributed.</p>
    `,
  },
  "phone-number-privacy": {
    title: "Phone Number Privacy Risks You Should Know",
    date: "January 6, 2025",
    readTime: "7 min read",
    category: "Privacy Basics",
    content: `
      <h2>Why Phone Numbers Are Sensitive</h2>
      <p>Your phone number is a unique identifier that's much harder to change than an email address. It's tied to your identity through carrier records, financial accounts, two-factor authentication, and countless online services.</p>

      <h3>What Your Phone Number Reveals</h3>
      <ul>
        <li><strong>Carrier Information:</strong> Which mobile network you use</li>
        <li><strong>Geographic Location:</strong> Area code indicates general location</li>
        <li><strong>Line Type:</strong> Mobile, landline, or VoIP</li>
        <li><strong>Account Connections:</strong> Links to social media, banking, and other services</li>
        <li><strong>Identity Verification:</strong> Used to confirm your identity across platforms</li>
      </ul>

      <h3>How Phone Numbers Are Exposed</h3>
      <p><strong>1. Data Brokers:</strong> People search sites like Whitepages and Spokeo list phone numbers with names and addresses.</p>
      <p><strong>2. Social Media:</strong> Many users have their phone number connected to accounts for recovery and 2FA.</p>
      <p><strong>3. Data Breaches:</strong> Breaches often include phone numbers alongside other personal data.</p>
      <p><strong>4. Public Records:</strong> Property records, business licenses, and court documents may contain phone numbers.</p>
      <p><strong>5. Spam Lists:</strong> Once on a spam list, your number is bought and sold repeatedly.</p>

      <h3>Risks of Phone Number Exposure</h3>
      <p><strong>Spam and Robocalls:</strong></p>
      <p>Once exposed, you'll receive endless spam calls from telemarketers, scammers, and robocalls. These calls are not just annoying - they can be sophisticated phishing attempts.</p>

      <p><strong>SIM Swapping Attacks:</strong></p>
      <p>Attackers convince your carrier to transfer your number to a new SIM card they control. This gives them access to:</p>
      <ul>
        <li>Text messages (including 2FA codes)</li>
        <li>Password reset links</li>
        <li>Banking notifications</li>
        <li>Email account recovery</li>
      </ul>

      <p><strong>Social Engineering:</strong></p>
      <p>Scammers use your phone number to build trust. They might call pretending to be from your bank, using information tied to your number to seem legitimate.</p>

      <p><strong>Account Takeovers:</strong></p>
      <p>Many services use phone-based password reset. If attackers control your number, they can reset passwords and lock you out of your accounts.</p>

      <h3>Protection Strategies</h3>
      <p><strong>1. Use Virtual Phone Numbers:</strong></p>
      <ul>
        <li>Google Voice - Free virtual number for calls/texts</li>
        <li>MySudo - Multiple numbers with privacy focus</li>
        <li>Burner - Temporary numbers for one-time use</li>
      </ul>

      <p><strong>2. Remove from Data Brokers:</strong></p>
      <p>Use services like FootprintIQ to automatically remove your number from people search sites.</p>

      <p><strong>3. Limit Social Media Sharing:</strong></p>
      <ul>
        <li>Don't use phone number for account recovery</li>
        <li>Make phone number private or remove entirely</li>
        <li>Use email for login instead of phone number</li>
      </ul>

      <p><strong>4. Set Up Carrier PIN:</strong></p>
      <p>Contact your mobile carrier and set up a PIN or password required for any account changes. This helps prevent SIM swapping.</p>

      <p><strong>5. Use Authenticator Apps:</strong></p>
      <p>Instead of SMS-based 2FA, use authenticator apps like:</p>
      <ul>
        <li>Google Authenticator</li>
        <li>Authy</li>
        <li>Microsoft Authenticator</li>
      </ul>

      <p><strong>6. Register with National Do Not Call:</strong></p>
      <p>Register your number at donotcall.gov to reduce legitimate telemarketing calls.</p>

      <h3>What to Do If Exposed</h3>
      <ol>
        <li><strong>Request Removal:</strong> Submit opt-out requests to people search sites</li>
        <li><strong>Monitor Usage:</strong> Check your phone bill for unauthorized charges or unusual activity</li>
        <li><strong>Consider Changing Number:</strong> In severe cases, getting a new number may be necessary</li>
        <li><strong>Enable Scam Protection:</strong> Most carriers offer spam call filtering - enable it</li>
        <li><strong>Never Answer Unknown Numbers:</strong> Let calls go to voicemail; legitimate callers will leave a message</li>
      </ol>

      <h3>When to Share Your Number</h3>
      <p>Be selective about sharing your real phone number:</p>
      <ul>
        <li><strong>Always Required:</strong> Banks, government services, healthcare</li>
        <li><strong>Use Virtual Number:</strong> Online shopping, app signups, loyalty programs</li>
        <li><strong>Never Share:</strong> Public forums, social media profiles, untrusted websites</li>
      </ul>

      <p>Your phone number is a key piece of your digital identity. Protecting it should be a priority in your overall privacy strategy.</p>
    `,
  },
  "username-security": {
    title: "Why Username Reuse Is Dangerous for Your Privacy",
    date: "January 4, 2025",
    readTime: "8 min read",
    category: "Security",
    content: `
      <h2>The Username Reuse Problem</h2>
      <p>Using the same username across multiple platforms might seem convenient, but it creates a massive privacy and security risk. A single username can serve as a thread that connects your entire online identity, making it easy for attackers, stalkers, or anyone else to build a comprehensive profile of you.</p>

      <h3>How Attackers Exploit Username Reuse</h3>
      <p><strong>1. Cross-Platform Profiling:</strong></p>
      <p>Tools like Sherlock, WhatsMyName, and Namechk can search hundreds of platforms for a username in seconds. This reveals:</p>
      <ul>
        <li>Which platforms you use</li>
        <li>Your interests and hobbies</li>
        <li>Geographic location clues</li>
        <li>Posting patterns and habits</li>
        <li>Social connections</li>
      </ul>

      <p><strong>2. Information Aggregation:</strong></p>
      <p>By finding your username on multiple platforms, attackers can piece together:</p>
      <ul>
        <li>Your real name (if you used it anywhere)</li>
        <li>Email addresses (from profile pages or posts)</li>
        <li>Photos and videos</li>
        <li>Family and friends</li>
        <li>Work and school information</li>
        <li>Personal interests and routines</li>
      </ul>

      <p><strong>3. Password Credential Stuffing:</strong></p>
      <p>If one account with your username is breached, attackers will try those credentials on every other platform where you used the same username.</p>

      <h3>Real-World Attack Scenarios</h3>
      <p><strong>Scenario 1: The Targeted Attack</strong></p>
      <ol>
        <li>Attacker finds your username in a data breach</li>
        <li>Uses OSINT tools to find all your accounts</li>
        <li>Gathers information from public profiles</li>
        <li>Crafts convincing phishing emails using gathered details</li>
        <li>Tricks you into revealing passwords or clicking malicious links</li>
      </ol>

      <p><strong>Scenario 2: The Stalker</strong></p>
      <ol>
        <li>Someone finds your username on one platform</li>
        <li>Searches for it across all social media</li>
        <li>Finds your location from geotagged posts</li>
        <li>Identifies your workplace, gym, favorite restaurants</li>
        <li>Can track your physical movements and routines</li>
      </ol>

      <p><strong>Scenario 3: The Doxxing</strong></p>
      <ol>
        <li>Your username is linked to a controversial opinion</li>
        <li>Someone wants to "expose" you</li>
        <li>They find all your accounts using your username</li>
        <li>Compile personal information from various sources</li>
        <li>Publish your real identity, address, workplace, etc.</li>
      </ol>

      <h3>Username Privacy Best Practices</h3>
      <p><strong>1. Use Unique Usernames:</strong></p>
      <ul>
        <li>Create different usernames for different platforms</li>
        <li>Avoid patterns that link usernames together</li>
        <li>Don't use derivatives of your real name</li>
        <li>Use a password manager to track usernames</li>
      </ul>

      <p><strong>2. Separate Personal and Professional:</strong></p>
      <ul>
        <li>Use completely different usernames for work vs. personal accounts</li>
        <li>Keep professional accounts (LinkedIn) separate from entertainment (gaming, forums)</li>
        <li>Consider pseudonyms for sensitive communities</li>
      </ul>

      <p><strong>3. Audit Existing Accounts:</strong></p>
      <ol>
        <li>Search for your username using OSINT tools</li>
        <li>Identify all accounts using the same username</li>
        <li>Change usernames where possible</li>
        <li>Delete accounts you no longer use</li>
      </ol>

      <p><strong>4. Use Username Generation Strategies:</strong></p>
      <ul>
        <li><strong>Random Generation:</strong> Unrelated random words or characters</li>
        <li><strong>Platform-Specific:</strong> Include platform name in username (twitter_user123, reddit_user123)</li>
        <li><strong>Purpose-Based:</strong> Create usernames based on the purpose (shop_acc, gaming_acc)</li>
      </ul>

      <h3>What If You Can't Change Your Username?</h3>
      <p>Some platforms don't allow username changes. In these cases:</p>
      <ul>
        <li>Make the profile private if possible</li>
        <li>Remove personal information from the profile</li>
        <li>Don't link to other social media accounts</li>
        <li>Consider creating a new account if the platform is important</li>
        <li>Be extra cautious about what you post</li>
      </ul>

      <h3>Checking Your Username Exposure</h3>
      <p>Use FootprintIQ's username scanning to:</p>
      <ul>
        <li>Find all platforms where your username appears</li>
        <li>Identify accounts you may have forgotten about</li>
        <li>Discover what information is linked to that username</li>
        <li>Get recommendations for improving username security</li>
      </ul>

      <h3>Moving Forward</h3>
      <p>Key takeaways for username security:</p>
      <ol>
        <li><strong>Never reuse usernames across platforms</strong></li>
        <li><strong>Audit your current username exposure</strong></li>
        <li><strong>Change usernames where possible</strong></li>
        <li><strong>Delete unused accounts</strong></li>
        <li><strong>Use a password manager to track unique usernames</strong></li>
        <li><strong>Consider the privacy implications before choosing a username</strong></li>
      </ol>

      <p>Your username is often the first step in building a profile about you. Making it harder for people to connect your accounts is a crucial privacy protection.</p>
    `,
  },
  "ip-address-security": {
    title: "IP Address Security: What Your IP Reveals About You",
    date: "January 2, 2025",
    readTime: "9 min read",
    category: "Privacy Basics",
    content: `
      <h2>Understanding IP Addresses</h2>
      <p>Your IP (Internet Protocol) address is a unique identifier assigned to your device when it connects to the internet. While it's necessary for online communication, it also reveals more about you than you might think.</p>

      <h3>What Your IP Address Reveals</h3>
      <p><strong>Geographic Location:</strong></p>
      <ul>
        <li>Country, region, and city (usually accurate to 50-100 miles)</li>
        <li>Zip code or postal code area</li>
        <li>Internet Service Provider (ISP) information</li>
        <li>Sometimes more precise location based on ISP data</li>
      </ul>

      <p><strong>Internet Service Provider:</strong></p>
      <ul>
        <li>Your ISP name (Comcast, AT&T, Verizon, etc.)</li>
        <li>Type of connection (cable, DSL, fiber)</li>
        <li>Organization name (if using corporate/university network)</li>
      </ul>

      <p><strong>Technical Information:</strong></p>
      <ul>
        <li>Whether you're using IPv4 or IPv6</li>
        <li>If you're behind a VPN or proxy</li>
        <li>Your time zone</li>
        <li>Open ports and exposed services</li>
      </ul>

      <h3>Privacy Risks of IP Exposure</h3>
      <p><strong>1. Tracking and Profiling:</strong></p>
      <p>Websites track your IP address to:</p>
      <ul>
        <li>Build profiles of your browsing behavior</li>
        <li>Target advertising based on location</li>
        <li>Enforce geo-restrictions</li>
        <li>Correlate visits across multiple sites</li>
      </ul>

      <p><strong>2. Physical Location Exposure:</strong></p>
      <p>While IP addresses don't reveal your exact home address, they provide enough information for:</p>
      <ul>
        <li>Identifying your neighborhood</li>
        <li>Targeting local attacks or scams</li>
        <li>Physical surveillance in extreme cases</li>
      </ul>

      <p><strong>3. DDoS Attacks:</strong></p>
      <p>If attackers know your IP address, they can:</p>
      <ul>
        <li>Launch Distributed Denial of Service (DDoS) attacks</li>
        <li>Overwhelm your connection with traffic</li>
        <li>Take your internet connection offline</li>
      </ul>

      <p><strong>4. Port Scanning and Exploitation:</strong></p>
      <p>Tools like Shodan index internet-connected devices. Attackers use your IP to:</p>
      <ul>
        <li>Scan for open ports</li>
        <li>Identify vulnerable services</li>
        <li>Attempt unauthorized access</li>
        <li>Find security cameras, routers, IoT devices</li>
      </ul>

      <h3>How Your IP Gets Exposed</h3>
      <ul>
        <li><strong>Every Website You Visit:</strong> Logs your IP in server logs</li>
        <li><strong>Email Headers:</strong> Often contain sender's IP address</li>
        <li><strong>Torrent Files:</strong> P2P connections expose your IP to all peers</li>
        <li><strong>Online Gaming:</strong> Multiplayer games may reveal IPs to other players</li>
        <li><strong>VoIP Services:</strong> Some expose IP during calls</li>
        <li><strong>Forum Posts:</strong> Some forums display or log IP addresses</li>
      </ul>

      <h3>Protection Strategies</h3>
      <p><strong>1. Use a VPN (Virtual Private Network):</strong></p>
      <p>VPNs encrypt your traffic and route it through remote servers, masking your real IP address.</p>
      <p><strong>Recommended VPN Features:</strong></p>
      <ul>
        <li>No-logs policy</li>
        <li>Kill switch (blocks internet if VPN drops)</li>
        <li>DNS leak protection</li>
        <li>Support for multiple devices</li>
      </ul>

      <p><strong>Popular VPN Services:</strong></p>
      <ul>
        <li>NordVPN</li>
        <li>ExpressVPN</li>
        <li>Mullvad</li>
        <li>ProtonVPN</li>
      </ul>

      <p><strong>2. Use Tor Browser:</strong></p>
      <p>Tor routes your traffic through multiple volunteer-run servers, making it extremely difficult to trace.</p>
      <ul>
        <li><strong>Pros:</strong> Maximum anonymity, free</li>
        <li><strong>Cons:</strong> Slow speeds, some sites block Tor</li>
        <li><strong>Best For:</strong> High-privacy needs, whistleblowing, censorship circumvention</li>
      </ul>

      <p><strong>3. Use a Proxy Server:</strong></p>
      <p>Proxies act as intermediaries between you and the internet.</p>
      <ul>
        <li><strong>HTTP/HTTPS Proxies:</strong> For web browsing</li>
        <li><strong>SOCKS Proxies:</strong> For all types of traffic</li>
        <li><strong>Note:</strong> Less secure than VPNs, traffic may not be encrypted</li>
      </ul>

      <p><strong>4. Secure Your Router:</strong></p>
      <ul>
        <li>Change default admin credentials</li>
        <li>Update router firmware regularly</li>
        <li>Disable UPnP (Universal Plug and Play)</li>
        <li>Use WPA3 encryption for WiFi</li>
        <li>Disable remote management</li>
      </ul>

      <p><strong>5. Check for IP Leaks:</strong></p>
      <p>Regularly test for IP leaks using tools like:</p>
      <ul>
        <li>ipleak.net</li>
        <li>dnsleaktest.com</li>
        <li>browserleaks.com</li>
      </ul>

      <h3>Dynamic vs. Static IP Addresses</h3>
      <p><strong>Dynamic IPs (Most Common):</strong></p>
      <ul>
        <li>Change periodically (every few days or weeks)</li>
        <li>Assigned by your ISP from a pool</li>
        <li>Slightly better for privacy (harder to track long-term)</li>
        <li>Can be reset by rebooting your modem</li>
      </ul>

      <p><strong>Static IPs:</strong></p>
      <ul>
        <li>Never change unless you request it</li>
        <li>Usually costs extra from ISP</li>
        <li>Easier to track your activity over time</li>
        <li>Necessary for hosting servers</li>
      </ul>

      <h3>What to Do If Your IP Is Exposed</h3>
      <ol>
        <li><strong>Start Using a VPN Immediately:</strong> This will mask your real IP going forward</li>
        <li><strong>Scan Your IP for Open Ports:</strong> Use Shodan or similar tools to see what's visible</li>
        <li><strong>Close Unnecessary Ports:</strong> Configure your router firewall to block unused ports</li>
        <li><strong>Request New IP from ISP:</strong> Some ISPs will assign a new IP if you ask</li>
        <li><strong>Restart Your Modem:</strong> If you have a dynamic IP, this may give you a new one</li>
      </ol>

      <h3>FootprintIQ IP Scanning</h3>
      <p>FootprintIQ scans your IP address to identify:</p>
      <ul>
        <li>Open ports and exposed services</li>
        <li>Vulnerable software versions</li>
        <li>Publicly accessible devices</li>
        <li>Historical data from Shodan and similar sources</li>
        <li>ISP and geolocation information</li>
      </ul>

      <p>Understanding what your IP reveals is the first step in protecting your online privacy. Combined with VPN usage and proper router security, you can significantly reduce your exposure.</p>
    `,
  },
  "identity-theft-response": {
    title: "How to Respond to Identity Theft: Complete Action Plan",
    date: "December 30, 2024",
    readTime: "15 min read",
    category: "Security",
    content: `
      <h2>Recognizing Identity Theft</h2>
      <p>Identity theft occurs when someone uses your personal information (Social Security number, credit card, bank account, etc.) without permission to commit fraud or other crimes. Early detection is crucial.</p>

      <h3>Warning Signs of Identity Theft</h3>
      <ul>
        <li>Unexplained withdrawals from your bank account</li>
        <li>Missing bills or statements</li>
        <li>Debt collection calls for accounts you didn't open</li>
        <li>Unfamiliar accounts or charges on credit reports</li>
        <li>Denied credit applications despite good credit</li>
        <li>Medical bills for treatments you didn't receive</li>
        <li>Tax return rejection (someone filed using your SSN)</li>
        <li>Notifications from data breaches</li>
      </ul>

      <h3>Immediate Actions (First 24 Hours)</h3>
      <p><strong>1. Place Fraud Alerts:</strong></p>
      <p>Contact one of the three credit bureaus to place a fraud alert. They're required to notify the other two.</p>
      <ul>
        <li><strong>Equifax:</strong> 1-888-766-0008</li>
        <li><strong>Experian:</strong> 1-888-397-3742</li>
        <li><strong>TransUnion:</strong> 1-800-680-7289</li>
      </ul>
      <p>Fraud alerts are free and last one year. They require creditors to verify your identity before opening new accounts.</p>

      <p><strong>2. Place Credit Freezes:</strong></p>
      <p>A credit freeze is stronger than a fraud alert - it completely blocks access to your credit report.</p>
      <ul>
        <li>Contact all three credit bureaus</li>
        <li>Credit freezes are free</li>
        <li>You'll receive a PIN to lift the freeze when needed</li>
        <li>Freezes don't affect your credit score</li>
      </ul>

      <p><strong>3. Report to Federal Trade Commission:</strong></p>
      <ol>
        <li>Go to IdentityTheft.gov</li>
        <li>Create an account and file a report</li>
        <li>Get your Identity Theft Report</li>
        <li>Create a recovery plan</li>
      </ol>
      <p>The FTC report is official documentation you'll need for disputes.</p>

      <p><strong>4. File Police Report:</strong></p>
      <ul>
        <li>Contact local police to file a report</li>
        <li>Bring your FTC Identity Theft Report</li>
        <li>Bring photo ID and proof of address</li>
        <li>Get a copy of the police report</li>
        <li>Some creditors require a police report for fraud disputes</li>
      </ul>

      <h3>Financial Account Recovery</h3>
      <p><strong>Close Compromised Accounts:</strong></p>
      <ol>
        <li><strong>Bank Accounts:</strong> Close and open new accounts with new account numbers</li>
        <li><strong>Credit Cards:</strong> Report as stolen, request new cards with different numbers</li>
        <li><strong>Investment Accounts:</strong> Contact brokerage firms immediately</li>
        <li><strong>PayPal/Venmo:</strong> Change passwords, enable 2FA, review transactions</li>
      </ol>

      <p><strong>Dispute Fraudulent Charges:</strong></p>
      <ul>
        <li>Contact creditors in writing (keep copies)</li>
        <li>Include your FTC Identity Theft Report</li>
        <li>Include police report if available</li>
        <li>Request removal of fraudulent charges</li>
        <li>Follow up if not resolved within 30 days</li>
      </ul>

      <h3>Credit Report Cleanup</h3>
      <p><strong>1. Get Free Credit Reports:</strong></p>
      <p>Visit AnnualCreditReport.com for free reports from all three bureaus.</p>

      <p><strong>2. Review Every Line:</strong></p>
      <ul>
        <li>Check personal information for errors</li>
        <li>Identify unfamiliar accounts</li>
        <li>Look for unauthorized inquiries</li>
        <li>Note accounts with wrong balances</li>
      </ul>

      <p><strong>3. Dispute Fraudulent Items:</strong></p>
      <p>Send dispute letters to credit bureaus including:</p>
      <ul>
        <li>Your identity theft report</li>
        <li>Police report (if filed)</li>
        <li>Explanation of which items are fraudulent</li>
        <li>Supporting documentation</li>
      </ul>

      <p>Credit bureaus have 30 days to investigate.</p>

      <h3>Government ID Recovery</h3>
      <p><strong>If SSN Is Compromised:</strong></p>
      <ul>
        <li>Report to Social Security Administration: 1-800-772-1213</li>
        <li>Request new Social Security card (number stays the same unless extreme circumstances)</li>
        <li>Monitor IRS notices for tax fraud</li>
        <li>Get an Identity Protection PIN from IRS</li>
      </ul>

      <p><strong>If Driver's License Is Stolen:</strong></p>
      <ul>
        <li>Report to DMV immediately</li>
        <li>Request replacement license</li>
        <li>Some states flag stolen licenses in databases</li>
      </ul>

      <p><strong>If Passport Is Compromised:</strong></p>
      <ul>
        <li>Report to State Department</li>
        <li>Call 1-877-487-2778 (24/7 hotline)</li>
        <li>Submit Form DS-64 (Statement Regarding Lost or Stolen Passport)</li>
      </ul>

      <h3>Tax Identity Theft</h3>
      <p><strong>Signs of Tax Identity Theft:</strong></p>
      <ul>
        <li>IRS notice that multiple returns were filed</li>
        <li>Tax refund is less than expected</li>
        <li>IRS records show income from employer you don't work for</li>
      </ul>

      <p><strong>How to Respond:</strong></p>
      <ol>
        <li>File Form 14039 (Identity Theft Affidavit) with IRS</li>
        <li>Continue to file taxes as usual (paper return may be required)</li>
        <li>Request an Identity Protection PIN for future filings</li>
        <li>Respond to all IRS notices promptly</li>
      </ol>

      <h3>Medical Identity Theft</h3>
      <p><strong>Warning Signs:</strong></p>
      <ul>
        <li>Bills for medical services you didn't receive</li>
        <li>Debt collectors calling about medical debt</li>
        <li>Insurance denying coverage due to exceeded limits</li>
        <li>Wrong information in medical records</li>
      </ul>

      <p><strong>Steps to Take:</strong></p>
      <ol>
        <li>Request medical records from all providers</li>
        <li>Review for inaccuracies</li>
        <li>Contact providers' billing departments</li>
        <li>File complaint with Federal Trade Commission</li>
        <li>Request correction of medical records</li>
      </ol>

      <h3>Long-Term Protection</h3>
      <p><strong>1. Monitor Regularly:</strong></p>
      <ul>
        <li>Check credit reports every 3-4 months</li>
        <li>Review bank/credit card statements monthly</li>
        <li>Set up account alerts for suspicious activity</li>
        <li>Use credit monitoring services</li>
      </ul>

      <p><strong>2. Secure Your Accounts:</strong></p>
      <ul>
        <li>Change all passwords using password manager</li>
        <li>Enable two-factor authentication everywhere</li>
        <li>Use strong, unique passwords for each account</li>
        <li>Never reuse passwords</li>
      </ul>

      <p><strong>3. Reduce Future Exposure:</strong></p>
      <ul>
        <li>Remove personal info from data broker sites</li>
        <li>Opt out of pre-approved credit offers (OptOutPrescreen.com)</li>
        <li>Shred documents with personal information</li>
        <li>Use locked mailbox or PO Box</li>
        <li>Don't carry Social Security card</li>
      </ul>

      <p><strong>4. Consider Identity Theft Protection:</strong></p>
      <p>Services like LifeLock, Identity Guard, or IdentityForce provide:</p>
      <ul>
        <li>Credit monitoring from all three bureaus</li>
        <li>Dark web monitoring</li>
        <li>Social Security number monitoring</li>
        <li>Up to $1M identity theft insurance</li>
        <li>Full-service restoration if theft occurs</li>
      </ul>

      <h3>Prevention Tips</h3>
      <ul>
        <li>Never give SSN unless absolutely necessary</li>
        <li>Don't carry unnecessary ID or cards</li>
        <li>Secure physical documents in locked safe</li>
        <li>Use encrypted password manager</li>
        <li>Enable 2FA on all financial accounts</li>
        <li>Be wary of phishing emails and calls</li>
        <li>Use secure WiFi only (avoid public WiFi for financial transactions)</li>
        <li>Keep software and devices updated</li>
        <li>Run regular scans with FootprintIQ</li>
      </ul>

      <h3>Resources</h3>
      <ul>
        <li><strong>IdentityTheft.gov:</strong> Report identity theft and create recovery plan</li>
        <li><strong>AnnualCreditReport.com:</strong> Free credit reports</li>
        <li><strong>SSA.gov:</strong> Social Security Administration</li>
        <li><strong>IRS.gov/identitytheft:</strong> Tax identity theft resources</li>
        <li><strong>USA.gov/identity-theft:</strong> Government identity theft guide</li>
      </ul>

      <p>Identity theft recovery can take months or years. Stay persistent, keep detailed records of all communications, and don't hesitate to seek legal help if needed. The sooner you act, the less damage will occur.</p>
    `,
  },
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPosts[slug as keyof typeof blogPosts] : null;
  const heroImage = slug ? getBlogHeroImage(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": new Date(post.date).toISOString(),
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ",
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://footprintiq.com/logo.png",
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://footprintiq.com/blog/${slug}`,
    },
  };

  return (
    <>
      <SEO
        title={`${post.title} | FootprintIQ Blog`}
        description={post.content.substring(0, 160).replace(/<[^>]*>/g, '')}
        canonical={`https://footprintiq.com/blog/${slug}`}
        ogType="article"
        article={{
          publishedTime: new Date(post.date).toISOString(),
          author: "FootprintIQ",
          tags: [post.category, "digital privacy", "OSINT"],
        }}
        structuredData={structuredData}
      />

      <Header />

      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <article className="max-w-4xl mx-auto px-6 py-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {post.title}
          </h1>

          <div className="h-1 w-24 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8"></div>

          {/* Hero Image */}
          {heroImage && (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border-2 border-border/50">
              <img 
                src={heroImage} 
                alt={post.title}
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* 
            SECURITY NOTE: Blog content is static and hardcoded by developers only.
            This content is NOT user-generated or CMS-managed. All blog posts are
            defined in the blogPosts object above and can only be modified by developers
            with repository access. If this changes (e.g., adding a CMS), implement
            DOMPurify sanitization or migrate to react-markdown.
          */}
          <div
            className="prose prose-lg max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
              prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-primary
              prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-p:my-4
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-muted-foreground prose-li:my-2 prose-li:leading-relaxed
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline
              prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:border prose-pre:border-border"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />

          <div className="mt-16 p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border-2 border-primary/20">
            <h3 className="text-2xl font-bold mb-3">Ready to Check Your Digital Footprint?</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Run a free OSINT scan to see what information is publicly available about you online.
            </p>
            <Button asChild size="lg" className="font-semibold">
              <Link to="/scan">Start Free Scan Now</Link>
            </Button>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default BlogPost;
