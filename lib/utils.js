const url = require('url')
const qs = require('querystring')

/**
 * Formats mongoose errors into proper array
 *
 * @param {Array} errors
 * @return {Array}
 * @api public
 */

exports.errors = errors => {
  let keys = Object.keys(errors);
  const errs = [];

  // if there is no validation error, just display a generic error
  if (!keys) {
    return ['Oops! There was an error']
  }

  keys.forEach(key => {
    errs.push(errors[key].message)
  });

  return errs
};

/**
 * Index of object within an array
 *
 * @param {Array} arr
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

const indexof = (arr, obj) => {
  const index = -1; // not found initially
  const keys = Object.keys(obj);
  // filter the collection with the given criterias
  let result = arr.filter((doc, idx) => {
    // keep a counter of matched key/value pairs
    let matched = 0;

    // loop over criteria
    for (let i = keys.length - 1; i >= 0; i--) {
        if (doc[keys[i]] === obj[keys[i]]) {
            matched++;

            // check if all the criterias are matched
            if (matched === keys.length) {
                index = idx;
                return idx;
            }
        }
    }
      ;
  });
  return index;
};

exports.indexof = indexof

/**
 * Find object in an array of objects that matches a condition
 *
 * @param {Array} arr
 * @param {Object} obj
 * @return {Object}
 * @api public
 */

exports.findByParam = (arr, obj) => {
  const index = indexof(arr, obj)
  return index ? arr[index] : undefined
}

exports.createPagination = (req, pages, page) => {
  let params = qs.parse(url.parse(req.url).query)
  let str = ''
  let pageCutLow = page - 1
  let pageCutHigh = page + 1

  // Show the Previous button only if you are on a page other than the first
  if (page > 1) {
    str += `<li class="page-item no"><a class="page-link" href="?page=${page - 1}">Previous</a></li>`
  }

  // Show all the pagination elements if there are less than 6 pages total
  if (pages < 6) {
    for (let p = 1; p <= pages; p++) {
      const active = page === p ? 'active' : 'no'
      const href = '?' + qs.stringify({ ...params, page: p })

      str += `<li class="${active}"><a class="page-link" href="${href}">${p}</a></li>`
    }
  } else {
    // Use "..." to collapse pages outside of a certain range

    // Show the very first page followed by a "..." at the beginning of the
    // pagination section (after the Previous button)

    if (page > 2) {
      str += '<li class="no page-item"><a class="page-link" href="?page=1">1</a></li>'
      if (page > 3) {
        str += '<li class="out-of-range">...</li>'
      }
    }

    // Determine how many pages to show before the current page index
    if (page === pages) {
      pageCutLow -= 2
    } else if (page === pages - 1) {
      pageCutLow -= 1
    }

    // Determine how many pages to show after the current page index
    if (page === 1) {
      pageCutHigh += 2
    } else if (page === 2) {
      pageCutHigh += 1
    }

    // Output the indexes for pages that fall inside
    // the range of pageCutLow and pageCutHigh
    for (let p = pageCutLow; p <= pageCutHigh; p++) {
      if (p === 0) {
        p += 1
      }

      if (p > pages) {
        continue
      }

      const active = page === p ? 'active' : 'no'
      const href = '?' + qs.stringify({ ...params, page: p })

      str += `<li class="page-item ${active}"><a class="page-link" href="${href}">${p}</a></li>`
    }

    // Show the very last page preceded by a "..." at the end of the pagination
    // section (before the Next button)
    if (page < pages - 1) {
      if (page < pages - 2) {
        str += '<li class="out-of-range">...</li>'
      }
      str += `<li class="page-item no"><a class="page-link" href="?page=${pages}">${pages}</a></li>`
    }
  }

  // Show the Next button only if you are on a page other than the last
  if (page < pages) {
    str += `<li class="page-item no"><a class="page-link" href="?page=${page + 1}">Next</a></li>`
  }

  // Return the pagination string to be outputted in the pug templates
  return str
}