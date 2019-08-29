#!/usr/bin/env python3
import grp
import json
import hashlib
import os.path
import time

# sha256sum /etc/skel/public_html/index.html
UNEDITED_INDEX_DIGESTS = [
    '1a12a62bcfcf2f488e927d8b1bd81bbb1952e0d6ae69354b2959f2e80e4359a8',
]

def get_users():
    users = {}
    url = "http://tilde.town/~"

    # Get the list of users!
    town_group = grp.getgrnam('town')
    for u in town_group.gr_mem:
        exclude = False
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
            hash = hashlib.new('sha256')
            with open(index, 'rb') as f:
                hash.update(f.read())
                if hash.hexdigest() in UNEDITED_INDEX_DIGESTS:
                    edited = 0
                else:
                    edited = 1

            # determines wether the user is a member of the ring,
            # i.e., whether they have included the ring html in
            # their index. - um
            if 'id="tilde_town_ring"' in open(index).read():
                ringmember = 1
            else:
                ringmember = 0

        except Exception:
            continue  # Ignore error. Continue to next user.

        # Adds username as a key to the dictionary
        # then adds relevant data to that key.
        # Looks like {"dan": {"homepage": "", "modtime": ""}, "edited": int, "ringmember": int}
        # Easy enough to change this format if needed later on.
        # or at other's suggestions.
        users[u] = {"homepage": url + u, "modtime": modtime, "edited": edited, "ringmember": ringmember}

    return json.dumps(users, indent=4)

if __name__ == "__main__":
    print(get_users())
