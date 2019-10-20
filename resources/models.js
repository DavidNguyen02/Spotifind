const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password_hash: { type: String, required: true },
    //spotify api info
    date_joined: Date
});

userSchema.pre('save', function(next) {
    var user = this;
    if (!user.isModified('password_hash')) return next();
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password_hash, salt, function(err, hash) {
            if (err) return next(err);
            user.password_hash = hash;
            console.log(user.password_hash + " before save");
            next();
        });
    });
});

userSchema.methods.comparePasswords = function(password, callback) {
    bcrypt.compare(password, this.password_hash, function(err, isMatch) {
        if (err) { return callback(err) };
        callback(null, isMatch);
    });
};

var messageSchema = new Schema({
    user_id: String,
    room_id: Schema.Types.ObjectId,
    text : { type: String, required: true },
    date_sent: Date
});

var roomSchema = new Schema({
    user1_id: Schema.Types.ObjectId,
    user2_id: Schema.Types.ObjectId,
    date_created: Date
})

var User = mongoose.model('User', userSchema);
var Message = mongoose.model('Message', messageSchema);
var Room = mongoose.model('Room', roomSchema);

module.exports = {
    User: User, 
    Message: Message,
    Room: Room
};
