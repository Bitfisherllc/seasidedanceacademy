# Seaside Dance Academy SEO optimization report

Local work only. Nothing was deployed, published, submitted to a webmaster account, or pushed.

## 1. Website SEO summary

Seaside Dance Academy is a dance school at 16 S Main St, Berlin, Maryland 21811. Lisa Tingle opened it in September 2001. The public site is an Astro project whose production address is `https://www.seasidedanceacademy.net`. Pages use the existing `.html` URLs. The visible design, colors, and page copy were left in place.

The site already had a title, description, canonical URL, one Open Graph image, a sitemap, `robots.txt`, breadcrumbs, and favicons. Those pieces were uneven: many pages shared a thin description, search and the 404 page could be indexed, album and news photographs had empty alt text, and there was no business structured data.

What changed:

- Every public page now has its own title, description, canonical URL, robots directive, Open Graph tags, and X/Twitter card.
- The shared head now includes the business name, `en_US`, a large image preview, and JSON-LD for the dance school, website, and page.
- The classes page lists each published class as a service. The Q & A page marks its published questions as an FAQ.
- Photographs that could be identified now have descriptions. Gallery photographs use the album name and photo number instead of an invented scene.
- New homepage photos and new gallery photos have a description field in the existing editor.
- Search, the missing-page screen, and the class desk stay out of the sitemap. Search and the missing page use `noindex`. The class desk uses `noindex, nofollow`.

No ratings, review counts, opening hours, or new business claims were added. The only hours fact on the site is “Desk staff during operation hours,” and that is what the contact description uses.

## 2. Page-by-page metadata

Canonical URLs use `https://www.seasidedanceacademy.net`. Every page also has `og:site_name`, `og:locale` (`en_US`), `og:type` (`website`), `og:title`, `og:description`, `og:url`, `og:image`, and a `summary_large_image` X/Twitter card. The language is `en`.

The default share image is `/images/hero/duo-blue.jpg`. Album pages use that album’s cover. Instagram uses the first saved Instagram photo.

`DanceSchool` and `WebSite` are on every page. `BreadcrumbList` comes from the existing breadcrumb. The table lists the page-specific type in addition to those.

