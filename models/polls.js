var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PollsSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'user'
  },
    name: {
        type: String,
        required: true,
        unique: true
    },
    options: [
        {
            name: {
                type: String,
                required: true
            },
            votes: {
                default: 0,
                type: Number
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    owner: {
        type: String,
        required: true
    }
});

var Model = mongoose.model('Polls', PollsSchema);

module.exports = Model;
