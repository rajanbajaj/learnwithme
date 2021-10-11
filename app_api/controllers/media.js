const mongoose = require('mongoose');
const fs = require('fs');
const mediaUtils = require('../utils').Media;
const path = require('path');
const logger = require('../../logger');

const Media = mongoose.model('Media');
const MediaGroup = mongoose.model('MediaGroup');

const sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.countMedia = function(req, res) {
  Media.countDocuments({}).exec(function(err, count) {
    if (err) { // mongoose returned error
      sendJsonResponse(res, 404, err);
      return;
    }

    // cache member data for 3600 secs
    // client.set(req.params.memberId, JSON.stringify(data.toJSON()), 'EX', 3600);

    sendJsonResponse(res, 200, count);
  });
};

module.exports.countMediaGroup = function(req, res) {
  MediaGroup.count({}).exec(function(err, count) {
    if (err) { // mongoose returned error
      sendJsonResponse(res, 404, err);
      return;
    }

    // cache member data for 3600 secs
    // client.set(req.params.memberId, JSON.stringify(data.toJSON()), 'EX', 3600);

    sendJsonResponse(res, 200, count);
  });
};

module.exports.readMediaGroup = function(req, res) {
  const limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
  const start = req.query.start ? Math.max(0, req.query.start) : 0;

  MediaGroup.find()
      .skip(start)
      .limit(limit)
      .sort({
        updatedAt: 'desc',
      })
      .exec(function(err, data) {
        if (!data) { // mongoose does not return data
          sendJsonResponse(res, 404, {'message': 'MediaGroup not found'});
          return;
        } else if (err) { // mongoose return error
          sendJsonResponse(res, 404, err);
          return;
        }

        sendJsonResponse(res, 200, {
          '_expandable': [],
          '_links': {
            base: req.headers.host,
            self: '/api/media-group?start=' + String(start) + '&limit=' + limit,
            prev: '/api/media-group?start=' + (start-limit>=0 ? String((start-limit)) : '0') + '&limit=' + limit,
            next: '/api/media-group?start=' + String(start+limit) + '&limit=' + limit,
          },
          'limit': limit,
          'size': data.length,
          'start': start,
          'results': data,
        });
      });
};

module.exports.createMediaGroup = function(req, res, next) {
  if (req.body && req.body.name && req.body.path) {
    // create dir in system
    // note path should start and end with '/'
    const dir = mediaUtils.getFinalDirectoryPath(req.body.path + req.body.name);
    if (!fs.existsSync(dir)) {
      fs.mkdir(dir, {recursive: true}, (err) => {
        if (err) {
          logger.error(JSON.stringify(err));
        }
        MediaGroup.create({
          name: req.body.name,
          path: req.body.path,
          attributes: {
            readOnly: false,
            hidden: false,
          },
          security: {
            group: [],
            owner: req.body.owner ? req.body.owner : '',
            permissions: 'd777',
          },
        }, function(err, data) {
          if (err) {
            // delete dir

            sendJsonResponse(res, 400, err);
          } else {
            logger.info('Directory created!');
            sendJsonResponse(res, 201, data);
          }
        });
      });
    } else {
      sendJsonResponse(res, 200, {'message': 'Directory already exists.'});
      logger.warn('Directory already exists.');
    }
  } else {
    sendJsonResponse(res, 400, {'message': 'Unable to parase request body!'});
  }
};

