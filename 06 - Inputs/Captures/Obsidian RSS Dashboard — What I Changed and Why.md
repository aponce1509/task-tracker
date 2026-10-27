---
file_class: capture
paras:
type: "[[Resources]]"
subtypes:
  - "[[External Knowledge - Resources - video|video]]"
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-26 21:34
url: "https://www.youtube.com/watch?v=iqz7ivxcAaY"
author:
  - "[[@PaulsObsidianSystems]]"
platform: youtube
---
# [[Obsidian RSS Dashboard — What I Changed and Why]]

> [!abstract] Video by [[@PaulsObsidianSystems]]
> - Published 2026-03-13
> - Duration 14:28

![](https://www.youtube.com/watch?v=iqz7ivxcAaY)

> [!info]- Description
> Obsidian Starter Vault Download
> Free Kit: https://ko-fi.com/s/33678f10a7 (Free)
> Pro Kit: https://ko-fi.com/s/c8e544e005 (Donation)
> Obsidian App: https://obsidian.md/
>
> Become a Vault Explorer
> https://paulsvaultmembers.com/vault-explorers/
> OR
> https://ko-fi.com/motion2082/tiers
>
> Reddit Post - RSS-Dashboard -2.2.0-beta.3 is now available
> https://www.reddit.com/r/ObsidianMD/comments/1rnx7g7/rssdashboard_220beta3_is_now_available/
>
> CHAPTERS
> 00:00 - Intro
> 00:18 - RSS Dashboard Introduction
> 01:19 - Let me Show you How it Works...
> 06:39 - RSS Dashboard My Improvements
> 14:02 - Outro
>
> DESCRIPTION
>
> This week, my Reddit Intelligence System flagged the RSS-Dashboard as a top 10 post on r/ObsidianMD.
>
> I tested it, broke it down, and rebuilt it into a more efficient, production-ready workflow.
>
> Here's what I changed, why it works better, and how to set it up for yourself
>
> RSS Dashboard Github
> https://github.com/amatya-aditya/obsidian-rss-dashboard
>
> 1. Installing through BRAT
> 2. Install BRAT from the Community Plugins in Obsidian.
> 3. Get the link to the GitHub repository: https://github.com/amatya-aditya/obsidian-rss-dashboard
> 4. Open the command palette and run the command "BRAT: Add a beta plugin for testing"
> 5. Using the link from step 2, copy that into the modal that opens up and Select the latest version (recommended)
> 6. Click on Add Plugin -- wait a few seconds and BRAT will tell you what is going on.
> 7. After BRAT confirms the installation, in Settings go to the Community plugins tab.
> 8. Refresh the list of plugins.
> 9. Find the RSS Dashboard in the plugin list and Enable it (If not enabled)
>
> My RSS Dashboard Changes
> https://github.com/motion2082/obsidian-rss-dashboard
> Use same install steps as above
>
> // Buy me a Coffee
> https://ko-fi.com/motion2082

> [!quote]- Transcript
> - [00:00](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=0s) My Reddit intelligence system flagged the RSS dashboard as a top 10 posts on Obsidian MD this week. So, I tested it, broke [music] it down, and rebuilt it into a more efficient, production-ready workflow. Here is what I changed, why it works better, and how to set it up for yourself. Here I am on the Obsidian Reddit, and the convoluted fire has posted RSS dashboard 2.2.0 [music] beta 3 is now available. We've got a few screenshots here of the RSS dashboard to show us what it looks like. And the main change was that there was a data migration from JSON to SQLite, resulting in improved [music] performance and faster feed article updates. There's a link to the beta release here. At the time of making this video, there's 280 upvotes. There's been a lot of interest in this plugin, quite a few comments for suggestions >> [music] >> and improvements. So, as someone that used fresh RSS feeds in the past, I've
> - [01:00](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=60s) always wanted a solution for RSS inside of Obsidian. So, this week I installed the plugin, and I've been making my own improvements. So, first I'll [music] just give you a brief overview of what the original plugin looks like, and then we'll go through the changes [music] that I've made. So, here I am inside of Obsidian, and I've installed the RSS dashboard 2.2.0 beta 4. To open up the RSS dashboard, I simply go to the icon on the ribbon and select RSS dashboard. That opens up all feeds, and you can see that I've loaded in some podcasts, RSS, and YouTube videos. So, by default, it just selects all feeds, and we can see all the RSS feeds here. If we click on the first one here by XDA, you can see by default it'll load the full image, and it takes a little bit of time to download. We've also got some links here that are a little bit hard to read. If I'm interested in this article, I can select
> - [02:00](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=120s) open in browser at the top right, and that will take me to the XDA website, where I can read the full article. To close the open RSS feed, I just hit the cross, and that takes me back to the dashboard. And I can hide the sidebar by clicking the little toggle sidebar, and revealing it again. Got some links up here for discover. So, if I wanted to discover some more RSS feeds, there are some pre-loaded in here. So, if we wanted to have a look at art RSS feeds, we can have a look there. At the top right, we've got a hamburger menu, which we can change a few filters. So, we can search articles. We can choose a time period. We can sort newest or oldest. We can select our card view or a list view. And we can also adjust the card spacing if we want more or less space. And we've got a refresh feeds button as well. So, if we have a look here, I've got a few folders. So, I've got podcast RSS feed
> - [03:00](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=180s) and YouTube. So, if we look at Theo Von, we can see all the podcasts from Theo. So, let's just choose the first one here. That loads up episode 645, Chris Robertson, and we can play and listen to that inside of Obsidian. And we can also scroll through and have a look at the other episodes here. We can see we've got a brief description here. So, that should be enough to know what the podcast is about. If we close that one, have a look at Joe Rogan, that is the same, and we can see we've got a tag here called podcast. So, we could always add another tag by hitting manage tag, and selecting another tag. So, that one could be important, or it could be something that we want to listen later. So, we could change this one, or add a new tag called listen later. Also got the option to save the full article. Now, I don't particularly like this feature because it saves it in the default folder that you specify in the settings, and it doesn't open up the
> - [04:00](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=240s) article by default, and I'll cover that a little bit later. I've then got the Obsidian MD here, and we can see anything with an image shows up. And if we roll over, we get a little description, but anything that doesn't is empty. So, if we click this one, you can see it's just text there. So, if we use our open in browser, you see it's just a text post on Reddit. It doesn't bring in the comments as well. And I've got another Reddit feed here called 980 and XDA. If we select this first XDA feed here, you can see it pulls in the full images, which I don't like, and sometimes they take a while to download. You can see this one is still coming down, and also the links are hard to read here, but you get the idea of what that one's about, and we can always jump to the website by opening in the browser there. Moving down to the YouTube folder, if we have a look here at Chris Titus Tech, you can see by default there's a lot of empty space under each feed, which I didn't like. And if we
> - [05:01](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=301s) right-click, we've got a few options here. So, I can update, edit, mark as read, change media type, move folder, or delete feed. If I go to into edit feed, and say I want to see more videos from Chris, you can see I've got some options here. So, I'll say I want to see 50 items, and I hit it save. If we scroll down, you can notice there's only 15. There is a limitation by default of 15 videos. So, that was another thing I didn't like. If we click on one of these YouTube videos, you can see it auto plays, which is quite nice, but we don't really have any description here of what the video is about. So, if we wanted to take notes on this particular video, we'd either have to save it with a default template, then make the changes, or go out to YouTube and then use the web clipper and use our predefined template to import back into Obsidian. So, I thought that was a little bit convoluted as well. Another thing is if we click and drag, you notice there's no
> - [06:01](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=361s) indicator of where this is going to be dragged to. So, if I just let go below Learn Linux TV, you can see it doesn't actually move down there. So, another thing I didn't like is when you switch to list view, everything is listed in the center here. So, we've got a lot of wasted space on the left and the right-hand side. So, I made a note to put that on my improvements list. So, that's a quick overview of the RSS dashboard. I'll now jump over to my Obsidian vault and I'm going to go through the changes that I've made to this default plugin this week. So, here I am inside of my Obsidian vault and I'm just going to navigate to RSS dashboard. That's going to bring up all articles by default. So, you can see I've still got the same feeds in the left-hand side here, but I've made a few changes. So, let's have a look at the podcast. So, the first one by Theo. So, now I'm just bringing in the cover art
> - [07:02](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=422s) for each feed and if I want to grab the description, I just roll over and it still gives me the description there. You can see I've taken out a lot of the negative space below each feed. If we switch back to the original one, you can see that there is the space there and there's no cover art. If we click that first one by Chris Roberson on the old one, that's what it looks like. And on the new one, it's pretty much the same, so no functionality change there. Another change I made is on the Reddit feed here. You can see that there is still negative space here. So, I was thinking about putting a default image every there is no image available. But for now, I've just left it like this. I can still roll over an image to get some more information. And if I click, you can see now that any links inside of the Reddit feed here are a little bit easier to read. So, you notice here on my
> - [08:02](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=482s) version, four maps plugin doesn't show local images. You can see I've got a lot more information being pulled in here. Whereas on the old one, I've only got a little snippet there. So, I'm pulling in a little bit more information. Let's have a look at XDA. So, XDA, I've got 10 feeds here. So, you can see I've got the title, image, and if I roll over, I've got the description. If I just open up this one, I still haven't fixed the large images. So, that will be something I will be looking to fix after I make this video. So, for now, I've just fixed the links here for the XDA feed. And if we have a look in the old one here, you can see that I got rid of all that negative space there. Uh but still got the large images there. So, moving down to YouTube, you can see with Chris Titus Tech here, I've taken out all that negative space below. And when I click a video now, it still auto plays, but then I've got this little hidden callout for the description. So, I can just get a
> - [09:02](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=542s) quick overview of what the video is about, and I can hide that and still get access to these videos below. The other change I've made is when I hit the save article, I've got this little save with YouTube. That replaces that with a template of my choice. Then I can pull in my YAML properties here, as well as my predefined YouTube template. And I've got my little media extended link here, so I can start taking notes for media extended. If I wanted all these areas here to be pre-filled out, then I could use AI tools in order to do that. Or what I could do is still go out to YouTube and come back in with the web clipper. But I think if I just want to take notes on the video, this is the best way to go about it. On the old plugin here, if we go into settings and scroll down to RSS dashboard, under article saving, by default everything goes into a save path and it uses this
> - [10:03](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=603s) default template here, which only has these variables available. So what I did is I saved my own template. So you can see here I've got YouTube. I'll show you what I've done inside of mine. So if we go into settings, scroll down, RSS dashboard, still got the default article template, but now I've added this little edit button here. So I can edit, choose the preset name, save it to a folder in my vault, and then use a templater template with predefined templater syntax. And I can also bring in my metabind buttons and all those features as well. As well as opening up the note when I'm ready to take notes on that particular video. So that's going to be really useful for YouTube as well as other RSS feeds. So the other change I made is to the way that it fetches the videos from the feed. So if we have a look here on the original one, if I right click and select add feed, going
> - [11:04](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=664s) to go out to YouTube and grab this Green Red Productions channel by copying the YouTube channel URL and we'll paste that in and hit load and it should detect and give us the title. So going to save that one. Now you see down the bottom there, by default it's only in 15 results. So if I edit that feed and change it to 50 and hit save, you'll notice that I've still only got 15 and even when I update the feed, it still shows 15. So, to get around that issue, what I did is I used the YouTube data API, which is a free API that you can use with a Google Cloud account, which is also free. So, I've got my API here, and here is all the queries per day, per minute that I can use this API for. Inside my Obsidian vault, under settings, under media, I've now got this YouTube API key, and I can paste my API key
> - [12:06](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=726s) inside of there, and then I can tell RSS dashboard how many videos I want to add. So, this one is maximum number of videos to fetch per channel. So, at the moment, I've just got it to 50. So, let's add that same channel by hitting the plus icon here, or add YouTube channel. I'll just go plus, paste in that same channel, hit load. You can see it still detects the title. I'm going to put it in my YouTube folder, and this time I'm going to change the maximum items to 50. I'm going to hit save. So, now you can see that I've got that channel down here, and if we scroll down, we can see that I've got a lot more feeds there. So, I've got 50 results. So, that's going to be a lot more useful for me. Another thing is if I want to click and drag it, now I can click and drag, and you can see that I can actually change where it's located. So, if I wanted this to be higher, I could just drag and drop it up there, and now it's up there. So, I can rearrange my feeds a lot easier,
> - [13:07](https://www.youtube.com/watch?v=iqz7ivxcAaY&t=787s) as well as bringing more of them. So, one other change that I made was one that I mentioned earlier. So, now when we go to the list view, I've got the empty left and right space filled up with all the RSS feeds. So, I think this looks a little bit better. I could probably add some more information here or here, but for now I like this a lot better than the old list view. This is what I've been busy working on this week using this RSS dashboard plugin and making my own customizations to it. So, let me know in the comments what you think of this plugin. If you wanted to install the original, I'll leave a link in the video description. But, if you want to get my changes, then I'll also leave that available in the description as well. Big shout-out to the Convoluted Fire for all your hard work so far on this community plugin. Thanks for watching and I'll see you in the next video.

## Annotations
