// This code is totally beta
//
//  written by ~um@tilde.town (@shon_feder) and ~dan@tilde.town
//  with lots of help form ~karlen, ~datagrok, ~nick, ~vilmibm
//  and tilde.town in general.

/*
 * CONSTANTS
 *
 * */

var tildeboxlist_urls = 'https://tilde.town/~um/json/othertildes.json';
var userlist_url = 'https://tilde.town/~dan/users.json';

/*
 *  MAIN FUNCTIONS
 * 
 * */

// run when page is loaded
window.onload = function() {
    add_event_listeners();
    link_tilde_ring();
};

function add_event_listeners() {
    var ring_link_rand = document.getElementById('tilde_town_ring'),
        rand_box_link  = document.getElementById('random_tildebox'),
        ring_link_next = document.getElementById('tilde_town_ring_next');

    ring_link_rand.addEventListener('click', link_tilde_ring);
    
    add_tilde_ring_listener_if_present( rand_box_link );
    add_tilde_ring_listener_if_present( ring_link_next );
}

function link_tilde_ring() {
    if (document.getElementById('random_tildebox')) {link_random_tildebox();};
    link_users();
}


/*
 * FETCHING DATA AND GENERATING HREF VALUES FOR LINKS
 *
 * */

// generates a random href value for a link dependng on the list of tilde boxes
function link_random_tildebox() {
    fetchJSONFile( tildeboxlist_urls ,
                   function(data) {
                       var urls = normalize_tilde_urls( obj_values(data) );
                       document.getElementById('random_tildebox').href = random_item(urls);
                   });
}

// generates href values for links that depend upon the user list
function link_users() {
    fetchJSONFile( userlist_url,
                   function(users) {

                       var user_url = users[user()].homepage,
                           urls     = normalized_user_urls(obj_values(users)),
                           
                           random_user_link = document.getElementById('tilde_town_ring'),
                           next_user_link   = document.getElementById('tilde_town_ring_next');

                       random_user_link.href = random_item(remove(urls, user_url));
                       if (next_user_link) { // ensure user has next link
                           next_user_link.href = next_item(user_url, urls);
                       }

                   });
}


/*
 * NORMALIZING DATA
 *
 * */

// normalized tilde urls have trailing slashes trimmed
// remove the host from the array
function normalize_tilde_urls(urls) {
    urls.push('http://tilde.club');     // compensating for tilde.club's club-centricism ;)

    var trimmed_urls  = urls.map(trim_trailing_slash),
        host_tildebox = window.location.hostname;

    return remove(trimmed_urls, host_tildebox);
}

// normalized_user_urls :: [users] -> [user_urls]
// "normalization" here means ...
// - eliminating users who haven't joined the ring
// - sorting the list
// - and returning the homepage urls of the remainder.
function normalized_user_urls(users) {
    return users.filter(function(u) {return u.ringmember;})
                .map(function(o) { return o.homepage; })
                .sort();
}

/*
 * GET PAGE-ENVIORONMENT VALUES
 *
 * */

// use to add listeners for links which are option to
// include: e.g., "random ~box" and "next ~user"
function add_tilde_ring_listener_if_present(link) {
    if (link) {
        link.addEventListener('click', link_tilde_ring);
    }
}

// get ~user (minus ~)
function user() {
    return window.location.pathname.split('/')[1].split('~')[1];
}

/*
 * GENERAL UTILITIES
 *
 * */

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

function last(array) {
    return array[array.length - 1];
}

function trim_trailing_slash(string) {
    return ( (last(string) == "/")
             ? string.slice(0, string.length-1)
             : string
           );
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

// next_item :: (ref_item, [items]) -> next_item
//
function next_item(item, items) {
    var item_index = items.indexOf(item),
        next_index = item_index == (items.length - 1)
                     ? 0
                     : item_index + 1
                     ;
                    
    return items[next_index];
}
