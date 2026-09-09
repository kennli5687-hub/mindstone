const blockerCatalog = [
  {
    id: "avoidance",
    name: "Avoidance",
    description: "Dodging the task, tab, or conversation.",
    enemy: "Fog Wisp",
    tools: ["behavioral", "cognitive"],
    shortTermEffect: "Reduces discomfort and anxiety.",
    longTermEffect: "Can reinforce fear and make the avoided task or situation feel increasingly difficult.",
    underlyingThought: "Avoiding the problem is safer or easier than facing it.",
  },
  {
    id: "procrastination",
    name: "Procrastination",
    description: "Putting off what matters even when you mean to begin.",
    enemy: "Delay Drift",
    tools: ["behavioral", "cognitive"],
    shortTermEffect: "Creates instant relief by delaying the task.",
    longTermEffect: "Can increase pressure, guilt, and the size of the task.",
    underlyingThought: "Starting later will feel easier than starting now.",
  },
  {
    id: "perfectionism",
    name: "Perfectionism",
    description: "Waiting until it feels perfect before starting.",
    enemy: "Mirror Judge",
    tools: ["cognitive", "behavioral"],
    shortTermEffect: "Creates a sense of control and reduces uncertainty.",
    longTermEffect: "Can lead to procrastination, exhaustion, self-criticism, and fear of failure.",
    underlyingThought: "Something must be done perfectly to be acceptable or successful.",
  },
  {
    id: "overthinking",
    name: "Overthinking",
    description: "Looping over the same thought without reaching a decision.",
    enemy: "Loop Lantern",
    tools: ["behavioral", "emotional"],
    shortTermEffect: "Feels like careful analysis or control.",
    longTermEffect: "Can drain energy, stall decisions, and make small problems feel larger.",
    underlyingThought: "If I think about it enough, I can eliminate uncertainty.",
  },
  {
    id: "stress",
    name: "Stress",
    description: "Feeling pushed by pressure, time, or too much demand.",
    enemy: "Storm Heap",
    tools: ["behavioral", "emotional"],
    shortTermEffect: "Can sharpen attention and push you to react quickly.",
    longTermEffect: "Can cause tension, fatigue, irritability, and burnout when it stays high.",
    underlyingThought: "I have more to handle than I can comfortably carry right now.",
  },
  {
    id: "anxiety",
    name: "Anxiety",
    description: "Rising tension, worry, and what-ifs building up at once.",
    enemy: "Shifting Static",
    tools: ["emotional", "cognitive"],
    shortTermEffect: "Increases alertness and prepares the mind and body to respond to perceived threats.",
    longTermEffect: "Persistent anxiety can cause exhaustion, avoidance, difficulty concentrating, and ongoing distress.",
    underlyingThought: "Something may go wrong and needs to be prevented or controlled.",
  },
  {
    id: "self_doubt",
    name: "Self-Doubt",
    description: "Second-guessing your ability and intentions.",
    enemy: "Echo Doubler",
    tools: ["cognitive", "emotional"],
    shortTermEffect: "Encourages caution and repeated checking of decisions.",
    longTermEffect: "Can weaken confidence, increase dependence on reassurance, and cause missed opportunities.",
    underlyingThought: "Your abilities, judgment, or decisions may not be good enough.",
  },
  {
    id: "insecurity",
    name: "Insecurity",
    description: "Feeling unsure of your worth or place.",
    enemy: "Wobble Veil",
    tools: ["emotional", "social"],
    shortTermEffect: "Can push you toward reassurance or shrinking yourself.",
    longTermEffect: "Can weaken confidence, increase comparison, and make connection feel riskier.",
    underlyingThought: "If people really saw me, they might judge me.",
  },
  {
    id: "social_anxiety",
    name: "Social Anxiety",
    description: "Fear of being watched, judged, or evaluated.",
    enemy: "Spotlight Shade",
    tools: ["social", "emotional"],
    shortTermEffect: "Can make you monitor yourself closely or hold back.",
    longTermEffect: "Can reduce confidence, limit connection, and strengthen avoidance.",
    underlyingThought: "Other people's reactions decide whether I am acceptable.",
  },
  {
    id: "fear_of_rejection",
    name: "Fear of Rejection",
    description: "Worry that people will say no or pull away.",
    enemy: "Closed Gate",
    tools: ["social", "emotional"],
    shortTermEffect: "May keep you from asking, sharing, or reaching out.",
    longTermEffect: "Can shrink opportunities, increase loneliness, and reinforce self-protection.",
    underlyingThought: "If I ask or show myself, I might be rejected.",
  },
];

const blockerCategoryCatalog = [
  {
    id: "behavioral",
    name: "Behavioral Blockers",
    summary: "Starting, continuing, finishing",
    symbol: "->",
    states: ["avoidance", "procrastination", "perfectionism"],
  },
  {
    id: "cognitive",
    name: "Cognitive Blockers",
    summary: "Thought loops and uncertainty",
    symbol: "?",
    states: ["overthinking", "self_doubt"],
  },
  {
    id: "emotional",
    name: "Emotional Blockers",
    summary: "Pressure, worry, and tension",
    symbol: "~",
    states: ["stress", "anxiety"],
  },
  {
    id: "social",
    name: "Social Blockers",
    summary: "Judgment and connection fears",
    symbol: "::",
    states: ["social_anxiety", "fear_of_rejection"],
  },
];

const psychologicalStateReference = [
  {
    id: "avoidance",
    name: "Avoidance",
    intro: "Avoidance is when you distance yourself from a task, situation, or feeling because facing it feels uncomfortable or difficult.",
    underlyingThought: "If I avoid this, I won't have to deal with the discomfort.",
    shortTermEffects: ["Temporary relief", "Reduced anxiety", "Feeling of safety or comfort"],
    longTermEffects: ["Problems remain unresolved", "Anxiety or fear can become stronger", "Avoidance becomes a habitual response"],
    solutions: ["Start with one very small step", "Gradually face what you are avoiding", "Focus on starting rather than finishing"],
  },
  {
    id: "procrastination",
    name: "Procrastination",
    intro: "Procrastination is delaying an important task even though you know postponing it may create problems later.",
    underlyingThought: "I'll feel more ready to do it later.",
    shortTermEffects: ["Temporary relief from pressure", "More time for enjoyable activities", "Less immediate discomfort"],
    longTermEffects: ["Increased stress and guilt", "Rushed or lower-quality work", "Reduced trust in yourself"],
    solutions: ["Break the task into smaller steps", "Use a short timer to get started", "Set a specific time to begin"],
  },
  {
    id: "perfectionism",
    name: "Perfectionism",
    intro: "Perfectionism is the belief that your work or performance must meet extremely high standards to be considered good enough.",
    underlyingThought: "If it isn't perfect, it isn't good enough.",
    shortTermEffects: ["Increased pressure", "Fear of making mistakes", "Difficulty starting or finishing"],
    longTermEffects: ["Burnout", "Procrastination and avoidance", "Constant self-criticism"],
    solutions: ["Define what \"good enough\" means", "Allow yourself to make mistakes", "Focus on progress instead of perfection"],
  },
  {
    id: "overthinking",
    name: "Overthinking",
    intro: "Overthinking is repeatedly analyzing the same thoughts or situation without reaching a decision or solution.",
    underlyingThought: "I need to think about this more before I can make the right decision.",
    shortTermEffects: ["Mental exhaustion", "Indecision", "Increased tension"],
    longTermEffects: ["Difficulty making decisions", "Reduced confidence in yourself", "Increased anxiety"],
    solutions: ["Set a deadline for making the decision", "Write down your options and next step", "Ask whether more thinking will actually help"],
  },
  {
    id: "stress",
    name: "Stress",
    intro: "Stress occurs when the demands placed on you feel greater than your ability or resources to handle them.",
    underlyingThought: "There is too much to do, and I can't keep up.",
    shortTermEffects: ["Feeling overwhelmed", "Difficulty concentrating", "Irritability or tension"],
    longTermEffects: ["Exhaustion or burnout", "Reduced productivity", "Difficulty relaxing and recovering"],
    solutions: ["Prioritize the most important tasks", "Take regular breaks", "Ask for help when necessary"],
  },
  {
    id: "anxiety",
    name: "Anxiety",
    intro: "Anxiety is a state of heightened worry in which your mind and body prepare for something that might go wrong.",
    underlyingThought: "Something bad is going to happen, and I won't be able to handle it.",
    shortTermEffects: ["Racing thoughts", "Physical tension", "Restlessness"],
    longTermEffects: ["Chronic worry", "Increased avoidance", "Reduced confidence"],
    solutions: ["Challenge catastrophic thoughts", "Use breathing or grounding techniques", "Take gradual action despite the anxiety"],
  },
  {
    id: "self_doubt",
    name: "Self-Doubt",
    intro: "Self-doubt is uncertainty about your abilities, decisions, or capacity to handle a situation.",
    underlyingThought: "I'm probably not capable enough to do this.",
    shortTermEffects: ["Hesitation", "Reduced motivation", "Seeking reassurance"],
    longTermEffects: ["Lower self-confidence", "Missed opportunities", "Dependence on others' approval"],
    solutions: [
      "Keep track of things you have successfully accomplished",
      "Challenge negative assumptions with evidence",
      "Make small decisions independently",
    ],
  },
  {
    id: "insecurity",
    name: "Insecurity",
    intro: "Insecurity is a feeling of uncertainty about your worth, abilities, appearance, or place among others.",
    underlyingThought: "I'm not good enough compared to everyone else.",
    shortTermEffects: ["Self-comparison", "Sensitivity to criticism", "Reassurance-seeking"],
    longTermEffects: ["Lower self-esteem", "Difficulty asserting yourself", "Avoidance of opportunities"],
    solutions: ["Separate self-worth from performance", "Reduce unhealthy comparisons", "Focus on your own strengths and values"],
  },
  {
    id: "social_anxiety",
    name: "Social Anxiety",
    intro: "Social anxiety is a strong fear of being judged, embarrassed, or negatively evaluated by other people.",
    underlyingThought: "Everyone is going to notice and judge me.",
    shortTermEffects: [
      "Nervousness and self-consciousness",
      "Avoiding conversations or social situations",
      "Physical symptoms such as tension or a racing heart",
    ],
    longTermEffects: ["Social isolation", "Reduced confidence", "Missed relationships and opportunities"],
    solutions: [
      "Gradually practice uncomfortable social situations",
      "Focus on the other person instead of yourself",
      "Challenge assumptions about what others think",
    ],
  },
  {
    id: "fear_of_rejection",
    name: "Fear of Rejection",
    intro: "Fear of rejection is the expectation that others will reject, criticize, dislike, or withdraw from you.",
    underlyingThought: "If someone rejects me, it means I'm not good enough.",
    shortTermEffects: ["Hesitation to reach out", "People-pleasing", "Overanalyzing interactions"],
    longTermEffects: ["Missed relationships and opportunities", "Difficulty expressing your needs", "Dependence on external approval"],
    solutions: ["Separate rejection from your self-worth", "Practice making small requests", "Learn to tolerate the possibility of hearing \"no\""],
  },
];

