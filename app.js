var points = []; 
var palette = [];
var savedData = [];

var distance = function(a,b){
    return Math.sqrt(Math.pow(a[0]-b[0], 2)+Math.pow(a[1]-b[1], 2)+Math.pow(a[2]-b[2], 2))   
}

var cluster = function(k){
   var centroids = [];
   inter_centroids = [];
   for (var i = 0; i < k; i++){
         var r = Math.round(Math.random()*255);
         var g = Math.round(Math.random()*255);
         var b = Math.round(Math.random()*255);
        centroids.push([r,g,b]);
   }
   inter_centroids.push(centroids);
   var done = false;
   var count = 0;
   while(!done){
    var newcentroids = []
    var lengths = []
    for (var i = 0; i < k; i++){
        newcentroids.push([0,0,0]);
        lengths.push(0);
    }
    for (var j = 0; j < points.length; j++){
        var mind = 1000;
        var mindi = 0;
        for (var i = 0; i < k; i++){
           var d = distance(centroids[i], points[j]);
           if (d<mind){
               mind  = d;
               mindi = i;
           }
        }
        newcentroids[mindi][0]+=points[j][0];
        newcentroids[mindi][1]+=points[j][1];
        newcentroids[mindi][2]+=points[j][2];   
        lengths[mindi]++;
    }
    for (var i = 0; i < k; i++){
        if (lengths[i]!=0){
            newcentroids[i][0] = Math.round(newcentroids[i][0]/lengths[i]);
            newcentroids[i][1] = Math.round(newcentroids[i][1]/lengths[i]);
            newcentroids[i][2] = Math.round(newcentroids[i][2]/lengths[i]);
        } else {
            var r = Math.round(Math.random()*255);
         var g = Math.round(Math.random()*255);
         var b = Math.round(Math.random()*255);
            newcentroids[i]=[r,g,b];
        }
    }
    done = true;
    for (var i = 0; i < k; i++)
        if (newcentroids[i][0] != centroids[i][0] ||
            newcentroids[i][1] != centroids[i][1] ||
            newcentroids[i][2] != centroids[i][2]) 
                done = false;
    if (++count >= 200) done = true;
    centroids = newcentroids;
    inter_centroids.push(centroids);
   }
   console.log("converged in "+count+" iterations");
   return centroids;
}

var displayPalette = function(){
    document.getElementById("fileinput").style.display="none"; 
    document.getElementById("image").style.display="inline"; 
    document.getElementById("rimage").style.display="inline-block"; 
    document.getElementById("palette").style.display="inline-block";     
    document.getElementById("reloadbutton").style.display="inline-block";    
    var st = "";
    for(var i = 0; i < palette.length; i++){
        var avg = (palette[i][0]+palette[i][1]+palette[i][2])/2
        var color = "black";
        var vstring = palette[i][0].toString(16)+palette[i][1].toString(16)+palette[i][2].toString(16);
        if (avg < 128) color = "white";
        st+="<div class='colorblock' style='background: rgb("+palette[i][0]+","+palette[i][1]+","+palette[i][2]+"); width: "+(90/palette.length)+"%; height: 100%; color: "+color+"'>#"+vstring+"</div>";
    }
    document.getElementById("palette").innerHTML = st;  
}

            
var recolor = function(){
   var canvas = document.getElementsByTagName('canvas')[0];
   var context = canvas.getContext('2d'); 
   var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
   var d1 = imageData.data;
   var d = [];
   for (var i = 0; i < d1.length-3; i+=4){
        var point = [d1[i],d1[i+1],d1[i+2]];
        var mind = 100000;
        var minj = 0;
        for (var j = 0; j < palette.length; j++){
            var di = distance(point, palette[j]);
            if (di < mind) { mind = di; minj = j; }
        }
        d.push(palette[minj][0]);
        d.push(palette[minj][1]);
        d.push(palette[minj][2]);
        d.push(255);
    }
    canvas = document.getElementsByTagName('canvas')[1];
    context = canvas.getContext('2d'); 
    var imageData2 = context.createImageData(400,400);
    imageData2.data.set(d);
    context.putImageData(imageData2, 0, 0);
}
            
var openFile = function(file) {
    var input = file.target;
    var reader = new FileReader();
    reader.onload = function(){
    var dataURL = reader.result;
    var canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    var canvas2 = document.createElement('canvas');
    canvas2.width = 400;
    canvas2.height = 400;
    var context = canvas.getContext('2d');  
    var img = new Image();
    img.addEventListener('load', function(){
            img.width=400
            img.height=400
            context.drawImage(img, 0, 0, img.width, img.height);
            imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            var output = document.getElementById('image');
            output.appendChild(canvas);
            var output2 = document.getElementById('rimage');
            output2.appendChild(canvas2);
            savedData = imageData.data.slice();
            for (var i = 0; i < imageData.data.length-3; i+=4){
            points.push([imageData.data[i],imageData.data[i+1],imageData.data[i+2]]);
            }
            var clustnum = document.getElementById('clust').value;
            console.log(clustnum);
            palette = cluster(clustnum);
            displayPalette();
            recolor();
    }, false);
    img.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);
};
