(function() {
'use strict';
    /**
     *
     *  Base64 encode / decode
     *  http://www.webtoolkit.info/
     *
     */
    var Base64 = {
      // private property
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        // public method for encoding
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = Base64._utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },
        // public method for decoding
        decode : function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = Base64._utf8_decode(output);
            return output;
        },
        // private method for UTF-8 encoding
        _utf8_encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },
        // private method for UTF-8 decoding
        _utf8_decode : function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while ( i < utftext.length ) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    };
    var _config = {
        api: '//m0.api.upyun.com/',
        chunkSize: 1048576
    };

    function _extend(dst, src) {
        for (var i in src) {
            dst[i] = src[i];
        }
    }

    function sortPropertiesByKey(obj) {
        var keys = [];
        var sorted_obj = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        keys.sort();
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            sorted_obj[k] = obj[k];
        }
        return sorted_obj;
    }

    function calcSign(data, secret) {
        if (typeof data !== 'object') {
            return;
        }
        var sortedData = sortPropertiesByKey(data);
        var md5Str = '';
        for (var key in sortedData) {
            if (key !== 'signature') {
                md5Str = md5Str + key + sortedData[key];
            }
        }
        var sign = SparkMD5.hash(md5Str + secret);
        return sign;
    }

    function formatParams(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        return arr.join("&");
    }

    function checkBlocks(arr) {
        var indices = [];
        var idx = arr.indexOf(0);
        while (idx != -1) {
            indices.push(idx);
            idx = arr.indexOf(0, idx + 1);
        }
        return indices;
    }


    function upload(path, fileSelector) {
        var self = this;
        var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
        var chunkSize = _config.chunkSize;
        var chunks;

        async.waterfall([

            function(callback) {
                var chunkInfo = {
                    chunksHash: {}
                };
                var files;
                if(fileSelector === void 0) {
                    files = document.getElementById('file').files;
                } else {
                    files = document.querySelector(fileSelector).files;
                }
                if (!files.length) {
                    console.log('no file is selected');
                    return;
                }
                var file = files[0];
                chunks = Math.ceil(file.size / chunkSize);
                if(!file.slice) {
                  chunkSize = file.size;
                  chunks = 1;
                }
                var currentChunk = 0;
                var spark = new SparkMD5.ArrayBuffer();
                var frOnload = function(e) {
                    chunkInfo.chunksHash[currentChunk] = SparkMD5.ArrayBuffer.hash(e.target.result);
                    spark.append(e.target.result);
                    currentChunk++;
                    if (currentChunk < chunks) {
                        loadNext();
                    } else {
                        chunkInfo.entire = spark.end();
                        chunkInfo.chunksNum = chunks;
                        chunkInfo.file_size = file.size;
                        callback(null, chunkInfo);
                        return;
                    }
                };
                var frOnerror = function() {
                    console.warn("oops, something went wrong.");
                };

                function loadNext() {
                    var fileReader = new FileReader();
                    fileReader.onload = frOnload;
                    fileReader.onerror = frOnerror;
                    var start = currentChunk * chunkSize,
                        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
                    var blobPacket = blobSlice.call(file, start, end);
                    fileReader.readAsArrayBuffer(blobPacket);
                }
                loadNext();
            },
            function(chunkInfo, callback) {
                var options = {
                    'path': path,
                    'expiration': _config.expiration,
                    'file_blocks': chunkInfo.chunksNum,
                    'file_size': chunkInfo.file_size,
                    'file_hash': chunkInfo.entire
                };
                var signature;

                _extend(options, self.options);

                if (self._signature) {
                    signature = self._signature;
                } else {
                    signature = calcSign(options, _config.form_api_secret);
                }
                var policy = Base64.encode(JSON.stringify(options));
                var paramsData = {
                    policy: policy,
                    signature: signature
                };
                var urlencParams = formatParams(paramsData);
                var request = new XMLHttpRequest();
                request.open('POST', _config.api + _config.bucket + '/');
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.onload = function(e) {
                    if (request.status == 200) {
                        if (JSON.parse(request.response).status.indexOf(0) < 0) {
                            return callback(new Error('file already exists'));
                        }

                        callback(null, chunkInfo, request.response);
                    } else {
                        request.send(urlencParams);
                    }
                };
                request.send(urlencParams);
            },
            function(chunkInfo, res, callback) {
                res = JSON.parse(res);

                var file;
                if(fileSelector === void 0) {
                    file = document.getElementById('file').files[0];
                } else {
                    file = document.querySelector(fileSelector).files[0];
                }
                var _status = res.status;
                var result;
                async.until(function() {
                    return checkBlocks(_status).length <= 0;
                }, function(callback) {
                    var idx = checkBlocks(_status)[0];
                    var start = idx * chunkSize,
                        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
                    var packet = blobSlice.call(file, start, end);

                    var options = {
                        'save_token': res.save_token,
                        'expiration': _config.expiration,
                        'block_index': idx,
                        'block_hash': chunkInfo.chunksHash[idx]
                    };

                    var signature = calcSign(options, res.token_secret);
                    var policy = Base64.encode(JSON.stringify(options));

                    var formDataPart = new FormData();
                    formDataPart.append('policy', policy);
                    formDataPart.append('signature', signature);
                    formDataPart.append('file', chunks === 1 ? file : packet);

                    var request = new XMLHttpRequest();
                    request.onreadystatechange = function(e) {
                        if (e.currentTarget.readyState === 4 && e.currentTarget.status == 200) {
                            _status = JSON.parse(e.currentTarget.response).status;
                            result = request.response;
                            setTimeout(function() {
                                return callback(null);
                            }, 0);
                        }
                    };
                    request.open('POST', _config.api + _config.bucket + '/', false);
                    request.send(formDataPart);

                }, function(err) {
                    if (err) {
                        callback(err);
                    }
                    callback(null, chunkInfo, result);
                });
            },
            function(chunkInfo, res, callback) {
                res = JSON.parse(res);

                var options = {
                    'save_token': res.save_token,
                    'expiration': _config.expiration
                };

                var signature = calcSign(options, res.token_secret);
                var policy = Base64.encode(JSON.stringify(options));
                var formParams = {
                    policy: policy,
                    signature: signature
                };
                var formParamsUrlenc = formatParams(formParams);
                var request = new XMLHttpRequest();
                request.open('POST', _config.api + _config.bucket + '/');
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.onload = function(e) {
                    if (request.status == 200) {
                        callback(null, request.response);
                    } else {
                        callback(null, request.response);
                    }
                };
                request.send(formParamsUrlenc);
            }
        ], function(err, res) {
            var event;
            if (err) {
                if (typeof CustomEvent === 'function') {
                    event = new CustomEvent('error', {
                        'detail': err
                    });
                    document.dispatchEvent(event);
                    return;
                } else {
                    //IE compatibility
                    event = document.createEvent("CustomEvent");
                    event.initCustomEvent("error", false, false, err);
                    document.dispatchEvent(event);
                    return;
                }
            }
            if(typeof CustomEvent === 'function') {
                event = new CustomEvent('uploaded', {
                    'detail': JSON.parse(res)
                });
                document.dispatchEvent(event);
            } else {
                //IE compatibility
                event = document.createEvent("CustomEvent");
                event.initCustomEvent("uploaded", false, false, JSON.parse(res));
                document.dispatchEvent(event);
            }
        });
    }

    function Sand(config) {
        _extend(_config, config);

        if(config.signature) {
            this._signature = config.signature;
        }

        this.setOptions = function(options) {
            this.options = options;
        };

        this.upload = upload;
    }

    // bind the construct fn. to global
    this.Sand = Sand;

}).call(this);
