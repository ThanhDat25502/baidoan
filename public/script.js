const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');    // phương thức createElement() tạo ra phần tử HTML được chỉ định bởi tagName,
myVideo.muted = true;     //tắt tiếng video từ myVideo để nó không phát lại
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
}); //tạo một kết nối ngang hàng có id duy nhất

myPeer.on('open', id => {   //yêu cầu kết nối ngang hàng
  socket.emit('join-room', ROOM_ID, id)     // hiển thị địa chỉ cho bất kì ai tham gia phong
})


let myVideoStream;
const peers = {}
navigator.mediaDevices.getUserMedia({    //yêu cầu quyền truy cập video và âm thanh
  video: true,
  audio: true
}).then(stream => {        // then: tạo luồng cho video
  myVideoStream = stream;
  addVideoStream(myVideo, stream)     //thêm một luồng video mới vào tệp myVideo.
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {  //kết nối luồng video từ clinet khác
      addVideoStream(video, userVideoStream)
    })
  })  

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)
  })//  Trong khối mã này, khi người dùng khác tham gia vào phòng với cùng một id phòng thì nó sẽ hiển thị luồng của anh ấy đến cửa sổ của tôi

  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('')
    }
  });
  socket.on("createMessage", message => {
    $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom()
  })
});



function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)    //kết nối cuộc gọi đến của client từ địa chỉ id gủi cho client
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })    //add luồng video vào web của minh
  call.on('close', () => {
    video.remove()    //xóa luồng video và kết thúc cuộc gọi
  })

  peers[userId] = call
}

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})    // người dùng ngắt kết nối thì đóng cuộc gọi



function addVideoStream(video, stream) {
  video  = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })      //addEventListener () gắn một trình xử lý sự kiện vào phần tử được chỉ định.
  videoGrid.append(video);    //append() Chèn nội dung, di chuyển thành phần vào trong thành phần khác,chèn video vào videoGird hàng 36 room.js


const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
} //tạo cửa sổ chat


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
} // chức năng bật tắt tiếng

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}// chức năng dừng video

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}//tao icon âm thanh khi bật

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}//tao icon âm thanh khi tắt

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}//tạo icon khi bật video

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};//tạo icon khi tắt video