| Page | SEO title | Meta description | Indexing | Schema |
| --- | --- | --- | --- | --- |
| `/` | Seaside Dance Academy \| Berlin, MD | Dance classes for ages 3 and up in Berlin, Maryland. Ballet, jazz, tap, hip hop, acro, pom, and Broadway. Registration is open for the 2026-2027 season. | index, follow | WebPage |
| `/classes.html` | Dance Classes \| Seaside Dance Academy | See the 2026-2027 schedule, ages, days, and monthly tuition at Seaside Dance Academy in Berlin, Maryland. Classes begin September 14. | index, follow | WebPage, ItemList, Service |
| `/registration.html` | Class Registration \| Seaside Dance Academy | Register for the 2026-2027 season at Seaside Dance Academy in Berlin, Maryland. Classes begin Monday, September 14. Call (410) 629-0377. | index, follow | WebPage |
| `/seaside-news.html` | Studio News \| Seaside Dance Academy | News and Facebook updates from Seaside Dance Academy in Berlin, Maryland, including performances, awards, and studio life. Read the latest posts. | index, follow | WebPage |
| `/photos--videos.html` | Photos & Videos \| Seaside Dance Academy | Photo albums and videos from Seaside Dance Academy recitals, competitions, and studio life in Berlin, Maryland. Open an album to see the pictures. | index, follow | WebPage |
| `/reviews.html` | Google Reviews \| Seaside Dance Academy | Read Google reviews from Seaside Dance Academy families in Berlin, Maryland, or leave a review for the studio. Written reviews come from Google. | index, follow | WebPage |
| `/q-and-a.html` | Class Questions \| Seaside Dance Academy | Answers about start dates, ages, tuition, and the Seaside Dance Academy studio at 16 S Main St in Berlin, Maryland. Classes begin September 14. | index, follow | WebPage, FAQPage |
| `/contact.html` | Contact \| Seaside Dance Academy | Call Seaside Dance Academy at (410) 629-0377 or email the studio at 16 S Main St, Berlin, Maryland 21811. Desk staff are available during operation hours. | index, follow | WebPage |
| `/directions.html` | Directions \| Seaside Dance Academy | Get directions to Seaside Dance Academy at 16 S Main St, Berlin, Maryland 21811, about ten miles from Ocean City and Assateague Island. | index, follow | WebPage |
| `/photos--videos/instagram.html` | Instagram \| Seaside Dance Academy | Recent photos from the Seaside Dance Academy Instagram, @seasidedanceacademy_, in Berlin, Maryland. Follow the studio for new pictures. | index, follow | WebPage |
| `/photos--videos/march-14th-2018.html` | 2018 Competition season \| Seaside Dance Academy | 2018 Competition season. 3/14/2018. Photos from Seaside Dance Academy in Berlin, Maryland. Look through the pictures in this album. | index, follow | WebPage |
| `/photos--videos/2017-competition-season.html` | 2017 Competition season \| Seaside Dance Academy | 2017 Competition season. 3/7/2018. Photos from Seaside Dance Academy in Berlin, Maryland. Look through the pictures in this album. | index, follow | WebPage |
| `/photos--videos/2017-groove-ida-nominations.html` | 2017 GROOVE IDA NOMINATIONS \| Seaside Dance Academy | 2017 GROOVE IDA NOMINATIONS. 2/15/2017. Photos from Seaside Dance Academy in Berlin, Maryland. Look through the pictures in this album. | index, follow | WebPage |
| `/photos--videos/2016-competition-season.html` | 2016 Competition Season \| Seaside Dance Academy | 2016 Competition Season. 12/31/2016. Photos from Seaside Dance Academy in Berlin, Maryland. Look through the pictures in this album. | index, follow | WebPage |
| `/photos--videos/2016-groove-ida-nominations.html` | 2016 GROOVE IDA NOMINATIONS \| Seaside Dance Academy | 2016 GROOVE IDA NOMINATIONS. 2/24/2016. Photos from Seaside Dance Academy in Berlin, Maryland. Look through the pictures in this album. | index, follow | WebPage |
| `/photos--videos/2015-competition-season.html` | 2015 Competition Season \| Seaside Dance Academy | 2015 Competition Season. 12/31/2015. Photos from Seaside Dance Academy in Berlin, Maryland. Look through the pictures in this album. | index, follow | WebPage |
| `/photos--videos/2014-competition-season.html` | 2014 Competition Season \| Seaside Dance Academy | 2014 Competition Season. 12/31/2014. Photos from Seaside Dance Academy in Berlin, Maryland. Look through the pictures in this album. | index, follow | WebPage |
| `/photos--videos/2013-competition-season.html` | 2013 Competition Season \| Seaside Dance Academy | 2013 Competition Season. 12/31/2013. Photos from Seaside Dance Academy in Berlin, Maryland. Look through the pictures in this album. | index, follow | WebPage |
| `/photos--videos/kendal-snyder-corey-vansice-duo-2012-liar-seaside-dance-academy-choreographer-meagen-walsh.html` | Kendal Snyder & Corey VanSice Duo 2012 "Liar" Seaside Dance Academy Choreographer Meagen Walsh \| Seaside Dance Academy | Photos from Kendal Snyder & Corey VanSice Duo 2012 "Liar" Seaside Dance Academy Choreographer Meagen Walsh at Seaside Dance Academy in Berlin, Maryland. | index, follow | WebPage |
| `/photos--videos/daydreamer-va-beach-nationals.html` | DayDreamer - VA Beach Nationals \| Seaside Dance Academy | DayDreamer - VA Beach Nationals. 8/16/2011. Photos from Seaside Dance Academy in Berlin, Maryland. Look through the pictures in this album. | index, follow | WebPage |
| `/photos--videos/kasey-clayland-kathryn-omalley-swing-with-me-baby-va-beach-nationals.html` | Kasey Clayland, Kathryn O'Malley - Swing With Me Baby - VA Beach Nationals \| Seaside Dance Academy | Kasey Clayland, Kathryn O'Malley - Swing With Me Baby - VA Beach Nationals. 8/15/2011. Photos from Seaside Dance Academy in Berlin, Maryland. | index, follow | WebPage |
| `/apps/search.html` | Search \| Seaside Dance Academy | Search Seaside Dance Academy classes, news, photos, and studio pages. | noindex, follow | WebPage |
| `/404.html` | Page not found \| Seaside Dance Academy | That page is not on the Seaside Dance Academy site. | noindex, follow | WebPage |
| `/studio.html` | Class desk \| Seaside Dance Academy | Studio staff add, edit, hide, and delete classes. | noindex, nofollow | WebPage |

Titles and descriptions were checked in the built HTML. No two pages share a title or a description. Search, the 404 page, and the class desk are not in the sitemap.

