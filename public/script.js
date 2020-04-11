
  // Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCT3EDBWfF7PVjI2xtBoP4ggZkBbSGWYcU",
  authDomain: "ll-art.firebaseapp.com",
  databaseURL: "https://ll-art.firebaseio.com",
  projectId: "ll-art",
  storageBucket: "ll-art.appspot.com",
  messagingSenderId: "612626647296",
  appId: "1:612626647296:web:3f162a78dd7864e3638be5"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storageService = firebase.storage();
const storageRef = storageService.ref();

const pages= document.getElementById('pages')




let i =0;
const images=[];
function drawImageActualSize() {
  ++i;
  let height =this.width;
  let width = this.height;


  if([5, 6, 7, 8].includes(this.EXIFOrientation)){
    width = this.height;
    height = this.width;
  }

  const page = Object.assign(document.createElement('div'), {id: 'page-'+i, className: 'page'})
  const canvasContainer = Object.assign(document.createElement('div'), {className: 'canvas-container'})
  const canvas = Object.assign(document.createElement('canvas'), {id: 'imagecanvas-'+i, className: 'image-canvas', height: height, width:width})
  const annotations = Object.assign(document.createElement('canvas'), {id: 'annotation-canvas-'+i, className: 'annotation-canvas', height: height, width:width})
  // console.log(this)
  canvas.rects=[];
  canvas.imagesrc= this;
  annotation_ctx.curRect=[];
  console.log(`orientation ${this.EXIFOrientation}`)
  // console.log(`orientation window ${window.image.EXIFOrientation}`)
  window.canvas = canvas

  canvasContainer.appendChild(canvas);
  canvasContainer.appendChild(annotations);
  page.appendChild(canvasContainer);
  pages.appendChild(page);
  pages.appendChild(document.createElement('br'));
  const ctx = canvas.getContext('2d');
  const annotation_ctx = annotations.getContext('2d');



  switch (this.EXIFOrientation) {
              case 2:
                  ctx.transform(-1, 0, 0, 1, this.width, 0);
                  break;
              case 3:
                  ctx.transform(-1, 0, 0, -1, this.width, this.height);
                  break;
              case 4:
                  ctx.transform(1, 0, 0, -1, 0, this.height);
                  break;
              case 5:
                  ctx.transform(0, 1, 1, 0, 0, 0);
                  break;
              case 6:
                  ctx.transform(0, 1, -1, 0, this.height, 0);
                  break;
              case 7:
                  ctx.transform(0, -1, -1, 0, this.height, this.width);
                  break;
              case 8:
                  ctx.transform(0, -1, 1, 0, 0, this.width);
                  break;
              default:
                  ctx.transform(1, 0, 0, 1, 0, 0);
          }

  
  annotations.onmousedown = canvasMouseDown;
  annotations.onmouseup = canvasMouseUp;
  annotations.onmousemove = canvasMouseMove;

  annotations.ontouchstart = handleStart;
  annotations.ontouchend = handleEnd;
  annotations.ontouchmove = handleMove;

  annotations.addEventListener('DOMMouseScroll',handleScroll,false);
  annotations.addEventListener('mousewheel',handleScroll,false);

  ctx.drawImage(this, 0, 0);
  ctx.setTransform(1,0,0,1,0,0);
}

$("#textletter").keyup(function(){

  $('#textsubmit').prop("disabled", (this.value === "")? true : false);
});

function readURL(input) {
  $('#filesubmit').prop('disabled', false);
  if (input.files && input.files[0]) {
    const files = input.files;
    Array.from(files).forEach((file) =>{
      const reader = new FileReader();
      const image = new Image();
      // window.image=image;
      image.onload = drawImageActualSize
      images.push(image)
      reader.onload = function(e){

        EXIF.getData(file, function(){
          let orientation = EXIF.getAllTags(this).Orientation
          image.EXIFOrientation = EXIF.getAllTags(this).Orientation;
          console.log('setting orientation')
          image.src=e.target.result
        })
       
        console.log('setting')
        

      };
      reader.readAsDataURL(file);
    })
  }
}


function redraw(){
  const imagecanvas= $(this).prev('.image-canvas')[0]
  const imagecanvas_ctx=imagecanvas.getContext('2d')

  imagecanvas_ctx.save();
  imagecanvas_ctx.setTransform(1,0,0,1,0,0);
  imagecanvas_ctx.clearRect(0,0,imagecanvas.width,imagecanvas.height);
  imagecanvas_ctx.restore();
  
  imagecanvas_ctx.drawImage(canvas.imagesrc, 0, 0);
  imagecanvas.rects.forEach((rect)=>{
    imagecanvas_ctx.fillRect(...rect)
  })
}