const quizQuestions = [
  {
    question: "Alex has an assignment due tomorrow but keeps watching videos instead of starting it. What is the most likely reason for this behavior?",
    options: [
      "The task provides immediate comfort",
      "Delaying helps Alex temporarily avoid discomfort",
      "Alex has completely lost interest in school",
      "Alex wants the assignment to be harder",
    ],
    answer: 1,
  },
  {
    question: "Maya finishes an assignment but refuses to submit it because she believes there is always something she could improve. What is the main problem?",
    options: [
      "She is setting an unrealistic standard for herself",
      "She is avoiding social situations",
      "She is afraid of asking for help",
      "She has too many responsibilities",
    ],
    answer: 0,
  },
  {
    question: "Jordan has already made a decision but keeps thinking, \"What if I chose the wrong option?\" What would be the best response?",
    options: [
      "Analyze every possible outcome indefinitely",
      "Make another decision immediately",
      "Recognize that complete certainty is impossible and move forward",
      "Avoid making decisions in the future",
    ],
    answer: 2,
  },
  {
    question: "Sam has three tests, two assignments, and a presentation in the same week and feels unable to manage everything. What would be the most helpful first step?",
    options: [
      "Try to complete everything simultaneously",
      "Prioritize the most urgent and important tasks",
      "Ignore all deadlines until the weekend",
      "Spend more time worrying about the workload",
    ],
    answer: 1,
  },
  {
    question: "Taylor thinks, \"If I make a mistake during my presentation, everyone will think I'm stupid.\" Which response would be the most realistic?",
    options: [
      "Everyone will definitely laugh at me.",
      "I must make absolutely no mistakes.",
      "A mistake may happen, but it does not mean everyone will judge me negatively.",
      "I should avoid presenting completely.",
    ],
    answer: 2,
  },
  {
    question: "Chris receives a low grade and immediately thinks, \"I knew I wasn't smart enough.\" What would be the healthiest response?",
    options: [
      "Treat the grade as proof of inability",
      "Compare the grade with everyone else's",
      "Look at what went wrong and identify what can be improved",
      "Avoid taking difficult classes",
    ],
    answer: 2,
  },
  {
    question: "Emma constantly compares her appearance, grades, and achievements with other people. What is a likely consequence?",
    options: [
      "Increased self-confidence",
      "Greater feelings of inadequacy",
      "Better relationships automatically",
      "Less concern about other people's opinions",
    ],
    answer: 1,
  },
  {
    question: "Before speaking in class, Noah thinks, \"Everyone is going to notice if I sound nervous.\" What would be the most helpful approach?",
    options: [
      "Focus entirely on how he appears to others",
      "Avoid speaking whenever possible",
      "Focus attention on communicating his idea rather than monitoring himself",
      "Memorize every possible response beforehand",
    ],
    answer: 2,
  },
  {
    question: "Riley wants to ask someone to join them for an activity but thinks, \"If they say no, it proves they don't like me.\" What is the flaw in this thought?",
    options: [
      "A rejection can have many explanations besides personal worth",
      "People never reject invitations",
      "Rejection always means the relationship is over",
      "Riley should never ask again",
    ],
    answer: 0,
  },
  {
    question: "Which action would most effectively break a cycle of avoidance?",
    options: [
      "Waiting until you feel completely comfortable",
      "Taking one small step toward the uncomfortable situation",
      "Finding another activity to distract yourself",
      "Convincing yourself the problem does not exist",
    ],
    answer: 1,
  },
  {
    question: "Someone keeps postponing a 30-minute assignment because it feels overwhelming. Which approach would probably make starting easier?",
    options: [
      "Tell themselves they must finish it perfectly",
      "Commit to working on it for only five minutes",
      "Wait until they have several free hours",
      "Think about all the consequences of failing",
    ],
    answer: 1,
  },
  {
    question: "After making a small mistake, someone spends the entire evening criticizing themselves. Which response would be most constructive?",
    options: [
      "Continue analyzing the mistake until they understand every detail",
      "Remind themselves that mistakes are part of learning",
      "Avoid similar situations permanently",
      "Assume the mistake defines their ability",
    ],
    answer: 1,
  },
  {
    question: "Someone is extremely nervous about attending a party but decides to stay for 15 minutes instead of avoiding it completely. Why could this help?",
    options: [
      "It guarantees they will enjoy the party",
      "It allows them to gradually become more comfortable with the situation",
      "It prevents them from ever feeling anxious again",
      "It eliminates the need for future social interaction",
    ],
    answer: 1,
  },
  {
    question: "Which statement shows the healthiest attitude toward rejection?",
    options: [
      "If they say no, something must be wrong with me.",
      "I should never risk being rejected.",
      "Rejection can be disappointing without determining my worth.",
      "I need everyone to approve of my choices.",
    ],
    answer: 2,
  },
  {
    question: "A student feels overwhelmed, avoids their homework, becomes guilty, and then feels even more stressed. What would be the best way to interrupt this cycle?",
    options: [
      "Avoid the homework until the stress disappears",
      "Criticize themselves for procrastinating",
      "Choose one small task and begin working on it",
      "Try to complete every assignment at once",
    ],
    answer: 2,
  },
];

const alternateQuizQuestions = [
  {
    question: "Someone keeps checking their work because they believe even one small mistake means they have failed. What would help them move forward?",
    options: [
      "Define a clear good-enough standard before submitting",
      "Keep checking until no uncertainty remains",
      "Avoid submitting the work entirely",
      "Raise the standard every time they improve it",
    ],
    answer: 0,
  },
  {
    question: "An unopened email feels stressful, so someone keeps distracting themselves. What action would best interrupt that pattern?",
    options: [
      "Think through every possible outcome first",
      "Open the email and read only the first sentence",
      "Wait until the discomfort disappears completely",
      "Find another task that feels easier",
    ],
    answer: 1,
  },
  {
    question: "What is a common underlying thought behind procrastination?",
    options: [
      "I need to avoid all social situations.",
      "I'll feel more ready to do this later.",
      "Everyone is judging me.",
      "I'm better than everyone else.",
    ],
    answer: 1,
  },
  {
    question: "Someone spends an hour imagining every possible outcome of a decision but still cannot decide. What would be the most useful next step?",
    options: [
      "Keep analyzing until certainty appears",
      "Avoid the decision until someone else chooses",
      "Set a decision deadline and identify one next action",
      "Start comparing yourself to people who decide faster",
    ],
    answer: 2,
  },
  {
    question: "Which is most likely to be a short-term effect of procrastination?",
    options: ["Temporary relief", "Long-term burnout", "Improved self-confidence", "Better time management"],
    answer: 0,
  },
  {
    question: "Someone has several assignments, little time, and feels like they cannot keep up. What would be the most helpful first response?",
    options: [
      "Try to finish everything at the same time",
      "Choose the most urgent priorities and start with one",
      "Ignore the assignments until motivation returns",
      "Spend the rest of the day worrying",
    ],
    answer: 1,
  },
  {
    question: "A student wants to try out for a team but keeps doubting whether they are capable. Which thought fits that pattern?",
    options: [
      "Everyone is watching me.",
      "If I make one mistake, everything is ruined.",
      "Maybe I'm not capable of doing this.",
      "I have too much to do.",
    ],
    answer: 2,
  },
  {
    question: "Someone feels uncomfortable speaking in class because they are afraid other students will think they sound stupid. What would help most?",
    options: [
      "Monitor every facial expression in the room",
      "Focus on clearly communicating one idea",
      "Avoid speaking for the rest of the semester",
      "Rehearse every possible reaction first",
    ],
    answer: 1,
  },
  {
    question: "A student keeps comparing themselves with classmates and feels worse afterward. Which thought fits that pattern?",
    options: [
      "I'm worried they might say no.",
      "I keep thinking about the same decision.",
      "Everyone else seems better than me.",
      "I have too many deadlines.",
    ],
    answer: 2,
  },
  {
    question: "Someone wants to ask a friend to hang out but decides not to because they are convinced the friend will reject them. What is the healthiest reframe?",
    options: [
      "A no would be disappointing, but it would not define my worth",
      "A no would prove the relationship is over",
      "I should never ask anyone again",
      "I need to become impossible to reject first",
    ],
    answer: 0,
  },
  {
    question: "Which is a possible long-term effect of avoidance?",
    options: [
      "Problems becoming easier automatically",
      "Increased confidence",
      "Stronger anxiety around the avoided situation",
      "Better decision-making",
    ],
    answer: 2,
  },
  {
    question: "Which strategy would be most helpful for overthinking?",
    options: [
      "Continue analyzing until you are 100% certain",
      "Set a decision deadline and choose a next step",
      "Avoid making the decision",
      "Ask everyone else what they would do",
    ],
    answer: 1,
  },
  {
    question: "Which strategy is most helpful for anxiety?",
    options: [
      "Wait until the anxiety completely disappears before acting",
      "Avoid everything that makes you anxious",
      "Challenge anxious thoughts and take gradual action",
      "Assume the worst possible outcome",
    ],
    answer: 2,
  },
  {
    question: "Which strategy would best help someone with fear of rejection?",
    options: [
      "Never make requests that could receive a no",
      "Practice making small requests and learn to tolerate rejection",
      "Constantly seek reassurance from others",
      "Try to make everyone like you",
    ],
    answer: 1,
  },
  {
    question: "Which combination creates a common negative cycle?",
    options: [
      "Anxiety to action to confidence to success",
      "Stress to rest to recovery to confidence",
      "Discomfort to avoidance to temporary relief to stronger anxiety",
      "Mistake to learning to improvement to confidence",
    ],
    answer: 2,
  },
];

