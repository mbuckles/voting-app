(function() {

    const app = angular.module('app', ['ngRoute', 'angular-jwt']);

    app.run(function($rootScope, $location, $window, $http) {

        // Add default Authorization Bearer header to be validated with each request

        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.localStorage.token

        $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
            if(nextRoute.access !== undefined && nextRoute.access.restricted === true  &&  !$window.localStorage.token) {
                event.preventDefault();
                $location.path('/');
            }
            if($window.localStorage.token && nextRoute.access.restricted === true) {

                $http.post('/api/verify-token', { token: $window.localStorage.token })
                     .then(function(response) {
                      }, function(err) {
                         // invalid token. delete token in local storage to prevent further inauthentic requests to API
                         delete $window.localStorage.token;
                         $location.path('/login')
                     })
            }
        });
    })

    app.config(function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider.when('/', {
            templateUrl: 'main.html',
            controller: 'MainController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });
        $routeProvider.when('/allpoll', {
            templateUrl: 'allpoll.html',
            controller: 'AllPollController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });
        $routeProvider.when('/profile', {
            templateUrl: 'profile.html',
            controller: 'ProfileController',
            controllerAs: 'vm',
            access: {
                restricted: true
            }
        });
        $routeProvider.when('/register', {
            templateUrl: 'register.html',
            controller: 'RegisterController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });
        $routeProvider.when('/login', {
            templateUrl: 'login.html',
            controller: 'LoginController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        })
        $routeProvider.when('/polls', {
            templateUrl: 'polls.html',
            controller: 'PollsController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });
        $routeProvider.when('/poll/:id', {
            templateUrl: 'poll.html',
            controller: 'PollController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        })
        $routeProvider.otherwise('/')

    })


    app.controller('MainController', MainController);

    function MainController() {
        const vm = this;
        vm.title = "Main";
    }
//View All Polls
    app.controller('AllPollController', AllPollController);

    function AllPollController($http, $window, $location, jwtHelper) {
        var vm = this;
        vm.title = "All Polls";
        vm.polls = [];

// returns all polls
        vm.getAllPolls = function() {
            $http.get('/api/allpolls').then(function(response) {
                vm.polls = response.data;
            });
        }
        vm.getAllPolls();
         function drawChart() {
         var chartArray = [];
         chartArray.push(['Name', 'Votes']);
         for(var i = 0; i < vm.data.options.length; i++){
             chartArray.push([vm.data.options[i].name, vm.data.options[i].votes ])
         }
         //console.log(chartArray);
         var data = google.visualization.arrayToDataTable(chartArray);
         var options = {
           title: vm.data.name
         };
         var chart = new google.visualization.PieChart(document.getElementById('piechart'));
         chart.draw(data, options);
       }

        var onSuccess = function(response) {
          console.log('response below');
            console.log(response.data)
            vm.poll = {};
            vm.getAllPolls();
        }
        var onError = function(err) {
            console.error(err)
        }
    }

    app.controller('PollController', PollController);

    function PollController($http, $routeParams, $window, $location, $scope) {
        const vm = this;
        vm.title = "Poll";
        vm.poll;
        vm.data;
        vm.link = 'https://mb-voting-app.herokuapp.com/' + $location.path();

        vm.addOption = function(id) {
          var id =  $routeParams.id;
          var option = vm.option;
          console.log(option);

          if(option) {
            $http.put('/api/poll/' + id, { option: vm.option, id: $routeParams.id }).then(function(response) {
            vm.option = null;
            vm.getPoll();
          })
            }
          }

        vm.getPoll  = function() {
             var id = $routeParams.id;
             $http.get('/api/poll/' + id)
                  .then(function(response) {
                     vm.id = response.data._id;
                     vm.owner = response.data.owner;
                     vm.poll = response.data.options;
                     vm.data = response.data;
                     google.charts.load('current', {'packages':['corechart']});
                     google.charts.setOnLoadCallback(drawChart);
                  }, function(err) {
                     $location.path('/polls');
                  })
         }
         vm.getPoll();

         function drawChart() {
         var chartArray = [];
         chartArray.push(['Name', 'Votes']);
         for(var i = 0; i < vm.data.options.length; i++){
             chartArray.push([vm.data.options[i].name, vm.data.options[i].votes ])
         }
         //console.log(chartArray);
         var data = google.visualization.arrayToDataTable(chartArray);
         var options = {
           title: vm.data.name
         };
         var chart = new google.visualization.PieChart(document.getElementById('piechart'));
         chart.draw(data, options);
       }

     vm.vote = function(id) {
       var pollid =  $routeParams.id;
       console.log('poll id below');
       console.log(pollid);
       var id = vm.selected;
       console.log('option id below');
       console.log(id);
       if(vm.selected) {
         $http.put('/api/poll-vote/' + id , {id: vm.selected, pollid: $routeParams.id}).then(function(response) {
           vm.selected = null;
           vm.getPoll();
         })
       }
     }

     vm.getAllPolls = function() {
       $http.get('/api/polls').then(function(response) {
         vm.polls = response.data;
       });
     }

     //delete poll
     vm.deletePoll = function(id){
       var id =  $routeParams.id;
       console.log(id);
       $http.delete('/api/poll/' + id).then(function(response) {
         $location.path('/polls');
       })
     }

     var onSuccess = function(response) {
       console.log('response below');
         console.log(response.data)
         vm.poll = {};
         vm.getAllPolls();
     }
     var onError = function(err) {
         console.error(err)
     }

     vm.logOut = function() {
       $window.localStorage.removeItem('token');
       vm.message = 'Logging you out...'
       $timeout(function() {
         vm.message = '';
         $location.path('/');
       }, 2000)
     }

}

  app.controller('PollsController', PollsController);

        function PollsController($http, $window, $location, jwtHelper) {
            var vm = this;
            var user = jwtHelper.decodeToken($window.localStorage.token);
            console.log(user);
            vm.id = user.data._id;
            console.log(vm.id);
            vm.title = "Add Polls";
            vm.polls = [];
            vm.poll = {
                name: '',
                options: [{
                    name: '',
                    votes: 1,
                }]
            }
            vm.isLoggedIn = function() {
                if(!$window.localStorage.token) {
                    return false;
                }
                if(jwtHelper.decodeToken($window.localStorage.token)) {
                    return true;
                }
                return false;
            }
            vm.isLoggedIn();

            vm.getAllPolls = function() {
                $http.get('/api/polls').then(function(response) {
                    vm.polls = response.data;
                });
            }
            vm.getAllPolls();

            vm.addPoll = function() {
              //console.log($window.localStorage.token);
                if(!$window.localStorage.token) {
                    alert('Cannot create a poll without an account');
                    return;
                }
                if(vm.poll) {
                  console.log('vm.poll below');
                  console.log(vm.poll);
                    var payload = {
                        owner: jwtHelper.decodeToken($window.localStorage.token).data.name || null,
                        name: vm.poll.name,
                        options: vm.poll.options,
                        token: $window.localStorage.token
                    }
                  $http.post('/api/polls' , payload).then(onSuccess, onError);
                  vm.getAllPolls();
                }
                else {
                    console.log('No poll data supplied');
                }
            }

            vm.addOption = function() {
                vm.poll.options.push({
                    name: '',
                    votes: 1
                })
            }

            var onSuccess = function(response) {
              console.log('response below');
                console.log(response.data)
                vm.poll = {};
                vm.getAllPolls();
            }
            var onError = function(err) {
                console.error(err)
            }
            vm.logOut = function() {
                $window.localStorage.removeItem('token');
                vm.message = 'Logging you out...'
                $timeout(function() {
                    vm.message = '';
                     $location.path('/');
                }, 2000)
            }

        }


    app.controller('ProfileController', ProfileController);

    function ProfileController(jwtHelper, $window, $location, $http, $timeout) {
        const vm = this;
        vm.title = "Profile";
        vm.currentUser = null;
        vm.polls = [];
        const token = $window.localStorage.token;

        vm.getPollsByUser = function() {
            $http.get('/api/user-polls/'+ vm.currentUser.name)
                 .then(function(response) {
                     vm.polls = response.data;
                  //   console.log(vm.polls[1]);
                 }, function(err) {
                     console.log(err)
                 })
               }
        if(token) {
           vm.currentUser = jwtHelper.decodeToken(token).data;
           if(vm.currentUser !== null )  {
               vm.getPollsByUser();
           }
        }

        vm.logOut = function() {
            $window.localStorage.removeItem('token');
            vm.message = 'Logging you out...'
            $timeout(function() {
                vm.message = '';
                 $location.path('/');
            }, 2000)
        }

        vm.deletePoll = function(_id) {
          console.log(vm.currentUser.name);
          console.log(_id);
          if(_id !== null) {
            $http.delete('/api/polls/' + _id).then(function(response) {
              vm.getPollsByUser();
            }, function(err) {
              console.log(err)
            })
          }
          else {
            return false;
          }
        }

    }

    app.controller('RegisterController', RegisterController);

    function RegisterController($location, $http, $window, $timeout) {
        const vm = this;
        vm.title = "Register";
        vm.user = {
            name: '',
            password: ''
        }
        vm.register = function() {
            if(vm.user) {
                $http.post('/api/register', vm.user).then(onSuccess, onError);
                $timeout(function() {
                    vm.error = ''
                }, 5000)
            }
            else {
                $location.path('/register');
            }
        }

        const onSuccess = function(response) {
            $window.localStorage.token = response.data;
            $location.path('/profile');
        }
        const onError = function(err){
            if(err.data.code === 11000) {
                vm.error = "This user already exists";
            }
            vm.user = null;
            $location.path('/register');
        }
    }

    app.controller('LoginController', LoginController);

    function LoginController($http, $window, $location, $timeout) {
        const vm = this;
        vm.title = "Login";
        vm.user = {
            name: '',
            password: ''
        }
        vm.login = function() {
            if(vm.user) {
                $http.post('/api/login', vm.user).then(onSuccess, onError);
            }
            else {
                vm.user = null;
                $location.path('/login');
            }
        }
        const onSuccess = function(response) {
            $window.localStorage.token = response.data;
            $location.path('/profile');
        }
        const onError = function(error) {
            console.log(error)
        }
    }
}());
