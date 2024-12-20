---
title: Node.js path
description: 测试
coverUrl: https://s2.loli.net/2023/10/12/XJPFkxYaQ8b2Ufo.jpg
category: 编程
tag: [前端, Node.js, path]
---

```js
import path from 'node:path';

// 注：当前工作目录为 'C:\Users\a\Desktop\NodeStudy'

// path.sep返回当前系统的路径分隔符，POSIX为'/'，Win为'\'

'path\\to\\file.txt'.split(path.sep); // [ 'path', 'to', 'file.txt' ]

// path.delimiter返回当前系统的路径定界符，POSIX为':'，Win为';'

process.env.PATH.split(path.delimiter);

// ['C:\\Windows\\system32', 'C:\\Windows', ... ]

// 返回路径的最后一部分，并删除 `suffix` 后缀名（区分大小写）

path.basename('path/to/file.txt', '.TXT'); // 'file.txt'

// 返回目录名，忽略尾部分隔符

path.dirname('path/to/file.txt'); // 'path/to'

// 返回后缀名

path.extname('path/to/file.txt'); // '.txt'

path.extname('.minecraft'); // ''

path.extname('file.'); // '.'

// 连接并规范path，忽略零长度的 path 片段。

path.join('/foo', './bar', 'baz\\asdf', 'quux', '..'); // '\foo\bar\baz\asdf'

// 如果连接的路径字符串最后是零长度字符串，则将返回当前工作目录

path.join('foo/bar', '../../'); // '.\'

// 将path解析为绝对路径并规范。从右到左处理，直到解析到绝对路径为止。注意盘符不会被忽略

path.resolve('D:/test', '\\foo', 'bar', 'file'); // 'D:\foo\bar\file'

// 如果最终还没有生成绝对路径，则使用当前工作目录的绝对路径。

path.resolve('test', 'static\\png\\', './../gif/image.gif');

// 'C:\Users\a\Desktop\NodeStudy\test\static\gif\image.gif'

// 返回一个含有path重要元素的对象，与path.format为互逆操作，注意该方法不会规范化

const pathObj = path.parse(path.normalize('/home/user/dir/file.txt'));

// { root: '\\',

//   dir: '\\home\\user\\dir',

//   base: 'file.txt',

//   ext: '.txt',

//   name: 'file' }

path.format(pathObj); // \home\user\dir\file.txt

// 返回从from到to的相对路径，若from和to相同则返回空字符串

path.relative('C:/test1/aaa', 'C:\\test2\\bbb'); // '..\..\test2\bbb'

// 若存在相对路径或空字符串，则以当前工作目录为基准。

path.relative('', 'C:/test1/aaa'); // '..\..\..\..\test1\aaa'

// 返回是否为绝对路径

path.isAbsolute('/foo/bar/'); // true
```
