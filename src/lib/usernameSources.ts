/**
 * Username Intelligence Sources
 * 500+ platforms for username OSINT scanning
 * Based on WebBreacher/WhatsMyName + custom expansions
 */

import { extendedUsernameSources } from './usernameSources-extended';

export type Category =
  | 'social' | 'forums' | 'gaming' | 'news' | 'crypto'
  | 'shopping' | 'dating' | 'adult' | 'other' | 'dev' 
  | 'nsfw' | 'business' | 'creative' | 'misc';

export interface UsernameSource {
  name: string;
  url: string;
  category: Category;
  favicon?: string;
  checkPattern?: string;
  icon?: string;
  avatar?: string;
}

export interface UsernameCheckResult {
  source: UsernameSource;
  status: 'found' | 'suspicious' | 'not_found';
  url: string;
  avatar?: string;
  bio?: string;
}

export const usernameSources: UsernameSource[] = [
  // ===== MAJOR SOCIAL MEDIA (30) =====
  { name: "Instagram", url: "https://www.instagram.com/{username}", category: "social", favicon: "https://www.instagram.com/favicon.ico" },
  { name: "Facebook", url: "https://www.facebook.com/{username}", category: "social", favicon: "https://www.facebook.com/favicon.ico" },
  { name: "Twitter/X", url: "https://x.com/{username}", category: "social", favicon: "https://x.com/favicon.ico" },
  { name: "TikTok", url: "https://www.tiktok.com/@{username}", category: "social", favicon: "https://www.tiktok.com/favicon.ico" },
  { name: "LinkedIn", url: "https://www.linkedin.com/in/{username}", category: "social", favicon: "https://www.linkedin.com/favicon.ico" },
  { name: "Snapchat", url: "https://www.snapchat.com/add/{username}", category: "social", favicon: "https://www.snapchat.com/favicon.ico" },
  { name: "Pinterest", url: "https://www.pinterest.com/{username}", category: "social", favicon: "https://www.pinterest.com/favicon.ico" },
  { name: "Tumblr", url: "https://{username}.tumblr.com", category: "social", favicon: "https://www.tumblr.com/favicon.ico" },
  { name: "Telegram", url: "https://t.me/{username}", category: "social", favicon: "https://telegram.org/favicon.ico" },
  { name: "WhatsApp", url: "https://wa.me/{username}", category: "social", favicon: "https://www.whatsapp.com/favicon.ico" },
  { name: "VK", url: "https://vk.com/{username}", category: "social", favicon: "https://vk.com/favicon.ico" },
  { name: "Weibo", url: "https://weibo.com/{username}", category: "social", favicon: "https://weibo.com/favicon.ico" },
  { name: "Mastodon.social", url: "https://mastodon.social/@{username}", category: "social", favicon: "https://mastodon.social/favicon.ico" },
  { name: "Threads", url: "https://www.threads.net/@{username}", category: "social", favicon: "https://www.threads.net/favicon.ico" },
  { name: "Bluesky", url: "https://bsky.app/profile/{username}", category: "social", favicon: "https://bsky.app/favicon.ico" },
  { name: "Signal", url: "https://signal.me/#p/{username}", category: "social", favicon: "https://signal.org/favicon.ico" },
  { name: "Viber", url: "https://www.viber.com/{username}", category: "social", favicon: "https://www.viber.com/favicon.ico" },
  { name: "Line", url: "https://line.me/ti/p/{username}", category: "social", favicon: "https://line.me/favicon.ico" },
  { name: "WeChat", url: "https://weixin.qq.com/r/{username}", category: "social", favicon: "https://weixin.qq.com/favicon.ico" },
  { name: "Kik", url: "https://kik.me/{username}", category: "social", favicon: "https://kik.com/favicon.ico" },
  { name: "We Heart It", url: "https://weheartit.com/{username}", category: "social", favicon: "https://weheartit.com/favicon.ico" },
  { name: "Flickr", url: "https://www.flickr.com/people/{username}", category: "social", favicon: "https://www.flickr.com/favicon.ico" },
  { name: "500px", url: "https://500px.com/p/{username}", category: "social", favicon: "https://500px.com/favicon.ico" },
  { name: "Imgur", url: "https://imgur.com/user/{username}", category: "social", favicon: "https://imgur.com/favicon.ico" },
  { name: "Giphy", url: "https://giphy.com/{username}", category: "social", favicon: "https://giphy.com/favicon.ico" },
  { name: "9GAG", url: "https://9gag.com/u/{username}", category: "social", favicon: "https://9gag.com/favicon.ico" },
  { name: "Meetup", url: "https://www.meetup.com/members/{username}", category: "social", favicon: "https://www.meetup.com/favicon.ico" },
  { name: "Ask.fm", url: "https://ask.fm/{username}", category: "social", favicon: "https://ask.fm/favicon.ico" },
  { name: "Yubo", url: "https://yubo.live/profile/{username}", category: "social", favicon: "https://yubo.live/favicon.ico" },
  { name: "MeWe", url: "https://mewe.com/{username}", category: "social", favicon: "https://mewe.com/favicon.ico" },
  
  // ===== FORUMS & COMMUNITIES (40) =====
  { name: "Reddit", url: "https://www.reddit.com/user/{username}", category: "forums", favicon: "https://www.reddit.com/favicon.ico" },
  { name: "Discord", url: "https://discord.com/users/{username}", category: "forums", favicon: "https://discord.com/favicon.ico" },
  { name: "Quora", url: "https://www.quora.com/profile/{username}", category: "forums", favicon: "https://www.quora.com/favicon.ico" },
  { name: "StackOverflow", url: "https://stackoverflow.com/users/{username}", category: "forums", favicon: "https://stackoverflow.com/favicon.ico" },
  { name: "HackerNews", url: "https://news.ycombinator.com/user?id={username}", category: "forums", favicon: "https://news.ycombinator.com/favicon.ico" },
  { name: "ProductHunt", url: "https://www.producthunt.com/@{username}", category: "forums", favicon: "https://www.producthunt.com/favicon.ico" },
  { name: "Medium", url: "https://medium.com/@{username}", category: "forums", favicon: "https://medium.com/favicon.ico" },
  { name: "Substack", url: "https://{username}.substack.com", category: "forums", favicon: "https://substack.com/favicon.ico" },
  { name: "4chan", url: "https://boards.4chan.org/search#/username/{username}", category: "forums" },
  { name: "8kun", url: "https://8kun.top/{username}", category: "forums" },
  { name: "Slashdot", url: "https://slashdot.org/~{username}", category: "forums" },
  { name: "Disqus", url: "https://disqus.com/by/{username}", category: "forums", favicon: "https://disqus.com/favicon.ico" },
  { name: "MyAnimeList", url: "https://myanimelist.net/profile/{username}", category: "forums", favicon: "https://myanimelist.net/favicon.ico" },
  { name: "Letterboxd", url: "https://letterboxd.com/{username}", category: "forums", favicon: "https://letterboxd.com/favicon.ico" },
  { name: "Goodreads", url: "https://www.goodreads.com/{username}", category: "forums", favicon: "https://www.goodreads.com/favicon.ico" },
  { name: "BookBub", url: "https://www.bookbub.com/profile/{username}", category: "forums", favicon: "https://www.bookbub.com/favicon.ico" },
  { name: "Ravelry", url: "https://www.ravelry.com/people/{username}", category: "forums", favicon: "https://www.ravelry.com/favicon.ico" },
  { name: "AllRecipes", url: "https://www.allrecipes.com/cook/{username}", category: "forums", favicon: "https://www.allrecipes.com/favicon.ico" },
  { name: "Instructables", url: "https://www.instructables.com/member/{username}", category: "forums", favicon: "https://www.instructables.com/favicon.ico" },
  { name: "Threadless", url: "https://www.threadless.com/@{username}", category: "forums", favicon: "https://www.threadless.com/favicon.ico" },
  { name: "Fiverr Forums", url: "https://forum.fiverr.com/u/{username}", category: "forums", favicon: "https://www.fiverr.com/favicon.ico" },
  { name: "Warrior Forum", url: "https://www.warriorforum.com/members/{username}.html", category: "forums" },
  { name: "BlackHatWorld", url: "https://www.blackhatworld.com/members/{username}", category: "forums" },
  { name: "HackForums", url: "https://hackforums.net/member.php?username={username}", category: "forums" },
  { name: "Craigslist", url: "https://{username}.craigslist.org", category: "forums" },
  { name: "Nextdoor", url: "https://nextdoor.com/profile/{username}", category: "forums", favicon: "https://nextdoor.com/favicon.ico" },
  { name: "Airbnb Community", url: "https://community.withairbnb.com/t5/user/viewprofilepage/user-id/{username}", category: "forums", favicon: "https://www.airbnb.com/favicon.ico" },
  { name: "TripAdvisor", url: "https://www.tripadvisor.com/members/{username}", category: "forums", favicon: "https://www.tripadvisor.com/favicon.ico" },
  { name: "Yelp", url: "https://www.yelp.com/user_details?userid={username}", category: "forums", favicon: "https://www.yelp.com/favicon.ico" },
  { name: "Foursquare", url: "https://foursquare.com/user/{username}", category: "forums", favicon: "https://foursquare.com/favicon.ico" },
  { name: "Untappd", url: "https://untappd.com/user/{username}", category: "forums", favicon: "https://untappd.com/favicon.ico" },
  { name: "Vivino", url: "https://www.vivino.com/users/{username}", category: "forums", favicon: "https://www.vivino.com/favicon.ico" },
  { name: "Houzz", url: "https://www.houzz.com/user/{username}", category: "forums", favicon: "https://www.houzz.com/favicon.ico" },
  { name: "Zillow", url: "https://www.zillow.com/profile/{username}", category: "forums", favicon: "https://www.zillow.com/favicon.ico" },
  { name: "Realtor.com", url: "https://www.realtor.com/realestateagents/{username}", category: "forums", favicon: "https://www.realtor.com/favicon.ico" },
  { name: "Angi", url: "https://www.angi.com/companylist/us/{username}", category: "forums", favicon: "https://www.angi.com/favicon.ico" },
  { name: "Thumbtack", url: "https://www.thumbtack.com/profile/{username}", category: "forums", favicon: "https://www.thumbtack.com/favicon.ico" },
  { name: "TaskRabbit", url: "https://www.taskrabbit.com/profile/{username}", category: "forums", favicon: "https://www.taskrabbit.com/favicon.ico" },
  { name: "Upwork Community", url: "https://community.upwork.com/t5/user/viewprofilepage/user-id/{username}", category: "forums", favicon: "https://www.upwork.com/favicon.ico" },
  { name: "Freelancer Forum", url: "https://www.freelancer.com/u/{username}", category: "forums", favicon: "https://www.freelancer.com/favicon.ico" },
  
  // ===== DEVELOPER PLATFORMS (35) =====
  { name: "GitHub", url: "https://github.com/{username}", category: "dev", favicon: "https://github.com/favicon.ico" },
  { name: "GitLab", url: "https://gitlab.com/{username}", category: "dev", favicon: "https://gitlab.com/favicon.ico" },
  { name: "Bitbucket", url: "https://bitbucket.org/{username}", category: "dev", favicon: "https://bitbucket.org/favicon.ico" },
  { name: "CodePen", url: "https://codepen.io/{username}", category: "dev", favicon: "https://codepen.io/favicon.ico" },
  { name: "Replit", url: "https://replit.com/@{username}", category: "dev", favicon: "https://replit.com/favicon.ico" },
  { name: "HackerOne", url: "https://hackerone.com/{username}", category: "dev", favicon: "https://hackerone.com/favicon.ico" },
  { name: "Bugcrowd", url: "https://bugcrowd.com/{username}", category: "dev", favicon: "https://bugcrowd.com/favicon.ico" },
  { name: "Pastebin", url: "https://pastebin.com/u/{username}", category: "dev", favicon: "https://pastebin.com/favicon.ico" },
  { name: "Keybase", url: "https://keybase.io/{username}", category: "dev", favicon: "https://keybase.io/favicon.ico" },
  { name: "NPM", url: "https://www.npmjs.com/~{username}", category: "dev", favicon: "https://www.npmjs.com/favicon.ico" },
  { name: "PyPI", url: "https://pypi.org/user/{username}", category: "dev", favicon: "https://pypi.org/favicon.ico" },
  { name: "RubyGems", url: "https://rubygems.org/profiles/{username}", category: "dev", favicon: "https://rubygems.org/favicon.ico" },
  { name: "Packagist", url: "https://packagist.org/users/{username}", category: "dev", favicon: "https://packagist.org/favicon.ico" },
  { name: "NuGet", url: "https://www.nuget.org/profiles/{username}", category: "dev", favicon: "https://www.nuget.org/favicon.ico" },
  { name: "Docker Hub", url: "https://hub.docker.com/u/{username}", category: "dev", favicon: "https://hub.docker.com/favicon.ico" },
  { name: "SourceForge", url: "https://sourceforge.net/u/{username}", category: "dev", favicon: "https://sourceforge.net/favicon.ico" },
  { name: "Launchpad", url: "https://launchpad.net/~{username}", category: "dev" },
  { name: "CodinGame", url: "https://www.codingame.com/profile/{username}", category: "dev", favicon: "https://www.codingame.com/favicon.ico" },
  { name: "LeetCode", url: "https://leetcode.com/{username}", category: "dev", favicon: "https://leetcode.com/favicon.ico" },
  { name: "HackerRank", url: "https://www.hackerrank.com/profile/{username}", category: "dev", favicon: "https://www.hackerrank.com/favicon.ico" },
  { name: "Codeforces", url: "https://codeforces.com/profile/{username}", category: "dev", favicon: "https://codeforces.com/favicon.ico" },
  { name: "TopCoder", url: "https://www.topcoder.com/members/{username}", category: "dev", favicon: "https://www.topcoder.com/favicon.ico" },
  { name: "Kaggle", url: "https://www.kaggle.com/{username}", category: "dev", favicon: "https://www.kaggle.com/favicon.ico" },
  { name: "Observable", url: "https://observablehq.com/@{username}", category: "dev", favicon: "https://observablehq.com/favicon.ico" },
  { name: "Glitch", url: "https://glitch.com/@{username}", category: "dev", favicon: "https://glitch.com/favicon.ico" },
  { name: "JSFiddle", url: "https://jsfiddle.net/user/{username}", category: "dev", favicon: "https://jsfiddle.net/favicon.ico" },
  { name: "CodeSandbox", url: "https://codesandbox.io/u/{username}", category: "dev", favicon: "https://codesandbox.io/favicon.ico" },
  { name: "StackBlitz", url: "https://stackblitz.com/@{username}", category: "dev", favicon: "https://stackblitz.com/favicon.ico" },
  { name: "Dev.to", url: "https://dev.to/{username}", category: "dev", favicon: "https://dev.to/favicon.ico" },
  { name: "Hashnode", url: "https://hashnode.com/@{username}", category: "dev", favicon: "https://hashnode.com/favicon.ico" },
  { name: "Indie Hackers", url: "https://www.indiehackers.com/user/{username}", category: "dev", favicon: "https://www.indiehackers.com/favicon.ico" },
  { name: "AngelList", url: "https://angel.co/u/{username}", category: "dev", favicon: "https://angel.co/favicon.ico" },
  { name: "Crunchbase", url: "https://www.crunchbase.com/person/{username}", category: "business", favicon: "https://www.crunchbase.com/favicon.ico" },
  { name: "WellfoundHQ", url: "https://wellfound.com/u/{username}", category: "dev", favicon: "https://wellfound.com/favicon.ico" },
  { name: "F6S", url: "https://www.f6s.com/profile/{username}", category: "dev", favicon: "https://www.f6s.com/favicon.ico" },
  
  // ===== GAMING & STREAMING (50) =====
  { name: "Steam", url: "https://steamcommunity.com/id/{username}", category: "gaming", favicon: "https://steamcommunity.com/favicon.ico" },
  { name: "Twitch", url: "https://www.twitch.tv/{username}", category: "gaming", favicon: "https://www.twitch.tv/favicon.ico" },
  { name: "Xbox Gamertag", url: "https://xboxgamertag.com/search/{username}", category: "gaming", favicon: "https://www.xbox.com/favicon.ico" },
  { name: "PlayStation Network", url: "https://psnprofiles.com/{username}", category: "gaming", favicon: "https://psnprofiles.com/favicon.ico" },
  { name: "Roblox", url: "https://www.roblox.com/users/profile?username={username}", category: "gaming", favicon: "https://www.roblox.com/favicon.ico" },
  { name: "Minecraft (NameMC)", url: "https://namemc.com/profile/{username}", category: "gaming", favicon: "https://namemc.com/favicon.ico" },
  { name: "Chess.com", url: "https://www.chess.com/member/{username}", category: "gaming", favicon: "https://www.chess.com/favicon.ico" },
  { name: "Lichess", url: "https://lichess.org/@/{username}", category: "gaming", favicon: "https://lichess.org/favicon.ico" },
  { name: "Epic Games", url: "https://www.epicgames.com/id/{username}", category: "gaming", favicon: "https://www.epicgames.com/favicon.ico" },
  { name: "Battle.net", url: "https://www.battle.net/player/{username}", category: "gaming", favicon: "https://www.battle.net/favicon.ico" },
  { name: "Origin", url: "https://www.origin.com/profile/{username}", category: "gaming", favicon: "https://www.origin.com/favicon.ico" },
  { name: "Uplay", url: "https://uplay.com/{username}", category: "gaming", favicon: "https://uplay.com/favicon.ico" },
  { name: "GOG", url: "https://www.gog.com/u/{username}", category: "gaming", favicon: "https://www.gog.com/favicon.ico" },
  { name: "itch.io", url: "https://{username}.itch.io", category: "gaming", favicon: "https://itch.io/favicon.ico" },
  { name: "Kongregate", url: "https://www.kongregate.com/accounts/{username}", category: "gaming", favicon: "https://www.kongregate.com/favicon.ico" },
  { name: "Armor Games", url: "https://armorgames.com/user/{username}", category: "gaming", favicon: "https://armorgames.com/favicon.ico" },
  { name: "Newgrounds", url: "https://{username}.newgrounds.com", category: "gaming", favicon: "https://www.newgrounds.com/favicon.ico" },
  { name: "Addicting Games", url: "https://www.addictinggames.com/user/{username}", category: "gaming" },
  { name: "Miniclip", url: "https://www.miniclip.com/users/{username}", category: "gaming", favicon: "https://www.miniclip.com/favicon.ico" },
  { name: "Pogo", url: "https://www.pogo.com/profile/{username}", category: "gaming", favicon: "https://www.pogo.com/favicon.ico" },
  { name: "Xbox", url: "https://account.xbox.com/en-us/profile?gamertag={username}", category: "gaming", favicon: "https://www.xbox.com/favicon.ico" },
  { name: "Nintendo", url: "https://accounts.nintendo.com/users/{username}", category: "gaming", favicon: "https://www.nintendo.com/favicon.ico" },
  { name: "Fortnite Tracker", url: "https://fortnitetracker.com/profile/all/{username}", category: "gaming" },
  { name: "Apex Legends Tracker", url: "https://apexlegends.tracker.network/profile/pc/{username}", category: "gaming" },
  { name: "COD Tracker", url: "https://cod.tracker.gg/warzone/profile/atvi/{username}/overview", category: "gaming" },
  { name: "Valorant Tracker", url: "https://tracker.gg/valorant/profile/riot/{username}", category: "gaming" },
  { name: "PUBG Tracker", url: "https://pubg.op.gg/user/{username}", category: "gaming" },
  { name: "League of Legends", url: "https://www.op.gg/summoners/na/{username}", category: "gaming", favicon: "https://www.leagueoflegends.com/favicon.ico" },
  { name: "Dota 2", url: "https://www.dotabuff.com/players/{username}", category: "gaming", favicon: "https://www.dota2.com/favicon.ico" },
  { name: "CS:GO", url: "https://steamcommunity.com/id/{username}", category: "gaming", favicon: "https://store.steampowered.com/favicon.ico" },
  { name: "Overwatch", url: "https://playoverwatch.com/en-us/career/{username}", category: "gaming" },
  { name: "Hearthstone", url: "https://hearthstone.blizzard.com/en-us/community/leaderboards/{username}", category: "gaming" },
  { name: "World of Warcraft", url: "https://worldofwarcraft.com/en-us/character/us/{username}", category: "gaming" },
  { name: "Final Fantasy XIV", url: "https://na.finalfantasyxiv.com/lodestone/character/{username}", category: "gaming" },
  { name: "Guild Wars 2", url: "https://account.arena.net/users/{username}", category: "gaming" },
  { name: "Elder Scrolls Online", url: "https://www.elderscrollsonline.com/en-us/player/{username}", category: "gaming" },
  { name: "Runescape", url: "https://secure.runescape.com/m=hiscore/compare?user1={username}", category: "gaming", favicon: "https://www.runescape.com/favicon.ico" },
  { name: "Old School RuneScape", url: "https://secure.runescape.com/m=hiscore_oldschool/overall?user1={username}", category: "gaming" },
  { name: "Minecraft Forums", url: "https://www.minecraftforum.net/members/{username}", category: "gaming" },
  { name: "Hypixel Forums", url: "https://hypixel.net/threads/user.{username}", category: "gaming" },
  { name: "Smogon", url: "https://www.smogon.com/forums/members/{username}", category: "gaming" },
  { name: "Pokémon Showdown", url: "https://pokemonshowdown.com/users/{username}", category: "gaming" },
  { name: "BoardGameGeek", url: "https://boardgamegeek.com/user/{username}", category: "gaming", favicon: "https://boardgamegeek.com/favicon.ico" },
  { name: "Tabletop Simulator Workshop", url: "https://steamcommunity.com/id/{username}/myworkshopfiles", category: "gaming" },
  { name: "Roll20", url: "https://app.roll20.net/users/{username}", category: "gaming", favicon: "https://roll20.net/favicon.ico" },
  { name: "D&D Beyond", url: "https://www.dndbeyond.com/profile/{username}", category: "gaming", favicon: "https://www.dndbeyond.com/favicon.ico" },
  { name: "Fantasy Grounds", url: "https://www.fantasygrounds.com/forums/member.php?u={username}", category: "gaming" },
  { name: "Kick", url: "https://kick.com/{username}", category: "gaming", favicon: "https://kick.com/favicon.ico" },
  { name: "Rumble", url: "https://rumble.com/user/{username}", category: "gaming", favicon: "https://rumble.com/favicon.ico" },
  { name: "Caffeine", url: "https://www.caffeine.tv/{username}", category: "gaming" },
  
  // ===== CREATIVE & DESIGN (35) =====
  { name: "Dribbble", url: "https://dribbble.com/{username}", category: "creative", favicon: "https://dribbble.com/favicon.ico" },
  { name: "Behance", url: "https://www.behance.net/{username}", category: "creative", favicon: "https://www.behance.net/favicon.ico" },
  { name: "DeviantArt", url: "https://www.deviantart.com/{username}", category: "creative", favicon: "https://www.deviantart.com/favicon.ico" },
  { name: "ArtStation", url: "https://www.artstation.com/{username}", category: "creative", favicon: "https://www.artstation.com/favicon.ico" },
  { name: "Pixiv", url: "https://www.pixiv.net/en/users/{username}", category: "creative", favicon: "https://www.pixiv.net/favicon.ico" },
  { name: "CGSociety", url: "https://cgsociety.org/profile/{username}", category: "creative", favicon: "https://cgsociety.org/favicon.ico" },
  { name: "Sketchfab", url: "https://sketchfab.com/{username}", category: "creative", favicon: "https://sketchfab.com/favicon.ico" },
  { name: "Adobe Portfolio", url: "https://{username}.myportfolio.com", category: "creative", favicon: "https://www.adobe.com/favicon.ico" },
  { name: "Cargo Collective", url: "https://cargocollective.com/{username}", category: "creative" },
  { name: "Carbonmade", url: "https://{username}.carbonmade.com", category: "creative" },
  { name: "Portfoliobox", url: "https://{username}.portfoliobox.net", category: "creative" },
  { name: "Format", url: "https://{username}.format.com", category: "creative" },
  { name: "Squarespace", url: "https://{username}.squarespace.com", category: "creative" },
  { name: "Wix", url: "https://{username}.wixsite.com/mysite", category: "creative" },
  { name: "Carrd", url: "https://{username}.carrd.co", category: "creative" },
  { name: "Dunked", url: "https://{username}.dunked.com", category: "creative" },
  { name: "Crevado", url: "https://{username}.crevado.com", category: "creative" },
  { name: "Coroflot", url: "https://www.coroflot.com/{username}", category: "creative", favicon: "https://www.coroflot.com/favicon.ico" },
  { name: "Krop", url: "https://www.krop.com/creative-portfolio/{username}", category: "creative" },
  { name: "Domestika", url: "https://www.domestika.org/en/{username}", category: "creative", favicon: "https://www.domestika.org/favicon.ico" },
  { name: "CreativePool", url: "https://creativepool.com/{username}", category: "creative" },
  { name: "The Dots", url: "https://the-dots.com/users/{username}", category: "creative" },
  { name: "Polywork", url: "https://www.polywork.com/{username}", category: "creative", favicon: "https://www.polywork.com/favicon.ico" },
  { name: "Contra", url: "https://contra.com/{username}", category: "creative", favicon: "https://contra.com/favicon.ico" },
  { name: "Bēhance (Adobe)", url: "https://www.behance.net/{username}", category: "creative" },
  { name: "Unsplash", url: "https://unsplash.com/@{username}", category: "creative", favicon: "https://unsplash.com/favicon.ico" },
  { name: "Pexels", url: "https://www.pexels.com/@{username}", category: "creative", favicon: "https://www.pexels.com/favicon.ico" },
  { name: "Shutterstock", url: "https://www.shutterstock.com/g/{username}", category: "creative", favicon: "https://www.shutterstock.com/favicon.ico" },
  { name: "iStock", url: "https://www.istockphoto.com/portfolio/{username}", category: "creative", favicon: "https://www.istockphoto.com/favicon.ico" },
  { name: "Adobe Stock", url: "https://stock.adobe.com/contributor/{username}", category: "creative" },
  { name: "Getty Images", url: "https://www.gettyimages.com/photos/{username}", category: "creative", favicon: "https://www.gettyimages.com/favicon.ico" },
  { name: "Alamy", url: "https://www.alamy.com/stock-photo-{username}", category: "creative", favicon: "https://www.alamy.com/favicon.ico" },
  { name: "Freepik", url: "https://www.freepik.com/@{username}", category: "creative", favicon: "https://www.freepik.com/favicon.ico" },
  { name: "VectorStock", url: "https://www.vectorstock.com/contributor/{username}", category: "creative" },
  { name: "Canva", url: "https://www.canva.com/design/{username}", category: "creative", favicon: "https://www.canva.com/favicon.ico" },
  
  // ===== MUSIC & AUDIO (25) =====
  { name: "Spotify", url: "https://open.spotify.com/user/{username}", category: "creative", favicon: "https://spotify.com/favicon.ico" },
  { name: "SoundCloud", url: "https://soundcloud.com/{username}", category: "creative", favicon: "https://soundcloud.com/favicon.ico" },
  { name: "Bandcamp", url: "https://{username}.bandcamp.com", category: "creative", favicon: "https://bandcamp.com/favicon.ico" },
  { name: "Last.fm", url: "https://www.last.fm/user/{username}", category: "creative", favicon: "https://www.last.fm/favicon.ico" },
  { name: "Apple Music", url: "https://music.apple.com/profile/{username}", category: "creative", favicon: "https://www.apple.com/favicon.ico" },
  { name: "Tidal", url: "https://tidal.com/{username}", category: "creative", favicon: "https://tidal.com/favicon.ico" },
  { name: "Deezer", url: "https://www.deezer.com/profile/{username}", category: "creative", favicon: "https://www.deezer.com/favicon.ico" },
  { name: "Pandora", url: "https://www.pandora.com/people/{username}", category: "creative", favicon: "https://www.pandora.com/favicon.ico" },
  { name: "Audiomack", url: "https://audiomack.com/{username}", category: "creative", favicon: "https://audiomack.com/favicon.ico" },
  { name: "Mixcloud", url: "https://www.mixcloud.com/{username}", category: "creative", favicon: "https://www.mixcloud.com/favicon.ico" },
  { name: "ReverbNation", url: "https://www.reverbnation.com/{username}", category: "creative", favicon: "https://www.reverbnation.com/favicon.ico" },
  { name: "Beatport", url: "https://www.beatport.com/artist/{username}", category: "creative", favicon: "https://www.beatport.com/favicon.ico" },
  { name: "Traxsource", url: "https://www.traxsource.com/artist/{username}", category: "creative" },
  { name: "Resident Advisor", url: "https://ra.co/dj/{username}", category: "creative", favicon: "https://ra.co/favicon.ico" },
  { name: "Discogs", url: "https://www.discogs.com/user/{username}", category: "creative", favicon: "https://www.discogs.com/favicon.ico" },
  { name: "AllMusic", url: "https://www.allmusic.com/artist/{username}", category: "creative", favicon: "https://www.allmusic.com/favicon.ico" },
  { name: "Genius", url: "https://genius.com/{username}", category: "creative", favicon: "https://genius.com/favicon.ico" },
  { name: "Musixmatch", url: "https://www.musixmatch.com/profile/{username}", category: "creative", favicon: "https://www.musixmatch.com/favicon.ico" },
  { name: "Shazam", url: "https://www.shazam.com/user/{username}", category: "creative", favicon: "https://www.shazam.com/favicon.ico" },
  { name: "8tracks", url: "https://8tracks.com/{username}", category: "creative" },
  { name: "Jamendo", url: "https://www.jamendo.com/artist/{username}", category: "creative", favicon: "https://www.jamendo.com/favicon.ico" },
  { name: "Free Music Archive", url: "https://freemusicarchive.org/music/{username}", category: "creative" },
  { name: "Audiojungle", url: "https://audiojungle.net/user/{username}", category: "creative" },
  { name: "Pond5", url: "https://www.pond5.com/artist/{username}", category: "creative", favicon: "https://www.pond5.com/favicon.ico" },
  { name: "Splice", url: "https://splice.com/{username}", category: "creative", favicon: "https://splice.com/favicon.ico" },
  
  // ===== VIDEO & STREAMING (20) =====
  { name: "YouTube", url: "https://www.youtube.com/@{username}", category: "creative", favicon: "https://www.youtube.com/favicon.ico" },
  { name: "Vimeo", url: "https://vimeo.com/{username}", category: "creative", favicon: "https://vimeo.com/favicon.ico" },
  { name: "DailyMotion", url: "https://www.dailymotion.com/{username}", category: "creative", favicon: "https://www.dailymotion.com/favicon.ico" },
  { name: "Metacafe", url: "https://www.metacafe.com/channels/{username}", category: "creative" },
  { name: "Veoh", url: "https://www.veoh.com/users/{username}", category: "creative" },
  { name: "Odysee", url: "https://odysee.com/@{username}", category: "creative", favicon: "https://odysee.com/favicon.ico" },
  { name: "LBRY", url: "https://lbry.tv/@{username}", category: "creative" },
  { name: "Dtube", url: "https://d.tube/#!/c/{username}", category: "creative" },
  { name: "BitChute", url: "https://www.bitchute.com/channel/{username}", category: "creative", favicon: "https://www.bitchute.com/favicon.ico" },
  { name: "Minds", url: "https://www.minds.com/{username}", category: "creative", favicon: "https://www.minds.com/favicon.ico" },
  { name: "Gab TV", url: "https://tv.gab.com/channel/{username}", category: "creative" },
  { name: "Peertube", url: "https://peertube.tv/accounts/{username}", category: "creative" },
  { name: "Floatplane", url: "https://www.floatplane.com/user/{username}", category: "creative" },
  { name: "Nebula", url: "https://nebula.tv/{username}", category: "creative", favicon: "https://nebula.tv/favicon.ico" },
  { name: "Curiosity Stream", url: "https://curiositystream.com/{username}", category: "creative" },
  { name: "TED", url: "https://www.ted.com/profiles/{username}", category: "creative", favicon: "https://www.ted.com/favicon.ico" },
  { name: "Skillshare", url: "https://www.skillshare.com/profile/{username}", category: "creative", favicon: "https://www.skillshare.com/favicon.ico" },
  { name: "Udemy", url: "https://www.udemy.com/user/{username}", category: "creative", favicon: "https://www.udemy.com/favicon.ico" },
  { name: "Coursera", url: "https://www.coursera.org/instructor/{username}", category: "creative", favicon: "https://www.coursera.org/favicon.ico" },
  { name: "edX", url: "https://www.edx.org/bio/{username}", category: "creative", favicon: "https://www.edx.org/favicon.ico" },
  
  // ===== DATING & SOCIAL DISCOVERY (25) =====
  { name: "Tinder", url: "https://tinder.com/@{username}", category: "adult", favicon: "https://tinder.com/favicon.ico" },
  { name: "Bumble", url: "https://bumble.com/get/{username}", category: "adult", favicon: "https://bumble.com/favicon.ico" },
  { name: "Hinge", url: "https://hinge.co/profile/{username}", category: "adult" },
  { name: "Match.com", url: "https://www.match.com/{username}", category: "adult", favicon: "https://www.match.com/favicon.ico" },
  { name: "eHarmony", url: "https://www.eharmony.com/user/{username}", category: "adult", favicon: "https://www.eharmony.com/favicon.ico" },
  { name: "OkCupid", url: "https://www.okcupid.com/profile/{username}", category: "adult", favicon: "https://www.okcupid.com/favicon.ico" },
  { name: "Plenty of Fish", url: "https://www.pof.com/viewprofile.aspx?profile_id={username}", category: "adult", favicon: "https://www.pof.com/favicon.ico" },
  { name: "Zoosk", url: "https://www.zoosk.com/profile/{username}", category: "adult", favicon: "https://www.zoosk.com/favicon.ico" },
  { name: "Coffee Meets Bagel", url: "https://coffeemeetsbagel.com/{username}", category: "adult" },
  { name: "Her", url: "https://weareher.com/{username}", category: "adult" },
  { name: "Grindr", url: "https://www.grindr.com/profile/{username}", category: "adult", favicon: "https://www.grindr.com/favicon.ico" },
  { name: "Scruff", url: "https://www.scruff.com/{username}", category: "adult", favicon: "https://www.scruff.com/favicon.ico" },
  { name: "Feeld", url: "https://feeld.co/{username}", category: "adult" },
  { name: "Badoo", url: "https://badoo.com/{username}", category: "adult", favicon: "https://badoo.com/favicon.ico" },
  { name: "Happn", url: "https://www.happn.com/en/me/{username}", category: "adult", favicon: "https://www.happn.com/favicon.ico" },
  { name: "Hily", url: "https://hily.com/{username}", category: "adult" },
  { name: "Lovoo", url: "https://www.lovoo.com/profile/{username}", category: "adult" },
  { name: "Tagged", url: "https://www.tagged.com/profile.html?uid={username}", category: "adult", favicon: "https://www.tagged.com/favicon.ico" },
  { name: "MeetMe", url: "https://www.meetme.com/{username}", category: "adult", favicon: "https://www.meetme.com/favicon.ico" },
  { name: "Skout", url: "https://www.skout.com/user/{username}", category: "adult" },
  { name: "Mingle2", url: "https://www.mingle2.com/user/{username}", category: "adult" },
  { name: "AshleyMadison", url: "https://www.ashleymadison.com/profile/{username}", category: "adult" },
  { name: "AdultFriendFinder", url: "https://adultfriendfinder.com/profile/{username}", category: "nsfw", favicon: "https://adultfriendfinder.com/favicon.ico" },
  { name: "Alt.com", url: "https://www.alt.com/profile/{username}", category: "nsfw" },
  { name: "FetLife", url: "https://fetlife.com/users/{username}", category: "nsfw", favicon: "https://fetlife.com/favicon.ico" },
  
  // ===== CRYPTO & WEB3 (20) =====
  { name: "OpenSea", url: "https://opensea.io/{username}", category: "crypto", favicon: "https://opensea.io/favicon.ico" },
  { name: "Rarible", url: "https://rarible.com/{username}", category: "crypto", favicon: "https://rarible.com/favicon.ico" },
  { name: "Foundation", url: "https://foundation.app/@{username}", category: "crypto", favicon: "https://foundation.app/favicon.ico" },
  { name: "SuperRare", url: "https://superrare.com/{username}", category: "crypto", favicon: "https://superrare.com/favicon.ico" },
  { name: "Zora", url: "https://zora.co/{username}", category: "crypto", favicon: "https://zora.co/favicon.ico" },
  { name: "KnownOrigin", url: "https://knownorigin.io/profile/{username}", category: "crypto" },
  { name: "Async Art", url: "https://async.art/u/{username}", category: "crypto" },
  { name: "Nifty Gateway", url: "https://niftygateway.com/{username}", category: "crypto" },
  { name: "MakersPlace", url: "https://makersplace.com/{username}", category: "crypto", favicon: "https://makersplace.com/favicon.ico" },
  { name: "Coinbase", url: "https://www.coinbase.com/{username}", category: "crypto", favicon: "https://www.coinbase.com/favicon.ico" },
  { name: "Binance", url: "https://www.binance.com/en/user/{username}", category: "crypto", favicon: "https://www.binance.com/favicon.ico" },
  { name: "Kraken", url: "https://www.kraken.com/u/{username}", category: "crypto", favicon: "https://www.kraken.com/favicon.ico" },
  { name: "Gemini", url: "https://www.gemini.com/user/{username}", category: "crypto", favicon: "https://www.gemini.com/favicon.ico" },
  { name: "Crypto.com", url: "https://crypto.com/users/{username}", category: "crypto", favicon: "https://crypto.com/favicon.ico" },
  { name: "FTX", url: "https://ftx.com/profile/{username}", category: "crypto" },
  { name: "Kucoin", url: "https://www.kucoin.com/ucenter/{username}", category: "crypto", favicon: "https://www.kucoin.com/favicon.ico" },
  { name: "Bitfinex", url: "https://www.bitfinex.com/user/{username}", category: "crypto", favicon: "https://www.bitfinex.com/favicon.ico" },
  { name: "Etherscan", url: "https://etherscan.io/address/{username}", category: "crypto", favicon: "https://etherscan.io/favicon.ico" },
  { name: "CoinGecko", url: "https://www.coingecko.com/en/users/{username}", category: "crypto", favicon: "https://www.coingecko.com/favicon.ico" },
  { name: "CoinMarketCap", url: "https://coinmarketcap.com/currencies/{username}", category: "crypto", favicon: "https://coinmarketcap.com/favicon.ico" },
  
  // ===== SHOPPING & MARKETPLACES (25) =====
  { name: "Etsy", url: "https://www.etsy.com/people/{username}", category: "shopping", favicon: "https://www.etsy.com/favicon.ico" },
  { name: "eBay", url: "https://www.ebay.com/usr/{username}", category: "shopping", favicon: "https://www.ebay.com/favicon.ico" },
  { name: "Amazon", url: "https://www.amazon.com/gp/profile/amzn1.account.{username}", category: "shopping", favicon: "https://www.amazon.com/favicon.ico" },
  { name: "Mercari", url: "https://www.mercari.com/u/{username}", category: "shopping", favicon: "https://www.mercari.com/favicon.ico" },
  { name: "Poshmark", url: "https://poshmark.com/closet/{username}", category: "shopping", favicon: "https://poshmark.com/favicon.ico" },
  { name: "Depop", url: "https://www.depop.com/{username}", category: "shopping", favicon: "https://www.depop.com/favicon.ico" },
  { name: "Vinted", url: "https://www.vinted.com/member/{username}", category: "shopping", favicon: "https://www.vinted.com/favicon.ico" },
  { name: "ThredUp", url: "https://www.thredup.com/user/{username}", category: "shopping" },
  { name: "Grailed", url: "https://www.grailed.com/{username}", category: "shopping", favicon: "https://www.grailed.com/favicon.ico" },
  { name: "Reverb", url: "https://reverb.com/shop/{username}", category: "shopping", favicon: "https://reverb.com/favicon.ico" },
  { name: "StockX", url: "https://stockx.com/users/{username}", category: "shopping", favicon: "https://stockx.com/favicon.ico" },
  { name: "GOAT", url: "https://www.goat.com/users/{username}", category: "shopping", favicon: "https://www.goat.com/favicon.ico" },
  { name: "Vestiaire Collective", url: "https://www.vestiairecollective.com/user/{username}", category: "shopping" },
  { name: "Rebag", url: "https://www.rebag.com/user/{username}", category: "shopping" },
  { name: "The RealReal", url: "https://www.therealreal.com/users/{username}", category: "shopping" },
  { name: "Chairish", url: "https://www.chairish.com/shop/{username}", category: "shopping", favicon: "https://www.chairish.com/favicon.ico" },
  { name: "1stDibs", url: "https://www.1stdibs.com/dealers/{username}", category: "shopping", favicon: "https://www.1stdibs.com/favicon.ico" },
  { name: "Alibaba", url: "https://www.alibaba.com/member/{username}.html", category: "shopping", favicon: "https://www.alibaba.com/favicon.ico" },
  { name: "AliExpress", url: "https://www.aliexpress.com/store/{username}", category: "shopping", favicon: "https://www.aliexpress.com/favicon.ico" },
  { name: "Wish", url: "https://www.wish.com/merchant/{username}", category: "shopping", favicon: "https://www.wish.com/favicon.ico" },
  { name: "Bonanza", url: "https://www.bonanza.com/booths/{username}", category: "shopping" },
  { name: "Reverb", url: "https://reverb.com/{username}", category: "shopping" },
  { name: "Discogs Marketplace", url: "https://www.discogs.com/seller/{username}", category: "shopping" },
  { name: "Carousell", url: "https://www.carousell.sg/{username}", category: "shopping" },
  { name: "OLX", url: "https://www.olx.com/profile/{username}", category: "shopping" },
  
  // ===== PROFESSIONAL & BUSINESS (30) =====
  { name: "LinkedIn", url: "https://www.linkedin.com/in/{username}", category: "business", favicon: "https://www.linkedin.com/favicon.ico" },
  { name: "Xing", url: "https://www.xing.com/profile/{username}", category: "business", favicon: "https://www.xing.com/favicon.ico" },
  { name: "ZoomInfo", url: "https://www.zoominfo.com/p/{username}", category: "business", favicon: "https://www.zoominfo.com/favicon.ico" },
  { name: "Apollo.io", url: "https://www.apollo.io/people/{username}", category: "business" },
  { name: "Hunter.io", url: "https://hunter.io/{username}", category: "business", favicon: "https://hunter.io/favicon.ico" },
  { name: "Clearbit", url: "https://person.clearbit.com/{username}", category: "business" },
  { name: "Rocket Reach", url: "https://rocketreach.co/person/{username}", category: "business" },
  { name: "People Data Labs", url: "https://www.peopledatalabs.com/person/{username}", category: "business" },
  { name: "SignalHire", url: "https://www.signalhire.com/profiles/{username}", category: "business" },
  { name: "ContactOut", url: "https://contactout.com/{username}", category: "business" },
  { name: "Lusha", url: "https://www.lusha.com/people/{username}", category: "business" },
  { name: "Seamless.ai", url: "https://www.seamless.ai/contacts/{username}", category: "business" },
  { name: "Owler", url: "https://www.owler.com/company/{username}", category: "business", favicon: "https://www.owler.com/favicon.ico" },
  { name: "Craft.co", url: "https://craft.co/companies/{username}", category: "business" },
  { name: "PitchBook", url: "https://pitchbook.com/profiles/{username}", category: "business" },
  { name: "CB Insights", url: "https://www.cbinsights.com/company/{username}", category: "business" },
  { name: "Bloomberg", url: "https://www.bloomberg.com/profile/person/{username}", category: "business", favicon: "https://www.bloomberg.com/favicon.ico" },
  { name: "Forbes", url: "https://www.forbes.com/profile/{username}", category: "business", favicon: "https://www.forbes.com/favicon.ico" },
  { name: "Fortune", url: "https://fortune.com/person/{username}", category: "business", favicon: "https://fortune.com/favicon.ico" },
  { name: "Alignable", url: "https://www.alignable.com/profile/{username}", category: "business", favicon: "https://www.alignable.com/favicon.ico" },
  { name: "Bark", url: "https://www.bark.com/en/us/company/{username}", category: "business", favicon: "https://www.bark.com/favicon.ico" },
  { name: "Clutch", url: "https://clutch.co/profile/{username}", category: "business", favicon: "https://clutch.co/favicon.ico" },
  { name: "GoodFirms", url: "https://www.goodfirms.co/company/{username}", category: "business" },
  { name: "DesignRush", url: "https://www.designrush.com/agency/profile/{username}", category: "business" },
  { name: "Freelancer.com", url: "https://www.freelancer.com/u/{username}", category: "business", favicon: "https://www.freelancer.com/favicon.ico" },
  { name: "Upwork", url: "https://www.upwork.com/freelancers/{username}", category: "business", favicon: "https://www.upwork.com/favicon.ico" },
  { name: "Fiverr", url: "https://www.fiverr.com/{username}", category: "business", favicon: "https://www.fiverr.com/favicon.ico" },
  { name: "Toptal", url: "https://www.toptal.com/resume/{username}", category: "business", favicon: "https://www.toptal.com/favicon.ico" },
  { name: "Guru", url: "https://www.guru.com/freelancers/{username}", category: "business", favicon: "https://www.guru.com/favicon.ico" },
  { name: "PeoplePerHour", url: "https://www.peopleperhour.com/freelancer/{username}", category: "business" },
  
  // ===== NSFW PLATFORMS (20) =====
  { name: "OnlyFans", url: "https://onlyfans.com/{username}", category: "nsfw", favicon: "https://onlyfans.com/favicon.ico" },
  { name: "Fansly", url: "https://fansly.com/{username}", category: "nsfw", favicon: "https://fansly.com/favicon.ico" },
  { name: "Fancentro", url: "https://fancentro.com/{username}", category: "nsfw", favicon: "https://fancentro.com/favicon.ico" },
  { name: "ManyVids", url: "https://www.manyvids.com/Profile/{username}", category: "nsfw", favicon: "https://www.manyvids.com/favicon.ico" },
  { name: "Pornhub", url: "https://www.pornhub.com/users/{username}", category: "nsfw", favicon: "https://www.pornhub.com/favicon.ico" },
  { name: "XVideos", url: "https://www.xvideos.com/profiles/{username}", category: "nsfw", favicon: "https://www.xvideos.com/favicon.ico" },
  { name: "XHamster", url: "https://xhamster.com/users/{username}", category: "nsfw", favicon: "https://xhamster.com/favicon.ico" },
  { name: "Chaturbate", url: "https://chaturbate.com/{username}", category: "nsfw", favicon: "https://chaturbate.com/favicon.ico" },
  { name: "Stripchat", url: "https://stripchat.com/{username}", category: "nsfw", favicon: "https://stripchat.com/favicon.ico" },
  { name: "Cam4", url: "https://www.cam4.com/{username}", category: "nsfw", favicon: "https://www.cam4.com/favicon.ico" },
  { name: "LiveJasmin", url: "https://www.livejasmin.com/en/girl/{username}", category: "nsfw" },
  { name: "MyFreeCams", url: "https://profiles.myfreecams.com/{username}", category: "nsfw", favicon: "https://www.myfreecams.com/favicon.ico" },
  { name: "Camsoda", url: "https://www.camsoda.com/{username}", category: "nsfw", favicon: "https://www.camsoda.com/favicon.ico" },
  { name: "BongaCams", url: "https://bongacams.com/{username}", category: "nsfw" },
  { name: "Streamate", url: "https://www.streamate.com/{username}", category: "nsfw" },
  { name: "FetLife", url: "https://fetlife.com/users/{username}", category: "nsfw", favicon: "https://fetlife.com/favicon.ico" },
  { name: "Clips4Sale", url: "https://www.clips4sale.com/studio/{username}", category: "nsfw" },
  { name: "IWantClips", url: "https://iwantclips.com/{username}", category: "nsfw" },
  { name: "LoyalFans", url: "https://www.loyalfans.com/{username}", category: "nsfw" },
  { name: "JustForFans", url: "https://justfor.fans/{username}", category: "nsfw" },
  
  // ===== MISCELLANEOUS (40) =====
  { name: "Gravatar", url: "https://gravatar.com/{username}", category: "misc", favicon: "https://gravatar.com/favicon.ico" },
  { name: "About.me", url: "https://about.me/{username}", category: "misc", favicon: "https://about.me/favicon.ico" },
  { name: "Linktree", url: "https://linktr.ee/{username}", category: "misc", favicon: "https://linktr.ee/favicon.ico" },
  { name: "Beacons", url: "https://beacons.ai/{username}", category: "misc", favicon: "https://beacons.ai/favicon.ico" },
  { name: "Campsite", url: "https://campsite.bio/{username}", category: "misc" },
  { name: "Link in Bio", url: "https://later.com/link-in-bio/{username}", category: "misc" },
  { name: "Stan Store", url: "https://stan.store/{username}", category: "misc" },
  { name: "Koji", url: "https://koji.to/{username}", category: "misc" },
  { name: "Venmo", url: "https://venmo.com/{username}", category: "misc", favicon: "https://venmo.com/favicon.ico" },
  { name: "PayPal.Me", url: "https://www.paypal.me/{username}", category: "misc", favicon: "https://www.paypal.com/favicon.ico" },
  { name: "Cash App", url: "https://cash.app/${username}", category: "misc", favicon: "https://cash.app/favicon.ico" },
  { name: "Buy Me a Coffee", url: "https://www.buymeacoffee.com/{username}", category: "misc", favicon: "https://www.buymeacoffee.com/favicon.ico" },
  { name: "Ko-fi", url: "https://ko-fi.com/{username}", category: "misc", favicon: "https://ko-fi.com/favicon.ico" },
  { name: "Patreon", url: "https://www.patreon.com/{username}", category: "misc", favicon: "https://www.patreon.com/favicon.ico" },
  { name: "Gumroad", url: "https://gumroad.com/{username}", category: "misc", favicon: "https://gumroad.com/favicon.ico" },
  { name: "Gum", url: "https://gum.co/{username}", category: "misc" },
  { name: "Shopify", url: "https://{username}.myshopify.com", category: "shopping", favicon: "https://www.shopify.com/favicon.ico" },
  { name: "BigCartel", url: "https://{username}.bigcartel.com", category: "shopping" },
  { name: "Storenvy", url: "https://{username}.storenvy.com", category: "shopping" },
  { name: "Zazzle", url: "https://www.zazzle.com/store/{username}", category: "shopping", favicon: "https://www.zazzle.com/favicon.ico" },
  { name: "Redbubble", url: "https://www.redbubble.com/people/{username}", category: "shopping", favicon: "https://www.redbubble.com/favicon.ico" },
  { name: "Society6", url: "https://society6.com/{username}", category: "shopping", favicon: "https://society6.com/favicon.ico" },
  { name: "Teespring", url: "https://teespring.com/stores/{username}", category: "shopping" },
  { name: "TripAdvisor", url: "https://www.tripadvisor.com/members/{username}", category: "misc", favicon: "https://www.tripadvisor.com/favicon.ico" },
  { name: "Booking.com", url: "https://www.booking.com/reviews/{username}.html", category: "misc", favicon: "https://www.booking.com/favicon.ico" },
  { name: "Airbnb", url: "https://www.airbnb.com/users/show/{username}", category: "misc", favicon: "https://www.airbnb.com/favicon.ico" },
  { name: "VRBO", url: "https://www.vrbo.com/traveler/{username}", category: "misc" },
  { name: "HomeAway", url: "https://www.homeaway.com/traveler/{username}", category: "misc" },
  { name: "Couchsurfing", url: "https://www.couchsurfing.com/people/{username}", category: "misc", favicon: "https://www.couchsurfing.com/favicon.ico" },
  { name: "Strava", url: "https://www.strava.com/athletes/{username}", category: "misc", favicon: "https://www.strava.com/favicon.ico" },
  { name: "Zwift", url: "https://www.zwift.com/athlete/{username}", category: "misc", favicon: "https://www.zwift.com/favicon.ico" },
  { name: "Nike Run Club", url: "https://www.nike.com/nrc/profile/{username}", category: "misc" },
  { name: "Peloton", url: "https://members.onepeloton.com/members/{username}", category: "misc", favicon: "https://www.onepeloton.com/favicon.ico" },
  { name: "MyFitnessPal", url: "https://www.myfitnesspal.com/profile/{username}", category: "misc", favicon: "https://www.myfitnesspal.com/favicon.ico" },
  { name: "Fitbit", url: "https://www.fitbit.com/user/{username}", category: "misc", favicon: "https://www.fitbit.com/favicon.ico" },
  { name: "Duolingo", url: "https://www.duolingo.com/profile/{username}", category: "misc", favicon: "https://www.duolingo.com/favicon.ico" },
  { name: "Khan Academy", url: "https://www.khanacademy.org/profile/{username}", category: "misc", favicon: "https://www.khanacademy.org/favicon.ico" },
  { name: "FanFiction.net", url: "https://www.fanfiction.net/u/{username}", category: "misc", favicon: "https://www.fanfiction.net/favicon.ico" },
  { name: "Wattpad", url: "https://www.wattpad.com/user/{username}", category: "misc", favicon: "https://www.wattpad.com/favicon.ico" },
  { name: "Archive of Our Own", url: "https://archiveofourown.org/users/{username}", category: "misc", favicon: "https://archiveofourown.org/favicon.ico" },
];