// only updates meta and location of media
module.exports.updateMediaGroup = function(req, res, next) {
  if (req.params && req.params.mediaGroupId ) {
    Media.findById(req.params.mediaId).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'mediaId not found'});
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      const name = req.body.name ? req.body.name : data.name;
      const path = req.body.path ? req.body.path : data.path;
      const pathFlag = (path === data.path);
      const nameFlag = (name === data.name);

      if (!pathFlag || !nameFlag) {
        const dir = mediaUtils.getFinalDirectoryPath(path + name);
        if (!fs.existsSync(dir)) {
          fs.mkdir(dir, {recursive: true}, (err) => {
            if (err) {
              logger.error(JSON.stringify(err));
            }

            // recurisively move files
            // Loop through all the files in the temp directory
            const moveFrom = mediaUtils.getFinalDirectoryPath(data.path + data.name);
            const moveTo = mediaUtils.getFinalDirectoryPath(path + name);
            fs.readdir(moveFrom, function(err, files) {
              if (err) {
                logger.error('Could not list the directory.');
                process.exit(1);
              }

              files.forEach(function(file, index) {
                // Make one pass and make the file complete
                const fromPath = path.join(moveFrom, file);
                const toPath = path.join(moveTo, file);

                fs.stat(fromPath, function(error, stat) {
                  if (error) {
                    logger.error('Error stating file.');
                    return;
                  }

                  if (stat.isFile()) {
                    logger.info('\'%s\' is a file.', fromPath);
                  } else if (stat.isDirectory()) {
                    logger.info('\'%s\' is a directory.', fromPath);
                  }

                  fs.rename(fromPath, toPath, function(error) {
                    if (error) {
                      logger.error('File moving error.');
                    } else {
                      logger.info('Moved file \'%s\' to \'%s\'.', fromPath, toPath);
                    }
                  });
                });
              });
            });

            // delete old folder
            fs.rmdir(moveFrom, {recursive: true}, (err) => {
              if (err) {
                logger.error(JSON.stringify(err));
              }
              logger.info(`${moveFrom} is deleted!`);
            });

            data.update({name: name, path: path}, function(err, data) {
              if (err) {
                sendJsonResponse(res, 404, err);
              }
              sendJsonResponse(res, 200, data);
            });
          });
        } else {
          // folder unique validation error
          sendJsonResponse(res, 200, {'message': 'Directory already exists.'});
          logger.warn('Directory already exists.');
        }
      }
    });
  } else {
    sendJsonResponse(res, 400, {'message': 'Unable to parse params!'});
  }
};

module.exports.deleteMediaGroup = function(req, res, next) {
  if (req.params && req.params.mediaGroupId ) {
    MediaGroup.findById(req.params.mediaGroupId).exec(function(err, data) {
      if (data) {
        const dir = mediaUtils.getFinalDirectoryPath(data.path + data.name);

        // TODO: delete related media

        // delete media folder recursively
        fs.rmdir(dir, {recursive: true}, (err) => {
          if (err) {
            logger.error(`${dir} ERR! :: ` + JSON.stringify(err));
          }
          logger.info(`${dir} is deleted!`);
        });
      }
    });

    MediaGroup.findByIdAndRemove(req.params.mediaGroupId).exec(function(err, data) {
      if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }
      sendJsonResponse(res, 204, null);
    });
  } else {
    sendJsonResponse(res, 400, {'message': 'Unable to parse params!'});
  }
};

module.exports.readMedia = function(req, res) {
  const limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
  const start = req.query.start ? Math.max(0, req.query.start) : 0;

  Media.find()
      .skip(start)
      .limit(limit)
      .sort({
        updatedAt: 'desc',
      })
      .exec(function(err, data) {
        if (!data) { // mongoose does not return data
          sendJsonResponse(res, 404, {'message': 'Media not found'});
          return;
        } else if (err) { // mongoose return error
          sendJsonResponse(res, 404, err);
          return;
        }

        sendJsonResponse(res, 200, {
          '_expandable': [],
          '_links': {
            base: req.headers.host,
            self: '/api/media?start=' + String(start) + '&limit=' + limit,
            prev: '/api/media?start=' + (start-limit>=0 ? String((start-limit)) : '0') + '&limit=' + limit,
            next: '/api/media?start=' + String(start+limit) + '&limit=' + limit,
          },
          'limit': limit,
          'size': data.length,
          'start': start,
          'results': data,
        });
      });
};

