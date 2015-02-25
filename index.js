var moduleName      = 'node-multi-sitemap',

    fs              = require('fs'),
    path            = require('path'),
    shelljs         = require('shelljs'),
    _               = require('lodash-node/modern'),

    Sitemap,

SitemapIndex = function (siteURL, sitemapPath) {
    if (!siteURL) {
        throw new Error('Missing either the siteURL parameter for module: ' + moduleName);
    }

    if (!sitemapPath){
        sitemapPath = '/';
    }

    // Make sure the url ends in a '/' so that http://www.google.com => http://www.google.com/
    if (siteURL.substr(-1, 1) !== '/') {
        siteURL += '/';
    }

    this._index     = null;
    this._sitemaps  = {};

    this._site      = siteURL;
    this._base      = path.resolve(process.env.PWD, sitemapPath);

    this._initiated = false;
    this._init();
};

SitemapIndex.prototype = _.extend(SitemapIndex.prototype, {
    _init: function () {
        var self = this;

        shelljs.mkdir('-p', self._base);
        self._initiated = true;
    },

    addSitemap: function (name) {
        this._sitemaps[name] = new Sitemap(this, name);
        return this;
    },

    add: function (page, URL, opts) {
        if (!this._sitemaps[page]) {
            throw new Error('Sitemap ' + page + ' has not been instantiated via `#addSitemap`');
        }

        if (!URL) {
            throw new Error('URL parameter is required');
        }

        // If the URL isn't an absolute URL then make it one
        if (URL.substr(0, 4) !== 'http') {
            if (URL[0] === '/') {
                URL = URL.substr(1);
            }

            URL = this._site + URL;
        }

        opts = opts || {};

        if (!opts.changeFreq){
            opts.changeFreq = 'Daily';
        }

        if (!opts.priority){
            opts.priority = '0.5';
        }

        this._sitemaps[page].add(URL, opts);
    },

    flush: function (page) {
        if (page) {
            if (!this._sitemaps[page]) {
                throw new Error('Sitemap ' + page + ' has not been instantiated via `#addSitemap`');
            }

            this._sitemaps[page].flush();
            return this;
        }
        _.each(this._sitemaps, function (instance) {
            instance.flush();
        });
    }
});

Sitemap = function (parent, name) {
    this.parent = parent;
    this.name = name;

    this.file = this.parent._base + '/' + name + '.xml';

    this._pages = [];           // each new sitemap to add
    this._empty = true;         // whether the pages are empty
    this._fileExists = null;    // whether the sitemap.xml file exists
    this._initiated = false;    // if has been initiated
    this._init();
}

Sitemap.prototype = _.extend(Sitemap.prototype, {
    _init: function () {
        var self = this;
        fs.exists(self.file, function (exists) {
            self._initiated = true;
            return self._fileExists = exists;
        });
    },

    add: function (url, opts) {
        this._pages.push({
            url: url,
            changeFreq: opts.changeFreq,
            priority: opts.priority
        });

        this._empty = false;
        return this;
    },

    _create: function (callback) {
        var self = this;

        fs.exists(self.file, function (exists) {
            if (exists) {
                callback('exists');
            }

            var wstream = fs.createWriteStream(self.file);
            
            wstream.write('<?xml version="1.0" encoding="UTF-8"?>');
            wstream.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

            _.each(self._pages, function(page, index) {
                wstream.write('<url>');
                wstream.write('<loc>' + page.url + '</loc>');
                wstream.write('<changefreq>' + page.changeFreq + '</changefreq>');
                wstream.write('<priority>' + page.priority + '</priority>');
                wstream.write('</url>');

                self._pages[index] = null;
            });

            wstream.write('</urlset>');
            wstream.end();
            self._fileExists = true;

            callback(null, 200);
        });
    },

    _append: function (callback) {
        var self = this,
            xml = '';

        _.each(self._pages, function(page, index) {
            xml +=
                '<url>' +
                    '<loc>' + page.url + '</loc>' +
                    '<changefreq>' + page.changeFreq + '</changefreq>' +
                    '<priority>' + page.priority + '</priority>' +
                '</url>';

            self._pages[index] = null;
        });

        xml += '</urlset>';

        shelljs.sed('-i', '</urlset>', xml, self.file);

        callback(null, 200);
    },

    flush: function (callback) {
        var self = this,
            callback,
            onResolve;

        if (!this._initiated) {
            return _.delay(function () {
                self.flush(callback);
            }, 50);
        }

        if (this._empty) {
            return false;
        }

        onResolve = self._resolve.bind(self);

        callback = function (err, res) {
            if (err) {
                if (err === 'exists') {
                    return self._append(onResolve);
                }

                throw new Error(err);
            }

            onResolve(res);
        };

        self._fileExists ? self._append(callback) : self._create(callback);
    },

    _resolve: function (code) {
        if (code !== 200) { return true; }

        this._pages.length = 0;
    }
});

module.exports = SitemapIndex;