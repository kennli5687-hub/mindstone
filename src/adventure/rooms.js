export const rooms = [
  {
    "id": "attic",
    "name": "The Fog Attic",
    "subtitle": "Where the letter began",
    "clue": "loop",
    "type": "jigsaw",
    "palette": [
      "#213a85",
      "#a293ee",
      "#ffbb72"
    ],
    "theme": "attic",
    "object": "The drawer lock",
    "description": "Six torn pieces of Ari's note are caught in the drawer. Tap one piece, then another to swap them. Restore the picture to reveal the loop that keeps the letter waiting.",
    "pieces": [
      [
        "finished",
        "A. Hiding the letter has solved the problem."
      ],
      [
        "loop",
        "B. The brief relief can make hiding feel worth repeating."
      ],
      [
        "ready",
        "C. Ari must wait until all worry disappears before starting."
      ]
    ],
    "solution": [
      "0", "1", "2", "3", "4", "5"
    ],
    "reward": "Loop lens",
    "success": "You recognized the loop. The drawer releases a lens that reveals the station beyond.",
    "wrong": "Some edges do not match yet. Join the letter, cup and cloud with their captions. The story moves from worry to hiding to brief relief. Tap two pieces to swap them and try again.",
    "details": [
      [
        "The cup",
        "A cup hides a letter, but it cannot answer it. The task remains."
      ],
      [
        "The window",
        "A street disappears each time Ari buys another tomorrow. It is a story metaphor, not a measurement of anyone's health."
      ]
    ]
  },
  {
    "id": "station",
    "name": "The Return Station",
    "subtitle": "A break with a way back",
    "clue": "return",
    "type": "pair",
    "palette": [
      "#185b79",
      "#62d9ca",
      "#ffca6c"
    ],
    "theme": "station",
    "object": "The departure clock",
    "description": "Build a return ticket. Choose a cue and what Ari will do when it arrives.",
    "groups": [
      {
        "name": "Return cue",
        "pieces": [
          [
            "someday",
            "When I feel completely ready"
          ],
          [
            "bell",
            "When the ten-minute bell rings"
          ]
        ]
      },
      {
        "name": "Next action",
        "pieces": [
          [
            "open",
            "Open the letter"
          ],
          [
            "finish",
            "Finish the entire letter perfectly"
          ]
        ]
      }
    ],
    "solution": [
      "bell",
      "open"
    ],
    "reward": "Return ticket",
    "success": "A place to rest, and a way to return. The next platform is ready.",
    "wrong": "Rest is welcome here. The ticket needs a concrete cue and a manageable return action.",
    "details": [
      [
        "The bench",
        "Rest does not need to be earned. A return plan helps distinguish a restorative pause from indefinite postponement."
      ],
      [
        "The tracks",
        "Every train called Later circles the station. Your return ticket changes the route."
      ]
    ]
  },
  {
    "id": "workshop",
    "name": "The Small-Door Workshop",
    "subtitle": "Make the beginning visible",
    "clue": "small",
    "type": "choice",
    "palette": [
      "#643c78",
      "#fa947c",
      "#ffe0a0"
    ],
    "theme": "workshop",
    "object": "The enormous door",
    "description": "The oversized door cannot move. Which action fits its tiny handle?",
    "pieces": [
      [
        "plan",
        "Design the whole perfect letter"
      ],
      [
        "unfold",
        "Unfold one sheet of paper"
      ],
      [
        "wait",
        "Wait for complete confidence"
      ]
    ],
    "solution": [
      "unfold"
    ],
    "reward": "Paper key",
    "success": "A small door appears inside the large one. A beginning does not have to be a finish.",
    "wrong": "Choose an action you can actually do now, not an entire outcome or a feeling you must wait for.",
    "details": [
      [
        "The unfinished model",
        "Small steps are specific actions. They are not promises to finish everything afterward."
      ],
      [
        "The spool",
        "A thread is enough to begin weaving. The workshop keeps unfinished things on purpose."
      ]
    ]
  },
  {
    "id": "mirrors",
    "name": "The Crooked Gallery",
    "subtitle": "A first draft may be a first draft",
    "clue": "imperfect",
    "type": "choice",
    "palette": [
      "#4d418d",
      "#bbabfa",
      "#ff998d"
    ],
    "theme": "mirrors",
    "object": "The missing floor tile",
    "description": "Three tiles reflect possible beginnings. Choose a tile to repair the path.",
    "pieces": [
      [
        "perfect",
        "The flawless tile: keep polishing forever"
      ],
      [
        "crooked",
        "The crooked tile: a rough but usable draft"
      ],
      [
        "empty",
        "The empty tile: make no attempt"
      ]
    ],
    "solution": [
      "crooked"
    ],
    "reward": "Crooked prism",
    "success": "The imperfect tile holds your weight. Polishing can happen after there is something to polish.",
    "wrong": "The gallery is asking for a usable beginning. Its perfect reflection keeps receding.",
    "details": [
      [
        "The tall mirror",
        "Ari's reflection looks worried even while moving forward. Confidence is not an entry requirement."
      ],
      [
        "The polishing cloth",
        "Standards can be useful. An impossible entry standard can keep the first attempt from happening."
      ]
    ]
  },
  {
    "id": "observatory",
    "name": "The Weather Observatory",
    "subtitle": "A forecast is not a fact",
    "clue": "facts",
    "type": "sort",
    "palette": [
      "#213f75",
      "#77c4ef",
      "#fcdb82"
    ],
    "theme": "observatory",
    "object": "The forecasting machine",
    "description": "Sort the four cards into observations and predictions to clear the telescope.",
    "pieces": [
      [
        "letter",
        "The letter is unfinished"
      ],
      [
        "laugh",
        "They will laugh at me"
      ],
      [
        "unread",
        "The recipient has not read it"
      ],
      [
        "never",
        "They will never answer"
      ]
    ],
    "solution": [
      "fact",
      "prediction",
      "fact",
      "prediction"
    ],
    "reward": "Clear-sky lens",
    "success": "The telescope shows a path instead of a verdict. Uncertainty remains; the forecast is no longer mistaken for evidence.",
    "wrong": "An observation describes what is known. A prediction describes an outcome that has not happened.",
    "details": [
      [
        "The star chart",
        "A thought may feel convincing without being a fact. Sorting is an invitation to check, not to replace every thought with positivity."
      ],
      [
        "The cloud jar",
        "Some outcomes are uncertain. The goal is not to guarantee that everything will go well."
      ]
    ]
  },
  {
    "id": "garden",
    "name": "The Staying Garden",
    "subtitle": "Find something here",
    "clue": "ground",
    "type": "order",
    "palette": [
      "#20564f",
      "#93e0b4",
      "#efadcf"
    ],
    "theme": "garden",
    "object": "The listening fountain",
    "description": "Restore the garden's gentle sequence from the comic. You may also try it in your actual surroundings, or simply solve the story puzzle.",
    "pieces": [
      [
        "sound",
        "Notice one sound"
      ],
      [
        "colors",
        "Notice three colors"
      ],
      [
        "contact",
        "Feel two points of contact"
      ]
    ],
    "solution": [
      "colors",
      "contact",
      "sound"
    ],
    "reward": "Present seed",
    "success": "The fountain flows. You are allowed to feel the same, better, or more tense. This is optional grounding, not a test of recovery.",
    "wrong": "Remember how Ari found the garden: colors, contact, then a sound. There is no rush.",
    "details": [
      [
        "The flowers",
        "Look for a color you enjoy. You do not need to breathe in a special way."
      ],
      [
        "The garden seat",
        "Stop, skip, or rest whenever you want. The exercise should not become another condition you must satisfy before living."
      ]
    ]
  },
  {
    "id": "bridge",
    "name": "The Unfinished Bridge",
    "subtitle": "A path, not a dare",
    "clue": "ladder",
    "type": "order",
    "palette": [
      "#364a91",
      "#a59dea",
      "#ffbf78"
    ],
    "theme": "bridge",
    "object": "The missing stepping stones",
    "description": "Place the three broad stones from a small action to a larger one. The bridge is safe; no jump is required.",
    "pieces": [
      [
        "sentence",
        "Write one rough sentence"
      ],
      [
        "unfold",
        "Open the paper"
      ],
      [
        "greeting",
        "Write a greeting"
      ]
    ],
    "solution": [
      "unfold",
      "greeting",
      "sentence"
    ],
    "reward": "Step stone",
    "success": "The bridge grows one stone at a time. In life, choose safe, manageable steps and repeat at your own pace.",
    "wrong": "Begin with the smallest visible action. Writing a sentence comes after opening the paper and a greeting.",
    "details": [
      [
        "The broken sign",
        "Ari refuses the enormous leap. Facing actual danger or overwhelming yourself is not the lesson."
      ],
      [
        "The footprints",
        "A repeated small step still counts. You do not have to increase the difficulty every time."
      ]
    ]
  },
  {
    "id": "archive",
    "name": "The Borrowed-Voice Archive",
    "subtitle": "Choose a voice you can live with",
    "clue": "kindness",
    "type": "choice",
    "palette": [
      "#583869",
      "#b8a3e9",
      "#ffca89"
    ],
    "theme": "archive",
    "object": "The speaking cabinet",
    "description": "The cabinet will open to the sentence Ari chose for a struggling friend.",
    "pieces": [
      [
        "shame",
        "You are hopeless for finding this hard"
      ],
      [
        "deny",
        "There is nothing difficult here"
      ],
      [
        "kind",
        "This is difficult. We can choose one manageable step"
      ]
    ],
    "solution": [
      "kind"
    ],
    "reward": "Kind lantern",
    "success": "The cabinet speaks in a warmer voice. Kindness can acknowledge difficulty and still leave room for action.",
    "wrong": "Try a voice that recognizes the difficulty without turning it into a judgment of the person.",
    "details": [
      [
        "The name drawer",
        "A difficult afternoon does not define a person."
      ],
      [
        "Yesterday's map",
        "Ari's fog returned. That did not erase the route already learned."
      ]
    ]
  },
  {
    "id": "harbor",
    "name": "The Two-Person Harbor",
    "subtitle": "Support leaves room for choice",
    "clue": "help",
    "type": "pair",
    "palette": [
      "#185578",
      "#69dcd2",
      "#ffb79a"
    ],
    "theme": "harbor",
    "object": "The two-person wheel",
    "description": "Give the ferryman a specific job, then choose Ari's part in opening the gate.",
    "groups": [
      {
        "name": "Ask the ferryman",
        "pieces": [
          [
            "everything",
            "Do everything and choose my destination"
          ],
          [
            "left",
            "Please hold the left handle"
          ]
        ]
      },
      {
        "name": "Ari's part",
        "pieces": [
          [
            "right",
            "Turn the right handle and choose the route"
          ],
          [
            "vanish",
            "Leave and never return"
          ]
        ]
      }
    ],
    "solution": [
      "left",
      "right"
    ],
    "reward": "Companion bell",
    "success": "Two handles turn together. Receiving support does not make the journey less yours.",
    "wrong": "Ask for a concrete piece of help while keeping Ari involved in the choice and action.",
    "details": [
      [
        "The ferryman",
        "Support can be a friend, a teacher, or a qualified professional. Different difficulties need different kinds of help."
      ],
      [
        "The boat",
        "The ferryman holds one handle. Ari still chooses where to sail."
      ]
    ]
  },
  {
    "id": "post",
    "name": "The Tomorrow Post Office",
    "subtitle": "An honest envelope",
    "clue": "value",
    "type": "choice",
    "palette": [
      "#51428b",
      "#ffb8a0",
      "#fff0b8"
    ],
    "theme": "post",
    "object": "The final postbox",
    "description": "Your nine keepsakes have opened the square. Set the compass to why Ari wants to send the letter.",
    "pieces": [
      [
        "approval",
        "A guarantee that the recipient approves"
      ],
      [
        "connection",
        "Connection with someone Ari misses"
      ],
      [
        "fearless",
        "Never feeling afraid again"
      ]
    ],
    "solution": [
      "connection"
    ],
    "reward": "Tomorrow stamp",
    "success": "The letter is sent. The reply is unknown. You chose a meaningful action without buying a promise about its outcome.",
    "wrong": "The compass points toward something Ari cares about, not a guarantee about the response or a permanent feeling.",
    "details": [
      [
        "The bargain",
        "The fog offers certainty in exchange for waiting forever. Ari can decline without knowing the future."
      ],
      [
        "A new postcard",
        "There will be other letters. Keep the map: you can return, rest, or ask for help."
      ]
    ]
  }
];
