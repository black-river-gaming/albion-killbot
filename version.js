const child_process = require('child_process');
const { projects } = require("./package.json");

for (const project of projects) {
  child_process.execSync(`cd ${project} && npm version ${process.env.npm_package_version} --no-git-commit-tag && git add package*.json`);
}
