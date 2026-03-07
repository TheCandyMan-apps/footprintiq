import { Link } from "react-router-dom";
import { SearchPlatformUsernameTemplate, type SearchPlatformUsernameConfig } from "@/components/templates/SearchPlatformUsernameTemplate";

const config: SearchPlatformUsernameConfig = {
  platform: "Chess.com",
  slug: "search-chess-username",
  profilePattern: "chess.com/member/username",
  metaDesc: "Search Chess.com usernames to find player profiles and discover linked accounts across 500+ platforms. Free Chess.com username lookup with cross-platform OSINT intelligence.",
  howItWorks: (
    <>
      <p>Chess.com profiles are publicly accessible at <code>chess.com/member/username</code>. OSINT tools query this URL to confirm whether a player profile exists and contains public game data.</p>
      <p>A confirmed Chess.com profile reveals the display name, country, profile photo, rating (blitz, bullet, rapid, daily), game history, win/loss/draw statistics, club memberships, and account creation date. Chess.com is the world's largest chess platform with over 100 million members. Many users also maintain profiles on Lichess with matching usernames.</p>
      <p>FootprintIQ extends this by checking the same handle across 500+ platforms, revealing connections to Lichess, Reddit, Discord, and other communities.</p>
    </>
  ),
  findingProfiles: (
    <>
      <p>Approaches for locating Chess.com profiles:</p>
      <ul>
        <li><strong>Direct URL check.</strong> Navigate to <code>chess.com/member/username</code>. FootprintIQ automates this.</li>
        <li><strong>Cross-platform pivot.</strong> Chess players often use matching handles on Chess.com, Lichess, and Reddit's r/chess community.</li>
        <li><strong>Club and tournament search.</strong> Chess.com club directories and tournament archives reveal participating players.</li>
        <li><strong>API access.</strong> Chess.com's public API provides detailed player statistics and game archives.</li>
      </ul>
      <p>For comprehensive methodology, see our <Link to="/find-someone-by-username" className="text-primary hover:underline">guide to finding someone by username</Link>.</p>
    </>
  ),
  osintInvestigation: (
    <>
      <p>Chess.com profiles provide OSINT value:</p>
      <ul>
        <li><strong>Geographic intelligence.</strong> Country flags and location fields reveal geographic information.</li>
        <li><strong>Activity patterns.</strong> Game timestamps reveal timezone, daily schedule, and availability patterns.</li>
        <li><strong>Club memberships.</strong> Chess club affiliations may reveal institutional, corporate, or geographic connections.</li>
        <li><strong>Cross-platform correlation.</strong> Matching handles on Chess.com and Lichess are extremely common.</li>
      </ul>
      <p>Explore our full <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques</Link> guide.</p>
    </>
  ),
  privacyExposure: (
    <>
      <p>Chess.com username exposure creates privacy risks:</p>
      <ul>
        <li><strong>Activity scheduling.</strong> Game timestamps reveal daily patterns and timezone with high precision.</li>
        <li><strong>Country disclosure.</strong> Country flags are displayed on all profiles.</li>
        <li><strong>Cross-platform linking.</strong> Matching handles on Chess.com and other platforms connect gaming identity to broader presence.</li>
        <li><strong>Game history permanence.</strong> Complete game archives are permanently public and searchable.</li>
      </ul>
      <p>To reduce exposure: use a unique handle, review country and location settings, and be aware that game history is permanent.</p>
    </>
  ),
  faqs: [
    { q: "Can you search Chess.com by username?", a: "Yes. Chess.com profiles are accessible at chess.com/member/username. FootprintIQ checks this alongside 500+ platforms." },
    { q: "Is Chess.com username search free?", a: "Yes. FootprintIQ's free tier includes Chess.com along with 500+ other platforms." },
    { q: "What does a Chess.com profile reveal?", a: "A public Chess.com profile shows username, country, ratings, game history, win/loss stats, club memberships, and account creation date." },
    { q: "Can Chess.com game times reveal my timezone?", a: "Yes. Patterns in game timestamps can reveal your timezone and daily schedule with high accuracy." },
  ],
};

export default function SearchChessUsername() {
  return <SearchPlatformUsernameTemplate config={config} />;
}
