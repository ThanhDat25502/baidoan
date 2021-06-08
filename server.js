const express = require('express')    //gọi thư viện express
const app = express()   //tạo đối tượng có kiểu express()
const server = require('http').Server(app)    //tạo một máy chủ để sử dụng trong socket.io
const io = require('socket.io')(server)   //kết nối sever vs soket.io
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});   // tạo máy chủ ngang hàng
app.use('/peerjs', peerServer);     // truy cập vào máy chủ ngang hàng.

const { v4: uuidV4 } = require('uuid')    //tạo địa chỉ uuidv4 và yêu cầu đưa uuid vào dự án

app.set('view engine', 'ejs')   //view engine: chuyển đổi tu ejs thành tệp HTML được gửi đến client
app.use(express.static('public'))   // sử dụng Express cung cấp các tệp tĩnh như hình ảnh, tệp CSS và tệp JavaScript trong thư mục pulic
                                    //thiết lập thư mục chung làm thư mục tĩnh

app.get('/', (req, res) => {    //tạo một căn phòng hoàn toàn mới,
  res.redirect(`/${uuidV4()}`)
})    //tra loi diaa chi uuid khi get yeu cau

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})    //lay roomid để chuyển đến url 

io.on('connection', socket => {   // tạo kết nối giữa client và server
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)   //client vafo phong
    socket.to(roomId).broadcast.emit('user-connected', userId);   //gui tb co client vao phong
    // messages
    socket.on('message', (message) => {
      // gửi tin nhắn đến cùng phòng
      io.to(roomId).emit('createMessage', message)
  }); 

    socket.on('disconnect', () => {      //server lắng nghe dữ liệu từ client ngắt kết nối
      socket.to(roomId).broadcast.emit('user-disconnected', userId)   //tb client ngat ket noi cko cac thah vien khac
    })
  })
})    //điều này sẽ chạy bất cứ lúc nào khi ai đó kết nối với trang web của chúng ta,

server.listen(process.env.PORT||3030)     //khai báo PORT mặc định khi chạy(từ hệ thống, nó có PORT nào thì lấy PORT đó)

//req :yeu cau
// res: Response--tra loi
// redirect: dieu huong trang den dia chi
