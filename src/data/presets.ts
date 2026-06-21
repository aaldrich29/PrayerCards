import type { Cadence, CardType } from '../types';

export interface PresetCard {
  type: CardType;
  title: string;
  verseRef?: string;
  body?: string;
}

export interface PresetStack {
  id: string;
  name: string;
  description: string;
  /** Suggested category name pre-filled in the deploy dialog. */
  suggestedCategory?: string;
  /** Suggested cadence pre-selected in the deploy dialog. */
  suggestedCadence?: Cadence;
  cards: PresetCard[];
}

// Names of God set by Steve Gaines (Bellevue Baptist Church). Verse text mostly NASB,
// with Psalm 23 and Isaiah 26:3 in KJV, transcribed faithfully from the original cards.
const namesOfGod: PresetCard[] = [
  // Jehovah Shammah
  { type: 'request', title: 'Jehovah Shammah — The LORD Is With Me', body: 'Worship God as Jehovah Shammah, the LORD who is always with you.' },
  { type: 'verse', title: 'Jehovah Shammah', verseRef: 'Psalm 16:11', body: 'You will make known to me the path of life; in Your presence is fullness of joy; in Your right hand there are pleasures forever.' },
  { type: 'verse', title: 'Jehovah Shammah', verseRef: 'Isaiah 41:10', body: 'Do not fear, for I am with you; do not anxiously look about you, for I am your God. I will strengthen you, surely I will help you, surely I will uphold you with My righteous right hand.' },
  { type: 'verse', title: 'Jehovah Shammah', verseRef: 'Matthew 28:20b', body: 'and lo, I am with you always, even to the end of the age.' },

  // Jehovah Makadesh
  { type: 'request', title: 'Jehovah Makadesh — The LORD Sanctifies Me', body: 'Worship God as Jehovah Makadesh, the LORD who sanctifies you.' },
  { type: 'verse', title: 'Jehovah Makadesh', verseRef: 'Leviticus 20:26', body: 'Thus you are to be holy to Me, for I the LORD am holy; and I have set you apart from the peoples to be Mine.' },
  { type: 'verse', title: 'Jehovah Makadesh', verseRef: 'Psalm 51:10-13', body: 'Create in me a clean heart, O God, And renew a steadfast spirit within me. 11 Do not cast me away from Your presence And do not take Your Holy Spirit from me. 12 Restore to me the joy of Your salvation And sustain me with a willing spirit. 13 Then I will teach transgressors Your ways, And sinners will be converted to You.' },
  { type: 'verse', title: 'Jehovah Makadesh', verseRef: '2 Timothy 2:22', body: 'Now flee from youthful lusts and pursue righteousness, faith, love and peace, with those who call on the Lord from a pure heart.' },

  // Jehovah Nissi
  { type: 'request', title: 'Jehovah Nissi — The LORD My Banner', body: 'Worship God as Jehovah Nissi, the LORD your banner and victory.' },
  { type: 'verse', title: 'Jehovah Nissi', verseRef: 'Exodus 14:13-14', body: '"Do not fear! Stand by and see the salvation of the LORD which He will accomplish for you today; for the Egyptians whom you have seen today, you will never see them again forever. 14 The LORD will fight for you while you keep silent."' },
  { type: 'verse', title: 'Jehovah Nissi', verseRef: 'Psalm 91:10-11', body: 'No evil will befall you, Nor will any plague come near your tent. 11 For He will give His angels charge concerning you, To guard you in all your ways.' },
  { type: 'verse', title: 'Jehovah Nissi', verseRef: 'Isaiah 54:17', body: '"No weapon that is formed against you will prosper; And every tongue that accuses you in judgment you will condemn. This is the heritage of the servants of the LORD, And their vindication is from Me," declares the LORD.' },

  // Jehovah Tsidkenu
  { type: 'request', title: 'Jehovah Tsidkenu — The LORD My Righteousness', body: 'Worship God as Jehovah Tsidkenu, the LORD your righteousness.' },
  { type: 'verse', title: 'Jehovah Tsidkenu', verseRef: 'Psalm 17:15', body: 'As for me, I shall behold Your face in righteousness; I will be satisfied with Your likeness when I awake.' },
  { type: 'verse', title: 'Jehovah Tsidkenu', verseRef: 'Psalm 23:3', body: 'He restores my soul; He guides me in the paths of righteousness for His name’s sake.' },
  { type: 'verse', title: 'Jehovah Tsidkenu', verseRef: '1 Corinthians 1:30', body: 'But by His doing you are in Christ Jesus, who became to us wisdom from God, and righteousness and sanctification, and redemption.' },
  { type: 'verse', title: 'Jehovah Tsidkenu', verseRef: 'Matthew 6:33', body: '"But seek first His kingdom and His righteousness, and all these things will be added to you."' },
  { type: 'verse', title: 'Jehovah Tsidkenu', verseRef: '2 Corinthians 5:21', body: 'He made Him who knew no sin to be sin on our behalf, so that we might become the righteousness of God in Him.' },

  // Jehovah Rohi
  { type: 'request', title: 'Jehovah Rohi — The LORD My Shepherd', body: 'Worship God as Jehovah Rohi, the LORD your shepherd.' },
  { type: 'verse', title: 'Jehovah Rohi', verseRef: 'Psalm 23:1-2', body: 'The LORD is my shepherd; I shall not want. 2 He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
  { type: 'verse', title: 'Jehovah Rohi', verseRef: 'Psalm 23:3-4', body: '3 He restoreth my soul: he leadeth me in the paths of righteousness for his name’s sake. 4 Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
  { type: 'verse', title: 'Jehovah Rohi', verseRef: 'Psalm 23:5-6', body: '5 Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over. 6 Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD forever.' },
  { type: 'verse', title: 'Jehovah Rohi', verseRef: 'John 10:27-30', body: '"My sheep hear My voice, and I know them, and they follow Me; 28 and I give eternal life to them, and they will never perish; and no one will snatch them out of My hand. 29 My Father, who has given them to Me, is greater than all; and no one is able to snatch them out of the Father’s hand. 30 I and the Father are one."' },

  // Jehovah Rapha
  { type: 'request', title: 'Jehovah Rapha — The LORD My Healer', body: 'Worship God as Jehovah Rapha, the LORD who heals you.' },
  { type: 'verse', title: 'Jehovah Rapha', verseRef: 'Psalm 103:1-3', body: 'Bless the LORD, O my soul, And all that is within me, bless His holy name. 2 Bless the LORD, O my soul, And forget none of His benefits; 3 Who pardons all your iniquities, Who heals all your diseases;' },
  { type: 'verse', title: 'Jehovah Rapha', verseRef: 'Psalm 103:4-5', body: '4 Who redeems your life from the pit, Who crowns you with lovingkindness and compassion; 5 Who satisfies your years with good things, So that your youth is renewed like the eagle.' },
  { type: 'verse', title: 'Jehovah Rapha', verseRef: 'Jeremiah 17:14', body: 'Heal me, O LORD, and I will be healed; Save me and I will be saved, For You are my praise.' },
  { type: 'verse', title: 'Jehovah Rapha', verseRef: '3 John 1:2', body: 'Beloved, I pray that in all respects you may prosper and be in good health, just as your soul prospers.' },

  // Jehovah Jireh
  { type: 'request', title: 'Jehovah Jireh — The LORD My Provider', body: 'Worship God as Jehovah Jireh, the LORD who provides.' },
  { type: 'verse', title: 'Jehovah Jireh', verseRef: 'Romans 8:32', body: 'He who did not spare His own Son, but delivered Him up for us all, how will He not also with Him freely give us all things?' },
  { type: 'verse', title: 'Jehovah Jireh', verseRef: 'Philippians 4:19', body: 'And my God will supply all your needs according to His riches in glory in Christ Jesus.' },

  // Jehovah Shalom
  { type: 'request', title: 'Jehovah Shalom — The LORD My Peace', body: 'Worship God as Jehovah Shalom, the LORD your peace.' },
  { type: 'verse', title: 'Jehovah Shalom', verseRef: 'Isaiah 26:3', body: 'Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.' },
  { type: 'verse', title: 'Jehovah Shalom', verseRef: 'John 14:27', body: '"Peace I leave with you; My peace I give to you; not as the world gives do I give to you. Do not let your heart be troubled, nor let it be fearful."' },
  { type: 'verse', title: 'Jehovah Shalom', verseRef: 'Acts 9:31', body: 'So the church throughout all Judea and Galilee and Samaria enjoyed peace, being built up; and going on in the fear of the Lord and in the comfort of the Holy Spirit, it continued to increase.' },
  { type: 'verse', title: 'Jehovah Shalom', verseRef: 'Philippians 4:6-7', body: 'Be anxious for nothing, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. 7 And the peace of God, which surpasses all comprehension, will guard your hearts and your minds in Christ Jesus.' },

  // Closing prayer verses
  { type: 'verse', title: 'The Prayer of Jabez', verseRef: '1 Chronicles 4:10', body: 'Now Jabez called on the God of Israel, saying, "Oh that You would bless me indeed and enlarge my border, and that Your hand might be with me, and that You would keep me from harm that it may not pain me!" And God granted him what he requested.' },
  { type: 'verse', title: 'God’s Plans for You', verseRef: 'Jeremiah 29:11-12', body: '‘For I know the plans that I have for you,’ declares the LORD, ‘plans for welfare and not for calamity to give you a future and a hope. 12 Then you will call upon Me and come and pray to Me, and I will listen to you.’' },
  { type: 'verse', title: 'God’s Plans for You', verseRef: 'Jeremiah 29:13-14', body: '13 ‘You will seek Me and find Me when you search for Me with all your heart. 14 I will be found by you,’ declares the LORD, ‘and I will restore your fortunes and will gather you from all the nations and from all the places where I have driven you,’ declares the LORD, ‘and I will bring you back to the place from where I sent you into exile.’' },
  { type: 'verse', title: 'Arise, Shine', verseRef: 'Isaiah 60:1-3', body: '"Arise, shine; for your light has come, And the glory of the LORD has risen upon you. 2 For behold, darkness will cover the earth And deep darkness the peoples; But the LORD will rise upon you And His glory will appear upon you. 3 Nations will come to your light, And kings to the brightness of your rising."' },
  { type: 'verse', title: 'Arise, Shine', verseRef: 'Isaiah 60:4-5, 10a', body: '4 "Lift up your eyes round about and see; They all gather together, they come to you. Your sons will come from afar, And your daughters will be carried in the arms. 5 Then you will see and be radiant, And your heart will thrill and rejoice; Because the abundance of the sea will be turned to you, The wealth of the nations will come to you. ... 10a Foreigners will build up your walls."' },
];

// Praying for your spouse (Scripture: ESV).
const spouse: PresetCard[] = [
  { type: 'request', title: 'Their walk with God', body: 'Pray your spouse would love Jesus more each day — growing in His Word, in prayer, and in glad obedience.' },
  { type: 'verse', title: 'Love sacrificially', verseRef: 'Ephesians 5:25', body: 'Husbands, love your wives, as Christ loved the church and gave himself up for her,' },
  { type: 'verse', title: 'Two become one', verseRef: 'Genesis 2:24', body: 'Therefore a man shall leave his father and his mother and hold fast to his wife, and they shall become one flesh.' },
  { type: 'verse', title: 'Love and respect', verseRef: 'Ephesians 5:33', body: 'However, let each one of you love his wife as himself, and let the wife see that she respects her husband.' },
  { type: 'verse', title: 'Patient, kind love', verseRef: '1 Corinthians 13:4-7', body: 'Love is patient and kind; love does not envy or boast; it is not arrogant or rude. It does not insist on its own way; it is not irritable or resentful; it does not rejoice at wrongdoing, but rejoices with the truth. Love bears all things, believes all things, hopes all things, endures all things.' },
  { type: 'verse', title: 'Gracious words', verseRef: 'Ephesians 4:29', body: 'Let no corrupting talk come out of your mouths, but only such as is good for building up, as fits the occasion, that it may give grace to those who hear.' },
  { type: 'verse', title: 'Quick to forgive', verseRef: 'Colossians 3:13', body: 'bearing with one another and, if one has a complaint against another, forgiving each other; as the Lord has forgiven you, so you also must forgive.' },
  { type: 'request', title: 'Faithfulness and purity', body: 'Pray for faithfulness and purity in your marriage, and a hedge of protection around both of you against temptation.' },
  { type: 'request', title: 'Health and protection', body: 'Lift up your spouse’s physical, emotional, and mental health. Ask God to strengthen, protect, and sustain them.' },
  { type: 'request', title: 'Their work and calling', body: 'Pray for your spouse’s work and responsibilities, and for a clear sense of God’s calling and purpose.' },
  { type: 'request', title: 'Thank God for them', body: 'Thank God for your spouse — name specific things you are grateful for about them today.' },
];

// Praying for your children (Scripture: ESV).
const children: PresetCard[] = [
  { type: 'request', title: 'That they would know Jesus', body: 'Pray each child would come to genuine faith in Christ early, and walk with Him all their days.' },
  { type: 'verse', title: 'Wise for salvation', verseRef: '2 Timothy 3:15', body: 'and how from childhood you have been acquainted with the sacred writings, which are able to make you wise for salvation through faith in Christ Jesus.' },
  { type: 'verse', title: 'Grow like Jesus', verseRef: 'Luke 2:52', body: 'And Jesus increased in wisdom and in stature and in favor with God and man.' },
  { type: 'verse', title: 'Train them up', verseRef: 'Proverbs 22:6', body: 'Train up a child in the way he should go; even when he is old he will not depart from it.' },
  { type: 'verse', title: 'Wisdom from God', verseRef: 'James 1:5', body: 'If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.' },
  { type: 'verse', title: 'A heart for God’s Word', verseRef: 'Deuteronomy 6:6-7', body: 'And these words that I command you today shall be on your heart. You shall teach them diligently to your children, and shall talk of them when you sit in your house, and when you walk by the way, and when you lie down, and when you rise.' },
  { type: 'request', title: 'Godly character', body: 'Pray for honesty, kindness, humility, courage, diligence, and self-control to take root in each child.' },
  { type: 'verse', title: 'Wise friendships', verseRef: '1 Corinthians 15:33', body: 'Do not be deceived: "Bad company ruins good morals."' },
  { type: 'request', title: 'Protection', body: 'Ask God to protect your children in body, mind, and soul, and to keep them from the evil one (John 17:15).' },
  { type: 'request', title: 'Their future spouse', body: 'Pray for the person each child may one day marry — for their faith, character, and protection even now.' },
  { type: 'request', title: 'Their calling', body: 'Pray they would discover and walk in the good works and purpose God has prepared for them (Ephesians 2:10).' },
  { type: 'request', title: 'Thank God for each child', body: 'Thank God for each of your children by name, and for the specific gift each one is.' },
];

// Praying for yourself (Scripture: ESV).
const self: PresetCard[] = [
  { type: 'request', title: 'Hunger for God', body: 'Ask God for a deeper love for Jesus and a consistent, joyful time with Him in His Word and prayer.' },
  { type: 'verse', title: 'Ask for wisdom', verseRef: 'James 1:5', body: 'If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.' },
  { type: 'verse', title: 'A clean heart', verseRef: 'Psalm 51:10', body: 'Create in me a clean heart, O God, and renew a right spirit within me.' },
  { type: 'verse', title: 'Search me, O God', verseRef: 'Psalm 139:23-24', body: 'Search me, O God, and know my heart! Try me and know my thoughts! And see if there be any grievous way in me, and lead me in the way everlasting!' },
  { type: 'verse', title: 'Guard my mouth', verseRef: 'Psalm 141:3', body: 'Set a guard, O LORD, over my mouth; keep watch over the door of my lips!' },
  { type: 'verse', title: 'Fruit of the Spirit', verseRef: 'Galatians 5:22-23', body: 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.' },
  { type: 'verse', title: 'Work for the Lord', verseRef: 'Colossians 3:23', body: 'Whatever you do, work heartily, as for the Lord and not for men,' },
  { type: 'verse', title: 'Renewed strength', verseRef: 'Isaiah 40:31', body: 'but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.' },
  { type: 'verse', title: 'Contentment', verseRef: 'Hebrews 13:5', body: 'Keep your life free from love of money, and be content with what you have, for he has said, "I will never leave you nor forsake you."' },
  { type: 'request', title: 'Humility', body: 'Pray for a humble heart — to put others first, listen well, and depend on God’s grace (1 Peter 5:6).' },
  { type: 'request', title: 'Calling and purpose', body: 'Ask God for clarity, courage, and faithfulness in the work and purpose He has given you.' },
  { type: 'verse', title: 'Cast your cares', verseRef: '1 Peter 5:7', body: 'casting all your anxieties on him, because he cares for you.' },
];

// TACOS — a guided prayer rhythm: Thanksgiving, Adoration, Confession, Others, Self.
const tacos: PresetCard[] = [
  {
    type: 'request',
    title: 'T — Thanksgiving',
    body: 'Begin with thanks. Slow down and name specific blessings: salvation, the people you love, provision, answered prayers, God’s steady faithfulness. Thank Him for at least three things right now.\n\n“give thanks in all circumstances; for this is the will of God in Christ Jesus for you.” — 1 Thessalonians 5:18',
  },
  {
    type: 'request',
    title: 'A — Adoration',
    body: 'Adore God for who He is, not just what He does. Praise His character — holy, loving, sovereign, merciful, faithful, wise. Worship Him by His names (try the Names of God set). Tell Him what you love about Him.\n\n“Great is the LORD, and greatly to be praised, and his greatness is unsearchable.” — Psalm 145:3',
  },
  {
    type: 'request',
    title: 'C — Confession',
    body: 'Confess honestly. Ask the Spirit to search you; name specific sins rather than generalities. Receive His forgiveness, and turn from them with His help.\n\n“If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.” — 1 John 1:9',
  },
  {
    type: 'request',
    title: 'O — Others',
    body: 'Intercede for others. Lift up family, friends, your church and leaders, the hurting, and those who don’t yet know Christ. Pray for their needs and, above all, their salvation.\n\n“Let each of you look not only to his own interests, but also to the interests of others.” — Philippians 2:4',
  },
  {
    type: 'request',
    title: 'S — Self',
    body: 'Bring your own needs to God last. Ask for wisdom, strength, provision, and guidance for today. Cast your worries on Him and trust His care.\n\n“casting all your anxieties on him, because he cares for you.” — 1 Peter 5:7',
  },
];

// Praise & worship — adoring God for who He is, not just what He does.
const praiseWorship: PresetCard[] = [
  { type: 'request', title: 'Just praise Him', body: 'Before you ask for anything, spend a few minutes only adoring God for who He is. Don’t bring a single request — just worship.' },
  { type: 'verse', title: 'Worthy of all worship', verseRef: 'Revelation 4:11', body: '“Worthy are you, our Lord and God, to receive glory and honor and power, for you created all things, and by your will they existed and were created.”' },
  { type: 'verse', title: 'Your prayers rise like incense', verseRef: 'Revelation 5:8', body: 'the four living creatures and the twenty-four elders fell down before the Lamb, each holding a harp, and golden bowls full of incense, which are the prayers of the saints.' },
  { type: 'verse', title: 'Your prayers reach the throne', verseRef: 'Revelation 8:3-4', body: 'another angel came and stood at the altar with a golden censer, and he was given much incense to offer with the prayers of all the saints on the golden altar before the throne, and the smoke of the incense, with the prayers of the saints, rose before God from the hand of the angel.' },
  { type: 'verse', title: 'Give thanks with your whole heart', verseRef: 'Psalm 111:1', body: 'Praise the LORD! I will give thanks to the LORD with my whole heart, in the company of the upright, in the congregation.' },
  { type: 'verse', title: 'His works are faithful and just', verseRef: 'Psalm 111:7-9', body: 'The works of his hands are faithful and just; all his precepts are trustworthy; they are established forever and ever, to be performed with faithfulness and uprightness. Holy and awesome is his name!' },
  { type: 'verse', title: 'He never grows weary', verseRef: 'Isaiah 40:28', body: 'Have you not known? Have you not heard? The LORD is the everlasting God, the Creator of the ends of the earth. He does not faint or grow weary; his understanding is unsearchable.' },
  { type: 'verse', title: 'Enter His gates with thanksgiving', verseRef: 'Psalm 100:4-5', body: 'Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name! For the LORD is good; his steadfast love endures forever, and his faithfulness to all generations.' },
  { type: 'request', title: 'Pray a psalm of praise', body: 'Open to one of these and pray it back to God: Psalm 33, 47, 63, 84, 92, 95, 100, 103, 111, 113, 136, 145, 146, 147, 148, 149, or 150.' },
  { type: 'request', title: 'Worship through music', body: 'Put on a worship song and sing or pray along, letting the truth of it lead you into adoration rather than just listening.' },
];

// Thanksgiving — remembering and naming what God has done ("Ebenezer stones").
const thanksgiving: PresetCard[] = [
  { type: 'verse', title: 'Till now the LORD has helped us', verseRef: '1 Samuel 7:12', body: 'Then Samuel took a stone and set it up… and called its name Ebenezer; for he said, “Till now the LORD has helped us.”' },
  { type: 'verse', title: 'Don’t forget what you’ve seen', verseRef: 'Deuteronomy 4:9', body: 'Only take care, and keep your soul diligently, lest you forget the things that your eyes have seen, and lest they depart from your heart all the days of your life. Make them known to your children and your children’s children.' },
  { type: 'verse', title: 'Tell the coming generation', verseRef: 'Psalm 78:4', body: 'We will not hide them from their children, but tell to the coming generation the glorious deeds of the LORD, and his might, and the wonders that he has done.' },
  { type: 'verse', title: 'Stones as a memorial', verseRef: 'Joshua 4:6-7', body: 'that this may be a sign among you. When your children ask in time to come, “What do those stones mean to you?” then you shall tell them what the LORD did.' },
  { type: 'request', title: 'Keep an Ebenezer list', body: 'Keep a running list of the big things God has done — ways He has protected, provided, answered, and guided you. Add to it, and read back through it often.' },
  { type: 'request', title: 'Thank Him for today’s small mercies', body: 'Name a few small things from yesterday and today you’re grateful for — a kindness, a provision, an answered worry. Thank God for each one specifically.' },
  { type: 'request', title: 'Tell your children', body: 'Share with your children the specific things God has done in your life and theirs — let gratitude become part of your family’s story.' },
];

// Morning rest & surrender — positioning your heart before God at the start of the day.
const rest: PresetCard[] = [
  { type: 'verse', title: 'Be still and know', verseRef: 'Psalm 46:10', body: '“Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!”' },
  { type: 'verse', title: 'The LORD will fight for you', verseRef: 'Exodus 14:14', body: 'The LORD will fight for you, and you have only to be silent.' },
  { type: 'verse', title: 'He gives sleep to His beloved', verseRef: 'Psalm 127:1-2', body: 'Unless the LORD builds the house, those who build it labor in vain… It is in vain that you rise up early and go late to rest, eating the bread of anxious toil; for he gives to his beloved sleep.' },
  { type: 'verse', title: 'Come to me and rest', verseRef: 'Matthew 11:28-30', body: 'Come to me, all who labor and are heavy laden, and I will give you rest. Take my yoke upon you, and learn from me, for I am gentle and lowly in heart, and you will find rest for your souls. For my yoke is easy, and my burden is light.' },
  { type: 'verse', title: 'Put on compassion and patience', verseRef: 'Colossians 3:12', body: 'Put on then, as God’s chosen ones, holy and beloved, compassionate hearts, kindness, humility, meekness, and patience,' },
  { type: 'request', title: 'What’s on your mind and heart', body: 'Ask yourself: What’s on my mind? Who is on my heart? Who will I see today? What chance might I have to share the gospel?' },
  { type: 'request', title: 'Pray over your day', body: 'Walk through today’s appointments, calls, tasks, and events one by one, and ask God to go before you in each one — including your safety and health.' },
  { type: 'request', title: 'Rest begins with surrender', body: '“There will always be more you can do… we were never intended to finish it.” — Sarah Mackenzie, Teaching from Rest. Surrender today’s unfinished list to God before you begin.' },
];

// Confession — keeping a short account with God.
const confession: PresetCard[] = [
  { type: 'verse', title: 'Search me, O God', verseRef: 'Psalm 139:23-24', body: 'Search me, O God, and know my heart! Try me and know my thoughts! And see if there be any grievous way in me, and lead me in the way everlasting!' },
  { type: 'verse', title: 'Test my heart and mind', verseRef: 'Psalm 26:2', body: 'Prove me, O LORD, and try me; test my heart and my mind.' },
  { type: 'verse', title: 'Examine our ways', verseRef: 'Lamentations 3:40', body: 'Let us test and examine our ways, and return to the LORD!' },
  { type: 'verse', title: 'Faithful to forgive', verseRef: '1 John 1:9', body: 'If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.' },
  { type: 'verse', title: 'No condemnation in Christ', verseRef: 'Romans 8:1', body: 'There is therefore now no condemnation for those who are in Christ Jesus.' },
  { type: 'request', title: 'Confess specifically', body: 'Ask God to search your heart and reveal anything not pleasing to Him. Confess it by name rather than in general terms, and turn away from it.' },
  { type: 'request', title: 'Surrender, not just confess', body: 'Tell God: I confess my weakness and need for You. Help me die to myself and live in You. I surrender my will, and the inmost places of my heart and mind, to You.' },
  { type: 'request', title: 'Guard your gentle, quiet spirit', body: 'Ask God to protect you from what steals a gentle and quiet spirit: unconfessed sin, an unforgiving heart, neglected responsibilities, anxiety, anger, self-centeredness, and fatigue.' },
];

// Spiritual warfare — staying alert, and answering the enemy's lies with God's truth.
const warfare: PresetCard[] = [
  { type: 'verse', title: 'He is with you wherever you go', verseRef: 'Joshua 1:9', body: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.' },
  { type: 'verse', title: 'The battle belongs to the LORD', verseRef: '1 Samuel 17:47', body: 'that all this assembly may know that the LORD saves not with sword and spear. For the battle is the LORD’s, and he will give you into our hand.' },
  { type: 'verse', title: 'My God is my fortress', verseRef: 'Psalm 59:9-10, 16-17', body: 'O my Strength, I will watch for you, for you, O God, are my fortress. My God in his steadfast love will meet me… I will sing of your strength; I will sing aloud of your steadfast love in the morning. For you have been to me a fortress and a refuge in the day of my distress.' },
  { type: 'verse', title: 'Strong in weakness', verseRef: '2 Corinthians 12:9-10', body: '“My grace is sufficient for you, for my power is made perfect in weakness.” Therefore I will boast all the more gladly of my weaknesses, so that the power of Christ may rest upon me. For when I am weak, then I am strong.' },
  { type: 'verse', title: 'The enemy prowls like a lion', verseRef: '1 Peter 5:8', body: 'Be sober-minded; be watchful. Your adversary the devil prowls around like a roaring lion, seeking someone to devour.' },
  { type: 'request', title: 'Recognize the attack', body: 'Warfare doesn’t always look dramatic. Watch for: sudden discouragement right when you’re moving forward; conflict that escalates beyond what the situation warrants; lies that replay about your worth, your marriage, or your kids; temptation at your weakest point; numbness toward prayer and Scripture. Name the lie, speak the truth, and pray specifically.' },
  { type: 'request', title: '“I am broken”', body: 'Truth: my past doesn’t define me, God’s grace does. “If anyone is in Christ, he is a new creation.” — 2 Corinthians 5:17' },
  { type: 'request', title: '“God doesn’t care”', body: 'Truth: if God gave His own Son for me, how could He withhold anything? “He who did not spare his own Son but gave him up for us all, how will he not also with him graciously give us all things?” — Romans 8:32' },
  { type: 'request', title: '“I am not enough”', body: 'Truth: “I can do all things through him who strengthens me.” — Philippians 4:13' },
  { type: 'request', title: '“God has abandoned me”', body: 'Truth: “I will never leave you nor forsake you.” — Hebrews 13:5' },
  { type: 'request', title: '“My sins are too great to be forgiven”', body: 'Truth: “though your sins are like scarlet, they shall be as white as snow.” — Isaiah 1:18' },
  { type: 'request', title: '“I’m failing as a spouse”', body: 'Truth: God isn’t finished with you. “He who began a good work in you will carry it on to completion.” — Philippians 1:6' },
  { type: 'request', title: '“My marriage is too broken to fix”', body: 'Truth: “With God all things are possible.” — Matthew 19:26. “Love never ends.” — 1 Corinthians 13:8' },
  { type: 'request', title: '“I’m failing as a parent”', body: 'Truth: “Train up a child in the way he should go; even when he is old he will not depart from it.” — Proverbs 22:6. Your weakness is the place God works (2 Corinthians 12:9).' },
  { type: 'request', title: '“I have to figure this out alone”', body: 'Truth: “Cast all your anxieties on him, because he cares for you.” — 1 Peter 5:7' },
  { type: 'request', title: '“I am not worthy of being used by God”', body: 'Truth: “God chose what is weak in the world to shame the strong.” — 1 Corinthians 1:27' },
];

// Praying for your marriage together — distinct from praying for your spouse as a person.
const marriage: PresetCard[] = [
  { type: 'request', title: 'Christ at the center', body: 'Pray that Jesus would stay at the center of your marriage, and that your marriage would bring Him glory.' },
  { type: 'request', title: 'Protect and draw us close', body: 'Ask God to protect your marriage from anything that would divide you, and to draw you closer to each other and to Him.' },
  { type: 'request', title: 'Lead us into Your will', body: 'Pray that God would lead you both into His will for your lives, and show you how to best serve Him together.' },
  { type: 'request', title: 'Grow together spiritually', body: 'Pray for growth in your individual walks with God, and consistency in praying and studying Scripture together as a couple and family.' },
  { type: 'verse', title: 'Devoted to one another', verseRef: '1 Corinthians 7:3-5', body: 'The husband should give to his wife her conjugal rights, and likewise the wife to her husband… Do not deprive one another, except perhaps by agreement for a limited time, that you may devote yourselves to prayer; but then come together again.' },
  { type: 'request', title: 'Good communication', body: 'Pray for openness, honesty, and the willingness to talk through hard issues together, with patience and humility.' },
  { type: 'request', title: 'Quick to forgive', body: 'Ask for hearts that extend unconditional love, forgiveness, and understanding to one another.' },
  { type: 'request', title: 'Thoughtfulness', body: 'Pray for eyes to see creative, encouraging, unexpected ways to bless your spouse today.' },
  { type: 'request', title: 'A model for our kids', body: 'Pray that your marriage would be a visible example of biblical love for your children to grow up watching.' },
  { type: 'request', title: 'Thankful for each other', body: 'Thank God for your spouse, and tell them today specifically what you appreciate about them.' },
];

// Praying as a husband — your own heart and role, not what you ask for your wife.
const asHusband: PresetCard[] = [
  { type: 'verse', title: 'Stand firm, be strong', verseRef: '1 Corinthians 16:13', body: 'Be watchful, stand firm in the faith, act like men, be strong.' },
  { type: 'request', title: 'Lead spiritually', body: 'Pray for courage and conviction to provide spiritual leadership for your home, especially when it’s hard — and not to lead passively (Ephesians 5:25-27, Joshua 24:15).' },
  { type: 'request', title: 'Model Christlike manhood', body: 'Ask God to help you model Christlike manhood for your children, and to live with integrity and honor in all you do (Proverbs 20:7).' },
  { type: 'request', title: 'Protect your family', body: 'Pray for wisdom and strength to protect your family spiritually and physically (1 Peter 3:7).' },
  { type: 'request', title: 'Guard your eyes and mind', body: 'Ask for protection from lust and pornography, and a heart that stays pure (Job 31:1, Matthew 5:28).' },
  { type: 'request', title: 'Be present, not just there', body: 'Pray to be emotionally present with your wife and kids — not just physically in the room.' },
  { type: 'request', title: 'Identity in Christ', body: 'Ask God to root your identity in Christ, not in your career or performance (Colossians 3:3).' },
  { type: 'request', title: 'Godly friendships', body: 'Pray for deep friendships with other godly men who will sharpen you and hold you accountable (Proverbs 27:17).' },
  { type: 'request', title: 'Love her sacrificially', body: 'Pray for a love that pursues your wife’s heart, not just maintains the marriage — to know her deeply, speak her love language, and treat her with special honor (Ephesians 5:25, 1 Peter 3:7).' },
  { type: 'request', title: 'Initiate spiritually', body: 'Ask for the initiative to start spiritual conversation and prayer with your wife rather than leaving it to her, and for grace to manage anger and harshness (Ephesians 4:26).' },
];

// Praying as a wife — your own heart and role, not what you ask for your husband.
const asWife: PresetCard[] = [
  { type: 'request', title: 'Create a life-giving home', body: 'Pray for wisdom and joy in creating a life-giving home for your family (Proverbs 31:27).' },
  { type: 'request', title: 'Energy and joy in your calling', body: 'Ask God for energy and joy in the calling He’s given you as a wife and mother.' },
  { type: 'request', title: 'A wife of excellence', body: 'Pray to be a wife of excellence and noble character (Proverbs 31:10).' },
  { type: 'request', title: 'Encourage his leadership', body: 'Ask for a heart that encourages your husband in his relationship with the Lord and his role as spiritual leader, and seeks his guidance with trust.' },
  { type: 'request', title: 'Identity in Christ, not performance', body: 'Pray that your identity and worth would be rooted in Christ, not in how well you perform as a mom or wife — and for protection from comparison and the lies of the culture.' },
  { type: 'request', title: 'Renewed and sustained', body: 'Ask God to sustain and renew you under the weight you carry, and to meet your heart in the places only He can reach.' },
  { type: 'verse', title: 'Protected from anxiety', verseRef: 'Philippians 4:6-7', body: 'do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.' },
  { type: 'request', title: 'Patience with the kids', body: 'Ask for extraordinary patience and wisdom in parenting decisions, day in and day out.' },
  { type: 'request', title: 'Godly friendships', body: 'Pray for good friendships with other godly women who encourage your walk with God.' },
  { type: 'request', title: 'A gentle, peaceable spirit', body: 'Ask God for a gentle and peaceable spirit in your marriage, quick to listen and slow to speak.' },
];

// Your role as a parent — praying for your own heart and parenting, not for the kids directly.
const childrenRole: PresetCard[] = [
  { type: 'verse', title: 'Don’t provoke, but train', verseRef: 'Ephesians 6:4', body: 'Fathers, do not provoke your children to anger, but bring them up in the discipline and instruction of the Lord.' },
  { type: 'verse', title: 'Don’t discourage them', verseRef: 'Colossians 3:21', body: 'Fathers, do not provoke your children, lest they become discouraged.' },
  { type: 'verse', title: 'Discipline out of love', verseRef: 'Hebrews 12:6', body: 'For the Lord disciplines the one he loves, and chastises every son whom he receives.' },
  { type: 'verse', title: 'Children are a heritage', verseRef: 'Psalm 127:3-5', body: 'Behold, children are a heritage from the LORD, the fruit of the womb a reward. Like arrows in the hand of a warrior are the children of one’s youth. Blessed is the man who fills his quiver with them!' },
  { type: 'request', title: 'Wisdom to parent well', body: 'Ask God for wisdom in training your kids, and diligence to teach them His Word in the ordinary moments of the day (James 1:5, Deuteronomy 6:6-7).' },
  { type: 'request', title: 'Calm in the storms', body: 'Pray for the ability to stay calm in the midst of your kids’ storms, and to be quick to listen, slow to speak, slow to anger (James 1:19).' },
  { type: 'request', title: 'Firm and loving discipline', body: 'Ask for the will and wisdom to discipline consistently and firmly because you love them — without harshness, but with the wisdom and admonition of the Lord (Proverbs 13:24).' },
  { type: 'request', title: 'Unity as parents', body: 'Pray for unity between you and your spouse in parenting decisions, and eyes to catch teachable moments together.' },
  { type: 'request', title: 'See each child clearly', body: 'Ask God for perception to recognize the individual temperament, needs, and struggles of each child.' },
  { type: 'request', title: 'Be a godly example', body: 'Pray that your own walk with God would be a living example your children want to follow.' },
  { type: 'request', title: 'Present, and leading devotions', body: 'If you’re a dad: pray for intentional one-on-one time with each child, and the initiative to lead family devotions and prayer rather than leaving spiritual instruction to your spouse.' },
  { type: 'request', title: 'Encourage his fatherhood', body: 'If you’re a mom: ask God to make you an encourager of your husband as he grows into the fatherly role God has called him to.' },
];

// Praying for the lost.
const lost: PresetCard[] = [
  { type: 'request', title: 'Keep a list', body: 'Keep a list of names of people who don’t yet know Jesus, and pray through it regularly.' },
  { type: 'verse', title: 'Convicted of sin and need', verseRef: 'John 16:8', body: 'And when he comes, he will convict the world concerning sin and righteousness and judgment.' },
  { type: 'verse', title: 'Cut to the heart', verseRef: 'Acts 2:37', body: 'Now when they heard this they were cut to the heart, and said to Peter and the rest of the apostles, “Brothers, what shall we do?”' },
  { type: 'verse', title: 'My heart’s desire', verseRef: 'Romans 10:1', body: 'Brothers, my heart’s desire and prayer to God for them is that they may be saved.' },
  { type: 'verse', title: 'Boldness to speak', verseRef: 'Acts 4:29', body: 'And now, Lord, look upon their threats and grant to your servants to continue to speak your word with all boldness,' },
];

// Praying for your church.
const church: PresetCard[] = [
  { type: 'verse', title: 'United in mind and love', verseRef: '1 Corinthians 1:10', body: 'I appeal to you, brothers, by the name of our Lord Jesus Christ, that all of you agree, and that there be no divisions among you, but that you be united in the same mind and the same judgment.' },
  { type: 'verse', title: 'Unity of the Spirit', verseRef: 'Ephesians 4:3', body: 'eager to maintain the unity of the Spirit in the bond of peace.' },
  { type: 'verse', title: 'Stir one another up', verseRef: 'Hebrews 10:24-25', body: 'And let us consider how to stir up one another to love and good works, not neglecting to meet together, as is the habit of some, but encouraging one another, and all the more as you see the Day drawing near.' },
  { type: 'request', title: 'Pray for your pastors and staff', body: 'Pray for your pastors, elders, and ministry staff by name — for protection, endurance, and faithfulness to God’s Word. (Tip: add them as people in this app so they show up here.)' },
  { type: 'request', title: 'Raise up prayer warriors', body: 'Ask God to raise up a culture of prayer in your church — people devoted to knowing God and making Him known.' },
  { type: 'request', title: 'Faithful in the ordinary', body: 'Pray your church would stay faithful in giving, in faithfulness to spouses and family, and in using their spiritual gifts.' },
  { type: 'request', title: 'Love that shows the world', body: 'Ask for a love among believers in your church that’s visible enough to show a watching, dying world who Jesus is.' },
  { type: 'request', title: 'Changed by the Word', body: 'Pray that your church would walk away from sermons and personal time in Scripture genuinely changed — delighting in God’s Word and passing it on to your children.' },
];

// Praying for your work.
const work: PresetCard[] = [
  { type: 'verse', title: 'Work heartily for the Lord', verseRef: 'Colossians 3:23-24', body: 'Whatever you do, work heartily, as for the Lord and not for men, knowing that from the Lord you will receive the inheritance as your reward. You are serving the Lord Christ.' },
  { type: 'verse', title: 'Skillful work is noticed', verseRef: 'Proverbs 22:29', body: 'Do you see a man skillful in his work? He will stand before kings; he will not stand before obscure men.' },
  { type: 'verse', title: 'A good name', verseRef: 'Proverbs 22:1', body: 'A good name is to be chosen rather than great riches, and favor is better than silver or gold.' },
  { type: 'request', title: 'Integrity in all dealings', body: 'Pray for honesty and integrity with your boss, employees, coworkers, and clients.' },
  { type: 'request', title: 'A faithful witness', body: 'Ask God to make you a faithful witness to coworkers through your character and your words.' },
  { type: 'request', title: 'Wisdom with your time', body: 'Pray for wisdom in how you use your time, and for diligence and excellence in your work.' },
  { type: 'request', title: 'Pray for coworkers by name', body: 'Lift up your boss, employees, and coworkers by name — their walk with God and their needs.' },
  { type: 'request', title: 'A peacemaker, content', body: 'Ask to be a peacemaker in workplace conflict, and for contentment with what God has provided through your work (Philippians 4:11).' },
];

// Praying for your nation and those in authority — by role, not by name (so it stays current).
const nation: PresetCard[] = [
  { type: 'verse', title: 'The king’s heart in God’s hand', verseRef: 'Proverbs 21:1', body: 'The king’s heart is a stream of water in the hand of the LORD; he turns it wherever he will.' },
  { type: 'verse', title: 'Seek the welfare of your city', verseRef: 'Jeremiah 29:7', body: 'But seek the welfare of the city where I have sent you into exile, and pray to the LORD on its behalf, for in its welfare you will find your welfare.' },
  { type: 'verse', title: 'Pray for those in authority', verseRef: '1 Timothy 2:1-2', body: 'First of all, then, I urge that supplications, prayers, intercessions, and thanksgivings be made for all people, for kings and all who are in high positions, that we may lead a peaceful and quiet life, godly and dignified in every way.' },
  { type: 'verse', title: 'He trusts in the LORD', verseRef: 'Psalm 21:7', body: 'For the king trusts in the LORD, and through the steadfast love of the Most High he shall not be moved.' },
  { type: 'request', title: 'Your local leaders', body: 'Pray for your city and county’s mayor and local government — for wisdom, integrity, and the welfare of your community.' },
  { type: 'request', title: 'Your state and national leaders', body: 'Pray for your governor, your president and vice president, and all in positions of national leadership — for wisdom, and for their salvation.' },
  { type: 'request', title: 'The courts and judiciary', body: 'Pray for the justices of the Supreme Court and judges across the country — for discernment and a commitment to justice.' },
  { type: 'request', title: 'Upcoming elections', body: 'Pray for wisdom as you and your community vote, and for godly leaders to be raised up.' },
  { type: 'request', title: 'Repentance over our culture', body: 'Pray for repentance over the ways our culture distorts God’s good design for life, sexuality, and family, and ask God to bring healing.' },
];

export const PRESET_STACKS: PresetStack[] = [
  {
    id: 'steve-gaines-names-of-god',
    name: 'Steve Gaines — Names of God',
    description:
      'The Names of God prayer cards by Steve Gaines (Bellevue Baptist): worship God through eight of His Hebrew names, with Scripture for each.',
    suggestedCategory: 'Names of God',
    suggestedCadence: { kind: 'daily' },
    cards: namesOfGod,
  },
  {
    id: 'tacos-guided-prayer',
    name: 'TACOS — Guided Prayer',
    description:
      'A guided daily rhythm: Thanksgiving, Adoration, Confession, Others, Self. Five cards that walk you through how to pray each part.',
    suggestedCategory: 'TACOS Prayer',
    suggestedCadence: { kind: 'daily' },
    cards: tacos,
  },
  {
    id: 'praise-and-worship',
    name: 'Praise & Worship',
    description: 'Adore God for who He is, not just what He’s done — Scripture, a list of praise psalms, and a nudge to worship through music.',
    suggestedCategory: 'Praise & Worship',
    suggestedCadence: { kind: 'daily' },
    cards: praiseWorship,
  },
  {
    id: 'thanksgiving-ebenezer',
    name: 'Thanksgiving — Ebenezer Stones',
    description: 'Remember and name what God has done — keep a running list of His faithfulness, and thank Him for today’s small mercies too.',
    suggestedCategory: 'Thanksgiving',
    suggestedCadence: { kind: 'daily' },
    cards: thanksgiving,
  },
  {
    id: 'morning-rest',
    name: 'Morning Rest & Surrender',
    description: 'Rightly position your heart before God at the start of the day — be still, hand Him your day, and surrender the unfinished list.',
    suggestedCategory: 'Rest',
    suggestedCadence: { kind: 'daily' },
    cards: rest,
  },
  {
    id: 'confession',
    name: 'Confession',
    description: 'Keep a short account with God — ask Him to search your heart, confess specifically, and receive His forgiveness.',
    suggestedCategory: 'Confession',
    suggestedCadence: { kind: 'daily' },
    cards: confession,
  },
  {
    id: 'spiritual-warfare',
    name: 'Spiritual Warfare',
    description: 'Stay alert to the enemy’s schemes and answer his lies with God’s truth — Scripture for the fight, plus ten common lies paired with the truth that answers each one.',
    suggestedCategory: 'Spiritual Warfare',
    suggestedCadence: { kind: 'weekly' },
    cards: warfare,
  },
  {
    id: 'praying-for-spouse',
    name: 'Praying for Your Spouse',
    description: 'Pray Scripture and blessings over your husband or wife — their walk with God, your marriage, and their well-being.',
    suggestedCategory: 'My Spouse',
    suggestedCadence: { kind: 'daily' },
    cards: spouse,
  },
  {
    id: 'praying-for-marriage',
    name: 'Praying for Your Marriage',
    description: 'Pray for your marriage as a shared life — unity, communication, intimacy, and a love that models Christ to your kids.',
    suggestedCategory: 'Our Marriage',
    suggestedCadence: { kind: 'daily' },
    cards: marriage,
  },
  {
    id: 'praying-as-husband',
    name: 'Praying as a Husband',
    description: 'Pray for your own heart and role as a husband — spiritual leadership, purity, presence, and love that pursues your wife.',
    suggestedCategory: 'As a Husband',
    suggestedCadence: { kind: 'daily' },
    cards: asHusband,
  },
  {
    id: 'praying-as-wife',
    name: 'Praying as a Wife',
    description: 'Pray for your own heart and role as a wife — identity in Christ, joy in your calling, and a gentle, peaceable spirit.',
    suggestedCategory: 'As a Wife',
    suggestedCadence: { kind: 'daily' },
    cards: asWife,
  },
  {
    id: 'praying-for-children',
    name: 'Praying for Your Children',
    description: 'Pray for your children’s faith, wisdom, character, protection, and future — grounded in Scripture.',
    suggestedCategory: 'My Children',
    suggestedCadence: { kind: 'daily' },
    cards: children,
  },
  {
    id: 'praying-as-a-parent',
    name: 'Praying for Your Role as a Parent',
    description: 'Pray for your own heart as a parent — wisdom, patience, unity with your spouse, and grace to lead by example. Pairs with “Praying for Your Children,” which prays for the kids themselves.',
    suggestedCategory: 'As a Parent',
    suggestedCadence: { kind: 'daily' },
    cards: childrenRole,
  },
  {
    id: 'praying-for-self',
    name: 'Praying for Yourself',
    description: 'Bring your own heart before God — for hunger after Him, wisdom, purity, strength, and calling.',
    suggestedCategory: 'Myself',
    suggestedCadence: { kind: 'daily' },
    cards: self,
  },
  {
    id: 'praying-for-the-lost',
    name: 'Praying for the Lost',
    description: 'Keep a list of people who don’t yet know Jesus and pray for their salvation by name.',
    suggestedCategory: 'The Lost',
    suggestedCadence: { kind: 'weekly' },
    cards: lost,
  },
  {
    id: 'praying-for-church',
    name: 'Praying for Your Church',
    description: 'Pray for your church’s unity, leaders, and witness — and a nudge to pray for your pastors and staff by name.',
    suggestedCategory: 'My Church',
    suggestedCadence: { kind: 'weekly' },
    cards: church,
  },
  {
    id: 'praying-for-work',
    name: 'Praying for Your Work',
    description: 'Pray for integrity, witness, and contentment in your work — and for your boss and coworkers by name.',
    suggestedCategory: 'Work',
    suggestedCadence: { kind: 'weekly' },
    cards: work,
  },
  {
    id: 'praying-for-nation',
    name: 'Praying for Your Nation & Leaders',
    description: 'Pray for those in authority over you, by role — local, state, and national leaders, the courts, and upcoming elections.',
    suggestedCategory: 'Nation & Leaders',
    suggestedCadence: { kind: 'weekly' },
    cards: nation,
  },
];
