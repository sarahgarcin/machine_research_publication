#! /usr/bin/env python
 
"""
HelloBot in reverse (2 modes of reversing text -letters or words- depending whether the messages are public or private)
"""
 
import irc.bot
from time import sleep
 
class Bot (irc.bot.SingleServerIRCBot):
    def __init__(self, server, channel, nickname, port=6667):
        irc.bot.SingleServerIRCBot.__init__(self, [(server, port)], nickname, nickname)
        self.channel = channel
 
    def on_nicknameinuse(self, c, e):
        c.nick(c.get_nickname() + "_")
 
    def on_welcome(self, c, e):
        c.join(self.channel)
 
    def on_pubmsg(self, c, e):
        filename = e.arguments[0]
        filename=open('frankenstein_gutenberg.txt','r')
        f=filename.readlines()
        filename.close()
        for line in f:
            print line
            time.sleep(2)


#############################################
# Standard code to start the bot
#############################################
 
def main():
    import sys
    if not len(sys.argv) >= 3 :
        print "Usage: testbot server[:port] channel nickname"
        sys.exit(1)
 
    s = sys.argv[1].split(":", 1)
    server = s[0]
    if len(s) == 2:
        try:
            port = int(s[1])
        except ValueError:
            print "Error: Erroneous port."
            sys.exit(1)
    else:
        port = 6667
 
    channel = sys.argv[2]
 
    nickname = sys.argv[3]
    bot = Bot(server, channel, nickname, port)
    bot.start()
 
if __name__ == "__main__":
    main()
