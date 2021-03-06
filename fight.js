/**
 * @copyright 2012 yayramen. 
 * @author yayramen
 * @description This is where the battle functions will be held.
 */

global.mOpponent = null;
global.mOpHealth = null;
global.mCooldown = false;
global.mConfTime = null;
global.mOwnConf = null;
global.mOwnTurn = false;
global.mFightTime = null;
global.mCanLearn = false;
global.mPotions = 0;

global.Offense = function(a){
    mOwnTurn = false;
    var b = mOpHealth - a;
    Call("My attack hit for "+a+" damage! Opponent at "+b+" HP!");
    mFightTime = setTimeout(function(){ 
        PM(mOpponent, "/ftimedout");
        Call('Fight Timed Out!');
        CalledOut = mOpponent = mOpHealth = null;mFighting = mOwnTurn = false;
    }, 30000)
};

global.Defense = function(a, b) {
    clearTimeout(mFightTime);
    mOwnTurn = true;
    mCurrentHP = mCurrentHP - a;;
    if (mCurrentHP < 1) return Faint();
    var e = "I got hit by "+b+" for "+a+" damage! Now at "+mCurrentHP+" HP!";
    mArena?Say(mOwner, e):Call(e);
    Call("It's your turn! Use a /potion, or pick an /attack!");
};

global.Damage = function(a, b) {
    return Math.floor((b - (a - 1)) * Math.random()) + a
};

global.Faint = function() {
    Call('I fainted!');
    PM(mOpponent, '/fainted '+mLevel)
    mLosses++;mCurrentHP = mHP / 10;
    Save();
    CalledOut = mOpponent = mOpHealth = null;mFighting = mOwnTurn = false;
    setTimeout(function(){ mCooldown = false; }, 1000 * 60 * 5);
};

