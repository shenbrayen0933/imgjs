function updateImage(src, items, dst){
    for(var i=0;i<items.length;i++){
        var item = items[i];
        if(item.type === 'img'){
            item.el.src = dst;
        }else{
            item.el.style.backgroundImage = 'url(' + dst + ')';
        }
    }
}

function asynculr(src, items){
    var oReq = new XMLHttpRequest();
    oReq.open('GET', src, true);
    oReq.responseType = 'text';
    oReq.onreadystatechange = ()=>{
        if(oReq.readyState == oReq.DONE){
            var ok = false;
            if(oReq.responseURL && /https:\/\/cdn\..+\/[a-z0-9]{32}\.data$/.test(oReq.responseURL)){
                ok = true;
            }

            if(ok){
                var blob = 'data:image/png;base64, ' + oReq.response.substring(11, oReq.response.length - 21);
                updateImage(src, items, URL.createObjectURL(dataURLtoBlob(blob)))
            }
        }
    }
    oReq.send();
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    var jpeg = '';
    try {
        jpeg = new Blob([u8arr], {type: mime});
    } catch (e) {
        window.BlobBuilder = window.BlobBuilder ||
        window.WebKitBlobBuilder ||
        window.MozBlobBuilder ||
        window.MSBlobBuilder;
        if (e.name == 'TypeError' && window.BlobBuilder) {
            var bb = new BlobBuilder();
            bb.append([u8arr.buffer]);
            jpeg = bb.getBlob(mime);
        } else if (e.name == "InvalidStateError") {
            jpeg = new Blob([u8arr.buffer], {type: mime});
        }
    }

    return jpeg;
}

function checkimgs(){
    var map = {};
    var imgs = document.getElementsByTagName('img');
    var divs = document.getElementsByTagName('div');
    for(var i=0;i<imgs.length;i++){
        var el = imgs[i];
        var src = el.src;
        if(!map[src])map[src] = [];
        map[src].push({el: el, type: 'img'});
    }

    for(var j=0;j<divs.length;j++){
        var el = divs[j];
        var styles = el.getAttribute('style');
        if(!styles)continue;
        styles = styles.split(';');
        var background = null;
        for(var k=0;k<styles.length;k++){
            if(/^background-image/.test(styles[k])){
                background = styles[k];
                break;
            }
        }

        if(!background)continue;
        var src = background.match(/http.+\.((jpg)|(data))/);
        if(!src)continue;
        src = src[0];
        if(!map[src])map[src] = [];
        map[src].push({el: el, type: 'div'});
    }

    for(var src in map){
        asynculr(src, map[src]);
    }
}

window.addEventListener('load', checkimgs);