module.exports.readMediaByMediaGroupId = function(req, res) {
  const limit = req.query.limit ? Math.max(0, req.query.limit) : 10;
  const start = req.query.start ? Math.max(0, req.query.start) : 0;
  const expand = req.query.expand ? req.query.expand.split(",") : [];

  Media.find({mediaGroup: req.params.mediaGroupId})
  .skip(start)
  .limit(limit)
  .sort({
    updatedAt: 'desc',
  })
  .exec(function(err, data) {
    if (!data) { // mongoose does not return data
      sendJsonResponse(res, 404, {'message': 'Media not found'});
      return;
    } else if (err) { // mongoose return error
      sendJsonResponse(res, 404, err);
      return;
    }
    
    MediaGroup.findById(req.params.mediaGroupId).exec(function(err, mediaGroupData) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'mediaGroupId not found'});
        return;
      } else if (err) { // mongoose returned error
        sendJsonResponse(res, 404, err);
        return;
      }
  
      // cache member data for 3600 secs
      // client.set(req.params.postId, JSON.stringify(data.toJSON()), 'EX', 3600);
  
      // embed links to media
      for (let index = 0; index < data.length; index++) {
        data[index] = { _embedded: `http://${req.headers.host}${mediaGroupData.path}${mediaGroupData.name}/${data[index].filename}`, ...(data[index].toJSON())};
      }

      let mediaGroupExpandIndex = expand.indexOf("mediaGroup");    
      let payload = {
        '_expandable': expand,
        '_links': {
          base: `http://${req.headers.host}`,
          self: `http://${req.headers.host}/api/${req.params.mediaGroupId}/media?start=` + String(start) + '&limit=' + limit,
          prev: `http://${req.headers.host}/api/${req.params.mediaGroupId}/media?start=` + (start-limit>=0 ? String((start-limit)) : '0') + '&limit=' + limit,
          next: `http://${req.headers.host}/api/${req.params.mediaGroupId}/media?start=` + String(start+limit) + '&limit=' + limit,
        },
        'limit': limit,
        'size': data.length,
        'start': start,
        'results': data,
      }

      // update expand array based on needs
      if (mediaGroupExpandIndex !== -1) {
        expand.splice(mediaGroupExpandIndex, 1);
        payload._expandable = expand;
        payload.mediaGroup = mediaGroupData;
      }

      sendJsonResponse(res, 200, payload);
    });
  });
};

module.exports.createMedia = function(req, res, next) {
  if (req.file && req.params.mediaGroupId) {
    Media.create({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mediaGroup: req.params.mediaGroupId,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      attributes: {
        readOnly: false,
        hidden: false,
      },
      security: {
        group: [],
        owner: '',
        permissions: '-777',
      },
    }, function(err, data) {
      if (err) {
        sendJsonResponse(res, 400, err);
      } else {
        sendJsonResponse(res, 201, data);
      }
    });
  } else {
    sendJsonResponse(res, 400, {'message': `Unable to parse params! :: ${req.params.mediaGroupId}`});
  }
};

