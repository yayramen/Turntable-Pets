/**
 * @copyright 2012 yayramen. 
 * @author yayramen && Axe_
 * @description This is the file that contains the type commands
 * @Type: Dog
 */

global.mHungry = ["I'm hungry D:", "Can I have a treat? I'm starving!", "forget dog food can i have a bite of what you are eating?"];
global.mSpeak = ["I'm excited to see you!", "ahwooooOOoooOOo. <.<", "I may not seem tuff, but I could rip you to shreds :)", "meow- i mean bark."];
global.mFed = ["That tasted way better than i thought it would!", "yumm :)", "I usually only eat PREMIUM dog food, but that was alright :)"];
global.mBathed = ["I'm to busy for a bat-SQUIRREL"];
global.mIdle = ["/me stretches and lays down", "/me howls", "Bark.", "i'mmmm sllleeeeeepppppy *yawns*"];

var sCommands = [{
    command: 'pet',
    message: ["^-^ Thank youuuuu :D", "<3", "/me howls (happy)", "/me bites hand (don't sneak up on me like that!)"],
    callback: function (a, b) {
        if (b == '@'+mName) Say(a, Random(this.message));
    },
    level: 0,
    mode: 0,
    hint: 'Pets the dog'
},
{
    command: 'eat',
    callback: function (a, b) {
        Say(a, "/me chows down on "+b);
    },
    level: 0,
    mode: 1,
    owner: true,
    hint: 'the dog eats'
}];

mCommands = _.union(mCommands, sCommands);