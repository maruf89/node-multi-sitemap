# node-multi-sitemap
A sitemap module that is built to grow with multiple connected sitemaps

Good for if you want to keep your sitemaps organized into multiple individual sitemaps under an sitemap index file.

## Installation

`npm install node-multi-sitemap`

## Setup

Require and register your sitemap indexes

```coffee
MultiSitemap    = require('node-multi-sitemap')

sitemapPath     = '/path/to/sitemap'

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

- Automatically generate the sitemap index XML file if it does not exist.
- Does not currently support sitemap pages with more than 50,000 URLs