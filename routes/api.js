const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const Poll = require('../models/polls');
const jwt = require('jsonwebtoken');
const router = express.Router({ caseSensitive: true });

// deletes a single poll
router.delete('/poll/:id', function(request, response) {
  var id = request.params.id;
  console.log(id);
  Poll.findOneAndRemove({ _id: id }, function(err, poll){
  if (err) {
    response.send('error deleting');
  } else {
    console.log('Poll deleted');
    return response.status(200).json(poll)
  }
})
});
//Add option to a single poll
router.put('/poll/:id', function(request, response) {
  var id = request.body.id;
  var option = request.body.option;
  var voteId = request.body.name;
  console.log(voteId);
  if (option){
    Poll.findById(id, function(err, poll) {
    //console.log(poll);
      if (err) {
        return response.status(400).send(err)
      }
      poll.options.push({
        name: option,
        votes: 1
      });
      poll.save(function(err, updatedPoll) {
        if (err) {
          console.log(err);
          return response.status(400).send(err);
        } else{
          console.log(updatedPoll);
          response.send(updatedPoll);
        }
      })
    })
    }
    /*
    if (voteId) {
      //var _id = request.params.id

      Poll.findOneAndUpdate({_id: '598cbc7af0138732181b124e'
      },
      {$set:{vote: request.body.vote}},
      function(err, poll) {
      if (err)  {
      console.log('error');
      } else {
      console.log(poll);
      response.send(poll)
      }
      })
      }
      */
    });

  /*
  //added for vote
  Poll.findById(id, function(err, poll) {
    //console.log(poll.options);
    if (err) {
      return response.status(400).send(err)
    }
    for (const i = 0; i < poll.options[i].length; i++) {
      console.log(poll.options[0]);
      if (poll.options[i]._id.toString() === request.body.vote) {
        poll.options[i].votes += 1;
        poll.save(function(err, res) {
          if (err) {
            return response.status(400).send(err)
          } else {
            return response.status(200).send({
              message: 'Successfully updated poll!'
            })
          }
        })
      }
    }
  })
  //end added for vote
  */
      /*
      for (const i = 0; i < poll.options.length; i++) {
          if (poll.options[i].name === option) {
              return response.status(403).send({
                  message: 'Option already exists!'
              })
          }
      }
      */
// add poll votes
router.put('/poll-vote/:id', function(request, response) {
    var pollid = request.body.pollid;
    console.log('poll id below');
    console.log(pollid);
    var id = request.body.id;
    console.log('option id below');
    console.log(id);
/*
    Poll.findOne({_id: pollid}, function(err, poll) {
      if (err)  {
        console.log('error');
        } else {
        //console.log(poll);
        response.send(poll)
      }
      var poll = poll.options.id(id);
      console.log(poll);
      poll.options.id(id).votes += 1;
      console.log(poll.options.id(id));
      poll.save();
    });
*/

    Poll.findOneAndUpdate({"_id": pollid, "options._id": id},
                              {"$inc":{"options.$.votes": 1}
                          },
                          function(err, poll) {
                            if (err)  {
                              console.log('error');
                            } else {
                              console.log(poll);
                              response.send(poll)
                            }
                          })
                        });

//Add polls
router.put('/polls', function(request, response) {
  var result = request.body;
  console.log(result);
  Poll.findById(request.body.id, function(err, poll) {
    if (err) {
      return response.status(400).send(err)
    }
    //console.log(poll)
    for (const i = 0; i < poll.options.length; i++) {
      if (poll.options[i]._id.toString() === request.body.vote) {
        //console.log('hit');
        poll.options[i].votes += 1;
        poll.save(function(err, res) {
          if (err) {
            return response.status(400).send(err)
          } else {
            return response.status(200).send({
              message: 'Successfully updated poll!'
            })
          }
        })
      }
    }
  })
});

router.get('/allpolls', function(request, response) {
  console.log(request.params);
    Poll.find({}, function(err, polls) {
        if (err) {
            return response.status(404).send({})
        } else {
            return response.status(200).json(polls)
        }
    })
});

router.get('/allpoll/:id', function(request, response) {
  console.log(request.params.id);
  Poll.findOne({ _id: request.params.id }, function(err, poll) {
    if (err) {
      return response.status(400).send(err)
    } else {
      console.log(poll);
      return response.status(200).send(poll)
    }
  })
})

router.get('/polls', function(request, response) {
  console.log(request.params);
    Poll.find({}, function(err, polls) {
        if (err) {
            return response.status(404).send({})
        } else {
            return response.status(200).json(polls)
        }
    })
});

router.get('/poll/:id', function(request, response) {
    Poll.findOne({ _id: request.params.id }, function(err, poll) {
        if (err) {
            return response.status(400).send(err)
        } else {
            return response.status(200).send(poll)
        }
    })
})

