"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _application = _interopRequireDefault(require("./application"));

var _media = _interopRequireDefault(require("../controllers/media"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DefaultMediaReceiver extends _application.default {
  constructor(client, session) {
    super(client, session);
    this.APP_ID = 'CC1AD845';
    /**
     * Media controller
     * @type {MediaController}
     */

    this.media = this.createController(_media.default);
    const self = this;

    function onDisconnect() {
      self.emit('close');
    }

    function onStatus(status) {
      self.emit('status', status);
    }

    function onClose() {
      self.media.removeListener('disconnect', onDisconnect);
      self.media.removeListener('status', onStatus);
      self.media.close();
      self.media = undefined;
    }

    this.media.on('status', onStatus);
    this.once('close', onClose);
    this.media.on('disconnect', onDisconnect);
  }
  /**
   * Get the status
   * @returns {Promise}
   */


  getStatus() {
    return this.media.getStatus();
  }
  /**
   * Load a media object
   * @param {Object} media - Media to load
   * @param {Object} [options = {}] - Options
   * @returns {Promise}
   */


  load(media, options = {}) {
    return this.media.load(media, options);
  }
  /**
   * Play the media
   * @returns {Promise}
   */


  play() {
    return this.media.play();
  }
  /**
   * Pause the media
   * @returns {Promise}
   */


  pause() {
    return this.media.pause();
  }
  /**
   * Stop the media
   * @returns {Promise}
   */


  stop() {
    return this.media.stop();
  }
  /**
   * Seek through the media
   * @param {number} currentTime - Time to seek to
   */


  seek(currentTime) {
    return this.media.seek(currentTime);
  }
  /**
   * Load a queue of items to play (playlist)
   * @see https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.QueueLoadRequest
   * @param {Object[]} items - Items to load into the queue
   * @param {Object} options - Options
   * @returns {Promise}
   */


  queueLoad(items, options = {}) {
    return this.media.queueLoad(items, options);
  }
  /**
   * Insert items into the queue
   * @param {Object[]} items - Items to insert
   * @param {Object} options - Options
   * @returns {Promise}
   */


  queueInsert(items, options = {}) {
    return this.media.queueInsert(items, options);
  }
  /**
   * Remove items from the queue
   * @param {String[]} itemIds - IDs to remove
   * @param {Object} options - Options
   * @returns {Promise}
   */


  queueRemove(itemIds, options = {}) {
    return this.media.queueRemove(itemIds, options);
  }
  /**
   * Reorder the queue
   * @param {String[]} itemIds - IDs to reorder
   * @param {Object} options - Options
   * @returns {Promise}
   */


  queueReorder(itemIds, options = {}) {
    return this.media.queueReorder(itemIds, options);
  }
  /**
   * Update the queue
   * @param {Object[]} items - Items
   * @param {Object} options - Options
   * @returns {Promise}
   */


  queueUpdate(items, options = {}) {
    return this.media.queueUpdate(items, options);
  }

}

DefaultMediaReceiver.APP_ID = 'CC1AD845';
var _default = DefaultMediaReceiver;
exports.default = _default;