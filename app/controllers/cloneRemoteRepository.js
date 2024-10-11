const axios = require("axios");
const dotenv = require("dotenv");
const createGitDirectory = require("./createGitDirectory");
const addBlobToRepo = require("./addBlob.localRepo");
const commitTreeObject = require("./commitTreeObject");
const addTreeToRepo = require("./addTreeToRepo");
dotenv.config();
function getAuthToken() {
  return process.env.GITHUB_TOKEN;
}

/**
 *
 * @param {string} url
 * @returns {Promise<object>} Data from the API
 */
async function getData(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${getAuthToken()}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return response.data;
  } catch (err) {
    console.error(err);
  }
  //   usefullKeys = [
  //     "name",
  //     "tags_url",
  //     "blobs_url",
  //     "trees_url",
  //     "commits_url",
  //     "default_branch",
  //     "contents_url",
  //   ];
  //   usefullKeys.forEach((key) => {
  // console.log(key, metadata.data[key]);
  //   });
}

/**
 *
 * @param {*} commitSha
 * @param {*} repoUrl
 * @returns {Promise<object>} Tree object
 */
async function fetchTree(commitSha, repoUrl) {
  const treeUrl = `${repoUrl}/git/trees/${commitSha}`;
  return await getData(treeUrl);
}

/**
 *
 * @param {string} blobUrl
 * @returns {Promise<string>} Decoded content of the blob
 */
async function fetchBlobContent(blobUrl) {
  try {
    const blob = await getData(blobUrl);
    const decodedContent = Buffer.from(blob.content, "base64").toString(
      "utf-8"
    );
    return decodedContent;
  } catch (error) {
    console.error(`Error fetching blob ${blobUrl}:`);
  }
}

// async function processTree(tree, repoUrl) {
//   if (!tree || !tree.tree) {
//     console.error("Invalid tree structure:");
//     return;
//   }

//   const treeEntries = []; // Array to hold entries for the tree

//   for (const item of tree.tree) {
//     if (item.type === "blob") {
//       const blobUrl = `${repoUrl}/git/blobs/${item.sha}`;
//       const blobContent = await fetchBlobContent(blobUrl);
//       await addBlobToRepo(blobContent, item.path);
//       treeEntries.push({ type: "blob", sha: item.sha, path: item.path });
//     } else if (item.type === "tree") {
//       console.log(`Processing sub-tree: ${item.path}`);
//       const treeUrl = `${repoUrl}/git/trees/${item.sha}`;
//       const subTreeData = await getData(treeUrl);
//       const subTreeSHA = await processTree(subTreeData, repoUrl);
//       treeEntries.push({ type: "tree", sha: subTreeSHA, path: item.path });
//     }
//   }

//   // Add the collected entries as a new tree object
//   const treeSHA = await addTreeToRepo(treeEntries);
//   return treeSHA; // Return the SHA of the created tree object
// }

/**
 *
 * @param {*} tree
 * @param {*} repoUrl
 * @returns {Promise<void>}
 */
async function processTree(tree, repoUrl) {
  if (!tree || !tree.tree) {
    console.error("Invalid tree structure:");
    return;
  }

  const treeEntries = [];
  const promises = [];

  for (const item of tree.tree) {
    if (item.type === "blob") {
      const blobUrl = `${repoUrl}/git/blobs/${item.sha}`;
      const promise = fetchBlobContent(blobUrl)
        .then(blobContent => {
          return addBlobToRepo(blobContent, item.path).then(() => {
            treeEntries.push({ type: "blob", sha: item.sha, path: item.path });
          });
        })
        .catch(error => {
          console.error(`Error fetching blob ${item.sha}:`, error.message);
        });
      promises.push(promise);
    } else if (item.type === "tree") {
      console.log(`Processing sub-tree: ${item.path}`);
      const treeUrl = `${repoUrl}/git/trees/${item.sha}`;
      const promise = getData(treeUrl)
        .then(subTreeData => {
          return processTree(subTreeData, repoUrl).then(subTreeSHA => {
            treeEntries.push({ type: "tree", sha: subTreeSHA, path: item.path });
          });
        })
        .catch(error => {
          console.error(`Error fetching tree ${item.sha}:`, error.message);
        });
      promises.push(promise);
    }
  }
  await Promise.all(promises);
  const treeSHA = await addTreeToRepo(treeEntries);
  return treeSHA;
}

/**
 *
 * @param {*} trees
 * @param {*} repoUrl
 */
async function fetchTreeContents(trees, repoUrl) {
  for (const tree of trees) {
    console.log(`Tree SHA: ${tree.sha}`);
    await processTree(tree, repoUrl);
  }
}

/**
 *
 * @param {*} url
 * @returns {Promise<void>}
 */
const cloneRemoteRepository = async (url) => {
  const userName = url.split("/")[3];
  const repoName = url.split("/")[4].split(".")[0];
  repoUrl = `https://api.github.com/repos/${userName}/${repoName}`;
  // const alldata = await getData(repoUrl);

  createGitDirectory();

  // Gettting the commits
  const commitsUrl = `${repoUrl}/commits`;
  const commits = await getData(commitsUrl);
  const allCommitsArray = [];
  // Store the commits in local repo
  commits.map((c) =>
    allCommitsArray.push({
      sha: c.sha,
      treeSHA: c.commit.tree.sha,
      message: c.commit.message,
      date: c.commit.committer.date,
      parent: c.parents.map((p) => p.sha),
      author: c.commit.author.name,
    })
  );
  for (const commit of allCommitsArray) {
    const treeSHA = commit.treeSHA;
    const parentCommitSHAs = commit.parent;
    const message = commit.message;
    const author = commit.author;
    commitTreeObject(treeSHA, parentCommitSHAs, message, `${author} <${commit.email}>`, commit.date);
  }

  //Getting ---> tree contains the sha of the tree object and sha of parent commit object and sha of the blobs

  let trees = [];
  for (const commit of commits) {
    let tree = await fetchTree(commit.sha, repoUrl);
    trees.push(tree);
  }
  // console.log(JSON.stringify(trees, null, 2));
  // process the treesand get the tree contents
  fetchTreeContents(trees, repoUrl);
};

module.exports = cloneRemoteRepository;