let scaleFactor = 1.1;
function zoom (clicks){
  var pt = ctx.transformedPoint(lastX,lastY);
  ctx.translate(pt.x,pt.y);
  var factor = Math.pow(scaleFactor,clicks);
  ctx.scale(factor,factor);
  ctx.translate(-pt.x,-pt.y);
  redraw();
}





function handleFileUploadSubmit(e) {
  const baseString=[...document.querySelectorAll(".image-canvas")].map(n => n.toDataURL())
  const fileBase=  Date.now()+'.jpg';
  const progressBar = document.getElementById('progress');
  const sent = document.getElementById('pageNo');

  sent.innerText= '0/' +baseString.length;
  progressBar.parentElement.style.display= "block";
  progressBar.parentElement.style.top= "0px";
  

  baseString.forEach((base, i)=>{
    var uploadTask = storageRef.child('images/'+i+'_'+fileBase).putString(base, 'data_url')
    uploadTask.on('state_changed', function(snapshot){
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is '+ progress + "% done")
      progressBar.value=progress
      switch(snapshot.state){
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
    }, function(error) {
      console.log(error)
    }, function(){
      console.log('upload success')
      ++i
      sent.innerText= ' '+i+'/' +baseString.length;
      if(i===baseString.length){
        document.getElementById('upload').innerText='Upload Success!'
        setTimeout(()=> {location.reload(true)}, 1000)
      }
    })
  })
}

let canvasx;// = $(canvas).offset().left;
let canvasy;// = $(canvas).offset().top;

var last_mousex = last_mousey = 0;
var mousex = mousey = 0;
var mousedown = false;

function canvasMouseDown(e){
  var BB=this.getBoundingClientRect();
  canvasx=BB.left;
  canvasy=BB.top;
  last_mousex =  Math.round( (e.clientX-canvasx) * (this.width / this.offsetWidth) );//parseInt(e.clientX-canvasx);
  last_mousey = Math.round( (e.clientY-canvasy) * (this.height / this.offsetHeight) );//parseInt(e.clientY-canvasy);
  mousedown = true;
}

function canvasMouseUp(e){
   mousedown = false;
   const imagecanvas= $(this).prev('.image-canvas')[0]
   const imagecanvas_ctx=imagecanvas.getContext('2d')
   imagecanvas.rects.push(curRect)
   imagecanvas_ctx.drawImage(this, 0, 0);

}

function canvasMouseMove(e){
  mousex = Math.round( (e.clientX-canvasx) * (this.width / this.offsetWidth) );//parseInt(e.clientX - canvasx);
  mousey = Math.round( (e.clientY-canvasy) * (this.height / this.offsetHeight) );//parseInt(e.clientY - canvasy);
  let ctx = this.getContext('2d');
  if (mousedown) {
    ctx.clearRect(0, 0, this.width, this.height); //clear canvas
    ctx.beginPath();
    let width = mousex - last_mousex;
    let height = mousey - last_mousey;
    this.curRect = [last_mousex, last_mousey, width, height];
    ctx.fillRect(...this.curRect);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    ctx.stroke();
  }
}


function handleScroll(e){
      var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
      if (delta){

         zoom(delta);
      }
      return e.preventDefault() && false;
    };


// document.addEventListener("touchmove", handleMove, false);

function handleStart(e) {
  
  if(e.touches.length===1){
    e.preventDefault();
    console.log("one finger touch")
    console.log(e.touches[0].clientX)
    var BB=this.getBoundingClientRect();
    canvasx=BB.left;
    canvasy=BB.top;
    last_mousex =  Math.round( (e.touches[0].clientX-canvasx) * (this.width / this.offsetWidth) );//parseInt(e.clientX-canvasx);
    last_mousey = Math.round( (e.touches[0].clientY-canvasy) * (this.height / this.offsetHeight) );//parseInt(e.clientY-canvasy);
    mousedown = true;
  }
  else if(e.touches.length===2){
    console.log("two finger touch")
  }
}

function handleEnd(e){
  e.preventDefault();
    mousedown = false;
    let imagecanvas_ctx= $(this).prev('.image-canvas')[0].getContext('2d')
    imagecanvas_ctx.drawImage(this, 0, 0);
  
}

function handleMove(e){
  e.preventDefault()
  if(e.touches.length===1){
    mousex = Math.round( (e.touches[0].clientX-canvasx) * (this.width / this.offsetWidth) );//parseInt(e.clientX - canvasx);
    mousey = Math.round( (e.touches[0].clientY-canvasy) * (this.height / this.offsetHeight) );//parseInt(e.clientY - canvasy);
    let ctx = this.getContext('2d');
    // ctx.setTransform(0, 1, -1, 0, this.height, 0);
    if (mousedown) {
      ctx.clearRect(0, 0, this.width, this.height); //clear canvas
      ctx.beginPath();
      var width = mousex - last_mousex;
      var height = mousey - last_mousey;
      ctx.fillRect(last_mousex, last_mousey, width, height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }
}
