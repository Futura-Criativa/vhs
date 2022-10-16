let shouldStop = false;
let stopped = false;
const videoElement = document.getElementsByTagName('video')[0];
const videoPlayer = document.getElementById('player');
const stopButton = document.getElementById('stop');
const downloadLink = document.getElementById('download');
const aboutText = document.getElementById('about');

$('#player').css('display', 'none');
$('#stop').css('display', 'none');
$('#download').css('display', 'none');

function startRecord() {
    
    videoElement.removeAttribute('controls','');

    $('.btn-info').prop('disabled', true);
    $('.video').prop('muted', 'muted');
    $('#stop').css('display', '');
    $('#about').css('display', '');
    $('#screen').css('display', 'none');
    $('#video').css('display', 'none');
    $('#audio').css('display', 'none')
    $('#download').css('display', 'none');
}

function stopRecord() {
    $('.btn-info').prop('disabled', false);
    $('#download').css('display', 'block')
}
const audioRecordConstraints = {
    echoCancellation: true
}

stopButton.addEventListener('click', function() {
    shouldStop = true;
});

const handleRecord = function({
    stream,
    mimeType
}) {
    startRecord()
    let recordedChunks = [];
    stopped = false;
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }

        if (shouldStop === true && stopped === false) {
            mediaRecorder.stop();
            stopped = true;
        }
    };

    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, {
            type: mimeType
        });
        recordedChunks = []
        const filename = window.prompt('Nome do arquivo: ');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${filename || 'recording'}.webm`;
        stopRecord();

        stopButton.style.display = 'none';

        videoElement.srcObject = null;

        let video = document.querySelector('video')
        video.src = downloadLink;

        videoElement.setAttribute('controls','');
        
        video.play();

        $('#screen').css('display', '');
        $('#video').css('display', '');
        $('#audio').css('display', '')

    };

    mediaRecorder.start(200);
};

async function recordAudio() {
    const mimeType = 'audio/webm';
    shouldStop = false;
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioRecordConstraints
    });
    handleRecord({
        stream,
        mimeType
    })

    $('#about').css('display', 'none');

}

async function recordVideo() {
    const mimeType = 'video/webm';
    shouldStop = false;
    const constraints = {
        audio: {
            "echoCancellation": true
        },
        video: {
            "width": {
                "min": 640,
                "max": 1024
            },
            "height": {
                "min": 480,
                "max": 768
            }
        }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    handleRecord({
        stream,
        mimeType
    })

    $('#about').css('display', 'none');
    $('#player').css('display', '');

}

async function recordScreen() {
    const mimeType = 'video/webm';
    shouldStop = false;
    const constraints = {
        video: {
            cursor: 'motion'
        }
    };
    if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
        return window.alert('Gravação de tela não suportada!')
    }
    let stream = null;
    const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: "motion"
        },
        audio: {
            'echoCancellation': true
        }
    });
    if (window.confirm("Gravar com áudio?")) {
        const audioContext = new AudioContext();

        const voiceStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                'echoCancellation': true
            },
            video: false
        });
        const userAudio = audioContext.createMediaStreamSource(voiceStream);

        const audioDestination = audioContext.createMediaStreamDestination();
        userAudio.connect(audioDestination);

        if (displayStream.getAudioTracks().length > 0) {
            const displayAudio = audioContext.createMediaStreamSource(displayStream);
            displayAudio.connect(audioDestination);
        }

        const tracks = [...displayStream.getVideoTracks(), ...audioDestination.stream.getTracks()]
        stream = new MediaStream(tracks);
        handleRecord({
            stream,
            mimeType
        })
    } else {
        stream = displayStream;
        handleRecord({
            stream,
            mimeType
        });
    };
    videoElement.srcObject = stream;

    $('#about').css('display', 'none');
    $('#player').css('display', '');
}
