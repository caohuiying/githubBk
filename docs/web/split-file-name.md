# JS截取文件名称不带后缀

``` js
  //方法1
	function splitFileName(text) {
	    var pattern = /\.{1}[a-z]{1,}$/;
	    if (pattern.exec(text) !== null) {
	        return (text.slice(0, pattern.exec(text).index));
	    } else {
	        return text;
	    }
  }
  //方法2
  function splitFileName(filepath) { 
    if (filepath != "") { 
      var names = filepath.split("\\");
      var pos = names[names.length - 1].lastIndexOf(".");
      return names[names.length - 1].substring(0, pos);
    } 
  }
```

# JS截取文件后缀名称

``` js

  // 方法1
  var fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);

  // 方法2
  var fileExtension = fileName.split('.').pop().toLowerCase();
```