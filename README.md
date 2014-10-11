# upyun-multipart-upload
使用 HTML 5 相关 API 开发的分块上传 SDK

## Install

```sh
$ bower install --save upyun-multipart-upload
```

## Usage

eg:

```js
document.getElementById('submit').onclick = function() {
    var ext = '.' + document.getElementById('file').files[0].name.split('.').pop();
    var instance = new Sand('demonstration', '1+JY2ZqD5UVfw6hQ8EesYQO50Wo=', parseInt((new Date().getTime() + 3600000) / 1000));
    var options = {
        'notify_url': 'http://upyun.com'
    };

    instance.setOptions(options);
    instance.upload('/upload/test' + parseInt((new Date().getTime() + 3600000) / 1000) + ext);
};
```


## API

### 构建实例
```js
new Sand(bucket, form_api_secret, expiration);
```

__参数说明__

* `bucket`: 空间名称
* `form_api_secret`: 表单 API 密钥
* `expiration`: 上传请求过期时间（单位为：`秒`）

### 设置额外上传参数

```js
instance.setOptions(options)
```
__参数说明__

* `options`: Object 类型，包含额外的上传参数（详情见 [表单 API Policy](http://docs.upyun.com/api/form_api/#可选参数)）

## 上传
```js
instance.upload(path)
```

__参数说明__

* `path`: 文件在空间中的存放路径