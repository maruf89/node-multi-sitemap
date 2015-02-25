# node-multi-sitemap
A sitemap module that is built to grow with multiple connected sitemaps

Good for if you want to keep your sitemaps organized into multiple individual sitemaps under an sitemap index file. See [https://support.google.com/webmasters/answer/75712?hl=en&rd=1](https://support.google.com/webmasters/answer/75712?hl=en&rd=1) for details

## Installation

`npm install node-multi-sitemap`

## Setup

Require and register your sitemap indexes

```coffee
MultiSitemap    = require('node-multi-sitemap')

sitemapPath     = '/path/to/sitemap' # path to dir where all your sitemaps live

pages           = ['products', 'blogs', 'events']

siteURL = 'https://www.example-site.com'
instance = new MultiSitemap(siteURL, sitemapPath)

# Register sitemap pages
pages.forEach(instance.addSitemap)

# Add pages to the sitemap
instance.add('blogs', 'blogs/20150225/some-path-of-a-blog-post')
instance.add('products', 'http://www.example-site.com/pid/40273', { priority: .8, changeFreq: 'monthly' })

setTimeout ->
    instance.flush() # writes the new pages to disk. Creates the sitemap if it doesn't exist, otherwise appends

```

### TODO

Currently this module expects you to already have a root sitemap index file, and be hooked up to use the sitemaps that your will be adding. For example the previous examples root sitemap would look like:

```xml
<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>https://www.example-site.com/path/to/sitemap/products.xml</loc>
    </sitemap>
    <sitemap>
        <loc>https://www.example-site.com/path/to/sitemap/blogs.xml</loc>
    </sitemap>
    <sitemap>
        <loc>https://www.example-site.com/path/to/sitemap/events.xml</loc>
    </sitemap>
```

- Automatically generate the sitemap index XML file if it does not exist.
- Automatically update the last modified of the sitemaps in the index whenever a child sitemap is flushed/updated
- Does not currently support sitemap pages with more than 50,000 URLs