router.get('/user-polls/:name', function(request, response) {
    if (!request.params.name) {
        return response.status(400).send({
            message: 'No user name supplied'
        })
    } else {
        Poll.find({ owner: request.params.name }, function(err, documents) {
            if (err) {
                return response.status(400).send(err)
            } else {
                return response.status(200).send(documents)
            }
        })
    }
})

router.put('/polls/add-option', function(request, response) {
    const id = request.body.id;
    const option = request.body.option;
    console.log(id);
    console.log(option);
    Poll.findById(id, function(err, poll) {
        if (err) {
            return response.status(400).send(err)
        }
        for (const i = 0; i < poll.options.length; i++) {
            if (poll.options[i].name === option) {
                return response.status(403).send({
                    message: 'Option already exists!'
                })
            }
        }
        poll.option.push({
            name: option,
            votes: 0
        });
        poll.save(function(err, res) {
            if (err) {
                return response.status(400).send({
                    message: 'Problem has occurred in saving poll!',
                    error: err
                })
            } else {
                return response.status(201).send({
                    message: 'Successfully created a poll option!'
                })
            }
        })
    })
});

//create polls
router.post('/polls', authenticate, function(request, response) {
    var result = request.body;
    console.log(result);
    const poll = new Poll();
    poll.name = request.body.name;
    poll.options = request.body.options;
    poll.owner = request.body.owner;
    poll.save(function(err, document) {
        if (err) {
            if (err.code === 11000) {
                return response.status(400).send('No dupes!');
            }
            return response.status(400).send(err)
        } else {
            return response.status(201).send({
                message: 'Successfully created a poll',
                data: document
            })
        }
    })
})

router.post('/verify-token', function(request, response) {
    jwt.verify(request.body.token, 'fcc', function(err, decoded) {
        if (err) {
            return response.status(400).send({
                message: 'invalid token',
                error: err
            })
        } else {
            return response.status(200).send({
                message: 'valid token',
                decoded: decoded
            })
        }
    })
});
router.post('/login', function(request, response) {
    if (request.body.name && request.body.password) {
        User.findOne({ name: request.body.name }, function(err, document) {
            if (err) {
                return response.status(400).send(err)
            } else {
                //console.log(document);
                if (bcrypt.compareSync(request.body.password, document.password)) {
                    const token = jwt.sign({
                        data: document
                    }, 'fcc', { expiresIn: 3600 });
                    return response.status(200).send(token)
                } else {
                    return response.status(400).send({
                        message: 'Unauthorized'
                    })
                }
            }
        })
    } else {
        return response.status(400).send({
            message: 'Server error in posting to api'
        })
    }
});
router.post('/register', function(request, response) {
    if (request.body.name && request.body.password) {
        const user = new User();
        user.name = request.body.name;
        console.time('bcryptHash');
        user.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
        console.timeEnd('bcryptHash');
        user.save(function(err, document) {
            if (err) {
                return response.status(400).send(err)
            } else {
                const token = jwt.sign({
                    data: document
                }, 'fcc', { expiresIn: 3600 })
                return response.status(201).send(token)
            }
        })

    } else {
        return response.status(400).send({
            message: 'Server error in posting to api'
        })
    }
})
// custom middleware to authenticate Header Bearer token on all secure endpoints
function authenticate(request, response, next) {
    const header = request.headers.authorization;
    if (header) {
        const token = header.split(' ')[1];
        jwt.verify(token, 'fcc', function(err, decoded) {
            if (err) {
                return response.status(401).json('Unauthorized request: invalid token')
            } else {
                next();
            }
        })
    } else {
        return response.status(403).json('No token provided')
    }
}
module.exports = router;
//obsolete
//Add option to an existing poll
/*router.put('/poll/add-option', function(request, response) {
const id = request.body.id;
const option = request.body.option;
console.log(id);
console.log('poll page option');
console.log(option);
Poll.findById(id, function(err, poll) {
if (err) {
return response.status(400).send(err)
}
for (const i = 0; i < poll.options.length; i++) {
if (poll.options[i].name === option) {
return response.status(403).send({
message: 'Option already exists!'
})
}
}
poll.option.push({
name: option,
votes: 0
});
poll.save(function(err, res) {
if (err) {
return response.status(400).send({
message: 'Problem has occurred in saving poll!',
error: err
})
} else {
return response.status(201).send({
message: 'Successfully created a poll option!'
})
}
})
})
});
*/
/*router.delete('/polls/:id', function(request, response) {
Poll.findById(request.params.id, function(err, poll) {
if (err) {
return response.status(400).send({
message: 'No poll with specified id'
})
}
if (poll) {
const token = request.headers.authorization.split(' ')[1];
jwt.verify(token, 'fcc', function(err, decoded) {
if (err) {
return response.status(401).json('Unauthorized request: invalid token')
} else {
//console.log(poll)
if (decoded.data.name === poll.owner) {
poll.remove(function(err) {
if (err) {
return response.status(400).send(err)
} else {
return response.status(200).send({
message: 'Deleted poll'
})
}
})
} else {
return response.status(403).send({
message: 'Can only delete own polls'
})
}
}
})
}
});
});
*/
