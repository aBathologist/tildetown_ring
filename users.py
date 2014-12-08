
#!/usr/local/bin/python
import json
import subprocess
import os.path
import os
import time

def get_users():
    users = {}
    url = "http://tilde.town/~"

    # Get the list of users!
    with open("/etc/passwd", "r") as f:
        for line in f:
            exclude = False
            if "/bin/bash" in line:
                u = line.split(":")[0]  # Grab all text before first ':'

                # Exclude list for the feed if required.
                with open(os.path.expanduser("~/.user_exclude"), "r") as e:
                    for eline in e:
                        if u in eline:
                            exclude = True
                            break  # Break just exits the current loop
                if exclude:
                    continue  # Move on to next user

                folder = "/home/"+u+"/public_html/"
                index = folder + "index.html"

                try:
                    # Some system users don't have index.html's
                    # This try/except just supresses the error,
                    # ignores the system user and continues looping.
                    createdtime = time.ctime(os.path.getctime(index))
                    modtime     = time.ctime(os.path.getmtime(index))

                    # determines whether the file has been edited
                    # ( I would think that the then ... else branches
                    #   should be switched, but that gives an inverted
                    #   result. WTF? ) - um
                    if modtime == createdtime:
                        edited = 1 # will be read as "false" by javascript
                    else:
                        edited = 0 # will be read as "true" by javascript

                    # determines wether the user is a member of the ring,
                    # i.e., whether they have included the ring html in
                    # their index. - um
                    if 'id="tilde_town_ring"' in open(index).read():
                        ringmember = 1
                    else:
                        ringmember = 0

                except:
                    continue  # Ignore error. Continue to next user.

                # Adds username as a key to the dictionary
                # then adds relevant data to that key.
                # Looks like {"dan": {"homepage": "", "modtime": ""}, "edited": int, "ringmember": int}
                # Easy enough to change this format if needed later on.
                # or at other's suggestions.
                users[u] = {"homepage": url + u, "modtime": modtime, "edited": edited, "ringmember": ringmember}

    return json.dumps(users, indent=4)

if __name__ == "__main__":
    print get_users()
