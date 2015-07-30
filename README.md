# upyun-multipart-upload
使用 HTML 5 相关 API 开发的分块上传 DEMO


> 在您决定将本项目用于生产环境之前，请确保知晓如何保护表单密钥的安全性，以及本项目在部分低配设备上可能会有的兼容性和性能问题！


## 安装
你可以通过如下两种方式中任意一种引入本项目：

### 1.bower
```sh
$ bower install --save upyun-multipart-upload
```

### 2.直接下载
1.  下载本项目最新的 [Release](https://github.com/upyun/js-multipart-upload/releases/latest)
2.  下载依赖 [async](https://github.com/caolan/async/releases/latest)
3.  下载依赖 [SparkMD5](https://github.com/satazor/SparkMD5/releases/latest)
4.  通过 `<script src=""></script>` 标签以此引入文件，注意将依赖放在前面

```html
<script src="/path/to/spark-md5/spark-md5.js"></script>
<script src="/path/to/async/lib/async.js"></script>
<script src="/path/to/js-multipart-upload/lib/upyun-mu.js"></script>
```

## Usage

eg:

```js
document.getElementById('submit').onclick = function() {
    var ext = '.' + document.getElementById('file').files[0].name.split('.').pop();

    var config = {
        bucket: 'demonstration',
        expiration: parseInt((new Date().getTime() + 3600000) / 1000),
        signature: 'something'
    };

    var instance = new Sand(config);
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
new Sand(config);
```

__参数说明__

* `config` 必要参数
    * `bucket`: 空间名称
    * `expiration`: 上传请求过期时间（单位为：`秒`）
    * `signature`: 初始化上传所需的签名
    * `form_api_secret`: 表单 API （慎用）

__注意__

其中 `signature` 和 `form_api_secret` 为互斥项，为了避免表单 API 泄露造成安全隐患，请尽可能根据[所需参数](https://github.com/upyun/js-multipart-upload/wiki/%E5%88%86%E5%9D%97%E4%B8%8A%E4%BC%A0%E8%AF%B4%E6%98%8E#%E5%85%83%E4%BF%A1%E6%81%AF)自行传入初始化上传所需的 `signature` 参数

计算签名算法，请参考[文档](https://github.com/upyun/js-multipart-upload/wiki/%E5%88%86%E5%9D%97%E4%B8%8A%E4%BC%A0%E8%AF%B4%E6%98%8E#signature-%E5%92%8C-policy-%E7%AE%97%E6%B3%95)


### 设置额外上传参数

```js
instance.setOptions(options)
```
__参数说明__

* `options`: Object 类型，包含额外的上传参数（详情见 [表单 API Policy](http://docs.upyun.com/api/form_api/#api_1)）

## 上传
```js
instance.upload(path)
```

__参数说明__

* `path`: 文件在空间中的存放路径


## 事件

### `uploaded`
上传完成后，会触发自定义事件 `uploaded`, 在事件对象中，会包含一些基本的信息，以供使用


### `error`
上传出错，会触发自定义事件 `error`, 在事件对象中，会包含错误的详情
