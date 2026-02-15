=const socket = io();

let localStream;
let peer;

// STUN SERVER (needed for internet video connection)
const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
};

// GET CAMERA + MIC
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
.then(stream => {
  localStream = stream;
  document.getElementById("localVideo").srcObject = stream;
})
.catch(err => {
  alert("Camera access denied");
});

// MATCHED WITH USER
socket.on("matched", async caller => {

  document.getElementById("status").innerText = "Connected";

  peer = new RTCPeerConnection(config);

  // SEND CAMERA STREAM
  localStream.getTracks().forEach(track => {
    peer.addTrack(track, localStream);
  });

  // RECEIVE STRANGER VIDEO
  peer.ontrack = e => {
    document.getElementById("remoteVideo").srcObject = e.streams[0];
  };

  // SEND ICE CANDIDATES
  peer.onicecandidate = e => {
    if (e.candidate) {
      socket.emit("signal", { candidate: e.candidate });
    }
  };

  // CREATE OFFER (caller only)
  if (caller) {
    let offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit("signal", { offer });
  }

});

// SIGNAL EXCHANGE
socket.on("signal", async data => {

  if (data.offer) {
    await peer.setRemoteDescription(data.offer);
    let ans = await peer.createAnswer();
    await peer.setLocalDescription(ans);
    socket.emit("signal", { answer: ans });
  }

  if (data.answer) {
    await peer.setRemoteDescription(data.answer);
  }

  if (data.candidate) {
    try {
      await peer.addIceCandidate(data.candidate);
    } catch {}
  }

});

// NEXT STRANGER
function nextUser() {
  location.reload();
}

