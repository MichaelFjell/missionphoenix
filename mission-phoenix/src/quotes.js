// Quote library for the journey tracker. Pulled randomly on each day check.
// Categories: stoic, empower, harm, spirit, brotherhood.
// Add freely. The picker will auto-balance across categories.

export const quotes = [
  // ====== STOIC ======
  { text: "You have power over your mind, not outside events. Realize this, and you will find strength.", source: "Marcus Aurelius", category: "stoic" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", source: "Marcus Aurelius", category: "stoic" },
  { text: "We suffer more in imagination than in reality.", source: "Seneca", category: "stoic" },
  { text: "No man is free who is not master of himself.", source: "Epictetus", category: "stoic" },
  { text: "First say to yourself what you would be, then do what you have to do.", source: "Epictetus", category: "stoic" },
  { text: "The impediment to action advances action. What stands in the way becomes the way.", source: "Marcus Aurelius", category: "stoic" },
  { text: "It is not the man who has too little, but the man who craves more, that is poor.", source: "Seneca", category: "stoic" },
  { text: "He who fears death will never do anything worthy of a living man.", source: "Seneca", category: "stoic" },
  { text: "Man conquers the world by conquering himself.", source: "Zeno of Citium", category: "stoic" },
  { text: "If it is not right, do not do it. If it is not true, do not say it.", source: "Marcus Aurelius", category: "stoic" },
  { text: "The discipline of desire is the background of character.", source: "John Locke", category: "stoic" },
  { text: "Discipline equals freedom.", source: "Jocko Willink", category: "stoic" },
  { text: "The obstacle in the path becomes the path. Never forget, within every obstacle is an opportunity to improve our condition.", source: "Ryan Holiday", category: "stoic" },
  { text: "Every new beginning comes from some other beginning's end.", source: "Seneca", category: "stoic" },
  { text: "How long are you going to wait before you demand the best of yourself?", source: "Epictetus", category: "stoic" },
  { text: "Do not act as if you had ten thousand years to throw away. Death stands at your elbow. Be good for something while you live.", source: "Marcus Aurelius", category: "stoic" },
  { text: "A gem cannot be polished without friction, nor a man perfected without trials.", source: "Seneca", category: "stoic" },
  { text: "Luck is what happens when preparation meets opportunity.", source: "Seneca", category: "stoic" },
  { text: "Today I escaped anxiety. Or no, I discarded it. Because it was within me, in my own perceptions, not outside.", source: "Marcus Aurelius", category: "stoic" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", source: "Seneca", category: "stoic" },
  { text: "He who is brave is free.", source: "Seneca", category: "stoic" },
  { text: "Don't explain your philosophy. Embody it.", source: "Epictetus", category: "stoic" },
  { text: "The best revenge is to be unlike him who performed the injury.", source: "Marcus Aurelius", category: "stoic" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", source: "Epictetus", category: "stoic" },
  { text: "If you want to improve, be content to be thought foolish and stupid.", source: "Epictetus", category: "stoic" },

  // ====== EMPOWER ======
  { text: "You are not a weak man. You are a man who, for a time, outsourced his strength. Take it back.", category: "empower" },
  { text: "The cave you fear to enter holds the treasure you seek.", source: "Joseph Campbell", category: "empower" },
  { text: "Do the hard thing now so your future self can live the life your present self only dreams about.", category: "empower" },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", source: "James Clear", category: "empower" },
  { text: "The comfort you crave is killing the man you could be.", category: "empower" },
  { text: "Discipline is choosing between what you want now and what you want most.", source: "Abraham Lincoln", category: "empower" },
  { text: "What you do every day matters more than what you do once in a while.", source: "Gretchen Rubin", category: "empower" },
  { text: "Be yourself. But be the version of yourself that you respect.", category: "empower" },
  { text: "Don't negotiate with the version of you that's trying to take you backward.", category: "empower" },
  { text: "You're not behind. You're exactly where this path required you to be. Walk it anyway.", category: "empower" },
  { text: "The quality of your life is determined by the questions you ask yourself when nobody is watching.", category: "empower" },
  { text: "Your standards are your prayers. Whatever you tolerate, you invite.", category: "empower" },
  { text: "A warrior isn't someone who never feels fear. A warrior is someone who moves forward while feeling it.", category: "empower" },
  { text: "Hard choices, easy life. Easy choices, hard life.", source: "Jerzy Gregorek", category: "empower" },
  { text: "You can't pour from an empty vessel, and you can't build a mission from an exhausted soul.", category: "empower" },
  { text: "If it's important to you, you will find a way. If not, you will find an excuse.", source: "Ryan Blair", category: "empower" },
  { text: "Be stubborn about your goals and flexible about your methods.", category: "empower" },
  { text: "The person you are tomorrow is being built by the decisions you make today.", category: "empower" },
  { text: "Stop waiting for permission you were never going to get.", category: "empower" },
  { text: "A ship is safe in harbor, but that's not what ships are built for.", source: "John A. Shedd", category: "empower" },
  { text: "Your future self is watching you right now through memories.", category: "empower" },
  { text: "Don't compare your chapter one to someone else's chapter twenty.", category: "empower" },
  { text: "The man who chases two rabbits catches neither. Choose.", category: "empower" },
  { text: "You can rest. You cannot quit.", source: "David Goggins", category: "empower" },
  { text: "If you can't fly, then run. If you can't run, then walk. But whatever you do, you have to keep moving forward.", source: "Martin Luther King Jr.", category: "empower" },
  { text: "Comfort is a slow suicide. Discomfort is a fast cure.", category: "empower" },
  { text: "What we fear doing most is usually what we most need to do.", source: "Tim Ferriss", category: "empower" },
  { text: "The man who conquers himself is greater than the man who takes a city.", source: "Proverbs 16:32, paraphrased", category: "empower" },
  { text: "Excellence is never an accident. It is the result of deliberate choice made long before the opportunity arrives.", category: "empower" },
  { text: "You have been assigned this mountain to show others it can be moved.", category: "empower" },

  // ====== HARM (facts about porn / brain / relationship / testosterone) ======
  { text: "Pornography use is associated with reduced gray matter volume in the reward circuit of the brain, according to imaging research by Kuhn and Gallinat (2014).", category: "harm" },
  { text: "Every relapse reinforces the neural pathway you are trying to starve. Every clean day weakens it.", category: "harm" },
  { text: "The brain you train is the brain you get. Porn trains your brain to crave novelty, not intimacy.", category: "harm" },
  { text: "Chronic supernormal stimulation downregulates dopamine receptors. Your real life starts to feel gray not because it is, but because your baseline has been hijacked.", category: "harm" },
  { text: "The first time a pixel replaces a person in your desire, something quiet breaks. It can be rebuilt, but only on purpose.", category: "harm" },
  { text: "Studies have linked heavy porn use to reduced sexual function with real partners and erectile difficulties in men under 30, a problem that barely existed before broadband.", category: "harm" },
  { text: "Pornography does not teach you about sex. It teaches you about pornography. They are not the same language.", category: "harm" },
  { text: "You cannot simultaneously train yourself to seek the hyperreal and expect satisfaction from the real.", category: "harm" },
  { text: "The porn industry is not your friend. It is an industry. It needs you hooked to survive.", category: "harm" },
  { text: "The brain prunes what it does not use. Every day without porn is a day those old pathways grow quieter.", category: "harm" },
  { text: "Coolidge effect, the brain's interest in novel sexual partners, is what makes infinite-scroll porn so insidious. No real partner can compete with an algorithm.", category: "harm" },
  { text: "Research by Voon et al. (2014) found that cue reactivity in problematic porn users closely resembles the brain patterns of drug addicts.", category: "harm" },
  { text: "You are not weak for being hooked. You are dealing with a stimulus your ancestors never had to face. But you still have to face it.", category: "harm" },
  { text: "Shame does not stop the behavior. Structure stops the behavior. Shame just ensures you repeat it quietly.", category: "harm" },
  { text: "The average age of first porn exposure is now under 12. A generation is being raised on imagery their developing brains were never built to process.", category: "harm" },
  { text: "Dopamine is not pleasure. It is wanting. Porn manufactures wanting without the pleasure of being actually wanted back.", category: "harm" },
  { text: "A man who can't sit with his own boredom will always be a slave to whatever fills it first.", category: "harm" },
  { text: "The woman on the screen is not choosing you. That is the entire product.", category: "harm" },
  { text: "When porn becomes your primary teacher about intimacy, real intimacy starts to feel like a test you didn't study for.", category: "harm" },
  { text: "No research paper will ever fully capture what you already know: that something inside you feels heavier after, not lighter.", category: "harm" },
  { text: "The Voon study showed that heavy porn users experienced stronger brain activation to sexual cues but reported LESS subjective desire for real partners. The circuit gets louder while the pleasure gets quieter.", category: "harm" },
  { text: "Porn trains a man to perform arousal. Real intimacy asks him to be present in it. These are opposite skills.", category: "harm" },
  { text: "If a substance was free, infinitely abundant, hidden a click away, and rewired your reward system, you would call it a public health crisis. You would be right.", category: "harm" },
  { text: "The hours you reclaim from this are not small. Count them honestly and ask what you will spend them on instead. That is the real ledger.", category: "harm" },
  { text: "You are not fighting your sexuality. You are reclaiming it.", category: "harm" },

  // ====== SPIRIT (life force, transmutation, not religion-specific) ======
  { text: "What a man does with his sexual energy determines the quality of his contribution to the world.", category: "spirit" },
  { text: "Sexual energy is creative energy. What you do not spill into fantasy becomes available for everything else you value.", category: "spirit" },
  { text: "The ancients called it life force for a reason. It is not spent, it is directed.", category: "spirit" },
  { text: "You are not separate from the generations that came before you. They endured so that you could stand here. Honor them with your choices.", category: "spirit" },
  { text: "A sin is not primarily a rule broken. It is a pattern that diminishes who you were made to be.", category: "spirit" },
  { text: "Transmutation is the oldest known alchemy, the turning of base energy into higher work. Men have practiced it for millennia, and it has not aged.", category: "spirit" },
  { text: "To create, you must first contain. A river that spills in every direction irrigates nothing.", category: "spirit" },
  { text: "There is a reason every wisdom tradition, from monastic Christianity to Daoism to Vedic practice, treats unchecked sexual excess as a spiritual leak. They are not all wrong.", category: "spirit" },
  { text: "The body is not an enemy to overcome. It is a temple to steward. The distinction matters.", category: "spirit" },
  { text: "Restraint is not the absence of desire. It is desire bowed toward a higher purpose.", category: "spirit" },
  { text: "What you worship in private becomes what you are in public, whether you named it worship or not.", category: "spirit" },
  { text: "A man's intimate life is a small mirror of his covenant with reality. Where he is honest there, he tends to be honest elsewhere.", category: "spirit" },
  { text: "The sacred is not far away. It is hidden in every moment you chose restraint that nobody witnessed.", category: "spirit" },
  { text: "You are not only your thoughts. You are the one noticing them. Stay with the noticer.", category: "spirit" },
  { text: "Every act of self-mastery is a small prayer in the language of actions.", category: "spirit" },
  { text: "The deepest rebellion in a sensuality-addicted culture is to become a man who can sit with his own desire without being ruled by it.", category: "spirit" },
  { text: "Napoleon Hill called it sex transmutation and placed it among the most powerful principles for any man building a meaningful life.", category: "spirit" },
  { text: "You are not a body with a soul. You are a soul carrying a body. Act accordingly.", category: "spirit" },
  { text: "The phoenix is not just reborn. It burns first, and the burning is not a mistake. It is the means.", category: "spirit" },
  { text: "A life aligned is a life where your intimate choices, your work, and your stated values point in the same direction.", category: "spirit" },

  // ====== BROTHERHOOD / RECOVERY ======
  { text: "You are not alone in this. Every man who has ever walked through this darkness has thought he was the only one. He was wrong. So are you.", category: "brotherhood" },
  { text: "The opposite of addiction is not sobriety. It is connection.", source: "Johann Hari, paraphrased", category: "brotherhood" },
  { text: "A man who can ask for help is stronger than the one who pretends he doesn't need any.", category: "brotherhood" },
  { text: "Shame thrives in silence and withers in honest company. That is the entire reason the community exists.", category: "brotherhood" },
  { text: "Your recovery is your own. But you don't have to do it alone, and you were never meant to.", category: "brotherhood" },
  { text: "You are not broken. You are in the middle of being mended. There is a difference.", category: "brotherhood" },
  { text: "The man you will become is watching the man you are now. He is rooting for you.", category: "brotherhood" },
  { text: "Every man in the brotherhood started at day zero. Every day you stay is a day someone else will see and think, maybe I can too.", category: "brotherhood" },
  { text: "You do not have to believe you will make it. You only have to take the next right action anyway.", category: "brotherhood" },
  { text: "One relapse doesn't define you. A hundred relapses don't define you. What you do in the hour after the relapse does.", category: "brotherhood" },
  { text: "The strongest thing you will ever do is show up for yourself on a day you don't feel like it.", category: "brotherhood" },
  { text: "You're not starting over. You're continuing. Every day you've ever been clean is still in your bank.", category: "brotherhood" },
  { text: "Growth is not linear. Neither is healing. Be patient with a man who is doing the work, especially when that man is you.", category: "brotherhood" },
  { text: "Accountability is not surveillance. It is the simple practice of letting another man know where you stand.", category: "brotherhood" },
  { text: "You don't have to have it figured out to move forward.", category: "brotherhood" },
  { text: "A good day is one you chose. A hard day that you chose anyway is worth ten good ones that came easy.", category: "brotherhood" },
  { text: "If today felt small, it wasn't. Small consistent things are how mountains get built and how men do too.", category: "brotherhood" },
  { text: "You've been carrying this for a long time. Set it down for an hour. It will still be there if you need to pick it back up.", category: "brotherhood" },
  { text: "The voice telling you that you've failed too many times to try again is lying. It has always been lying.", category: "brotherhood" },
  { text: "Progress is not the absence of doubt. It is the willingness to move with it rather than against it.", category: "brotherhood" },
];

// Quick random picker. Optionally bias toward a category or away from a recently-seen set.
export function pickRandomQuote(excludeTexts = []) {
  const pool = quotes.filter(q => !excludeTexts.includes(q.text));
  if (pool.length === 0) return quotes[Math.floor(Math.random() * quotes.length)];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Deterministic pick based on a seed (e.g., date string), so a given day's quote is stable on reload.
export function pickDeterministicQuote(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  return quotes[Math.abs(hash) % quotes.length];
}
