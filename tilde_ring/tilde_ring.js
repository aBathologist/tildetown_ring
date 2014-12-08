// This code is totally beta
//
//  written by ~um@tilde.town (@shon_feder)
//  with lots of help form ~dan, ~karlen, ~datagrok, ~nick, ~vilmibm
//  and tilde.town in general.
 
var tildeboxlist_urls = 'http://tilde.town/~um/json/othertildes.json';
var userlist_url = 'http://tilde.town/~dan/users.json';

// main functions, run when script loads.
window.onload = function() {
    add_event_listeners(); 
    link_tilde_ring();
};

function link_tilde_ring() {
    link_random_tildebox();
    link_random_user();
}

function add_event_listeners() {
    var ring_link      = document.getElementById('tilde_town_ring'),
        rand_box_link  = document.getElementById('random_tildebox');

    ring_link.addEventListener('click', link_tilde_ring);
    rand_box_link.addEventListener('click', link_tilde_ring);
}

// get ~user (minus ~)
function user() {
    return window.location.pathname.split('/')[1].split('~')[1];
}

// this vanilla.js ajax approach copied from user dystroy's
// SO answer: http://stackoverflow.com/a/14388512/1187277
function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send(); 
}

// TODO: serve othertildes.json in JSONP so that this scripts can just be
//       dropped into any page.
function link_random_tildebox() {
    fetchJSONFile( tildeboxlist_urls ,
                   function(data) {
                       var urls = normalize_tilde_urls( obj_values(data) );
                       
                       // console.log(urls);
                       
                       document.getElementById('random_tildebox').href = random_item(urls);
                   });
}

// TODO: get tildes to store user JSON in standard location?
function link_random_user() { 
    fetchJSONFile( userlist_url,
                   function(users) {
                       delete users[user()];
                       var urls   = normalize_for_random_user(obj_values(users)),
                           tilde_ring_link = document.getElementById('tilde_town_ring');

                       // console.log("other ~ring members: ");
                       // console.log(urls);
                       
                       tilde_ring_link.href = random_item(urls);
                   });
}


// "normalizing" tilde urls means removing traling slashes and
// removing the host from the array
function normalize_tilde_urls(urls) {
    urls.push('http://tilde.club');     // compensating for tilde.club's club-centricism ;)

    function last(array) {
        return array[array.length - 1];
    }    

    function trim_trailing_slash(string) {
        return ( (last(string) == "/")
                 ? string.slice(0, string.length-1)
                 : string
               );
    }

    var trimmed_urls  = urls.map(trim_trailing_slash),
        host_tildebox = window.location.hostname;

    return remove(trimmed_urls, host_tildebox);
}

// "normalizing" for a random user means eliminating users who haven't
// edited their pages and haven't joined the ring
// and returning the remainder. 
function normalize_for_random_user(users) {
    return users.filter(function(u) {return u.edited && u.ringmember;})
                .map(function(o) { return o.homepage; });

    // ring_members = user_props.filter(function(x){ return ; }),
    // member_urls  = ring_members.,

}


function remove(array, x) {
    var index = array.indexOf(x);
    if ( index > -1 ) {
        array.splice(index, 1);
    };
    return array;
}


function random_item(items) {
    return items[Math.floor(Math.random()*items.length)];
}

// Object {key:values} -> Array [values]
function obj_values(obj) {
    var values = [];
    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            values.push(obj[key]);
        }
    }
    return values;
}