const quizQuestionBanks = [quizQuestions, alternateQuizQuestions];

const scenarioComics = {
  avoidance: [
    "/assets/scenario-avoidance-1.png",
    "/assets/scenario-avoidance-2.png",
    "/assets/scenario-avoidance-3.png",
    "/assets/scenario-avoidance-4.png",
    "/assets/scenario-avoidance-5.png",
    "/assets/scenario-avoidance-6.png",
  ],
  procrastination: [
    "/assets/scenario-procrastination-1.png",
    "/assets/scenario-procrastination-2.png",
    "/assets/scenario-procrastination-3.png",
    "/assets/scenario-procrastination-4.png",
    "/assets/scenario-procrastination-5.png",
    "/assets/scenario-procrastination-6.png",
  ],
  perfectionism: "/assets/scenario-perfectionism.png",
  overthinking: "/assets/scenario-overthinking.png",
  stress: "/assets/scenario-stress.png",
  anxiety: "/assets/scenario-anxiety.png",
  self_doubt: "/assets/scenario-self-doubt.png",
  insecurity: "/assets/scenario-insecurity.png",
  social_anxiety: "/assets/scenario-social-anxiety.png",
  fear_of_rejection: "/assets/scenario-fear-of-rejection.png",
};

const statePreviewImages = {
  avoidance: "/assets/avoidance-category-preview.png",
  procrastination: "/assets/state-procrastination.png",
  perfectionism: "/assets/state-perfectionism.png",
  overthinking: "/assets/state-overthinking.png",
  stress: "/assets/state-stress.png",
  anxiety: "/assets/state-anxiety.png",
  self_doubt: "/assets/state-self-doubt.png",
  insecurity: "/assets/state-insecurity.png",
  social_anxiety: "/assets/state-social-anxiety.png",
  fear_of_rejection: "/assets/state-fear-of-rejection.png",
};

const solutionCatalog = {
  avoidance: [
    {
      title: "The 5-Minute Start",
      text: "Commit to the uncomfortable task for only five minutes, removing the pressure to finish it.",
    },
    {
      title: "Make It Smaller",
      text: "Break the avoided task into the smallest possible action, like opening the document or writing one sentence.",
    },
    {
      title: "Do It Before Ready",
      text: "Notice the urge to avoid and take one deliberate step toward the situation without waiting for discomfort to disappear.",
    },
  ],
  perfectionism: [
    {
      title: "Define Good Enough",
      text: "Decide the minimum standard that makes the task successful, then stop when that standard is met.",
    },
    {
      title: "First-Draft Rule",
      text: "Separate creating from improving by allowing the first attempt to be intentionally imperfect.",
    },
    {
      title: "Set a Hard Limit",
      text: "Use a fixed time or revision limit so improvement cannot continue indefinitely.",
    },
  ],
  anxiety: [
    {
      title: "Separate Facts From Predictions",
      text: "Identify what you actually know versus what your anxious mind is predicting might happen.",
    },
    {
      title: "Control vs. Cannot Control",
      text: "Divide the situation into what you can influence and what you cannot, then focus on the actionable side.",
    },
    {
      title: "Delay the Worry",
      text: "Write the worry down and set a later time to think about it instead of engaging immediately.",
    },
  ],
  procrastination: [
    {
      title: "2-Minute Launch",
      text: "Begin with only two minutes so the task becomes easier to enter.",
    },
    {
      title: "Make It Visible",
      text: "Put the task on the screen or desk so the next step is obvious and hard to dodge.",
    },
    {
      title: "Use a Start Time",
      text: "Pick a specific time to begin and treat the start as the goal, not the finish.",
    },
  ],
  stress: [
    {
      title: "Downshift First",
      text: "Take one slower breath cycle before trying to solve anything else.",
    },
    {
      title: "Name the Load",
      text: "Write down what is actually pressuring you so the stress is less shapeless.",
    },
    {
      title: "Shrink the Surface Area",
      text: "Remove one demand, one distraction, or one unnecessary decision.",
    },
  ],
  overthinking: [
    {
      title: "Set a Thinking Timer",
      text: "Give the loop a short limit, then stop when time is up.",
    },
    {
      title: "Write the Decision Once",
      text: "Put the conclusion on paper so you do not keep re-deciding it.",
    },
    {
      title: "Return to Action",
      text: "Pick one visible step and let movement interrupt the loop.",
    },
  ],
  self_doubt: [
    {
      title: "Evidence Check",
      text: "Look at concrete evidence of your past abilities, results, and experiences instead of relying only on the feeling.",
    },
    {
      title: "Decision Criteria",
      text: "Decide what factors actually matter before making a choice, then evaluate against those criteria.",
    },
    {
      title: "Act Before Certainty",
      text: "Accept that complete confidence may not come first and take a reasonable action while confidence develops.",
    },
  ],
  insecurity: [
    {
      title: "Separate Facts From Feelings",
      text: "Check what is true about you versus what insecurity is telling you.",
    },
    {
      title: "Record Real Wins",
      text: "Keep a short list of things you have handled well and read it when doubt spikes.",
    },
    {
      title: "Ask for Direct Feedback",
      text: "Get specific information instead of assuming the worst about how you are being seen.",
    },
  ],
  social_anxiety: [
    {
      title: "Gradual Exposure",
      text: "Start with a mildly uncomfortable social situation and gradually work toward more challenging ones.",
    },
    {
      title: "Shift Attention Outward",
      text: "Focus on the conversation, environment, or other person rather than monitoring how you appear.",
    },
    {
      title: "Post-Interaction Reality Check",
      text: "Compare what actually happened with what you feared would happen so imagined mistakes do not become facts.",
    },
  ],
  fear_of_rejection: [
    {
      title: "Make the Ask",
      text: "Put the request or message out there instead of rehearsing it forever.",
    },
    {
      title: "Practice a Safe No",
      text: "Try small requests so rejection feels survivable, not catastrophic.",
    },
    {
      title: "Separate No From Worth",
      text: "Treat a rejection as information about the request, not a verdict on you.",
    },
  ],
};

const skillTrees = {
  cognitive: {
    label: "Cognitive",
    color: "#8b5e34",
    tools: [
      {
        id: "thought-check",
        name: "Thought Check",
        description: "Name the thought and test whether it is fully true.",
        energy: 2,
        asset: "/assets/card-thought-check.png",
      },
      {
        id: "reframe",
        name: "Reframe",
        description: "Rewrite the story in a more balanced way.",
        energy: 2,
        asset: "/assets/card-thought-check.png",
      },
      {
        id: "next-step",
        name: "Next Step",
        description: "Reduce the problem to one visible action.",
        energy: 1,
        asset: "/assets/card-thought-check.png",
      },
    ],
  },
  behavioral: {
    label: "Behavioral",
    color: "#3e6b63",
    tools: [
      {
        id: "tiny-action",
        name: "Tiny Action",
        description: "Do the smallest possible version now.",
        energy: 1,
        asset: "/assets/card-tiny-action.png",
      },
      {
        id: "exposure",
        name: "Gentle Exposure",
        description: "Approach the avoided thing in a safe, small dose.",
        energy: 3,
        asset: "/assets/card-tiny-action.png",
      },
      {
        id: "habit-link",
        name: "Habit Link",
        description: "Attach the action to an existing routine.",
        energy: 2,
        asset: "/assets/card-tiny-action.png",
      },
    ],
  },
  social: {
    label: "Social",
    color: "#5f5c9d",
    tools: [
      {
        id: "boundary",
        name: "Boundary Line",
        description: "Say what you can and cannot do.",
        energy: 2,
        asset: "/assets/card-pause-breathe.png",
      },
      {
        id: "perspective",
        name: "Perspective Shift",
        description: "Consider what the other person might actually need.",
        energy: 2,
        asset: "/assets/card-pause-breathe.png",
      },
      {
        id: "ask-help",
        name: "Ask for Help",
        description: "Make a concrete request from another person.",
        energy: 1,
        asset: "/assets/card-pause-breathe.png",
      },
    ],
  },
  emotional: {
    label: "Emotional",
    color: "#a15d35",
    tools: [
      {
        id: "pause-breathe",
        name: "Pause & Breathe",
        description: "Slow the moment down before choosing a response.",
        energy: 1,
        asset: "/assets/card-pause-breathe.png",
      },
      {
        id: "self-compassion",
        name: "Self-Compassion",
        description: "Respond like a supportive coach, not a critic.",
        energy: 2,
        asset: "/assets/card-pause-breathe.png",
      },
      {
        id: "acceptance",
        name: "Acceptance",
        description: "Let the feeling exist without needing it gone first.",
        energy: 2,
        asset: "/assets/card-pause-breathe.png",
      },
    ],
  },
};

const state = {
  mode: "dashboard",
  day: 1,
  xp: 0,
  morale: 3,
  energy: 5,
  selectedBlockerId: null,
  selectedTreeId: "cognitive",
  unlockedTools: new Set(["thought-check", "tiny-action", "pause-breathe"]),
  journal: [],
  blockerCount: cloneBlockerCatalog(),
  drawPile: [],
  hand: [],
  discardPile: [],
  enemyHp: 12,
  enemyMaxHp: 12,
  turn: 1,
  message: "Choose a path to begin.",
  victorySummary: null,
  cardLocked: false,
  playQueue: [],
  quizOpen: false,
  quizIndex: 0,
  quizAnswers: [],
  activeQuizQuestions: [],
  scenarioOpen: false,
  scenarioPageIndex: 0,
};