/**
 * Check username availability across platforms
 * Uses parallel fetching with concurrency limits
 */
export async function checkUsernameAvailability(
  username: string,
  sources: UsernameSource[] = usernameSources,
  options: {
    concurrency?: number;
    timeout?: number;
  } = {}
): Promise<UsernameCheckResult[]> {
  const { concurrency = 10, timeout = 7000 } = options;
  const results: UsernameCheckResult[] = [];
  
  // Process in batches
  for (let i = 0; i < sources.length; i += concurrency) {
    const batch = sources.slice(i, i + concurrency);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (source) => {
        const url = source.url.replace('{username}', encodeURIComponent(username));
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            mode: 'no-cors', // CORS will block most, but we can detect via status
          });
          
          clearTimeout(timeoutId);
          
          // Status 200 = found, 404 = not found, anything else = suspicious
          let status: 'found' | 'suspicious' | 'not_found' = 'suspicious';
          
          if (response.status === 200 || response.ok) {
            status = 'found';
          } else if (response.status === 404) {
            status = 'not_found';
          }
          
          return { source, status, url };
        } catch (error) {
          // Network error or timeout - mark as not found
          return { source, status: 'not_found' as const, url };
        }
      })
    );
    
    // Extract successful results
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    });
  }
  
  return results;
}
