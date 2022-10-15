let start = document.querySelector(".start-btn")
let stop = document.querySelector(".stop-btn")
let player = document.querySelector(".videoPlayer");
let download = document.querySelector(".download-btn");
let block = document.querySelector(".description");
let obs = document.querySelector(".obs-text");
let mediaRecorder;
  
  
start.addEventListener("click", async function () {
  player.style.display = "none";
  download.style.display = "none";
  stop.style.display = "";
  start.style.display = "none";
  block.style.display = "none";
  let stream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  })

    mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm"
    })
    

    let chunks = []
    mediaRecorder.addEventListener('dataavailable', function(e) {
        chunks.push(e.data)
    })

    mediaRecorder.addEventListener('stop', function(){
      stop.style.display = "none";
      start.style.display = "";
      start.innerText = "Nova gravação";
      obs.style.display = "";
      let blob = new Blob(chunks, {
          type: chunks[0].type
      })
      let url = URL.createObjectURL(blob)

      let video = document.querySelector("video")
      video.src = url
      player.style.display = "";
      video.play();

      
      download.href = url
      download.download = 'screenRecord.webm'
      download.style.display = "";
      
  })

    //we have to start the recorder manually
    mediaRecorder.start()
})
stop.addEventListener("click", function () {
  mediaRecorder.stop();
  stop.style.display = "none";
})