function cloneBlockerCatalog() {
  return Object.fromEntries(blockerCatalog.map((blocker) => [blocker.id, 0]));
}

function getBlocker(blockerId) {
  return blockerCatalog.find((blocker) => blocker.id === blockerId);
}

function getEnemyArt(blockerId) {
  const artMap = {
    stress: "/assets/enemy-storm-heap-full.png",
  };

  return artMap[blockerId] ?? null;
}

function getScenarioPages(blockerId) {
  const comic = scenarioComics[blockerId];
  if (!comic) return [];
  return Array.isArray(comic) ? comic : [comic];
}

function getTree(treeId) {
  return skillTrees[treeId];
}

function getBestTreeForBlocker(blockerId) {
  const blocker = getBlocker(blockerId);
  return blocker?.tools[0] ?? "cognitive";
}

function shuffleArray(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function prepareQuizQuestions(questions) {
  return shuffleArray(questions).map((question) => {
    const randomizedOptions = shuffleArray(
      question.options.map((option, optionIndex) => ({
        option,
        isCorrect: optionIndex === question.answer,
      })),
    );

    return {
      question: question.question,
      options: randomizedOptions.map((entry) => entry.option),
      answer: randomizedOptions.findIndex((entry) => entry.isCorrect),
    };
  });
}

function createQuizSession() {
  const bankIndex = Math.floor(Math.random() * quizQuestionBanks.length);
  return prepareQuizQuestions(quizQuestionBanks[bankIndex]);
}

function choosePath(id) {
  state.selectedBlockerId = id;
  state.selectedTreeId = getBestTreeForBlocker(id);
  state.message = `You stand before the ${getBlocker(id)?.name ?? "path"} path.`;
  state.victorySummary = null;
  render();
}

function backOut() {
  state.selectedBlockerId = null;
  state.message = "Choose a path from the library.";
  render();
}

function startGame() {
  state.mode = "dashboard";
  state.message = "Choose a path from the library.";
  render();
}

function handleMenuAction(action) {
  if (action === "start-game" || action === "load-game") {
    startGame();
    return;
  }

  if (action === "progress") {
    state.message = "Progress is tracked in your run and journal.";
    render();
    return;
  }

  if (action === "settings") {
    state.message = "Settings can be added later.";
    render();
    return;
  }

  if (action === "journal") {
    state.message = "Your journal is in the sidebar during play.";
    render();
    return;
  }

  if (action === "exit-game") {
    state.message = "Choose a path from the library.";
    render();
  }
}

function startPathBattle() {
  if (!state.selectedBlockerId) return;
  state.message = `Inspecting ${getBlocker(state.selectedBlockerId)?.name ?? "the selected path"}.`;
  render();
}

const avatarViewerState = {
  activePoint: "head",
  autoRotate: true,
};

let avatarViewerHandle = null;

function disposeAvatarViewer() {
  if (avatarViewerHandle) {
    avatarViewerHandle.destroy();
    avatarViewerHandle = null;
  }
}

function mountAvatarViewer() {
  const container = document.querySelector("[data-avatar-viewer]");
  const caption = document.querySelector("[data-avatar-caption]");
  if (!container) return;

  disposeAvatarViewer();
  avatarViewerHandle = createAvatarViewer(container, caption);
}

function createAvatarViewer(container, caption) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4eee6);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, -0.35, 5.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth || 1, container.clientHeight || 1, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.replaceChildren(renderer.domElement);
  renderer.domElement.className = "avatar-canvas";

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = avatarViewerState.autoRotate;
  controls.autoRotateSpeed = 1.1;
  controls.minPolarAngle = Math.PI * 0.34;
  controls.maxPolarAngle = Math.PI * 0.62;
  controls.target.set(0, 0.2, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 2.2));

  const keyLight = new THREE.DirectionalLight(0xfff3e2, 2.5);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xcfe0ff, 1.2);
  fillLight.position.set(-4, 3, 4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xf6d6b1, 0.8);
  rimLight.position.set(0, 3, -5);
  scene.add(rimLight);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(2.7, 64),
    new THREE.MeshStandardMaterial({ color: 0xd7c7b8, roughness: 1, metalness: 0 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.55;
  ground.receiveShadow = true;
  scene.add(ground);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.8, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.49;
  shadow.scale.set(1.1, 0.5, 1);
  scene.add(shadow);

  let frameId = 0;
  let disposed = false;

  const loader = new GLTFLoader();
  loader.load(
    "/assets/center-specimen.glb",
    (gltf) => {
      if (disposed) return;

      const loadedModel = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(loadedModel);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z) || 1;

      loadedModel.position.sub(center);
      loadedModel.scale.setScalar(4.4 / maxDimension);
      scene.add(loadedModel);

      const scaledBounds = new THREE.Box3().setFromObject(loadedModel);
      loadedModel.position.y += -1.45 - scaledBounds.min.y;
      if (caption) caption.textContent = "";
    },
    undefined,
    () => {
      if (caption) caption.textContent = "Model could not load.";
    },
  );

  function resizeRenderer() {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate() {
    if (disposed) return;
    controls.update();
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(animate);
  }

  const resizeObserver = new ResizeObserver(resizeRenderer);
  resizeObserver.observe(container);
  window.addEventListener("resize", resizeRenderer);
  resizeRenderer();
  if (caption) caption.textContent = "";
  animate();

  return {
    destroy() {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeRenderer);
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if (material && typeof material.dispose === "function") {
              material.dispose();
            }
          });
        }
      });
      renderer.dispose();
      container.replaceChildren();
    },
  };
}

function buildAvatarModel() {
  const group = new THREE.Group();
  group.position.y = -1.18;
  group.rotation.y = 0.2;

  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xe7bf97, roughness: 0.82, metalness: 0 });
  const sweaterMaterial = new THREE.MeshStandardMaterial({ color: 0xe9dfd2, roughness: 0.95, metalness: 0 });
  const jeansMaterial = new THREE.MeshStandardMaterial({ color: 0x5d6f8d, roughness: 0.96, metalness: 0 });
  const shoeMaterial = new THREE.MeshStandardMaterial({ color: 0xe2d5c8, roughness: 0.95, metalness: 0 });
  const hairMaterial = new THREE.MeshStandardMaterial({ color: 0x523a2f, roughness: 0.88, metalness: 0 });
  const backpackMaterial = new THREE.MeshStandardMaterial({ color: 0x7a563d, roughness: 0.9, metalness: 0 });
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x211b18, roughness: 0.7, metalness: 0 });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.95, 1.55, 8, 18), sweaterMaterial);
  torso.position.y = 1.2;
  torso.scale.set(1, 1.05, 0.94);
  group.add(torso);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.22, 16), skinMaterial);
  neck.position.y = 2.4;
  group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.84, 32, 24), skinMaterial);
  head.position.y = 3.18;
  group.add(head);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.96, 32, 24), hairMaterial);
  hairCap.position.y = 3.46;
  hairCap.scale.set(1.04, 0.82, 1.0);
  group.add(hairCap);

  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), eyeMaterial);
  leftEye.position.set(-0.28, 3.22, 0.78);
  leftEye.scale.set(0.72, 1.25, 0.45);
  group.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.x = 0.28;
  group.add(rightEye);

  const mouth = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.014, 8, 24, Math.PI),
    eyeMaterial,
  );
  mouth.position.set(0, 3.0, 0.81);
  mouth.rotation.set(0, 0, Math.PI);
  mouth.scale.set(1, 0.58, 1);
  group.add(mouth);

  const strandPositions = [
    [-0.52, 3.68, 0.32, 0.55, 0.24, 0.26, -0.38],
    [-0.18, 3.92, 0.18, 0.52, 0.24, 0.24, -0.12],
    [0.18, 3.96, 0.2, 0.52, 0.24, 0.24, 0.08],
    [0.54, 3.68, 0.28, 0.58, 0.25, 0.24, 0.4],
    [-0.34, 3.72, -0.42, 0.62, 0.24, 0.24, -0.72],
    [0.42, 3.74, -0.45, 0.6, 0.24, 0.24, -0.7],
  ];

  strandPositions.forEach(([x, y, z, length, radiusTop, radiusBottom, tilt]) => {
    const strand = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.12, length, 4, 10),
      hairMaterial,
    );
    strand.position.set(x, y, z);
    strand.rotation.z = tilt;
    strand.rotation.y = x > 0 ? -0.42 : 0.42;
    strand.scale.set(1, 0.65, 1);
    group.add(strand);
  });

  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.2, 6, 12), sweaterMaterial);
  leftArm.position.set(-1.12, 1.96, 0.05);
  leftArm.rotation.z = 0.28;
  leftArm.rotation.y = 0.1;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.2, 6, 12), sweaterMaterial);
  rightArm.position.set(1.12, 1.96, 0.05);
  rightArm.rotation.z = -0.28;
  rightArm.rotation.y = -0.1;
  group.add(rightArm);

  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMaterial);
  leftHand.position.set(-1.22, 1.24, 0.06);
  group.add(leftHand);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMaterial);
  rightHand.position.set(1.22, 1.24, 0.06);
  group.add(rightHand);

  const backpack = new THREE.Mesh(new THREE.CapsuleGeometry(0.56, 1.35, 8, 18), backpackMaterial);
  backpack.position.set(0, 1.34, -0.46);
  backpack.rotation.x = -0.08;
  backpack.scale.set(1.16, 1, 0.42);
  group.add(backpack);

  const leftStrap = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 1.28, 6, 12), backpackMaterial);
  leftStrap.position.set(-0.48, 1.78, 0.45);
  leftStrap.rotation.z = 0.1;
  group.add(leftStrap);

  const rightStrap = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 1.28, 6, 12), backpackMaterial);
  rightStrap.position.set(0.48, 1.78, 0.45);
  rightStrap.rotation.z = -0.1;
  group.add(rightStrap);

  const leftGrip = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), skinMaterial);
  leftGrip.position.set(-0.54, 1.5, 0.64);
  leftGrip.scale.set(0.9, 1.15, 0.9);
  group.add(leftGrip);

  const rightGrip = leftGrip.clone();
  rightGrip.position.x = 0.54;
  group.add(rightGrip);

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.34, 1.7, 18), jeansMaterial);
  leftLeg.position.set(-0.35, -0.04, 0.08);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.34, 1.7, 18), jeansMaterial);
  rightLeg.position.set(0.35, -0.04, 0.08);
  group.add(rightLeg);

  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 1.02), shoeMaterial);
  leftShoe.position.set(-0.35, -1.0, 0.28);
  leftShoe.rotation.y = 0.04;
  group.add(leftShoe);

  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 1.02), shoeMaterial);
  rightShoe.position.set(0.35, -1.0, 0.28);
  rightShoe.rotation.y = -0.04;
  group.add(rightShoe);

  return {
    group,
  };
}

