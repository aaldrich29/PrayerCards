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
];
