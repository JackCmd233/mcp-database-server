const fs = require('fs');
const path = require('path');

const directoriesToRemove = [
  './docs/local-setup',
  './docs/playwright-web',
  './docs/playwright-api',
  './docs/testing-videos',
];

// 递归删除目录的函数
function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directoryPath);
    console.log(`Removed directory: ${directoryPath}`);
  }
}

// 删除每个目录
directoriesToRemove.forEach((directory) => {
  try {
    deleteFolderRecursive(directory);
  } catch (error) {
    console.error(`删除 ${directory} 时出错:`, error);
  }
});

console.log('清理完成!'); 