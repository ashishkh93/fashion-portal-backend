const multer = require('multer');

// local storage upload
const fileUpload = (req, res) => {
  const storage = multer.diskStorage({
    destination: (reqdes, filedes, cb) => {
      cb(null, './uploads/');
    },
    filename: (reqfile, file, cb) => {
      const nameSplitArr = file.originalname.split('.');
      const fileExtension = nameSplitArr[nameSplitArr.length - 1];
      file.name = `${`${nameSplitArr[0]}_${Date.now()}`}.${fileExtension}`;
      cb(null, file.name);
    },
  });
  return storage;
};

module.exports = fileUpload;
