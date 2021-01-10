const rssPlugin = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const fs = require('fs');
const imgDim = require("./src/_11ty/plugins/img-dim.js");
const jsonLd = require("./src/_11ty/plugins/json-ld.js");
const optimizeHtml = require("./src/_11ty/plugins/optimize-html.js");
const applyCSP = require("./src/_11ty/plugins/apply-csp.js")

// Import filters
const dateFilter = require('./src/_11ty/filters/date-filter.js');
const markdownFilter = require('./src/_11ty/filters/markdown-filter.js');
const randomLimit = require('./src/_11ty/filters/randomLimit.js');
const w3DateFilter = require('./src/_11ty/filters/w3-date-filter.js');
const filters = require('./src/_11ty/filters/filters.js');

// Import transforms
const htmlMinTransform = require('./src/_11ty/transforms/html-min-transform.js');
const parseTransform = require('./src/_11ty/transforms/parse-transform.js');

// Import data files
const site = require('./src/_data/site.json');
const elsewhere = require('./src/_data/elsewhere.json');


module.exports = function(config) {
  // Filters
  config.addFilter('dateFilter', dateFilter);
  config.addFilter('markdownFilter', markdownFilter);
  config.addFilter("randomLimit", randomLimit);
  config.addFilter('w3DateFilter', w3DateFilter);
  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName])
  });

  config.addNunjucksAsyncFilter("addHash", function (
    absolutePath,
    callback
  ) {
    readFile(`./src${absolutePath}`, {
      encoding: "utf-8",
    })
      .then((content) => {
        return hasha.async(content)
      })
      .then((hash) => {
        callback(null, `${absolutePath}?hash=${hash.substr(0, 10)}`)
      })
      .catch((error) => callback(error))
  });

  // Layout aliases
  config.addLayoutAlias('home', 'layouts/home.njk');

  // Transforms
  //config.addTransform('htmlmin', htmlMinTransform);
  config.addTransform('parse', parseTransform);

  // Passthrough copy
  config.addPassthroughCopy('src/fonts');
  config.addPassthroughCopy('src/images');
  config.addPassthroughCopy('src/js');
  config.addPassthroughCopy('src/css');
  config.addPassthroughCopy('src/admin/config.yml');
  config.addPassthroughCopy('src/admin/previews.js');
  config.addPassthroughCopy('node_modules/nunjucks/browser/nunjucks-slim.js');
  config.addPassthroughCopy('src/robots.txt');

  const now = new Date();

  // Custom collections
  const livePosts = post => post.date <= now && !post.data.draft;
  config.addCollection('posts', collection => {
    return [
      ...collection.getFilteredByGlob('./src/posts/**.md').filter(livePosts)
    ].reverse();
  });

  config.addCollection('postFeed', collection => {
    return [...collection.getFilteredByGlob('./src/posts/*.md').filter(livePosts)]
      .reverse()
      .slice(0, site.maxPostsPerPage);
  });

  // Plugins
  config.addPlugin(rssPlugin);
  config.addPlugin(syntaxHighlight);
  config.addPlugin(imgDim);
  config.addPlugin(jsonLd);
  config.addPlugin(optimizeHtml);
  config.addPlugin(applyCSP);
  config.setDataDeepMerge(true);

  // 404
  config.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('dist/404.html');

        browserSync.addMiddleware('*', (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    }
  });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    passthroughFileCopy: true
  };
};
