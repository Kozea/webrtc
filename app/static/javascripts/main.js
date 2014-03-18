// Generated by CoffeeScript 1.6.3
(function() {
  var BinaryChannel, RTCTest, TextChannel, chat, file_receiver, files, make_progress, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  chat = function(text, type) {
    var $sb;
    if (type == null) {
      type = 'text';
    }
    $sb = $('.scrollback');
    $sb.append($('<div>')[type](text));
    return $sb.stop(true, true).animate({
      scrollTop: $sb.prop('scrollHeight') - $sb.height()
    });
  };

  file_receiver = null;

  files = [];

  make_progress = function(text, max) {
    var $progress;
    $('.progresses').append($('<tr>').append($('<td>').text(text), $('<td>').append($progress = $('<progress>', {
      max: max
    }))));
    return $progress;
  };

  TextChannel = (function(_super) {
    __extends(TextChannel, _super);

    function TextChannel() {
      _ref = TextChannel.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TextChannel.prototype.open = function() {
      var $input,
        _this = this;
      TextChannel.__super__.open.apply(this, arguments);
      return $input = $('input[name=local]').attr('disabled', null).on('keyup', function(e) {
        if (e.keyCode === 13 && $input.val()) {
          _this.send('CHAT', $input.val());
          chat('me   < ' + $input.val());
          return $input.val('');
        }
      });
    };

    TextChannel.prototype.CHAT = function(message) {
      return chat('peer > ' + message);
    };

    TextChannel.prototype.ACK = function() {
      var file;
      if (!files.length) {
        return;
      }
      file = files[0];
      return this.send("FILE|" + file.size + "," + file.type + "," + file.name);
    };

    TextChannel.prototype.ACCEPT = function() {
      var $progress, file;
      if (!files.length) {
        return;
      }
      file = files[0];
      $progress = make_progress("Sending " + file.name, 100);
      return new ShoRTCutHelpers.prototype.FileSender(file, this.rtc.peer.binary_channel.send.bind(this.rtc.peer.binary_channel), function() {
        files.shift();
        return chat("File sent.");
      }, function(p) {
        return $progress.val(p);
      });
    };

    TextChannel.prototype.FILE = function(message) {
      var $progress, FileReceiver, args, name, size, type,
        _this = this;
      args = message.split(',');
      size = +args.shift();
      type = args.shift();
      name = args.join(',');
      $progress = make_progress("Receiving " + name, size);
      FileReceiver = ShoRTCutHelpers.prototype.getFileReceiver();
      return file_receiver = new FileReceiver(name, size, type, function() {
        chat("Receiving file " + name + " " + (ShoRTCutHelpers.prototype.bytes(size)));
        return _this.send("ACCEPT");
      }, function() {
        chat("peer > File: <a href=\"" + (file_receiver.url()) + "\" download=\"" + file_receiver.name + "\">" + file_receiver.name + "</a>", 'html');
        _this.send('CHAT', "File received ! (received " + (ShoRTCutHelpers.prototype.bytes(file_receiver.size)) + ")");
        file_receiver = null;
        return _this.send('ACK');
      }, function(p) {
        return $progress.val(p);
      });
    };

    TextChannel.prototype.close = function() {
      TextChannel.__super__.close.apply(this, arguments);
      return $('input[name=local]').attr('disabled', 'disabled').off('keyup');
    };

    return TextChannel;

  })(ShoRTCut.prototype.TextChannel);

  BinaryChannel = (function(_super) {
    __extends(BinaryChannel, _super);

    function BinaryChannel() {
      _ref1 = BinaryChannel.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    BinaryChannel.prototype.open = function() {
      var _this = this;
      BinaryChannel.__super__.open.apply(this, arguments);
      return $('.filedrop').addClass('active').on('dragover', function(e) {
        $(this).addClass('hover');
        e = e.originalEvent;
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        return false;
      }).on('dragleave', function(e) {
        return $(this).removeClass('hover');
      }).on('drop', function(e) {
        var file, _i, _len, _ref2;
        if (!$('.filedrop').hasClass('active')) {
          return;
        }
        $('.filedrop').removeClass('hover').removeClass('active');
        setTimeout(function() {
          return $('.filedrop').addClass('active');
        }, 500);
        e = e.originalEvent;
        e.stopPropagation();
        e.preventDefault();
        _ref2 = e.dataTransfer.files;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          file = _ref2[_i];
          if (__indexOf.call(files, file) < 0) {
            files.push(file);
          }
        }
        if (files.length && files.length === e.dataTransfer.files.length) {
          file = files[0];
          _this.rtc.peer.text_channel.send("FILE|" + file.size + "," + file.type + "," + file.name);
        }
        return false;
      });
    };

    BinaryChannel.prototype.binary = function(part) {
      return file_receiver != null ? file_receiver.add(part) : void 0;
    };

    BinaryChannel.prototype.close = function() {
      BinaryChannel.__super__.close.apply(this, arguments);
      return $('.filedrop').removeClass('active').off('dragover').off('dragleave').off('drop');
    };

    return BinaryChannel;

  })(ShoRTCut.prototype.BinaryChannel);

  RTCTest = (function(_super) {
    __extends(RTCTest, _super);

    function RTCTest() {
      RTCTest.__super__.constructor.apply(this, arguments);
      this.TextChannel = TextChannel;
      this.BinaryChannel = BinaryChannel;
    }

    RTCTest.prototype.assign_local_stream_url = function(url) {
      chat('Local video connected');
      return $('video.local').attr('src', url);
    };

    RTCTest.prototype.assign_remote_stream_url = function(url) {
      chat('Remote video connected');
      return $('video.remote').attr('src', url);
    };

    RTCTest.prototype.reset = function() {
      RTCTest.__super__.reset.apply(this, arguments);
      chat('--');
      chat('Reset');
      return chat('--');
    };

    RTCTest.prototype.caller = function() {
      return $('h1').text('shoRTCut - caller');
    };

    RTCTest.prototype.callee = function() {
      return $('h1').text('shoRTCut - callee');
    };

    return RTCTest;

  })(ShoRTCut);

  $(function() {
    var debug, options, rtctest;
    options = window.options;
    debug = options != null ? options.debug : void 0;
    rtctest = new RTCTest({
      turn: {
        server: options.turn_server,
        username: options.turn_username,
        password: options.turn_password
      },
      debug: debug,
      host: location.host,
      path: location.pathname
    });
    rtctest.start();
    chat('Connecting...');
    return window.rtc = rtctest;
  });

}).call(this);