The dance-school record uses the published name, URL, logo, phone `+1-410-629-0377`, email, street address, Lisa Tingle as founder, founding date September 2001, Worcester County as the area already named on the homepage, and the Facebook, Instagram, and YouTube profiles. It does not include hours or a star rating. The website record points site search at `/apps/search.html?q={search_term_string}`.

## 3. Image alt text

### Inspected and described

| File | Where it appears | Alt text |
| --- | --- | --- |
| `public/images/gallery/01.jpg` | Home slideshow and lower photo strip | Seaside Dance Academy dancers in pink costumes performing a group routine on stage |
| `public/images/gallery/02.jpg` | Home slideshow | A Seaside Dance Academy dancer holding a standing split on stage |
| `public/images/gallery/03.jpg` | Home slideshow | Two Seaside Dance Academy dancers performing a lift on a dark stage |
| `public/images/gallery/04.jpg` | Home slideshow | Seaside Dance Academy dancers in red costumes performing at a GROOVE competition |
| `public/images/gallery/05.jpg` | Home slideshow | Seaside Dance Academy dancers in black and green costumes during a stage performance |
| `public/images/gallery/06.jpg` | Home slideshow | Seaside Dance Academy dancers in black costumes holding colorful umbrellas on stage |
| `public/images/albums/march-14th-2018/022.jpg` | Home upper photo strip | Young Seaside Dance Academy dancers in blue dresses performing a group routine on stage |
| `public/images/studio/lisa-tingle.jpg` | Studio director | Lisa Tingle, founder of Seaside Dance Academy |
| `public/images/logos/logo.png` | Footer | Seaside Dance Academy |
| `public/images/logos/mark.jpeg` | Mobile header | Seaside Dance Academy |
| `public/images/logos/mark.jpeg` | Desktop header, beside the name | Empty. The name is already the link text. |
| `public/images/schedule/class-schedule.jpg` | Registration | Class schedule. Registration is now open. Classes begin September 14th. |
| `public/images/schedule/pom-classes.jpg` | Registration | Junior Pom and Pom and Dance Team Prep are back. |
| `public/images/news/01.jpg` and posts with text | News | The first sentence of the published Facebook text, shortened when it is long |
| Hero photographs | Page banners | Empty. The banner quote and headings are the text; the photo is a background. |

### Pattern used for the rest

| Images | Where | Alt text |
| --- | --- | --- |
| Album covers | Photos & Videos | The album title |
| Album photographs | Each gallery page | `{Album title}, photo {number}`, unless a saved description exists |
| Instagram photographs | Instagram page | Seaside Dance Academy Instagram post from {date} |
| Instagram cover | Photos & Videos | Latest photo from the Seaside Dance Academy Instagram |
| News post with no text (`public/images/news/02.jpg`) | News | Seaside Dance Academy Facebook post from October 5, 2026 |

There are 471 image files under `public/images`, including about 408 under the albums folder. Gallery pages put the same description on the thumbnail and in the enlarged view.

### Images that need a manual look

- Album photographs were not given scene-by-scene descriptions. Guessing costumes, people, or places for hundreds of files would invent details. A signed-in editor can add a description when uploading a new gallery photo. Existing photos keep the album-and-number description until someone writes a better one.
- Instagram posts have a date and a link, not a caption in the project. The alt text uses the date. A caption would need to come from Instagram.
- `public/images/news/02.jpg` has no published caption, so the alt text is only the date. The other news images use the published post text, not a separate look at each still.
- If the studio director photo is replaced with someone other than Lisa Tingle, the current alt text would need to be changed. The editor does not yet have a separate description for that portrait.
- Replaced homepage slideshow or wide photos should get a new description in the editor. If that field is left as the previous sentence, the description can lag behind the new picture.

## 4. Technical SEO changes

