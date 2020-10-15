const prefix_C_ = 'sock__C_',
    prefix_E_ = 'sock__E_';

const {
    verifyToken,
    getSockInfo
} = require("./helpers/functions")

module.exports = (io, client) => {
    io.use(async (socket, next) => {
            if (socket.handshake.query && socket.handshake.query.token) {
                verifyToken(socket.handshake.query.token)
                    .then(info => {
                        socket.userInfo = info;
                        next();
                    })
                    .catch(e => {
                        return next(new Error('Authentication error'));
                    })
            } else next(new Error('Authentication error'));
        })
        .on('connection', socket => {
            console.log('a user Connected');
    
            //join chat channel
            socket.on('joinChat', async (user) => {
                const prefix = socket.userInfo.r == 'em' ? prefix_E_ : prefix_C_;
                client.set(prefix + socket.id + '--_' + socket.userInfo.sub + '_--' + user.channel+'--_--'+user.peerId ,true, 'EX', 10800);
                socket.join(user.channel);
                io.sockets.in(user.channel).emit('user-connected',{id:user.peerId});
            });

            //on message
            socket.on('message', async obj => {
                io.sockets.in(obj.channel).emit('message', {
                    user: socket.userInfo.sub,
                    msg: obj.msg,
                    channel: obj.channel,
                    type: obj.type
                })
            })

            //on disconnect
            socket.on('disconnect', () => {
                client.keys(`*${socket.id}*`, (err, redisSock) => {
                    if (redisSock.length > 0) {
                        redisSock = redisSock.shift();
                        const info =  redisSock.split("--_")[1].split("_--");
                        let user = getSockInfo(redisSock);
                        client.keys(`*--_${user.id}*`, (err, socks) => {
                            console.log(socks.length)
                            console.log(socks);
                            (socks.length > 1) ? io.sockets.in(user.channel).emit('user-disconnected', {channel:user.channel,peerId:user.peerId}): null;
                            //(socks.length - 1 <= 0) ? io.sockets.in(user.channel).emit('user-disconnected', [user.peerId]): null;
                        })
                        client.del(redisSock);
                        console.log("user leave")
                    }
                })
            });
        });
};