function createCardFromTool(tool, treeId) {
  const blocker = getBlocker(state.selectedBlockerId ?? blockerCatalog[0].id);
  const isMatch = blocker?.tools.includes(treeId);
  return {
    id: `${tool.id}-${treeId}`,
    name: tool.name,
    description: tool.description,
    energy: tool.energy,
    treeId,
    matchesBlocker: Boolean(isMatch),
    artClass: artClassForTool(tool.id),
    asset: tool.asset ?? null,
  };
}

function artClassForTool(toolId) {
  const artMap = {
    "thought-check": "art-thought-check",
    "reframe": "art-thought-check",
    "next-step": "art-next-step",
    "tiny-action": "art-tiny-action",
    "exposure": "art-exposure",
    "habit-link": "art-habit-link",
    "boundary": "art-boundary",
    "perspective": "art-perspective",
    "ask-help": "art-ask-help",
    "pause-breathe": "art-pause-breathe",
    "self-compassion": "art-self-compassion",
    "acceptance": "art-acceptance",
  };

  return artMap[toolId] ?? "art-thought-check";
}

function buildBattleDeck() {
  const baseDeck = [];
  const seen = new Set();
  const orderedTools = [
    "thought-check",
    "tiny-action",
    "pause-breathe",
    ...Object.values(skillTrees).flatMap((tree) => tree.tools.map((tool) => tool.id)),
  ];

  for (const toolId of orderedTools) {
    for (const [treeId, tree] of Object.entries(skillTrees)) {
      const tool = tree.tools.find((item) => item.id === toolId);
      if (!tool || !state.unlockedTools.has(tool.id)) continue;
      const key = `${tool.id}-${treeId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      baseDeck.push(createCardFromTool(tool, treeId));
    }
  }

  return shuffle([
    ...baseDeck,
    ...baseDeck.map((card) => ({ ...card, id: `${card.id}-alt1` })),
    ...baseDeck.map((card) => ({ ...card, id: `${card.id}-alt2` })),
  ]);
}

function drawCards(count = 5) {
  while (state.hand.length < count && state.drawPile.length > 0) {
    state.hand.push(state.drawPile.shift());
  }
}

function reshuffleDiscardIntoDeck() {
  if (state.drawPile.length > 0 || state.discardPile.length === 0) return;
  state.drawPile = shuffle(state.discardPile);
  state.discardPile = [];
}

function startBattle(blockerId) {
  const blocker = getBlocker(blockerId);
  state.drawPile = shuffle(buildBattleDeck());
  state.hand = [];
  state.discardPile = [];
  state.enemyMaxHp = 10 + (blocker?.tools.length ?? 0) * 2;
  state.enemyHp = state.enemyMaxHp;
  state.energy = 5;
  state.turn = 1;
  state.message = `A ${blocker?.enemy ?? "mystery enemy"} appears. Build a steady hand and look for the best fit.`;
  drawCards(7);
}

function shuffle(cards) {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function useTool(tool) {
  const blocker = getBlocker(state.selectedBlockerId ?? blockerCatalog[0].id);
  const tree = state.selectedTreeId;
  const isMatch = blocker?.tools.includes(tree);
  const cost = tool.energy;

  state.energy = Math.max(0, state.energy - cost);
  state.blockerCount[blocker?.id ?? blockerCatalog[0].id] += 1;

  let xpGain = 2;
  let moraleGain = 0;
  let note = `${tool.name} applied to ${blocker?.name ?? "Unknown"}.`;

  if (isMatch) {
    xpGain += 3;
    moraleGain += 1;
    note = `Good fit: ${tool.name} helps with ${blocker.name}.`;
  } else {
    note = `Still useful, but ${tool.name} is not the strongest match for ${blocker.name}.`;
  }

  if (tool.id === "tiny-action" || tool.id === "next-step") {
    xpGain += 1;
  }

  state.xp += xpGain;
  state.morale = Math.max(0, Math.min(5, state.morale + moraleGain));
  state.journal.unshift({
    day: state.day,
    scenario: blocker?.name ?? "Unknown",
    blocker: blocker?.name ?? "Unknown",
    tool: tool.name,
    note,
  });

  if (state.journal.length > 12) {
    state.journal.pop();
  }

  if (state.xp >= state.day * 10) {
    state.day += 1;
    state.energy = Math.min(5, state.energy + 2);
  }

  render();
}

function playCard(cardId) {
  if (state.cardLocked) {
    if (!state.playQueue.includes(cardId)) {
      state.playQueue.push(cardId);
    }
    return;
  }

  startCardPlay(cardId);
}

function startCardPlay(cardId) {
  state.cardLocked = true;
  const button = document.querySelector(`[data-card="${cardId}"]`);
  const enemyPanel = document.querySelector(".enemy-panel");
  const card = state.hand.find((item) => item.id === cardId);
  if (!button || !enemyPanel || !card) {
    state.cardLocked = false;
    resolveCardPlay(cardId);
    return;
  }

  const cardRect = button.getBoundingClientRect();
  const enemyRect = enemyPanel.getBoundingClientRect();
  const damage = card.matchesBlocker ? 4 + Math.max(0, 2 - card.energy) : 2;
  const crit = Boolean(card.matchesBlocker && (damage >= 5 || card.energy <= 1));
  launchCardStrike(card, cardRect, enemyRect, crit);

  window.setTimeout(() => {
    state.cardLocked = false;
    resolveCardPlay(cardId);
    const nextCardId = state.playQueue.shift();
    if (nextCardId) {
      window.setTimeout(() => startCardPlay(nextCardId), 0);
    }
  }, crit ? 420 : 340);
}

function resolveCardPlay(cardId) {
  const cardIndex = state.hand.findIndex((card) => card.id === cardId);
  if (cardIndex < 0) return;

  const card = state.hand.splice(cardIndex, 1)[0];
  state.discardPile.unshift(card);

  if (state.energy < card.energy) {
    state.message = "Not enough energy for that card right now.";
    state.hand.splice(cardIndex, 0, card);
    state.discardPile.shift();
    render();
    return;
  }

  state.energy -= card.energy;
  const damage = card.matchesBlocker ? 4 + Math.max(0, 2 - card.energy) : 2;
  state.enemyHp = Math.max(0, state.enemyHp - damage);
  state.xp += card.matchesBlocker ? 4 : 2;
  state.turn += 1;

  const result = card.matchesBlocker
    ? `${card.name} landed well against the current blocker.`
    : `${card.name} still helped, but it was not the strongest fit.`;

  state.message = result;
  state.journal.unshift({
    day: state.day,
    scenario: getBlocker(state.selectedBlockerId ?? blockerCatalog[0].id)?.name ?? "Unknown",
    blocker: getBlocker(state.selectedBlockerId ?? blockerCatalog[0].id)?.name ?? "Unknown",
    tool: card.name,
    note: result,
  });

  if (state.journal.length > 12) {
    state.journal.pop();
  }

  if (state.enemyHp === 0) {
    state.mode = "victory";
    state.message = `You cleared the ${blocker?.name ?? "path"} path.`;
    state.morale = Math.min(5, state.morale + 1);
    state.xp += 6;
    state.turn += 1;
    state.victorySummary = {
      blockerName: blocker?.name ?? "Unknown",
      enemyName: blocker?.enemy ?? "Unknown Enemy",
      reflection: getBlocker(state.selectedBlockerId ?? blockerCatalog[0].id)?.description ?? "",
    };
    render();
    return;
  }

  if (state.energy <= 0) {
    reshuffleDiscardIntoDeck();
    state.energy = 5;
    state.message = `${result} New energy restored for the next hand.`;
  }

  drawCards(7);

  if (state.xp >= state.day * 10) {
    state.day += 1;
  }

  render();
}

function launchCardStrike(card, cardRect, enemyRect, crit) {
  const startX = cardRect.left + cardRect.width / 2;
  const startY = cardRect.top + cardRect.height / 2;
  const targetX = enemyRect.left + enemyRect.width / 2;
  const targetY = enemyRect.top + enemyRect.height * 0.42;

  const overlay = document.createElement("div");
  overlay.className = `card-strike ${crit ? "crit" : ""}`;
  overlay.style.left = `${startX}px`;
  overlay.style.top = `${startY}px`;
  overlay.style.backgroundImage = card.asset ? `url('${card.asset}')` : "none";
  overlay.setAttribute("aria-hidden", "true");

  const trail = document.createElement("div");
  trail.className = `strike-trail ${crit ? "crit" : ""}`;
  trail.style.left = `${startX}px`;
  trail.style.top = `${startY}px`;
  trail.style.width = `${Math.hypot(targetX - startX, targetY - startY)}px`;
  trail.style.transform = `rotate(${Math.atan2(targetY - startY, targetX - startX)}rad)`;
  trail.setAttribute("aria-hidden", "true");

  const burst = document.createElement("div");
  burst.className = `crit-burst ${crit ? "show" : ""}`;
  burst.style.left = `${targetX}px`;
  burst.style.top = `${targetY}px`;
  burst.setAttribute("aria-hidden", "true");

  const flash = document.createElement("div");
  flash.className = `enemy-flash ${crit ? "crit" : ""}`;
  flash.style.left = `${enemyRect.left}px`;
  flash.style.top = `${enemyRect.top}px`;
  flash.style.width = `${enemyRect.width}px`;
  flash.style.height = `${enemyRect.height}px`;
  flash.setAttribute("aria-hidden", "true");

  document.body.appendChild(overlay);
  document.body.appendChild(trail);
  document.body.appendChild(burst);
  document.body.appendChild(flash);
  if (crit) {
    enemyPanel.classList.add("hit");
    window.setTimeout(() => enemyPanel.classList.remove("hit"), 320);
    const shell = document.querySelector(".app-shell");
    if (shell) {
      shell.style.animation = "screen-shake 240ms ease-out";
      window.setTimeout(() => {
        shell.style.animation = "";
      }, 260);
    }
  }

  overlay.animate(
    [
      { transform: "translate(-50%, -50%) scale(1) rotate(-6deg)", opacity: 1 },
      {
        transform: `translate(calc(-50% + ${(targetX - startX) * 0.72}px), calc(-50% + ${(targetY - startY) * 0.72}px)) scale(${crit ? 1.12 : 1.05}) rotate(5deg)`,
        opacity: 1,
        offset: 0.7,
      },
      {
        transform: `translate(calc(-50% + ${targetX - startX}px), calc(-50% + ${targetY - startY}px)) scale(0.98) rotate(12deg)`,
        opacity: 0,
      },
    ],
    { duration: crit ? 520 : 380, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)", fill: "forwards" },
  );

  trail.animate(
    [
      { opacity: 0, transform: trail.style.transform + " scaleX(0.2)" },
      { opacity: crit ? 0.95 : 0.65, transform: trail.style.transform + " scaleX(1)" },
      { opacity: 0, transform: trail.style.transform + " scaleX(1.05)" },
    ],
    { duration: crit ? 420 : 300, easing: "ease-out", fill: "forwards" },
  );

  flash.animate(
    [
      { opacity: 0, transform: "scale(1)", filter: "brightness(1)" },
      { opacity: crit ? 0.85 : 0.35, transform: "scale(1.01)", filter: "brightness(1.35)" },
      { opacity: 0, transform: "scale(1)", filter: "brightness(1)" },
    ],
    { duration: crit ? 360 : 220, easing: "ease-out", fill: "forwards" },
  );

  const cleanup = () => {
    overlay.remove();
    trail.remove();
    burst.remove();
    flash.remove();
  };

  burst.addEventListener("animationend", cleanup, { once: true });
  window.setTimeout(cleanup, crit ? 760 : 520);
}

function unlockTool(treeId) {
  const tree = getTree(treeId);
  const nextTool = tree.tools.find((tool) => !state.unlockedTools.has(tool.id));
  if (!nextTool) return;
  state.unlockedTools.add(nextTool.id);
  state.journal.unshift({
    day: state.day,
    scenario: "Unlock",
    blocker: tree.label,
    tool: nextTool.name,
    note: `Unlocked ${nextTool.name} in the ${tree.label} tree.`,
  });
  render();
}

function resetSession() {
  state.mode = "crossroads";
  state.day = 1;
  state.xp = 0;
  state.morale = 3;
  state.energy = 5;
  state.selectedBlockerId = null;
  state.selectedTreeId = "cognitive";
  state.unlockedTools = new Set(["thought-check", "tiny-action", "pause-breathe"]);
  state.journal = [];
  state.blockerCount = cloneBlockerCatalog();
  state.drawPile = [];
  state.hand = [];
  state.discardPile = [];
  state.enemyHp = 12;
  state.enemyMaxHp = 12;
  state.turn = 1;
  state.message = "Choose a path to begin.";
  state.victorySummary = null;
  state.cardLocked = false;
  state.playQueue = [];
  state.quizOpen = false;
  state.quizIndex = 0;
  state.quizAnswers = [];
  state.activeQuizQuestions = [];
  state.scenarioOpen = false;
  state.scenarioPageIndex = 0;
  render();
}

function returnToCrossroads() {
  state.mode = "crossroads";
  state.selectedBlockerId = null;
  state.message = "Choose a path to begin.";
  state.victorySummary = null;
  state.cardLocked = false;
  state.playQueue = [];
  render();
}

function openQuiz() {
  state.quizOpen = true;
  state.scenarioOpen = false;
  state.quizIndex = 0;
  state.quizAnswers = [];
  state.activeQuizQuestions = createQuizSession();
  render();
}

function closeQuiz() {
  state.quizOpen = false;
  render();
}

function selectQuizAnswer(answerIndex) {
  if (!state.quizOpen || state.quizIndex >= state.activeQuizQuestions.length) return;
  if (state.quizAnswers[state.quizIndex] !== undefined) return;
  state.quizAnswers[state.quizIndex] = answerIndex;
  render();
}

function advanceQuiz() {
  if (!state.quizOpen) return;
  if (state.quizAnswers[state.quizIndex] === undefined) return;
  state.quizIndex += 1;
  render();
}

function toggleAutoRotate() {
  avatarViewerState.autoRotate = !avatarViewerState.autoRotate;
  render();
}

function openScenario() {
  if (!state.selectedBlockerId || !getScenarioPages(state.selectedBlockerId).length) return;
  state.scenarioOpen = true;
  state.scenarioPageIndex = 0;
  state.quizOpen = false;
  render();
}

function closeScenario() {
  state.scenarioOpen = false;
  state.scenarioPageIndex = 0;
  render();
}

function changeScenarioPage(direction) {
  if (!state.scenarioOpen) return;
  const pages = getScenarioPages(state.selectedBlockerId);
  if (!pages.length) return;
  const nextPageIndex = Math.max(0, Math.min(state.scenarioPageIndex + direction, pages.length - 1));
  if (nextPageIndex === state.scenarioPageIndex) return;
  state.scenarioPageIndex = nextPageIndex;
  render();
}

function goToScenarioPage(pageIndex) {
  const pages = getScenarioPages(state.selectedBlockerId);
  if (!pages[pageIndex]) return;
  state.scenarioPageIndex = pageIndex;
  render();
}

function createApp() {
  const blocker = state.selectedBlockerId ? getBlocker(state.selectedBlockerId) : null;
  const selectedReference = psychologicalStateReference.find((entry) => entry.id === state.selectedBlockerId) ?? null;
  return `
    <div class="app-shell demo-shell">
      <div class="layout dashboard-layout">
        <aside class="panel library-panel stack">
          <div class="stage-header">
            <div>
              <div class="title">Psychological States</div>
              <div class="muted small">Select a state on the left.</div>
            </div>
          </div>
          <div class="library-list category-list">
            ${blockerCategoryCatalog
              .map((category) => {
                const categoryStates = category.states.map((blockerId) => getBlocker(blockerId)).filter(Boolean);
                const hasSelection = categoryStates.some((entry) => entry.id === state.selectedBlockerId);

                return `
                  <section class="category-card ${hasSelection ? "has-selection" : ""}">
                    <div class="category-header">
                      <span class="library-icon category-icon">${category.name.slice(0, 1)}</span>
                      <span class="library-copy">
                        <span class="title">${category.name}</span>
                        <span class="muted small">${category.summary}</span>
                      </span>
                      <span class="category-symbol">${category.symbol}</span>
                      <span class="category-count">${categoryStates.length}</span>
                    </div>
                    <div class="category-states">
                      ${categoryStates
                        .map(
                          (entry) => {
                            const previewImage = statePreviewImages[entry.id];
                            return previewImage
                              ? `
                                <button class="category-state-image-button ${entry.id === state.selectedBlockerId ? "active" : ""}" data-path="${entry.id}" aria-label="${entry.name}">
                                  <img class="category-state-image" src="${previewImage}" alt="${entry.name}" />
                                </button>
                              `
                              : `
                                <button class="category-state ${entry.id === state.selectedBlockerId ? "active" : ""}" data-path="${entry.id}">
                                  <span>${entry.name}</span>
                                </button>
                              `;
                          },
                        )
                        .join("")}
                    </div>
                  </section>
                `;
              })
              .join("")}
          </div>
        </aside>

        <main class="workspace-column">
          <section class="center-stage card stack viewer-stage">
            <div class="viewer-frame">
              <video
                class="specimen-video"
                src="/assets/what-avoidance-is-silent.mp4"
                controls
                preload="metadata"
                muted
                playsinline
                aria-label="What avoidance is — video"
              ></video>
            </div>
          </section>

          ${buildBottomCards()}
        </main>

        <aside class="panel info-rail stack">
          ${buildInfoPanel(selectedReference)}
        </aside>
      </div>
      ${state.scenarioOpen ? buildScenarioModal() : ""}
      ${state.quizOpen ? buildQuizModal() : ""}
    </div>
  `;
  if (state.mode === "menu") {
    return `
      <div class="app-shell">
        <section class="menu-screen">
          <div class="menu-art"></div>
          <div class="menu-hotspots" aria-label="Menu actions">
            <button class="menu-hotspot start" data-menu-action="start-game" aria-label="Start Journey"></button>
            <button class="menu-hotspot load" data-menu-action="load-game" aria-label="Load Game"></button>
            <button class="menu-hotspot progress" data-menu-action="progress" aria-label="Progress"></button>
            <button class="menu-hotspot settings" data-menu-action="settings" aria-label="Settings"></button>
            <button class="menu-hotspot exit" data-menu-action="exit-game" aria-label="Exit Game"></button>
            <button class="menu-hotspot journal" data-menu-action="journal" aria-label="Journal"></button>
          </div>
        </section>
      </div>
    `;
  }

  return `
    <div class="app-shell">
      <header class="hero">
        <h1>Choose your path</h1>
      </header>

      <div class="layout">
        <main class="panel stack">
          <section class="stack">
            <div class="row" style="justify-content: space-between; align-items: center;">
              <div>
                <div class="title">Current run</div>
                <div class="muted small">Day ${state.day} · Turn ${state.turn} · XP ${state.xp} · Energy ${state.energy}/5 · Morale ${state.morale}/5</div>
              </div>
              <button class="secondary" data-action="reset">Reset</button>
            </div>
          </section>

          ${
          state.mode === "crossroads"
              ? `
                <section class="crossroads-map">
                  <div class="crossroads-art"></div>
                  <div class="crossroads-hotspots" aria-label="Choose your path">
                    ${blockerCatalog
                      .map((entry) => `
                        <button class="path-hotspot path-${entry.id}" data-path="${entry.id}" aria-label="Choose ${entry.name} path"></button>
                      `)
                      .join("")}
                  </div>
                  <div class="crossroads-center">
                    <button class="crossroads-center-button secondary" data-action="reset" aria-label="Reset run">Reset</button>
                  </div>
                </section>
              `
              : state.mode === "path"
                ? `
                  <section class="crossroads card stack">
                    <div class="title">Path selected</div>
                    <div class="muted small">You can still back out before entering the battle.</div>
                    <div class="path-preview card">
                      <div class="title">${blocker?.name ?? "Unknown path"}</div>
                      <div class="muted small">${blocker?.description ?? ""}</div>
                      <div class="tag">Enemy: ${blocker?.enemy ?? "Unknown"}</div>
                    </div>
                    <div class="row">
                      <button class="secondary" data-action="back-out">Back out</button>
                      <button class="primary" data-action="enter-battle">Enter path</button>
                    </div>
                  </section>
                `
                : state.mode === "victory"
                  ? `
                    <section class="victory card stack">
                      <div class="title">Path cleared</div>
                      <div class="victory-card">
                        <div class="victory-art ${getEnemyArt(state.selectedBlockerId) ? "with-art" : ""}" style="${getEnemyArt(state.selectedBlockerId) ? `background-image: url('${getEnemyArt(state.selectedBlockerId)}');` : ""}"></div>
                        <div class="stack">
                          <div class="title">${state.victorySummary?.enemyName ?? "Enemy"} defeated</div>
                          <div class="muted small">You cleared the ${state.victorySummary?.blockerName ?? "path"} path.</div>
                          <div class="muted small">${state.victorySummary?.reflection ?? ""}</div>
                          <div class="row">
                            <span class="tag">XP ${state.xp}</span>
                            <span class="tag">Morale ${state.morale}/5</span>
                          </div>
                          <div class="row">
                            <button class="primary" data-action="return-crossroads">Return to crossroads</button>
                          </div>
                        </div>
                      </div>
                    </section>
                  `
                : `
                  <section class="battlefield card stack">
                    <div class="enemy-panel">
                      <div class="enemy-portrait ${getEnemyArt(state.selectedBlockerId) ? "with-art" : ""}" style="${getEnemyArt(state.selectedBlockerId) ? `background-image: url('${getEnemyArt(state.selectedBlockerId)}');` : ""}"></div>
                      <div class="meter enemy-meter" aria-label="Enemy health">
                        <span style="width: ${enemyPct}%"></span>
                      </div>
                      <div class="muted small">${state.message}</div>
                    </div>
                  </section>

                  <section class="card stack">
                    <div class="row" style="justify-content: space-between; align-items: center;">
                      <div>
                        <div class="title">Hand</div>
                      </div>
                      <button class="secondary" data-action="unlock">Unlock next tool</button>
                    </div>
                    <div class="card stack deck-strip">
                      <div class="row" style="justify-content: space-between;">
                        <span class="tag">Draw pile: ${state.drawPile.length}</span>
                        <span class="tag">Discard: ${state.discardPile.length}</span>
                        <span class="tag">Hand: ${state.hand.length}</span>
                      </div>
                      <div class="battle-row">
                        <div class="battle-slot enemy-slot">
                          <div class="slot-card">
                            <div class="battle-enemy-image ${getEnemyArt(state.selectedBlockerId) ? "with-art" : ""}" style="${getEnemyArt(state.selectedBlockerId) ? `background-image: url('${getEnemyArt(state.selectedBlockerId)}');` : ""}"></div>
                            <div class="meter enemy-meter" aria-label="Enemy health">
                              <span style="width: ${enemyPct}%"></span>
                            </div>
                          </div>
                        </div>
                        <div class="battle-slot player-slot">
                          <div class="hand">
                            ${
                              state.hand.length
                                ? state.hand
                                    .map(
                          (card) => `
                                        <button
                                          class="card choice hand-card ${card.matchesBlocker ? "good-fit" : ""}"
                                          data-card="${card.id}"
                                          aria-label="${card.name}"
                                          title="${card.name}"
                                          style="${card.asset ? `background-image: url('${card.asset}');` : ""}"
                                        >
                                          <span class="sr-only">${card.name}. ${card.description}. ${card.energy} energy.</span>
                                        </button>
                                      `,
                                    )
                                    .join("")
                                : `<div class="muted small">Your hand is empty. Reset to choose another path.</div>`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                `
          }
        </main>

        <aside class="panel split">
          <section class="card stack">
            <div class="title">Session journal</div>
            <div class="log">
              ${
                state.journal.length
                  ? state.journal
                      .map(
                        (entry) => `
                          <div class="log-entry">
                            <div class="title">${entry.tool}</div>
                            <div class="small">${entry.scenario} · ${entry.blocker}</div>
                            <div class="muted small">${entry.note}</div>
                          </div>
                        `,
                      )
                      .join("")
                  : `<div class="muted small">No actions yet. Pick a scenario and try a tool.</div>`
              }
            </div>
          </section>
        </aside>
      </div>
    </div>
  `;
}

function buildBottomCards() {
  return `
    <section class="card deck-card stack">
      <div class="row" style="justify-content: space-between; align-items: center;">
        <div>
          <div class="title">Actions</div>
        </div>
      </div>
      <div class="bottom-cards">
        <button
          class="bottom-card bottom-card-button solution-card"
          type="button"
          data-action="open-scenario"
          aria-label="Scenario"
          ${state.selectedBlockerId ? "" : "disabled"}
        >
          <div class="bottom-card-label">
            <div class="title">Scenario</div>
            <div class="muted small">View a realistic moment.</div>
          </div>
        </button>
        <button class="bottom-card bottom-card-button solution-card" type="button" data-action="open-quiz" aria-label="Quiz">
          <div class="bottom-card-label">
            <div class="title">Quiz</div>
            <div class="muted small">Test your knowledge with quick prompts.</div>
          </div>
        </button>
        <button class="bottom-card bottom-card-button solution-card" type="button" aria-label="Placeholder action"></button>
      </div>
    </section>
  `;
}

function buildInfoPanel(selectedReference) {
  if (!selectedReference) {
    return `
      <section class="info-empty">
        <div class="info-symbol large">i</div>
        <div>
          <div class="title">Information panel</div>
          <div class="muted small">Select a state from the left to show its notes.</div>
        </div>
      </section>
    `;
  }

  return `
    <section class="info-hero">
      <div class="info-symbol large">${selectedReference.name.slice(0, 1)}</div>
      <div class="info-hero-copy">
        <div class="info-kicker">Selected state</div>
        <div class="info-title">${selectedReference.name}</div>
      </div>
    </section>

    <section class="info-section intro-section">
      <div class="info-section-head">
        <span class="info-symbol">i</span>
        <span>What it means</span>
      </div>
      <p>${selectedReference.intro}</p>
    </section>

    <section class="info-thought">
      <div class="info-section-head">
        <span class="info-symbol thought-mark">?</span>
        <span>Underlying thought</span>
      </div>
      <p>"${selectedReference.underlyingThought}"</p>
    </section>

    <section class="effect-grid">
      <div class="effect-card short">
        <div class="info-section-head">
          <span class="info-symbol">+</span>
          <span>Short term</span>
        </div>
        <div class="icon-list">
          ${selectedReference.shortTermEffects.map((item) => `<div><span></span>${item}</div>`).join("")}
        </div>
      </div>
      <div class="effect-card long">
        <div class="info-section-head">
          <span class="info-symbol">!</span>
          <span>Long term</span>
        </div>
        <div class="icon-list">
          ${selectedReference.longTermEffects.map((item) => `<div><span></span>${item}</div>`).join("")}
        </div>
      </div>
    </section>

    <section class="info-section solution-section">
      <div class="info-section-head">
        <span class="info-symbol">✓</span>
        <span>Try this</span>
      </div>
      <div class="solution-chips">
        ${selectedReference.solutions.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </section>
  `;
}

function buildScenarioModal() {
  const blocker = getBlocker(state.selectedBlockerId);
  const comicPages = getScenarioPages(state.selectedBlockerId);
  const comicPath = comicPages[state.scenarioPageIndex] ?? comicPages[0];
  const hasMultiplePages = comicPages.length > 1;
  const isFirstPage = state.scenarioPageIndex === 0;
  const isLastPage = state.scenarioPageIndex === comicPages.length - 1;

  if (!blocker || !comicPath) return "";

  return `
    <div class="scenario-overlay" role="presentation">
      <section class="scenario-modal" role="dialog" aria-modal="true" aria-labelledby="scenario-title">
        <div class="quiz-header">
          <div>
            <div class="detail-label">Scenario</div>
            <div class="title" id="scenario-title">${blocker.name}</div>
          </div>
          <button class="quiz-close" type="button" data-scenario-action="close" aria-label="Close scenario">x</button>
        </div>
        <div class="scenario-book">
          ${
            hasMultiplePages
              ? `<button class="scenario-page-button previous" type="button" data-scenario-action="previous" aria-label="Previous page" ${isFirstPage ? "disabled" : ""}>‹</button>`
              : ""
          }
          <button class="scenario-page" type="button" data-scenario-action="next" aria-label="Next scenario page" ${isLastPage ? "disabled" : ""}>
            <img class="scenario-comic" src="${comicPath}" alt="${blocker.name} comic page ${state.scenarioPageIndex + 1}" />
          </button>
          ${
            hasMultiplePages
              ? `<button class="scenario-page-button next" type="button" data-scenario-action="next" aria-label="Next page" ${isLastPage ? "disabled" : ""}>›</button>`
              : ""
          }
        </div>
        ${
          hasMultiplePages
            ? `<div class="scenario-footer">
                <span class="scenario-page-count">Page ${state.scenarioPageIndex + 1} of ${comicPages.length}</span>
                <div class="scenario-dots" aria-label="Scenario pages">
                  ${comicPages
                    .map(
                      (_, index) => `
                        <button
                          class="scenario-dot ${index === state.scenarioPageIndex ? "active" : ""}"
                          type="button"
                          data-scenario-action="page"
                          data-scenario-page="${index}"
                          aria-label="Go to page ${index + 1}"
                        ></button>
                      `,
                    )
                    .join("")}
                </div>
              </div>`
            : ""
        }
      </section>
    </div>
  `;
}

function buildQuizModal() {
  const activeQuizQuestions = state.activeQuizQuestions.length ? state.activeQuizQuestions : quizQuestions;
  const currentQuestion = activeQuizQuestions[state.quizIndex];
  const selectedAnswer = state.quizAnswers[state.quizIndex];
  const isAnswered = selectedAnswer !== undefined;
  const isComplete = state.quizIndex >= activeQuizQuestions.length;
  const score = state.quizAnswers.reduce(
    (total, answer, index) => total + (answer === activeQuizQuestions[index]?.answer ? 1 : 0),
    0,
  );
  const scorePercent = Math.round((score / activeQuizQuestions.length) * 100);

  if (isComplete) {
    return `
      <div class="quiz-overlay" role="presentation">
        <section class="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
          <div class="quiz-header">
            <div>
              <div class="detail-label">Quiz complete</div>
              <div class="title" id="quiz-title">Score: ${score}/${activeQuizQuestions.length} (${scorePercent}%)</div>
            </div>
            <button class="quiz-close" type="button" data-quiz-action="close" aria-label="Close quiz">x</button>
          </div>
          <p class="muted small">You answered ${score} out of ${activeQuizQuestions.length} questions correctly for a ${scorePercent}% score.</p>
          <div class="quiz-actions">
            <button class="secondary" type="button" data-quiz-action="restart">Restart</button>
            <button class="primary" type="button" data-quiz-action="close">Done</button>
          </div>
        </section>
      </div>
    `;
  }

  return `
    <div class="quiz-overlay" role="presentation">
      <section class="quiz-modal" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
        <div class="quiz-header">
          <div>
            <div class="detail-label">Question ${state.quizIndex + 1} of ${activeQuizQuestions.length}</div>
            <div class="title" id="quiz-title">Quick Check</div>
          </div>
          <button class="quiz-close" type="button" data-quiz-action="close" aria-label="Close quiz">x</button>
        </div>
        <p class="quiz-question">${currentQuestion.question}</p>
        <div class="quiz-options">
          ${currentQuestion.options
            .map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = currentQuestion.answer === index;
              const resultClass = isAnswered && isSelected ? (isCorrect ? "correct" : "incorrect") : "";
              const correctClass = isAnswered && isCorrect ? "correct-answer" : "";

              return `
                <button
                  class="quiz-option ${isSelected ? "selected" : ""} ${resultClass} ${correctClass}"
                  type="button"
                  data-quiz-answer="${index}"
                  ${isAnswered ? "disabled" : ""}
                >
                  <span class="quiz-letter">${String.fromCharCode(65 + index)}</span>
                  <span>${option}</span>
                </button>
              `;
            })
            .join("")}
        </div>
        ${
          isAnswered
            ? `<div class="quiz-feedback ${selectedAnswer === currentQuestion.answer ? "correct" : "incorrect"}">
                ${selectedAnswer === currentQuestion.answer ? "Correct." : `Correct answer: ${currentQuestion.options[currentQuestion.answer]}.`}
              </div>`
            : ""
        }
        <div class="quiz-actions">
          <button class="secondary" type="button" data-quiz-action="close">Close</button>
          <button class="primary" type="button" data-quiz-action="next" ${isAnswered ? "" : "disabled"}>
            ${state.quizIndex === activeQuizQuestions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </section>
    </div>
  `;
}

function buildCenterDisplay(blocker, enemyPct) {
  if (state.mode === "crossroads") {
    return `
      <section class="center-stage crossroads-stage card stack">
        <div class="stage-header">
          <div>
            <div class="title">Central display</div>
            <div class="muted small">This area is the main demonstrative canvas.</div>
          </div>
          <button class="secondary" data-action="reset">Reset</button>
        </div>
        <div class="crossroads-map wide-map">
          <div class="crossroads-art"></div>
          <div class="crossroads-hotspots" aria-label="Choose your path">
            ${blockerCatalog
              .map((entry) => `
                <button class="path-hotspot path-${entry.id}" data-path="${entry.id}" aria-label="Choose ${entry.name} path"></button>
              `)
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  if (state.mode === "path") {
    return `
      <section class="center-stage card stack">
        <div class="stage-header">
          <div>
            <div class="title">Selected path</div>
            <div class="muted small">Preview the concept before entering the active view.</div>
          </div>
          <div class="row">
            <button class="secondary" data-action="back-out">Back out</button>
            <button class="primary" data-action="enter-battle">Enter path</button>
          </div>
        </div>
        <article class="focus-panel">
          <div class="focus-art ${getEnemyArt(state.selectedBlockerId) ? "with-art" : ""}" style="${getEnemyArt(state.selectedBlockerId) ? `background-image: url('${getEnemyArt(state.selectedBlockerId)}');` : ""}"></div>
          <div class="stack">
            <div class="title">${blocker?.name ?? "Unknown path"}</div>
            <div class="muted">${blocker?.description ?? ""}</div>
            <div class="row">
              <span class="tag">Enemy: ${blocker?.enemy ?? "Unknown"}</span>
              <span class="tag">Best fit: ${getTree(state.selectedTreeId)?.label ?? "Unknown"}</span>
            </div>
          </div>
        </article>
      </section>
    `;
  }

  if (state.mode === "victory") {
    return `
      <section class="center-stage card stack">
        <div class="stage-header">
          <div>
            <div class="title">Path cleared</div>
            <div class="muted small">A finished state for the demonstration concept.</div>
          </div>
          <button class="primary" data-action="return-crossroads">Return</button>
        </div>
        <article class="focus-panel">
          <div class="focus-art ${getEnemyArt(state.selectedBlockerId) ? "with-art" : ""}" style="${getEnemyArt(state.selectedBlockerId) ? `background-image: url('${getEnemyArt(state.selectedBlockerId)}');` : ""}"></div>
          <div class="stack">
            <div class="title">${state.victorySummary?.enemyName ?? "Enemy"} defeated</div>
            <div class="muted small">You cleared the ${state.victorySummary?.blockerName ?? "path"} path.</div>
            <div class="muted small">${state.victorySummary?.reflection ?? ""}</div>
            <div class="row">
              <span class="tag">XP ${state.xp}</span>
              <span class="tag">Morale ${state.morale}/5</span>
            </div>
          </div>
        </article>
      </section>
    `;
  }

  return `
    <section class="center-stage card stack">
      <div class="stage-header">
        <div>
          <div class="title">Active display</div>
          <div class="muted small">${state.message}</div>
        </div>
        <div class="row">
          <button class="secondary" data-action="unlock">Unlock next tool</button>
          <button class="secondary" data-action="reset">Reset</button>
        </div>
      </div>
      <div class="battle-main">
        <article class="enemy-panel stage-focus">
          <div class="enemy-portrait ${getEnemyArt(state.selectedBlockerId) ? "with-art" : ""}" style="${getEnemyArt(state.selectedBlockerId) ? `background-image: url('${getEnemyArt(state.selectedBlockerId)}');` : ""}"></div>
          <div class="meter enemy-meter" aria-label="Enemy health">
            <span style="width: ${enemyPct}%"></span>
          </div>
          <div class="muted small">${state.message}</div>
        </article>
        <article class="stage-info-card">
          <div class="title">Run details</div>
          <div class="stage-stats">
            <span class="tag">Day ${state.day}</span>
            <span class="tag">Turn ${state.turn}</span>
            <span class="tag">XP ${state.xp}</span>
            <span class="tag">Energy ${state.energy}/5</span>
            <span class="tag">Morale ${state.morale}/5</span>
          </div>
          <div class="muted small">The center panel stays dominant, while the right rail handles context and the bottom row carries the actionable cards.</div>
        </article>
      </div>
    </section>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "reset") resetSession();
      if (action === "unlock") unlockTool(state.selectedTreeId);
      if (action === "back-out") backOut();
      if (action === "enter-battle") startPathBattle();
      if (action === "return-crossroads") returnToCrossroads();
      if (action === "start-game") startGame();
      if (action === "open-quiz") openQuiz();
      if (action === "open-scenario") openScenario();
    });
  });

  document.querySelectorAll("[data-menu-action]").forEach((button) => {
    button.addEventListener("click", () => {
      handleMenuAction(button.dataset.menuAction);
    });
  });

  document.querySelectorAll("[data-path]").forEach((button) => {
    button.addEventListener("click", () => {
      choosePath(button.dataset.path);
    });
  });

  document.querySelectorAll("[data-card]").forEach((button) => {
    button.addEventListener("click", () => {
      playCard(button.dataset.card);
    });
  });

  document.querySelectorAll("[data-quiz-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      selectQuizAnswer(Number(button.dataset.quizAnswer));
    });
  });

  document.querySelectorAll("[data-quiz-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.quizAction;
      if (action === "close") closeQuiz();
      if (action === "next") advanceQuiz();
      if (action === "restart") openQuiz();
    });
  });

  document.querySelectorAll("[data-scenario-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.scenarioAction;
      if (action === "close") closeScenario();
      if (action === "previous") changeScenarioPage(-1);
      if (action === "next") changeScenarioPage(1);
      if (action === "page") goToScenarioPage(Number(button.dataset.scenarioPage));
    });
  });
}

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = createApp();
  bindEvents();
}

render();
