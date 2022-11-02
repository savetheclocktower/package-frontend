
const MarkdownIt = require("markdown-it");
let md = new MarkdownIt({
  html: true
}).use(require("markdown-it-highlightjs"), {
  auto: true,
  code: true,
  inline: true
}).use(require("markdown-it-emoji"), {

});
// Collection of utility functions for the frontend

async function displayError(req, res, errStatus) {
  switch(errStatus) {
    case 404:
      res.render('404');
      break;
    case 505:
      res.render('505');
      break;
    default:
      res.render('505');
      break;
  }
}

function prepareForListing(obj) {
  // Takes a package and prepares it for the short-form listing.
  // Simplifying it's structure and ensuring data accuracy
  return new Promise((resolve, reject) => {
    let packList = [];

    for (let i = 0; i < obj.length; i++) {
      try {
        let pack = {};

        pack.name = obj[i].name ? obj[i].name : "";
        pack.description = obj[i].metadata.description ? obj[i].metadata.description : "";
        pack.keywords = obj[i].metadata.keywords ? obj[i].metadata.keywords : [ "no-keywords" ];
        pack.author = findAuthorField(obj[i]);
        pack.downloads = obj[i].downloads ? obj[i].downloads : 0;
        pack.stars = obj[i].stargazers_count ? obj[i].stargazers_count : 0;

        // Cleanup the data
        pack.stars = Number(pack.stars).toLocaleString();
        pack.downloads = Number(pack.downloads).toLocaleString();

        packList.push(pack);
      } catch(err) {
        console.log(err);
        console.log("Error Caused by:");
        console.log(obj[i]);
        reject(err);
      }
    }

    resolve(packList);
  });
}

function prepareForDetail(obj) {
  return new Promise((resolve, reject) => {
    let pack = {};

    pack.name = obj.name ? obj.name : "";
    pack.description = obj.metadata.description ? obj.metadata.description : "";
    pack.keywords = obj.metadata.keywords ? obj.metadata.keywords : [];
    pack.author = findAuthorField(obj);
    pack.downloads = obj.downloads ? obj.downloads : 0;
    pack.stars = obj.stargazers_count ? obj.stargazers_count : 0;
    pack.license = obj.metadata.license ? obj.metadata.license : "";
    pack.version = obj.metadata.version ? obj.metadata.version : "";
    pack.repoLink = obj.metadata.repository ? obj.metadata.repository : (typeof obj.metadata.repository === "object" ? obj.metadata.repository.url : "");

    // Since filters are rendered at compile time they won't work the way I'd hoped to display
    // Markdown on the page, by using the `markdown-it` filter.
    // So the best method will likely be to instead provide the `readme` key as straight HTML.
    pack.readme = md.render(obj.readme);

    // Then we want to do some cleanup on these final values. Mostly ensuring numbers look pretty enough
    pack.stars = Number(pack.stars).toLocaleString();
    pack.downloads = Number(pack.downloads).toLocaleString();

    resolve(pack);
  });
}

function findAuthorField(obj) {
  let author = "";
  if (typeof obj.metadata.author === "string") {
    author = obj.metadata.author;
  } else if (typeof obj.metadata.author === "object" && obj.metadata.author.hasOwnProperty("name")) {
    author = obj.metadata.author.name;
  } else {
    // If no standards are found, lets instead use the name pulled from the repo.
    author = "repository-field";
  }

  return author;
}

module.exports = {
  displayError,
  prepareForListing,
  prepareForDetail,
};
