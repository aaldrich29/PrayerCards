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

  // Intercession / topical cards
  { type: 'request', title: 'Supreme Court', body: 'John G. Roberts, Clarence Thomas, Samuel A. Alito, Sonia Sotomayor, Elena Kagan, Neil Gorsuch, Brett M. Kavanaugh, Amy Coney Barrett, Ketanji Brown Jackson' },
  { type: 'request', title: 'Abort Abortion in America', body: 'Planned Parenthood; all pro-infanticide laws' },
  { type: 'request', title: 'Homosexual "Marriage" in America', body: 'adultery, fornication, lesbianism, homosexuality, bisexuality, transgenderism, pedophilia, pornography, abortion' },
  { type: 'request', title: 'Southern Baptist Convention', body: 'Pray for the presidents of: SBC Executive Committee; International Mission Board; Lifeway; Gateway Seminary; Midwestern Seminary; New Orleans Seminary; Southeastern Seminary; Southern Baptist Theological Seminary; Southwestern Seminary' },
  { type: 'request', title: 'Memphis & Shelby County', body: 'Pastors and churches; schools; businesses/jobs; political leaders — Memphis Mayor & City Council; Shelby County Mayor and County Commissioners' },

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

export const PRESET_STACKS: PresetStack[] = [
  {
    id: 'steve-gaines-names-of-god',
    name: 'Steve Gaines — Names of God',
    description:
      'The Names of God prayer cards by Steve Gaines (Bellevue Baptist): worship God through eight of His Hebrew names, with Scripture, plus cards for interceding for the nation, the church, and your city.',
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
    id: 'praying-for-spouse',
    name: 'Praying for Your Spouse',
    description: 'Pray Scripture and blessings over your husband or wife — their walk with God, your marriage, and their well-being.',
    suggestedCategory: 'My Spouse',
    suggestedCadence: { kind: 'daily' },
    cards: spouse,
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
    id: 'praying-for-self',
    name: 'Praying for Yourself',
    description: 'Bring your own heart before God — for hunger after Him, wisdom, purity, strength, and calling.',
    suggestedCategory: 'Myself',
    suggestedCadence: { kind: 'daily' },
    cards: self,
  },
];