var fCommands = [{
    command: 'fight',
    callback: function(b, a) {
        if(mType > 3) {
            if(mCooldown) return PM(mOwner, mCoolDownFight);
            for(i = 0;i < mUsers.length;i++) {
                var x = mUsers[i].userid;
                if (mUsers[i].name == a && isPet(x)) {
                    Log("User is pet");
                    PM(x, "/reqconf " + mCurrentHP + " " + mName);
                    CalledOut = true;mOpponent = x;
                    mConfTime = setTimeout(function() {
                        CalledOut = false;
                        mOpponent = null;
                    }, 5E3);
                } else if (mUsers[i].name == a) { Log("User is not pet, aborting"); }
            }
        }
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'Makes the pet fight'
},
{
    command: 'reqconf',
    callback: function(e, b) {
        if(isPet(e) && mCooldown) return PM(e, "/cooldown");
        if(!CalledOut && !mCooldown && !mOpponent && isPet(e)) {
            CalledOut = true;mOpponent = e;
            var c=b.split(" ");var d = c.shift();b = c.join(' ');
            mOpHealth = d;
            Call(b + " wants to fight! Type /accept to fight!");
            PM(e, "/sendconf "+mCurrentHP);
            mOwnConf = setTimeout(function() {
                PM(mOpponent, "/ftimedout");
                Call("Fight Timed Out!");
                mOpponent = CalledOut = null;
            }, 15000)
        }   
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'responds to fights'
},
{
    command: 'sendconf',
    callback: function(a,b,c){
        if (a == mOpponent) clearTimeout(mConfTime);
        mOpHealth = b;
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'confirms is bot'
},
{
    command: 'cooldown',
    callback: function() {
        Call("Oppenent is too weak to fight!");
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'oppenent is cooling down'
},
{
    command: 'ftimedout',
    callback: function(a, b, c) {
        Call('Fight Timed Out!');
        CalledOut = mOpponent = mOpHealth = null;mFighting = mOwnTurn = false;
    },
    level: 1,
    mode: 1, 
    hidden: true,
    hint: 'times out'
},
{
    command: 'accept',
    callback: function(a,b,c){
        clearTimeout(mOwnConf);
        mFighting = true;
        mOwnTurn = true;
        PM(mOpponent, "/accepted");
        Call("It's your turn! Pick an /attack!");
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'accept a fight'
},
{
    command: 'accepted',
    callback: function(a,b,c){
        mFighting = true;
        Call("Opponent Accepted! Wait for your turn");
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'accepted'
}];

mCommands = _.union(mCommands, fCommands);

global.mAttacks = [{
    command: 'attack',
    callback:function(a,b,c){
        var b = "Available attacks: /{attacks}"
        Call(b.replace('{attacks}', mLearned.join(', /')));
    },
    level: 1,
    mode: 1,
    hidden: true,
    owner: true,
    hint: 'shows possible attacks'
},
{
    command: 'attacked',
    callback: function(c,d){
        var a=d.split(" "),b=a[0],a=a[1];
        Defense(a, b)
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'change of information'
},
{
    command: 'stats',
    callback: function(a, b, c) {
        b = "HP: "+mCurrentHP+"/"+mHP;
        a == mOwner && (c ? PM(a, b) : Say(a, b))
    },
    level: 0,
    mode: 2,
    hidden: true,
    hint: 'Tells the bots stats.'
},
{
    command: 'ftimedout',
    callback: function(a, b, c) {
        Call('Fight Timed Out!');
        CalledOut = mOpponent = mOpHealth = null;mFighting = mOwnTurn = false;
    },
    level: 1,
    mode: 1, 
    hidden: true,
    hint: 'times out'
},
{
    command: 'fainted',
    callback: function(a, b, c) {
        CalledOut = null;mOpponent = null;mFighting = false;mCooldown = true;mOwnTurn = false;
        var d = Math.floor((10-4)*Math.random()) + 5;
        LevelUp(b*d);
        clearTimeout(mFightTime);
        Call("Opponent fainted! I gained "+b*d+" exp!");
        setTimeout(function(){ mCooldown = false; }, 1000 * 60 * 5);
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'faints'
},
{
    command: 'potion',
    callback: function(a, b, c) {
        if (mPotions > 0) {
            var d = mHP / 2;
            if (mHP - mCurrentHP < d) d = mHP - mCurrentHP;
            mCurrentHP += d;
            Call("Restored "+d+" HP!");
            PM(mOpponent, "/pass potion");
            mFightTime = setTimeout(function(){ 
                PM(mOpponent, "/ftimedout");
                Call('Fight Timed Out!');
                CalledOut = mOpponent = mOpHealth = null;mFighting = mOwnTurn = false;
            }, 30000)
        }
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'uses a pot'
},
{
    command: 'pass',
    callback: function(a, b, c) {
        clearTimeout(mFightTime);
        mOwnTurn = true;
        if (b == 'potion') e = "Opponent used a potion, my turn!";
        mArena?Say(a, e):Call(e);
        Call("It's your turn! Use a /potion, or pick an /attack!");
    },
    level: 1,
    mode: 1,
    hidden: true,
    hint: 'uses a pot'
},
///Now that we have the handshakes out of the way, the actual attacks
{
    command: 'headbutt',
    callback: function (a,b,c) {
        if (!mOwnTurn) return Call("It's not my turn to attack!");
        var dmg = Damage(this.min, this.max);
        PM(mOpponent, "/attacked headbutt "+dmg);
        Offense(dmg);
    },
    level: 1,
    min: 5,
    max: 10,
    hint: 'Headbutt. Range: 5-10'
},
{
    command: 'scratch',
    callback: function (a,b,c) {
        if (!mOwnTurn) return Call("It's not my turn to attack!");
        var dmg = Damage(this.min, this.max);
        PM(mOpponent, "/attacked scratch "+dmg);
        Offense(dmg);
    },
    level: 1,
    min: 2,
    max: 15,
    hint: 'Scratch. Range: 2-15'
},
{
    command: 'tackle',
    callback: function (a,b,c) {
        if (!mOwnTurn) return Call("It's not my turn to attack!");
        var dmg = Damage(this.min, this.max);
        PM(mOpponent, "/attacked tackle "+dmg);
        Offense(dmg);
    },
    level: 1,
    min: 3,
    max: 12,
    hint: 'Tackle. Range: 3-12'
}];