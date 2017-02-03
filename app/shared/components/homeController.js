app.controller('homeCtrl', function($scope, $location, authFactory, redditFactory, posts, user) {

  $scope.all = posts

  console.log(posts)

  for (obj in $scope.all) {
    let u;
    let d;
    console.log($scope.all[obj].downvotes)
    if ($scope.all[obj].upvotes === undefined) {
      u = 0
      console.log("u", u)
    } else {
      u = Object.keys($scope.all[obj].upvotes).length
      console.log("u", u)
    }
    if ($scope.all[obj].downvotes === undefined) {
      d = 0
      console.log("d", d)
    } else {

      d = Object.keys($scope.all[obj].downvotes).length
      console.log("d", d)
    }

    let score = u - d
    console.log("score", score)

    let key = obj

    redditFactory.updateScore(key, score)

  }

  // get users then loop through post and if they match then patch the username to the post
  redditFactory.getUsers()
    .then((allUsers) => {
      $scope.users = allUsers.data;
    }).then(() => {
      for (key in $scope.all) {
        for (k in $scope.users) {
          // see if post has a first name already. if so do nothing
          if ($scope.all[key].firstName === undefined) {
            if ($scope.all[key].uid === $scope.users[k].uid) {
              console.log("Tis a match!", key)
                // if match then post the firstName, lastName to the post
              let postFLName = { "firstName": $scope.users[k].firstName, "lastName": $scope.users[k].lastName };
              // patch the users first and last name to the database
              redditFactory.patchName(key, postFLName);
            }
          }
        }
      }
    })

// function pageLoad() {

  // }


  // onclick post the result to firebase
  $scope.upVote = (postkey) => {
    // get current user
    let voted = false;
    let uid;
    redditFactory.getPosts()
      .then((allPosts) => {
        $scope.all = allPosts.data
          // console.log("posts", $scope.all)
      }).then(() => {
        authFactory
          .getUser()
          .then((e) => {
            uid = e.uid;
          })
          .then(() => {
            // see if user has already upvoted or downvoted
            // loop through the postkey passed from click to find the post
            for (key in $scope.all) {
              // when the keys match, loop through the post and get the upvotes & downvotes
              if (key === postkey) {
                let obj = $scope.all[key];
                for (k1 in obj.upvotes) {
                  // if user upvoted then do nothing
                  if (uid === obj.upvotes[k1]) {
                    return voted = true;
                  }
                }
                for (k2 in obj.downvotes) {
                  // if the user wants to change their downvote to an upvote then delete the downvote and add an upvote
                  if (uid === obj.downvotes[k2]) { // upvoters uid will be obj.upvotes[k]
                    // console.log('delete the downvote and add an upvote, postkey & key match, k2 dv', postkey, key, k2);
                    // delete downvote
                    redditFactory.removeDownvotes(key, k2);
                    // add upvote
                    redditFactory.addUpvotes(key, uid);
                    return voted = true;
                  }
                }
              }
            }
          })
          // if user has not voted then add upvote.
          .then(() => {
            // the response will be true if user has already voted, false if they haven't
            if (voted === false) {
              for (key in $scope.all) {
                // when the keys match, loop through the post and get the upvotes & downvotes
                if (key === postkey) {
                  // console.log('keys match', key, postkey)
                  redditFactory.addUpvotes(key, uid)
                }
              }
            }
          })
      });
  }

  $scope.downVote = (postkey) => {
    // get current user
    let voted = false;
    let uid;
    redditFactory.getPosts()
      .then((allPosts) => {
        $scope.all = allPosts.data
          // console.log("posts", $scope.all)
      })
      .then(() => {
        authFactory
          .getUser()
          .then((e) => {
            uid = e.uid;
          })
          .then(() => {
            // see if user has already upvoted or downvoted
            // loop through the postkey passed from click to find the post
            for (key in $scope.all) {
              // when the keys match, loop through the post and get the upvotes & downvotes
              if (key === postkey) {
                let obj = $scope.all[key];
                for (k1 in obj.downvotes) {
                  // if user downvoted then do nothing
                  if (uid === obj.downvotes[k1]) {
                    return voted = true;
                  }
                }
                for (k2 in obj.upvotes) {
                  // if the user wants to change their downvote to an upvote then delete the downvote and add an upvote
                  if (uid === obj.upvotes[k2]) { // upvoters uid will be obj.upvotes[k]
                    // console.log('delete the upvote and add a downvote, postkey & key match, k2 dv', postkey, key, k2);
                    // delete upvote
                    redditFactory.removeUpvotes(key, k2);
                    // add downvote
                    redditFactory.addDownvotes(key, uid);
                    return voted = true;
                  }
                }
              }
            }
          })
          // if user has not voted then add downvote.
          .then(() => {
            // the response will be true if user has already voted, false if they haven't
            if (voted === false) {
              console.log('user has not yet voted so begin the vote')
              for (key in $scope.all) {
                // when the keys match, loop through the post and get the upvotes & downvotes
                if (key === postkey) {
                  console.log('keys match', key, postkey)
                  redditFactory.addDownvotes(key, uid)
                }
              }
            }
          })
      });
  }


  //materialize Modals below
  $('#loginButton').click(() => {
    $('#loginModal').modal('open')
  })

  $('.registerButton').click(() => {
    $('#registerModal').modal('open')
  })

  $('#newPost').click(() => {
    $('#postModal').modal('open')
  })
})
