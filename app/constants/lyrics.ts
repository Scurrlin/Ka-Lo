import { LYRIC_CATALOG, type LyricCatalogSong } from "./music";

export type LyricSong = Readonly<{
  id: `lyrics-${string}`;
  href: `#lyrics-${string}`;
  title: string;
  credits?: string;
  lyrics: string;
}>;

export type LyricRelease = Readonly<{
  id: `lyrics-${string}`;
  href: `#lyrics-${string}`;
  title: string;
  kind: "single" | "album";
  songs: readonly LyricSong[];
}>;

const LYRIC_TEXTS = {

"lyrics-kings-road":

`So I slow ride
To my South Side
To find clear eyes
Damn right, damn right

A lot of y'all been acting different since I made my own
Way to the king's throne, fuck everything you known

I'm standing tall even if I gotta stand alone
Break from the dream's mold, reality untold

I made a pot of gold
Even tho they told me not too
But they stuck up on the preview
While I'm working on my Part 2

Cuz they didn't know
Once this dries there's no undo
I see Earth in her birthday suit
And my footprint is a tattoo

Let’s see where it goes
Be like Tupac or Big
As a kid I was grown
Never too hot to dig
Cuz I knew all along
A true shot to the wig
Only few did belong
So I locked in to win

And since then I been headed to a new view
I be running from the bikes like they Voodoo
One pedal and the cycle continues
So don't come near me like you used to used to

This is the love that I been had
Cuz anybody finna take it just to send back
A lot of y'all splitting hairs like its Kit Kat
But don't come near me with the chit-chat, chit-chat

This is love, this is it, this is not a bluff
I was all in it like it was some sort of tummy tuck

Everybody was talking like they was new to love
But really they was new to nothing

Damn right

A lot of y'all been acting different since I made my own
Way to the king's throne, fuck everything you known

I'm standing tall even if I gotta stand alone
Break from the dream's mold, reality untold

I made a pot of gold
Even tho they told me not too
But I'm way up past my curfew
From the moon's point of view

Cuz they didn't know
No such thing as dreaming too soon
Unless you busy acting taboo
That's between God and you

I made a pot of gold
From the chains of my foes
It's on a hot stove
Of what remains of they hope

Only the Lord knows
On how I praise and it shows
I don't go toe to toe
With those six feet below

But if I did only know
It'd be Tupac or Big
Cuz after ten going against the wind
It was simple as this

Inhaling, exhaling

Against the elements
Baby I think I'm elegant
Nature was always dominant
At the same time so delicate
Reflection of my etiquette
That should be more than evident
One hand appeared innocent
The other a little militant

So I slow ride
To my South Side
To find clear eyes
Damn right, damn right

Against the elements
Machiavelli was president
I don't wanna seem arrogant
I just wanna be relevant
Is it really so detriment?
My life, truly a testament
Let's not ignore the elephant
We do this for hell of it

So I slow ride
To my South Side
To find clear eyes
Damn right, damn right

And now I'm gone`,

"lyrics-deep-end":

`Yeah this world
Got me slipping in the
Got me slipping in the deep
Yeah got me slipping in the

Got me slipping in the deep end that's why I depend on ya
Hand out of reach, God do me a favor
I don’t wanna leave I know I pretend not to
Care but I do give me the weekend to show ya

I’m reaching out

Got me slipping in the
Got me slipping in the deep
Yeah got me slipping in the

Got me slipping in the deep end that's why I depend on ya
Hand out of reach, God do me a favor
Yeah this world

Yeah, I came up short with my investment trying not to drown
No lifeguards in that department so why make a sound
If you ain't got the right garment then you playing around
Like wearing sandals to a summit where you running now

Careful don't slip, you got ya head in the clout
I seen the whole clip, of you wildin’ out
You on yo cannon shit, blowing up my style
Don't matter who ya hit
As long as they double click on ya profile

What happened to common sense, is it really broke now?
One day it will all make sense, just hope I'm still around
Coast to coast, like I'm Vince going to Motown
If I float, is it magic or is heaven calling down?

That's my preminisce, call me by my pronoun
Himothy wait and see uh
Yeah this world

Got me slipping in the deep end that's why I depend on ya
Hand out of reach, God do me a favor
I don’t wanna leave I know I pretend not to
Care but I do give me the weekend to show ya

Got me slipping in the deep
Got me slipping in the deep end
Yeah this world

Got me slipping in the deep end that's why I depend on ya
Hand out of reach, God do me a favor
Yeah this world

I tuned in to the world reflecting in the Cherry Bomb crater
That Cherry Bomb created while the Carters contemplated
Now check the coordinates, who’s recording this?
My name is on the ordinance, but I don't know who ordered this

First class to the salt flats past the border fence
Half-mast for the dog tags at border fence
Fingers crossed, hope its greener on the other side
Who hitting pause on the dreamers and their idle eyes?

What is the cost if we sanitize their minds?
I'm mortified but fortified, glorified but borderline
Just a quarter mile before the finish line
Ju-ju-just a quarter mile before the finish line

Got me slipping in the deep end that's why I depend on ya
Hand out of reach, God do me a favor
I don’t wanna leave I know I pretend not to
Care but I do give me the weekend to show ya

Got me slipping in the deep
Got me slipping in the deep end
Yeah this world

Got me slipping in the deep end that's why I depend on ya
Hand out of reach, God do me a favor
Yeah this world`,

"lyrics-silver-cracks-intro":

`You know something really stuck with me that L.A. Reid once said
He said, “When I look up, I don’t see barriers, I don’t see the ceiling…
I just see the sky”
Be unlimited in your belief

Remember, freedom ain’t free
You must be willing to give up who you are
For what you will become

Stay humble young king
Maintain order for yourself
Love

A man does not simply attract what he wants
He attracts what he is

Your crown has already been paid for young king
All you have to do is put it on and wear it

What’s your move playa?
What’s your move?`,
  "lyrics-silver-cracks-us": `Oh my God what you talkin’ ‘bout?
Careful young nigga why you talkin’ loud?
Why you talkin’ loud?

Putting up a front seems fine
But I ain’t seen mine
These schemes can’t hide what really be inside when the spotlight shines
Bright lights outside
But you know I don’t mind
Cuz I’m back on track, back online, did you see the signs this time?

My payload on the railroad
But I’m losing my train of thought
Still searching for locomotives to help me navigate around the block
But I’m told I hold all the answers within my soul
By corporate pranksters that always stole
They think they gangsters
So who gon’ make ‘em stop?

You? Or me?
Us? Let's see
You? Or me?
Us? Let's see

It’s getting hard to tell
Within these walls none can compel
Might leave this like Dave Chappelle
I don’t wanna hear what they tryna sell
Bid em’ farewell, then I turn the tale
Ding dong ditch when I ring the bell
Hold my breath when I smell the smell
No face to face, but I caught the tell
No face to face, still I called to tell

We live in that fake it ‘til you make it type of culture
Always been known, pick ya part like a vulture
All I really wanted was a little recognition from the owners
But they never let me kick it court side with the donors, ahh!
Guess they didn’t wanna risk losing voters, did they think I wouldn’t notice
How they switch up when we go from off the record to official?
Must’ve missed what I’d written on the wall...
I'm not yo’ traditional nigga

Oh my God what you talkin’ ‘bout?
Careful young nigga why you talkin’ loud?
Why you talkin’ loud?
Let someone else worry child
Let someone else worry child

So who it finna’ be?
You? Or me?
Us? Let’s see
You? Or me?
Us? Let’s see
Us? Let’s see
You? Or me?
Us? Let’s see

Careful young nigga why you talkin’ loud?
Why you talkin’ loud?
Let someone else worry child
Why you talkin’ loud?

Maybe it’s us?
It's probably us...`,
  "lyrics-silver-cracks-terms-and-conditions": `Ayo Kaleb! I got some paperwork for you to sign man
I need you to get yo shit
This ain't like that record label shit
This that real shit
This that, if you really about this
You gon’ sign this for yo soul man
This is for yo soul contract…

Terms and conditions, my heart yearns for attention
Whole lotta fine print, but I read between the lines
Firm hand position, writing stern with conviction
No model type shit, but the blueprint aligns

Strictly with me
I know it’s hard to believe, but these things are clearly
Only deceiving yo mind, and that's a pity
But I can't stop and rewind, I'm here to commit completely
Knowing that I'll be fine

Cuz this is public speaking at its finest
Forget speaking all loud I’m too busy breaking the silence
With a simple small sound that’s been hidden deep inside us
This ain’t me running my mouth
But damn it, it’s a crisis
So y’all might as well

Take a second, and hear what I’m saying
Niggas out here chasing after masters and y'all think we playing
Shit this a revolution, fuck what you saying
It’s gone be televised regardless
Don't matter who you paying

Don't matter if they print in gold
My soul could never be sold
I see the hands that try to take control
My pen designed for me and me alone
if you reach you risk yo life

Don't matter if they print in gold
My soul could never be sold
I see the hands that try to take control
My pen designed for me and me alone
If you reach you risk yo life

Yo hello? Is this shit working?
My nigga can you hear me?
Shit, I don't know if… fuck
Yo I'm hitting you up again cuz I haven't heard back from you
Don't go signing anybody else's bullshit
I need you to commit to this right here aight?
Fuck man, stop playing around!

People like to speak on my behalf
I sit back and laugh
And let the words pass by like the wind

Fatal to those dreams made of glass
But my die is cast
So I'mma let it ride ‘til the end

Not one to pretend, not yet
Life ain't all fun, take it how I can son
Not one to pretend, not yet
Wonder if I'll change when I'm standing in the spotlight

Cuz they gon’ holler out “sign-on bonus”
With a suit and a tie telling me how to sell this
And I’mma, have to bring it right into focus
So I can root out the lie, thought I wouldn’t notice

But I notice everything
Some things are sold with a wedding ring
Till death do us part, hear heaven sing
But the only contract that I'm signing's
With my soul that's on everything
So let me call that number back
Let me call that number back
Let me call that number back
Let me call that number back

Don't matter if they print in gold
My soul could never be sold
I see the hands that try to take control
My pen designed for me and me alone
If you reach you risk yo life

It’s about damn time…`,
  "lyrics-silver-cracks-behind-the-mind": `What else is you looking for?
My mind so hard to ignore
What else is you looking for?
My mind so hard to ignore

But I do it anyways cuz losing track of the days
Is something I can’t afford Lord
But I do it anyways cuz sometimes I can't face
What's hidden beneath the trap door

But I do it anyways
Cuz life has the habit of throwing me in the race
Without having my jacket or even a shoelace
The world is getting cold but damn it I hold pace
But I can't let my mind fold
This the moment I try and remove the blindfold
And hope to God He let me end on a high note
Feeling like a soprano without the hassle

What’s a tear to a nigga, fear to a winner?
Thoughts are circling swear the atmosphere feels thicker
Thought one, thought two severe head trauma
Thought one, thought two

What’s a tear to a nigga, fear to a winner?
Thots are circling swear the atmosphere feels thiccer
Thot one, thot two severe head giver
Thot one, thot two

What else is you looking for?
My mind so hard to ignore
What else is you looking for?
My mind so hard to ignore

But I do it anyways cuz losing track of the days
Is something I can’t afford Lord
But I do it anyways cuz sometimes I can't face
What's hidden beneath the trap door

Beneath the trap door
Beneath the trap door
If I demand more
I gotta be willing to push my hand forward

Said I gotta be willing to push
I said I gotta be willing to push
I said I gotta be willing to push
If I demand more
Beneath the trap door
Damn it I’mma have more

Pushing past, I hope it last
Don't wanna crash
I see the path behind the mask
I break the glass
Hiding behind the mind but soon be within my grasp
The hard to find are the ones that normally last

So I'm combing through the archives looking for silver
Lining of the files tell me all but clearer
And when I find it just check the paraphernalia
A sign that I'm no longer hidden behind my mind`,
  "lyrics-silver-cracks-oddities": `More than you know
Lord here I come yeah, yeah
Lord here I - more than you know
Lord here I come yeah, yeah
Lord here I - more than you know

Always paid attention to the details
No matter, how minor
Why you always tryna resell
another's designer?
I can tell who really XLs
Based on attire
Loose clothing, baggy as hell
Helps with the fire

No restrictions in my movements uh
Always ready to go, it’s a sign of a pro
No illusions or behoovements no
Takes a moment alone but you'll grow more than know
But you'll grow more than know
But you'll grow more than know
But you'll grow more than know

Swear there’s a lot of crows on my journey trying to
Control my outcome, but how dumb do I really look?
My affairs ain't a place for your corny moves
So roll without them or succumb to that very hook

Who cares for the choice that I plan to choose?
Call on Wisdom for this problem if his day ain't booked
Cuz I'm the one that gotta walk in these very shoes
Murder she wrote, when she know I got shit to lose

An opportunity knocking like it was police
Intimidating at first, but it was the Oddities
What the Oddities? Yes the Oddities
A strange part of me that went against conformity
An opportunity knocking like it was police
Intimidating at first, but it was the Oddities
What the Oddities? Yes the Oddities
A strange part of me that went against conformity

More than you know
Lord here I come yeah, yeah
Lord here I - more than you know
Lord here I come yeah, yeah
Lord here I - more than you know

Always paid attention to the details
No matter, how minor
Why you always tryna resell
another's designer?
I can tell who really XLs
Based on attire
Loose clothing, baggy as hell
Helps with the fire

No restrictions in my movements uh
Always ready to go, it’s a sign of a pro
No illusions or behoovements no
Take a moment alone but you'll grow more than know
But you'll grow more than know
But you'll grow more than know
But you'll grow more than know

I said part the sea, pardon me
Pardon me please
This is the heart of me, hard on me
Hard to believe
But this my odyssey, odd to see
Even for me

But I make it work
Regardless if you understand the pressures of my hurt
Rather fail knowing it was me for the record
Instead of selling out, just so I can make it forward
Even if that means being outcast to the outskirts,
At least I unmasked my powers first

Lord here I come yeah, yeah
Lord here I - more than you know
Lord here I come yeah, yeah
Lord here I - more than you know

More than you know
More than you know
More than you know`,
  "lyrics-silver-cracks-figure-it-out": `I would love to figure it out, but let me
tell you my doubts, cuz lately
I ain’t that proud or maybe
I ain’t that wild

It's kinda hard to tell from this crowd that I'm standing in
The moment is loud but I'm managing
I think I might shout, but it's damaging
Figure it out

I’m in a predicament talk about sentiments Lord
I might need some help now
Just look at the increments between the syllabus
Tell me how much grey ya found
I see us as limitless despite the decadence
That is why we thug it out
Let’s thug it out
Figure it out

(Guitar Solo)

I swear we got a lot of things against us
Tryna keep us a part
But I'm standing on business
So I speak from the heart
Hoping y’all bear witness when we stand in the yard
See my hand waving senseless pulling you out the dark

Cuz that’s what they did for me
An extra hand was a spark for me
Did more than leave a mark on me
Birthright wasn’t hard to see
Had to clear the air consciously

Cuz I don't know, what to do though
But I guess in the end its best to just go and
Figure it out`,
  "lyrics-silver-cracks-tough-skin": `Tough skin tho
If you didn't know
Tough skin tho
I had to let it grow
Tough skin tho
Always been my own
Tough skin tho

Needed that tough skin since back when
Even more in the present, past tense was a past friend
But careful friend cuz now it’s a weapon
Cheated for trusting, as black men
We all know that lesson, life always on the backspin
We cursed without exception

Pressing up against you
Pressing up against me
What are we to really do?
Daggers aimed at our feet
But it ain't getting through
This is years of practice, years of tactics
Acting like this cuz I proved the fact is
When life hits, you can push past the violence
With an iron chin I move in silence

Tough skin tho
If you didn't know
Tough skin tho
I had to let it grow
Tough skin tho
Always been my own
Tough skin tho

So when should I turn it off tho?
That’s the real question, that’s the real point of contention
That’s the expression I been compressin’ inside of my mental
It feels like a broke clock tho,
Stuck in the moment, fists clenched, hands frozen
Time spent withholding

Wonder who taught me to be this way?
Was it my teacher?
Was it the actions of my mother?
Was it the absence of my father?

One day he might hear this through a speaker
Pretend it’s all from his teachings
Then call me up for a feature
Acting like it’s all standard procedure
Naw fuck that bro

Tough skin tho
If you didn't know
Tough skin tho
I had to let it grow
Tough skin tho
Always been my own
Tough skin tho`,
  "lyrics-exercises-1": `Placeholder lyrics for Finna do?.

Additional verses and choruses will be added here.`,
  "lyrics-exercises-2": `Placeholder lyrics for Bliss.

Additional verses and choruses will be added here.`,
  "lyrics-exercises-3": `Placeholder lyrics for Help.

Additional verses and choruses will be added here.`,
  "lyrics-exercises-4": `Placeholder lyrics for Somethin' Special.

Additional verses and choruses will be added here.`,
  "lyrics-exercises-5": `Placeholder lyrics for Looking Glass.

Additional verses and choruses will be added here.`,
  "lyrics-exercises-6": `Placeholder lyrics for Birds Calling Out.

Additional verses and choruses will be added here.`,
  "lyrics-melody": `Placeholder lyrics for Melody.

Additional verses and choruses will be added here.`
} as const satisfies Readonly<Record<`lyrics-${string}`, string>>;

export const LYRIC_RELEASES: readonly LyricRelease[] = LYRIC_CATALOG.map(
  (release) => ({
    id: release.id,
    href: release.href,
    title: release.title,
    kind: release.kind,
    songs: release.songs.map((song: LyricCatalogSong) => {
      const lyrics = LYRIC_TEXTS[song.id as keyof typeof LYRIC_TEXTS];
      if (lyrics === undefined) {
        throw new Error(`Missing lyrics text for ${song.id}`);
      }
      return {
        id: song.id,
        href: song.href,
        title: song.title,
        credits: song.credits,
        lyrics
      };
    })
  })
);