// only updates meta and location of media
module.exports.updateMedia = function(req, res, next) {
  if (req.params && req.params.mediaId ) {
    // Update media meta
    // if mediaGroup changed then move media to that folder
    Media.findById(req.params.mediaId).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'mediaId not found'});
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      const filename = req.body.filename ? req.body.filename : data.filename;
      const mediaGroup = req.body.mediaGroupId ? req.body.mediaGroupId : data.mediaGroup;
      const filenameFlag = (filename === data.filename);
      const mediaGroupFlag = (mediaGroup === data.mediaGroup);

      if (!filenameFlag || !mediaGroupFlag) {
        let moveFromDir = null;
        let moveToDir = null;
        MediaGroup.findById(data.mediaGroup).exec(function(e, d) {
          if (!d) { // mongoose does not return data
            sendJsonResponse(res, 404, {'message': 'mediaGroupId not found'});
            return;
          } else if (e) {
            sendJsonResponse(res, 404, e);
            return;
          }
          moveFromDir = mediaUtils.getFinalDirectoryPath(d.path + d.name);

          if (!mediaGroupFlag) {
            MediaGroup.findById(req.body.mediaGroupId).exec(function(e, d) {
              if (!d) { // mongoose does not return data
                sendJsonResponse(res, 404, {'message': 'mediaGroupId not found'});
                return;
              } else if (e) {
                sendJsonResponse(res, 404, e);
                return;
              }
              moveToDir = mediaUtils.getFinalDirectoryPath(d.path + d.name);
              if (moveFromDir && moveToDir) {
                const fromPath = path.join(moveFromDir, data.filename);
                const toPath = path.join(moveToDir, filename);

                fs.rename(fromPath, toPath, function(error) {
                  if (error) {
                    logger.error('File moving error.');
                  } else {
                    logger.info('Moved file \'%s\' to \'%s\'.', fromPath, toPath);
                    data.update({filename: filename, mediaGroup: mediaGroup}, function(err, data) {
                      if (err) {
                        sendJsonResponse(res, 404, err);
                      } else {
                        sendJsonResponse(res, 200, data);
                      }
                    });
                  }
                });
              } else {
                sendJsonResponse(res, 400, [mediaGroupFlag, filenameFlag, moveFromDir, moveToDir]);
              }
            });
          } else {
            moveToDir = moveFromDir;
            if (moveFromDir && moveToDir) {
              const fromPath = path.join(moveFromDir, data.filename);
              const toPath = path.join(moveToDir, filename);

              fs.rename(fromPath, toPath, function(error) {
                if (error) {
                  logger.error('File moving error.');
                } else {
                  logger.info('Moved file \'%s\' to \'%s\'.', fromPath, toPath);
                  data.update({filename: filename, mediaGroup: mediaGroup}, function(err, data) {
                    if (err) {
                      sendJsonResponse(res, 404, err);
                    } else {
                      sendJsonResponse(res, 200, data);
                    }
                  });
                }
              });
            } else {
              sendJsonResponse(res, 400, [mediaGroupFlag, filenameFlag, moveFromDir, moveToDir]);
            }
          }
        });
      } else {
        sendJsonResponse(res, 200, {'message': 'OK'});
      }
    });
  } else {
    sendJsonResponse(res, 400, {'message': 'Unable to parse params!'});
  }
};

module.exports.deleteMedia = function(req, res, next) {
  if (req.params && req.params.mediaId ) {
    let filePath = null;

    Media.findById(req.params.mediaId).exec(function(err, data) {
      if (!data) { // mongoose does not return data
        sendJsonResponse(res, 404, {'message': 'Media not found'});
        return;
      } else if (err) { // mongoose return error
        sendJsonResponse(res, 404, err);
        return;
      }

      if (data.mediaGroup) {
        MediaGroup.findById(data.mediaGroup).exec(function(e, d) {
          if (!d) { // mongoose does not return data
            sendJsonResponse(res, 404, {'message': 'Media not found'});
            return;
          } else if (e) { // mongoose return error
            sendJsonResponse(res, 404, e);
            return;
          }

          filePath = mediaUtils.getFinalDirectoryPath(d.path + d.name);
          filePath = path.join(filePath, data.filename);

          Media.findByIdAndRemove(req.params.mediaId).exec(function(err, data) {
            if (err) {
              sendJsonResponse(res, 404, err);
              return;
            }

            // delete media file from folder
            fs.rm(filePath, {recursive: false}, (err) => {
              if (err) {
                logger.info(`${filePath} ERR! :: ` + JSON.stringify(err));
              }
              logger.info(`${filePath} is deleted!`);
            });


            sendJsonResponse(res, 204, null);
          });
        });
      } else {
        // delete media entry from db
        Media.findByIdAndRemove(req.params.mediaId).exec(function(err, data) {
            if (err) {
              sendJsonResponse(res, 404, err);
              return;
            }
            sendJsonResponse(res, 204, null);
          });
      }
    });
  } else {
    sendJsonResponse(res, 400, {'message': 'Unable to parse params!'});
  }
};
