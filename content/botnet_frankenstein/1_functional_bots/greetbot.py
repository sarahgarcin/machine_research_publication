## Script developed in framework of Hackers & Designers Summerschool, Amsterdam, July 2015
## Author: Michael Murtaugh

from random import choice
import sys, os

seen = set()

while True:
    # read message from chat
    i = sys.stdin.readline()
    # if there is no message: stop
    if i == '':
        break
    # remove break and whitespaces at end of message
    i = i.rstrip()
    # define different parts of message
    (time, nick, msg) = i.split(" ", 2)
    # remove ':' from nick
    nick = nick.rstrip(":")
    # if nick is new (not in set), say goodmorning + add to set
    if nick not in seen:
        seen.add(nick)
        print "Good morning " + nick
        os.system('espeak "Good morning {0}"'.format(nick))