- Shared head in `src/layouts/Base.astro`: unique title and description, canonical URL, robots, Open Graph, X/Twitter card, favicons, and JSON-LD. The page language stays `en`.
- `DanceSchool` structured data uses only facts already on the site. No star rating and no invented hours.
- Classes page: `ItemList` of `Service` entries from the published class list. Hidden classes stay out of it.
- Q & A page: `FAQPage` from the published questions. This records the questions for search systems. It does not promise a Google FAQ rich result.
- Album pages: description from the album title and date, canonical URL, and the album cover as the share image. A new gallery created in the editor is included because the sitemap and the album routes both read the album list.
- Sitemap at `/sitemap.xml`: 21 public URLs, absolute `https://www.seasidedanceacademy.net` addresses. Excludes the class desk, search, and the 404 page. No `lastmod` values were invented; the project does not store a publish date for each page.
- `robots.txt`: allows the public site, disallows `/studio` and `/apps/search`, and points to the production sitemap. `robots.txt` is not the only protection. Those pages also send `noindex`.
- Search and the 404 page: `noindex, follow`. The class desk remains `noindex, nofollow`.
- Unknown addresses return HTTP 404. The 404 page links to the class schedule.
- Canonical host is `https://www.seasidedanceacademy.net`. The existing Vercel rule still redirects the bare domain to `www`.
- Hero photographs load immediately and use high fetch priority. Slideshow, photo strips, news, registration flyers, and gallery thumbnails below the banner use lazy loading and already have width and height.
- Image files were not renamed and were not converted to WebP or AVIF. Renaming them would break the gallery records.
- Homepage slideshow, the two wide photos, and Add a photo in a gallery now have a description field. A blank gallery description falls back to the album name and photo number. New galleries keep working with the existing sitemap.

## 5. Outstanding issues

- Album and Instagram photographs still need human descriptions if the studio wants each picture to say more than the album name or the post date.
- Five album pages include a video file. They do not use `VideoObject` because the project does not have a verified upload date, and a made-up date would be misleading.
- The registration flyers are JPEGs at the same size as the original pictures. `pom-classes.jpg` is about 225 KB, down from a 974 KB PNG. `class-schedule.jpg` is about 153 KB.
- Google’s Rich Results Test and PageSpeed Insights were not run. Those tools need the public site, and this work was not deployed.
- Field Core Web Vitals, crawl stats, and index coverage can only be confirmed after the live site is updated and the sitemap is submitted.
- The class desk still needs `STUDIO_PASSWORD` and `GITHUB_TOKEN` on the host before a live save works. That was already true and was not changed here.
- Do not add an aggregate rating. The Google rating on the reviews page is third-party data, and the written reviews are only the ones already stored.

## 6. Search engine submission checklist

Do this after you approve a deploy. This session did not submit the site.

### Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) for `https://www.seasidedanceacademy.net`.
2. Use the Domain property, or a URL-prefix property for `https://www.seasidedanceacademy.net/`.
3. Submit `https://www.seasidedanceacademy.net/sitemap.xml`.
4. Use URL Inspection on the homepage, classes, directions, and one album page. Request indexing only after the new HTML is live.
5. Check Pages, Sitemaps, and Crawl stats for “Excluded by noindex” on `/studio.html` and `/apps/search.html`, and for 404s that should not be indexed.
6. Confirm the live page source shows the new title, description, canonical URL, and the dance-school JSON-LD.

### Bing Webmaster Tools

1. Open [Bing Webmaster Tools](https://www.bing.com/webmasters) for the same production site.
2. Submit `https://www.seasidedanceacademy.net/sitemap.xml`.
3. Use URL inspection on the homepage and the classes page after the deploy.
4. Review crawl errors and the robots.txt report. The file should allow `/` and disallow `/studio` and `/apps/search`.

### After either tool

- Give the sitemap a few days, then confirm the main pages are indexed and the class desk is not.
- Check that the bare domain redirects once to `https://www.seasidedanceacademy.net`.
- Re-check a shared link preview so the Open Graph image and title match the page.

## 7. Final verification

Completed:

- `npm run build` finished without errors and wrote 24 HTML pages plus the sitemap.
- Built and local pages were checked for a unique title, a unique description, a production canonical URL, robots, Open Graph, the X/Twitter card, and JSON-LD that parses.
- Homepage alt text matches the six slideshow photographs and the two wide photographs that were looked at.
- A gallery page uses `{album title}, photo {number}` and its cover as the share image.
- `/sitemap.xml` has 21 public URLs and does not list the class desk or search.
- `robots.txt` matches the intended rules and names the production sitemap.
- `/404.html` and an unknown address return HTTP 404 with `noindex, follow`.
- Desktop checks in the browser: homepage, classes, and the missing-page screen. The menu, hero, class cards, and footer still use the current layout.
- A narrow viewport check of the homepage showed the stacked hero cards and the menu button. The page content was not restyled.
- No linter errors were reported for the edited layout, data, homepage, classes, news, slideshow, and gallery files.

Not verified from here:

- Google Rich Results Test, Bing URL inspection, and live index status. The updated site is local only.
- Lab or field Core Web Vitals on the production host.
- A live save of a new photo description. The description field is in the editor and the save code accepts it, but it was not submitted with a test upload, so no gallery file was changed.
