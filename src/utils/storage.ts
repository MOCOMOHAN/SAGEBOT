import {
  UserProfile,
  Subject,
  Task,
  StudyLog,
  StreakState,
  RewardItem,
  DailyGoalRecord,
  SkillTreeNode,
  SmartFlashcard,
  MindMapItem
} from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr-tjx-2931',
  name: 'Alex Vance',
  mailId: 'tjx2931@gmail.com',
  profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexVance',
  age: 21,
  studentEducation: 'Undergraduate (Year 3)',
  domainOfStudying: 'Computer Science & Mathematics',
  university: 'Stanford / Tech Institute',
  bio: 'Passionate about multivariable calculus, graph algorithms, and late-night focus sessions.',
  friendCode: 'ALEX-7821',
  streakCount: 12,
  creditsValue: 450,
  bestStreak: 15,
  freezeCount: 1,
  isLoggedIn: true,
  oauthProvider: 'google',
  equippedBorder: 'golden-nebula',
  equippedGlow: 'solar-flare',
  equippedTitle: 'Quantum Pioneer',
  equippedBadge: '👑',
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-calc',
    name: 'Advanced Calculus',
    color: '#3b82f6',
    icon: '📐',
    targetHoursPerWeek: 10,
    category: 'Mathematics',
    topics: ['Multivariable Limits', "Green's Theorem", 'Stokes Theorem', 'Taylor Series'],
  },
  {
    id: 'sub-chem',
    name: 'Organic Chemistry',
    color: '#10b981',
    icon: '🧪',
    targetHoursPerWeek: 8,
    category: 'Natural Sciences',
    topics: ['SN1 / SN2 Kinetics', 'Electrophilic Addition', 'NMR Spectroscopy', 'Aromaticity'],
  },
  {
    id: 'sub-cs',
    name: 'Computer Science',
    color: '#6366f1',
    icon: '💻',
    targetHoursPerWeek: 10,
    category: 'Engineering',
    topics: ['Binary Search Trees', 'Graph Algorithms (Dijkstra)', 'Dynamic Programming', 'OS Memory Paging'],
  },
  {
    id: 'sub-econ',
    name: 'Macroeconomics',
    color: '#f97316',
    icon: '📊',
    targetHoursPerWeek: 6,
    category: 'Social Sciences',
    topics: ['IS-LM Model Equilibrium', 'Monetary Policy Tools', 'Phillips Curve', 'Solow Growth Model'],
  },
  {
    id: 'sub-phys',
    name: 'Quantum Physics',
    color: '#8b5cf6',
    icon: '⚛️',
    targetHoursPerWeek: 8,
    category: 'Physics',
    topics: ['Schrödinger 1D Well', 'Heisenberg Uncertainty', 'Wave-Particle Duality', 'Quantum Tunneling'],
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    subjectId: 'sub-calc',
    title: "Multivariable Integration & Green's Theorem",
    description: 'Solve problem set 4 and write down notes on flux integrals.',
    estimatedMinutes: 60,
    timeSpentSeconds: 8100, // 2h 15m
    completed: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
    topicTag: "Green's Theorem",
  },
  {
    id: 'task-2',
    subjectId: 'sub-chem',
    title: 'SN1 vs SN2 Reaction Mechanisms Review',
    description: 'Study reaction stereochemistry and nucleophilic substitution kinetics.',
    estimatedMinutes: 45,
    timeSpentSeconds: 2700,
    completed: false,
    priority: 'medium',
    createdAt: new Date().toISOString(),
    topicTag: 'SN1 / SN2 Kinetics',
  },
  {
    id: 'task-3',
    subjectId: 'sub-cs',
    title: 'Dijkstra Shortest Path & Min-Heap Implementation',
    description: 'Write O((V + E) log V) Dijkstra in TypeScript with adjacency list representation.',
    estimatedMinutes: 50,
    timeSpentSeconds: 3000,
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    priority: 'high',
    createdAt: new Date().toISOString(),
    topicTag: 'Graph Algorithms (Dijkstra)',
  },
  {
    id: 'task-4',
    subjectId: 'sub-econ',
    title: 'IS-LM Model Equilibrium Shifts Analysis',
    description: 'Complete practice exam equations on fiscal expansion vs monetary tightening.',
    estimatedMinutes: 45,
    timeSpentSeconds: 2700,
    completed: true,
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    topicTag: 'IS-LM Model Equilibrium',
  },
  {
    id: 'task-5',
    subjectId: 'sub-phys',
    title: 'Schrödinger Wave Equation in 1D Infinite Box',
    description: 'Derive wave functions and energy eigenstates for particle barriers.',
    estimatedMinutes: 50,
    timeSpentSeconds: 1500,
    completed: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
    topicTag: 'Schrödinger 1D Well',
  },
];

export const INITIAL_SKILL_TREE: SkillTreeNode[] = [
  // Calculus branch
  {
    id: 'sk-calc-1',
    subjectId: 'sub-calc',
    subjectName: 'Advanced Calculus',
    topicName: 'Partial Derivatives & Chain Rule',
    category: 'Foundations',
    masteryLevel: 'Mastered',
    masteryPercentage: 100,
    tasksCovered: ['Compute Gradient Vectors', 'Directional Derivatives Problem Set'],
    status: 'mastered',
    formulasOrKeyNotes: ['∇f = <∂f/∂x, ∂f/∂y, ∂f/∂z>', 'D_u f = ∇f · u (unit vector)'],
  },
  {
    id: 'sk-calc-2',
    subjectId: 'sub-calc',
    subjectName: 'Advanced Calculus',
    topicName: "Green's Theorem & Line Integrals",
    category: 'Vector Calculus',
    masteryLevel: 'Proficient',
    masteryPercentage: 75,
    tasksCovered: ['Multivariable Integration & Green\'s Theorem'],
    prerequisites: ['sk-calc-1'],
    status: 'in_progress',
    formulasOrKeyNotes: ['∮_C (P dx + Q dy) = ∬_D (∂Q/∂x - ∂P/∂y) dA', 'Works on simple closed positive curves'],
  },
  {
    id: 'sk-calc-3',
    subjectId: 'sub-calc',
    subjectName: 'Advanced Calculus',
    topicName: "Stokes' & Divergence Theorem",
    category: '3D Vector Analysis',
    masteryLevel: 'Novice',
    masteryPercentage: 30,
    tasksCovered: ['3D Flux across Parametric Surfaces'],
    prerequisites: ['sk-calc-2'],
    status: 'in_progress',
    formulasOrKeyNotes: ['∬_S (∇ × F) · dS = ∮_C F · dr', '∭_E (∇ · F) dV = ∬_S F · dS'],
  },

  // Chemistry branch
  {
    id: 'sk-chem-1',
    subjectId: 'sub-chem',
    subjectName: 'Organic Chemistry',
    topicName: 'Resonance & Acid-Base Equilibria',
    category: 'Foundations',
    masteryLevel: 'Mastered',
    masteryPercentage: 95,
    tasksCovered: ['pKa Rankings & Conjugate Base Stability'],
    status: 'mastered',
    formulasOrKeyNotes: ['CARDIO rules: Charge, Atom, Resonance, Dipole Induction, Orbital hybridization'],
  },
  {
    id: 'sk-chem-2',
    subjectId: 'sub-chem',
    subjectName: 'Organic Chemistry',
    topicName: 'SN1 vs SN2 Nucleophilic Substitution',
    category: 'Reaction Kinetics',
    masteryLevel: 'Proficient',
    masteryPercentage: 80,
    tasksCovered: ['SN1 vs SN2 Reaction Mechanisms Review'],
    prerequisites: ['sk-chem-1'],
    status: 'in_progress',
    formulasOrKeyNotes: ['SN2: 1-step backside attack, Walden inversion', 'SN1: 2-step carbocation intermediate, racemization'],
  },

  // CS branch
  {
    id: 'sk-cs-1',
    subjectId: 'sub-cs',
    subjectName: 'Computer Science',
    topicName: 'Binary Search & Asymptotic Analysis',
    category: 'Algorithms',
    masteryLevel: 'Mastered',
    masteryPercentage: 100,
    tasksCovered: ['Binary Search Bounds', 'Master Theorem Proofs'],
    status: 'mastered',
    formulasOrKeyNotes: ['Time: O(log n), Space: O(1)', 'mid = left + (right - left) / 2'],
  },
  {
    id: 'sk-cs-2',
    subjectId: 'sub-cs',
    subjectName: 'Computer Science',
    topicName: 'Graph Theory & Dijkstra Shortest Path',
    category: 'Graph Algorithms',
    masteryLevel: 'Mastered',
    masteryPercentage: 90,
    tasksCovered: ['Dijkstra Shortest Path & Min-Heap Implementation'],
    prerequisites: ['sk-cs-1'],
    status: 'mastered',
    formulasOrKeyNotes: ['Complexity: O((V + E) log V) with Priority Queue', 'Non-negative edge weights required'],
  },
  {
    id: 'sk-cs-3',
    subjectId: 'sub-cs',
    subjectName: 'Computer Science',
    topicName: 'Dynamic Programming & Memoization',
    category: 'Advanced Optimization',
    masteryLevel: 'Proficient',
    masteryPercentage: 65,
    tasksCovered: ['0/1 Knapsack & Longest Common Subsequence'],
    prerequisites: ['sk-cs-2'],
    status: 'in_progress',
    formulasOrKeyNotes: ['Overlapping subproblems + Optimal substructure', 'Top-down memoization vs bottom-up tabulation'],
  },

  // Macroeconomics branch
  {
    id: 'sk-econ-1',
    subjectId: 'sub-econ',
    subjectName: 'Macroeconomics',
    topicName: 'Aggregate Demand & Fiscal Policy',
    category: 'Macro Foundations',
    masteryLevel: 'Mastered',
    masteryPercentage: 90,
    tasksCovered: ['Keynesian Cross Multiplier Problem Set'],
    status: 'mastered',
    formulasOrKeyNotes: ['Multiplier k = 1 / (1 - MPC)', 'Expansionary: G↑ or T↓'],
  },
  {
    id: 'sk-econ-2',
    subjectId: 'sub-econ',
    subjectName: 'Macroeconomics',
    topicName: 'IS-LM Equilibrium & Monetary Shifting',
    category: 'Monetary Systems',
    masteryLevel: 'Proficient',
    masteryPercentage: 85,
    tasksCovered: ['IS-LM Model Equilibrium Shifts Analysis'],
    prerequisites: ['sk-econ-1'],
    status: 'mastered',
    formulasOrKeyNotes: ['IS Curve: Goods market equilibrium (Y = C + I + G)', 'LM Curve: Money market equilibrium (M/P = L(Y, r))'],
  },

  // Physics branch
  {
    id: 'sk-phys-1',
    subjectId: 'sub-phys',
    subjectName: 'Quantum Physics',
    topicName: 'Photoelectric Effect & de Broglie Wavelength',
    category: 'Wave Mechanics',
    masteryLevel: 'Mastered',
    masteryPercentage: 100,
    tasksCovered: ['Photoelectric Cutoff Frequency Experiments'],
    status: 'mastered',
    formulasOrKeyNotes: ['E = hf = ℏω', 'λ = h / p'],
  },
  {
    id: 'sk-phys-2',
    subjectId: 'sub-phys',
    subjectName: 'Quantum Physics',
    topicName: 'Time-Independent Schrödinger Equation',
    category: 'Quantum States',
    masteryLevel: 'Proficient',
    masteryPercentage: 70,
    tasksCovered: ['Schrödinger Wave Equation in 1D Infinite Box'],
    prerequisites: ['sk-phys-1'],
    status: 'in_progress',
    formulasOrKeyNotes: ['- (ℏ² / 2m) d²ψ/dx² + V(x)ψ = Eψ', 'ψ_n(x) = √(2/L) sin(nπx / L)'],
  },
];

export const INITIAL_FLASHCARDS: SmartFlashcard[] = [
  {
    id: 'fc-calc-green',
    subjectId: 'sub-calc',
    subjectName: 'Advanced Calculus',
    topic: "Green's Theorem Line Integral Evaluation",
    frontQuestion: 'How does Green\'s Theorem convert a counter-clockwise closed boundary line integral into a double area integral?',
    backExplanation: 'Green\'s Theorem transforms ∮_C (P dx + Q dy) into ∬_D (∂Q/∂x - ∂P/∂y) dA. The integrand (∂Q/∂x - ∂P/∂y) represents the 2D microscopic curl of the vector field.',
    mermaidDiagram: `graph LR
    C[Closed Line Integral ∮_C] -->|Curl Transform| D[Double Area Integral ∬_D]
    D --> E[Integrand: ∂Q/∂x - ∂P/∂y]
    E --> F[Simple Planar Summation]
    style C fill:#3b82f6,color:#fff,stroke:#1d4ed8
    style D fill:#10b981,color:#fff,stroke:#047857
    style E fill:#f59e0b,color:#fff,stroke:#b45309`,
    diagramType: 'flowchart',
    masteryLevel: 'Reviewing',
    repetitionIntervalDays: 3,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'fc-chem-sn12',
    subjectId: 'sub-chem',
    subjectName: 'Organic Chemistry',
    topic: 'SN1 vs SN2 Stereochemical Outcome & Rate',
    frontQuestion: 'What are the kinetic order, intermediate, and stereochemical outcome differences between SN1 and SN2 reactions?',
    backExplanation: 'SN1 is 1st order via a planar carbocation intermediate producing RACEMIZATION. SN2 is 2nd order via a concerted backside attack resulting in 100% WALDEN INVERSION.',
    mermaidDiagram: `stateDiagram-v2
    [*] --> Substrate
    Substrate --> Carbocation_Intermediate : SN1 (Slow Step)
    Carbocation_Intermediate --> Racemic_Product : Fast Nu- Attack
    Substrate --> Transition_State : SN2 (Concerted)
    Transition_State --> Inverted_Product : Walden Inversion`,
    diagramType: 'state',
    masteryLevel: 'Mastered',
    repetitionIntervalDays: 7,
    nextReviewDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
  },
  {
    id: 'fc-cs-dijkstra',
    subjectId: 'sub-cs',
    subjectName: 'Computer Science',
    topic: 'Dijkstra Shortest Path Relaxation Decision',
    frontQuestion: 'When does the Dijkstra algorithm update (relax) the distance to an adjacent neighbor vertex in the priority queue?',
    backExplanation: 'If dist[u] + weight(u, v) < dist[v], update dist[v] = dist[u] + weight(u, v) and push (dist[v], v) into the Min-Priority Queue.',
    mermaidDiagram: `flowchart TD
    A[Pop Min Distance Node u] --> B{For Each Neighbor v}
    B --> C{dist[u] + w < dist[v]?}
    C -- Yes --> D[Relax: Update dist[v]]
    D --> E[Push (dist[v], v) to Min-Heap]
    C -- No --> F[Skip Edge]
    E --> B
    F --> B
    style A fill:#6366f1,color:#fff
    style D fill:#10b981,color:#fff`,
    diagramType: 'flowchart',
    masteryLevel: 'Mastered',
    repetitionIntervalDays: 5,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'fc-econ-islm',
    subjectId: 'sub-econ',
    subjectName: 'Macroeconomics',
    topic: 'Fiscal vs Monetary Shifts in IS-LM Space',
    frontQuestion: 'What happens to equilibrium output (Y) and interest rate (r) when the Central Bank pursues expansionary Open Market Operations?',
    backExplanation: 'Buying bonds increases real money supply (M/P) ↑. The LM curve shifts RIGHT. Result: Output Y increases and interest rate r decreases, stimulating investment.',
    mermaidDiagram: `graph TD
    Fed[Fed Buys Gov Bonds] --> MS[Money Supply M/P Increases]
    MS --> LM[LM Curve Shifts Right]
    LM --> Res[Result: Output Y increases & Interest Rate r drops]
    style Fed fill:#f97316,color:#fff
    style LM fill:#3b82f6,color:#fff
    style Res fill:#10b981,color:#fff`,
    diagramType: 'flowchart',
    masteryLevel: 'Reviewing',
    repetitionIntervalDays: 3,
    nextReviewDate: new Date().toISOString().split('T')[0],
  },
];

export const INITIAL_MIND_MAPS: MindMapItem[] = [
  {
    id: 'mm-calc-greens',
    topic: "Green's Theorem & Flux Integrals",
    subjectId: 'sub-calc',
    subjectName: 'Advanced Calculus',
    mermaidCode: `mindmap
  root((Green's Theorem))
    Prerequisites
      Smooth_Jordan_Curve
      Positively_Oriented_CCW
      Continuous_Partial_Derivatives
    Integral_Formulation
      Circulation_Form[∮ P dx + Q dy]
      Curl_Integrand[∬ ∂Q/∂x - ∂P/∂y dA]
      Normal_Flux_Form[∮ P dy - Q dx]
    Applications
      Planar_Area_Computation
      Fluid_Vorticity_Measurement
      Work_in_Non_Conservative_Fields
    Exam_Checklist
      Verify_Counter_Clockwise
      Check_for_Holes_or_Singularities`,
    summary: "Visual taxonomy connecting boundary circulation to surface 2D curl integrals and planar area shortcuts.",
    keyTakeaways: [
      "Counter-clockwise closed boundary requirement is mandatory",
      "Area can be computed using 1/2 ∮ (x dy - y dx)",
      "Always check for interior holes (multiply connected regions)"
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mm-cs-graph',
    topic: 'Graph Shortest Paths & Traversal',
    subjectId: 'sub-cs',
    subjectName: 'Computer Science',
    mermaidCode: `mindmap
  root((Graph Algorithms))
    Unweighted_Graphs
      BFS_Queue[O(V + E) Shortest Path]
      Level_Order_Distance
    Non_Negative_Weights
      Dijkstra_Algorithm
      Min_Heap_Priority_Queue[O((V+E) log V)]
      Greedy_Frontier_Relaxation
    Negative_Weights
      Bellman_Ford[O(V * E)]
      Negative_Cycle_Detection
    All_Pairs
      Floyd_Warshall[O(V^3)]
      Johnson_Algorithm`,
    summary: "Complete decision map for selecting optimal shortest path algorithms based on edge weights and density.",
    keyTakeaways: [
      "Use BFS for unweighted graphs for linear O(V + E) guarantee",
      "Use Dijkstra with Fibonacci/Binary Heap for non-negative edges",
      "Switch to Bellman-Ford if negative weights exist to detect negative arbitrage cycles"
    ],
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_REWARDS: RewardItem[] = [
  // 1. Badges & Crests
  {
    id: 'rw-badge-focus',
    title: 'Hyperfocus Master Badge',
    description: 'Display an exclusive holographic focus crown in your student card.',
    category: 'badge',
    cost: 150,
    icon: '👑',
    unlocked: true,
  },
  {
    id: 'rw-badge-olympian',
    title: 'Academic Olympian Crest',
    description: 'Gold level prestige symbol showing 50+ total hours studied.',
    category: 'badge',
    cost: 500,
    icon: '🏅',
    unlocked: false,
  },

  // 2. Avatar Frames & Borders (Avatar Aesthetics)
  {
    id: 'rw-frame-golden-nebula',
    title: 'Golden Celestial Nebula Frame',
    description: 'Radiant gold spinning celestial ring for your avatar on profile and leaderboard.',
    category: 'avatar_frame',
    aestheticType: 'border',
    aestheticValue: 'golden-nebula',
    cost: 250,
    icon: '💫',
    unlocked: true,
    effect: 'Golden Aura Frame',
  },
  {
    id: 'rw-frame-cyber-holo',
    title: 'Cyber Holographic Neon Ring',
    description: 'Futuristic glowing neon cyan & magenta techno-ring for high-tech scholars.',
    category: 'avatar_frame',
    aestheticType: 'border',
    aestheticValue: 'cyber-holo',
    cost: 200,
    icon: '💠',
    unlocked: false,
    effect: 'Cyber Neon Ring',
  },
  {
    id: 'rw-frame-flame-phoenix',
    title: 'Phoenix Flame Crest',
    description: 'Fiery blazing animated border for legendary study streak champions.',
    category: 'avatar_frame',
    aestheticType: 'border',
    aestheticValue: 'flame-phoenix',
    cost: 320,
    icon: '🔥',
    unlocked: false,
    effect: 'Phoenix Blaze Frame',
  },
  {
    id: 'rw-frame-emerald-scholar',
    title: 'Emerald Scholar Rune Ring',
    description: 'Mystical verdant green rune circle signaling deep wisdom and mastery.',
    category: 'avatar_frame',
    aestheticType: 'border',
    aestheticValue: 'emerald-scholar',
    cost: 180,
    icon: '🌿',
    unlocked: false,
    effect: 'Emerald Rune Frame',
  },
  {
    id: 'rw-frame-obsidian-void',
    title: 'Obsidian Cosmic Void Ring',
    description: 'Deep space dark purple and starlight border with particle flares.',
    category: 'avatar_frame',
    aestheticType: 'border',
    aestheticValue: 'obsidian-void',
    cost: 220,
    icon: '🌌',
    unlocked: false,
    effect: 'Obsidian Void Frame',
  },

  // 3. Avatar Glow / Aura Effects (Avatar Aesthetics)
  {
    id: 'rw-glow-solar-flare',
    title: 'Solar Flare Amber Glow',
    description: 'Warm luminous amber radiation aura surrounding your avatar display.',
    category: 'avatar_glow',
    aestheticType: 'glow',
    aestheticValue: 'solar-flare',
    cost: 150,
    icon: '☀️',
    unlocked: true,
    effect: 'Solar Radiance Aura',
  },
  {
    id: 'rw-glow-cosmic-purple',
    title: 'Cosmic Violet Radiance Aura',
    description: 'Pulsing ultra-violet energy field emanating from your student portrait.',
    category: 'avatar_glow',
    aestheticType: 'glow',
    aestheticValue: 'cosmic-purple',
    cost: 160,
    icon: '🔮',
    unlocked: false,
    effect: 'Cosmic Violet Glow',
  },
  {
    id: 'rw-glow-cyan-pulse',
    title: 'Cyber Cyan Pulse Aura',
    description: 'Electric cybernetic blue light pulse for digital focus sessions.',
    category: 'avatar_glow',
    aestheticType: 'glow',
    aestheticValue: 'cyan-pulse',
    cost: 140,
    icon: '⚡',
    unlocked: false,
    effect: 'Cyber Cyan Glow',
  },
  {
    id: 'rw-glow-emerald-zen',
    title: 'Emerald Zen Radiance',
    description: 'Calming mint-green aura cultivating deep focus and mental clarity.',
    category: 'avatar_glow',
    aestheticType: 'glow',
    aestheticValue: 'emerald-zen',
    cost: 130,
    icon: '🍃',
    unlocked: false,
    effect: 'Emerald Zen Glow',
  },

  // 4. Academic Prestige Titles (Avatar Aesthetics)
  {
    id: 'rw-title-quantum-pioneer',
    title: 'Title: "Quantum Pioneer"',
    description: 'Equip the title badge "Quantum Pioneer" shown beneath your name.',
    category: 'avatar_title',
    aestheticType: 'title',
    aestheticValue: 'Quantum Pioneer',
    cost: 120,
    icon: '⚛️',
    unlocked: true,
    effect: 'Prestige Title Badge',
  },
  {
    id: 'rw-title-algo-virtuoso',
    title: 'Title: "Algorithmic Virtuoso"',
    description: 'Showcase your algorithmic mastery across the friends leaderboard.',
    category: 'avatar_title',
    aestheticType: 'title',
    aestheticValue: 'Algorithmic Virtuoso',
    cost: 140,
    icon: '💻',
    unlocked: false,
    effect: 'Prestige Title Badge',
  },
  {
    id: 'rw-title-calculus-master',
    title: 'Title: "Master of Calculus"',
    description: 'Distinguish yourself as an elite multivariable integration master.',
    category: 'avatar_title',
    aestheticType: 'title',
    aestheticValue: 'Master of Calculus',
    cost: 130,
    icon: '📐',
    unlocked: false,
    effect: 'Prestige Title Badge',
  },
  {
    id: 'rw-title-grandmaster',
    title: 'Title: "Dean\'s List Grandmaster"',
    description: 'The pinnacle academic title recognizing relentless discipline.',
    category: 'avatar_title',
    aestheticType: 'title',
    aestheticValue: "Dean's List Grandmaster",
    cost: 350,
    icon: '🏛️',
    unlocked: false,
    effect: 'Prestige Title Badge',
  },
  {
    id: 'rw-title-midnight-scholar',
    title: 'Title: "Midnight Oil Scholar"',
    description: 'Honoring the deep thinkers who thrive in quiet nighttime focus.',
    category: 'avatar_title',
    aestheticType: 'title',
    aestheticValue: 'Midnight Oil Scholar',
    cost: 110,
    icon: '🌙',
    unlocked: false,
    effect: 'Prestige Title Badge',
  },

  // 5. Soundscapes & Boosters
  {
    id: 'rw-streak-freeze',
    title: 'Emergency Streak Shield',
    description: 'Safeguard your streak even if you miss study goals for a whole day.',
    category: 'booster',
    cost: 200,
    icon: '🛡️',
    unlocked: false,
    effect: '+1 Streak Freeze',
  },
  {
    id: 'rw-soundscape-rain',
    title: 'Binaural Deep Rain Soundscape',
    description: 'Unlock calming lo-fi rain and 40Hz alpha waves for deep focus.',
    category: 'soundscape',
    cost: 250,
    icon: '🌧️',
    unlocked: true,
  },
  {
    id: 'rw-booster-2x',
    title: '2x Double Credit Elixir',
    description: 'Earn 2x currency on all completed focus sessions for the next 24 hours.',
    category: 'booster',
    cost: 300,
    icon: '🧪',
    unlocked: false,
  },
  {
    id: 'rw-soundscape-cafe',
    title: 'Midnight Library Atmosphere',
    description: 'Cozy fireplace crackle, soft page turns, and ambient jazz.',
    category: 'soundscape',
    cost: 220,
    icon: '☕',
    unlocked: false,
  },
];

export const INITIAL_FRIENDS: FriendUser[] = [
  {
    id: 'usr-maya-8821',
    name: 'Maya Lin',
    mailId: 'maya.lin@mit.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MayaLin',
    education: 'Undergraduate (Year 3)',
    domain: 'Computer Science & AI',
    university: 'MIT / EECS',
    streak: 18,
    studyMinutesThisWeek: 980,
    totalCredits: 890,
    equippedBorder: 'flame-phoenix',
    equippedGlow: 'solar-flare',
    equippedTitle: 'Algorithmic Virtuoso',
    equippedBadge: '🔥',
    isFriend: true,
    status: 'studying',
    currentStudyingSubject: 'Computer Science',
    activeTask: 'Dijkstra Priority Queue Proofs',
    lastActive: 'Just now',
    bio: 'Algorithms enthusiast & competitive programming. Aiming for 20h study this week!',
    cheersReceived: 42,
    tasksCompletedWeek: 19,
  },
  {
    id: 'usr-marcus-3490',
    name: 'Marcus Sterling',
    mailId: 'm.sterling@stanford.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MarcusSterling',
    education: 'Graduate Student (Year 1)',
    domain: 'Applied Mathematics & Statistics',
    university: 'Stanford University',
    streak: 15,
    studyMinutesThisWeek: 860,
    totalCredits: 720,
    equippedBorder: 'golden-nebula',
    equippedGlow: 'cosmic-purple',
    equippedTitle: 'Master of Calculus',
    equippedBadge: '👑',
    isFriend: true,
    status: 'studying',
    currentStudyingSubject: 'Advanced Calculus',
    activeTask: "Green's Theorem Double Integrals",
    lastActive: '5m ago',
    bio: 'Differential geometry, vector field flow models, and numerical analysis.',
    cheersReceived: 36,
    tasksCompletedWeek: 15,
  },
  {
    id: 'usr-elena-1209',
    name: 'Elena Rostova',
    mailId: 'elena.rostova@jhu.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ElenaRostova',
    education: 'Undergraduate (Year 4)',
    domain: 'Biochemistry & Pre-Med',
    university: 'Johns Hopkins',
    streak: 14,
    studyMinutesThisWeek: 790,
    totalCredits: 640,
    equippedBorder: 'emerald-scholar',
    equippedGlow: 'emerald-zen',
    equippedTitle: "Dean's List Grandmaster",
    equippedBadge: '🧪',
    isFriend: true,
    status: 'online',
    lastActive: '12m ago',
    bio: 'Organic reaction mechanisms & stereochemistry drill queen. MCAT prep mode!',
    cheersReceived: 28,
    tasksCompletedWeek: 14,
  },
  {
    id: 'usr-priya-5502',
    name: 'Priya Sharma',
    mailId: 'priya.s@berkeley.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PriyaSharma',
    education: 'Undergraduate (Year 3)',
    domain: 'Physics & Electrical Eng',
    university: 'UC Berkeley',
    streak: 11,
    studyMinutesThisWeek: 690,
    totalCredits: 530,
    equippedBorder: 'obsidian-void',
    equippedGlow: 'cosmic-purple',
    equippedTitle: 'Midnight Oil Scholar',
    equippedBadge: '⚡',
    isFriend: true,
    status: 'studying',
    currentStudyingSubject: 'Physics',
    activeTask: 'Maxwell Equations & Curl Integrals',
    lastActive: '2m ago',
    bio: 'Quantum electrodynamics & electromagnetism. Coffee and derivations.',
    cheersReceived: 31,
    tasksCompletedWeek: 12,
  },
  {
    id: 'usr-devon-7741',
    name: 'Devon Carter',
    mailId: 'dcarter@columbia.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevonCarter',
    education: 'Undergraduate (Year 2)',
    domain: 'Economics & Quant Finance',
    university: 'Columbia University',
    streak: 9,
    studyMinutesThisWeek: 580,
    totalCredits: 410,
    equippedBorder: 'cyber-holo',
    equippedGlow: 'cyan-pulse',
    equippedTitle: 'Quantum Pioneer',
    equippedBadge: '📈',
    isFriend: true,
    status: 'away',
    lastActive: '1h ago',
    bio: 'Macroeconomic equilibrium, monetary policy modeling, and econometric regressions.',
    cheersReceived: 19,
    tasksCompletedWeek: 10,
  },
];

export const INITIAL_CAMPUS_SUGGESTIONS: FriendUser[] = [
  {
    id: 'usr-liam-9012',
    name: 'Liam Chen',
    mailId: 'liam.chen@tech.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LiamChen',
    education: 'Undergraduate (Year 3)',
    domain: 'Software Engineering & Systems',
    university: 'Stanford / Tech Institute',
    streak: 8,
    studyMinutesThisWeek: 510,
    totalCredits: 390,
    equippedBorder: 'cyber-holo',
    equippedGlow: 'cyan-pulse',
    equippedTitle: 'Algorithmic Virtuoso',
    equippedBadge: '💻',
    isFriend: false,
    status: 'online',
    lastActive: '10m ago',
    bio: 'Building compilers and distributed databases. Study buddy for OS & systems!',
    cheersReceived: 14,
    tasksCompletedWeek: 8,
  },
  {
    id: 'usr-sophia-6743',
    name: 'Sophia Patel',
    mailId: 'spatel@math.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SophiaPatel',
    education: 'Undergraduate (Year 3)',
    domain: 'Applied Statistics & Data Science',
    university: 'Stanford / Tech Institute',
    streak: 13,
    studyMinutesThisWeek: 730,
    totalCredits: 580,
    equippedBorder: 'golden-nebula',
    equippedGlow: 'solar-flare',
    equippedTitle: 'Master of Calculus',
    equippedBadge: '📊',
    isFriend: false,
    status: 'studying',
    currentStudyingSubject: 'Advanced Calculus',
    activeTask: 'Bayesian Parameter Inference',
    lastActive: 'Just now',
    bio: 'Probability modeling, Markov chains, and linear algebra enthusiast.',
    cheersReceived: 25,
    tasksCompletedWeek: 13,
  },
  {
    id: 'usr-julian-4189',
    name: 'Julian Cruz',
    mailId: 'jcruz@chemistry.edu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=JulianCruz',
    education: 'Undergraduate (Year 2)',
    domain: 'Organic Chemistry & Biochemistry',
    university: 'Stanford / Tech Institute',
    streak: 10,
    studyMinutesThisWeek: 620,
    totalCredits: 470,
    equippedBorder: 'emerald-scholar',
    equippedGlow: 'emerald-zen',
    equippedTitle: 'Quantum Pioneer',
    equippedBadge: '🧪',
    isFriend: false,
    status: 'online',
    lastActive: '25m ago',
    bio: 'Organic synthesis mechanisms & stereochemistry drills.',
    cheersReceived: 18,
    tasksCompletedWeek: 11,
  },
];

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'freq-1',
    fromUser: {
      id: 'usr-claire-8321',
      name: 'Claire Dupont',
      mailId: 'claire.d@sorbonne.edu',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ClaireDupont',
      education: 'Undergraduate (Year 3)',
      domain: 'Mathematics & Computer Science',
      university: 'Sorbonne / Tech Institute',
      streak: 16,
      studyMinutesThisWeek: 840,
      totalCredits: 690,
      equippedBorder: 'golden-nebula',
      equippedGlow: 'solar-flare',
      equippedTitle: 'Quantum Pioneer',
      equippedBadge: '✨',
      isFriend: false,
      status: 'studying',
      currentStudyingSubject: 'Advanced Calculus',
      activeTask: 'Vector Line Integrals Drill',
      lastActive: '3m ago',
      bio: 'Let’s crush multivariable calculus and algorithms together!',
      cheersReceived: 29,
      tasksCompletedWeek: 16,
    },
    timestamp: '20 minutes ago',
    status: 'pending',
  },
];

export const INITIAL_DAILY_GOALS: DailyGoalRecord[] = generateInitialDailyGoals();
export const INITIAL_SMART_FLASHCARDS: SmartFlashcard[] = INITIAL_FLASHCARDS;
export function generateInitialStudyLogs(): StudyLog[] {
  const logs: StudyLog[] = [];
  const now = new Date();

  const dailyDistribution = [
    { dayOffset: 13, subId: 'sub-calc', mins: 90, task: 'Chain rule derivations' },
    { dayOffset: 12, subId: 'sub-cs', mins: 110, task: 'Binary search analysis' },
    { dayOffset: 11, subId: 'sub-chem', mins: 80, task: 'Acids and bases' },
    { dayOffset: 10, subId: 'sub-econ', mins: 60, task: 'Aggregate Demand multipliers' },
    { dayOffset: 9, subId: 'sub-phys', mins: 95, task: 'Photoelectric effect' },
    { dayOffset: 8, subId: 'sub-calc', mins: 120, task: 'Double integrals in polar coords' },
    { dayOffset: 7, subId: 'sub-cs', mins: 130, task: 'Graph representations' },
    { dayOffset: 6, subId: 'sub-calc', mins: 120, task: "Green's Theorem problem set" },
    { dayOffset: 6, subId: 'sub-econ', mins: 45, task: 'IS-LM equilibrium' },
    { dayOffset: 5, subId: 'sub-chem', mins: 90, task: 'SN1 reaction pathways' },
    { dayOffset: 5, subId: 'sub-phys', mins: 75, task: 'Wave mechanics' },
    { dayOffset: 4, subId: 'sub-calc', mins: 80, task: 'Flux line integrals' },
    { dayOffset: 4, subId: 'sub-cs', mins: 90, task: 'Dijkstra implementation' },
    { dayOffset: 3, subId: 'sub-phys', mins: 110, task: 'Schrodinger in 1D box' },
    { dayOffset: 3, subId: 'sub-econ', mins: 45, task: 'Monetary policy' },
    { dayOffset: 2, subId: 'sub-calc', mins: 95, task: 'Vector calculus surface integrals' },
    { dayOffset: 2, subId: 'sub-chem', mins: 50, task: 'SN2 inversion practice' },
    { dayOffset: 1, subId: 'sub-econ', mins: 45, task: 'Practice exam equations' },
    { dayOffset: 0, subId: 'sub-calc', mins: 135, task: 'Multivariable problem set 4' },
    { dayOffset: 0, subId: 'sub-cs', mins: 50, task: 'Dijkstra Priority Queue verification' },
    { dayOffset: 0, subId: 'sub-phys', mins: 25, task: 'Particle in box eigenstate review' },
  ];

  dailyDistribution.forEach((item, index) => {
    const logDate = new Date(now);
    logDate.setDate(now.getDate() - item.dayOffset);
    const dateStr = logDate.toISOString().split('T')[0];

    logs.push({
      id: `log-seed-${index}`,
      subjectId: item.subId,
      date: dateStr,
      durationSeconds: item.mins * 60,
      timestamp: logDate.toISOString(),
      taskTitle: item.task,
    });
  });

  return logs;
}

export function generateInitialDailyGoals(): DailyGoalRecord[] {
  const goals: DailyGoalRecord[] = [];
  const now = new Date();

  for (let offset = 14; offset >= 0; offset--) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    const dateStr = d.toISOString().split('T')[0];

    // Seed realistic achievements for past days
    const achievedMins = offset === 0 ? 210 : offset % 4 === 0 ? 165 : offset % 2 === 0 ? 140 : 90;
    const targetMins = 60;
    const goalAchieved = achievedMins >= targetMins;
    const tasksCount = offset === 0 ? 2 : offset % 3 === 0 ? 3 : 1;

    goals.push({
      date: dateStr,
      targetMinutes: targetMins,
      achievedMinutes: achievedMins,
      goalAchieved,
      tasksCompletedCount: tasksCount,
      reflectionNote:
        offset === 0
          ? 'Completed Dijkstra shortest path and multivariable problem set. Great focus today!'
          : offset % 3 === 0
          ? 'Deep focus session on reaction kinetics and physics.'
          : 'Met daily 60 min goal successfully.',
    });
  }

  return goals;
}

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

export function clearAllStoredData(): void {
  const keys = [
    'studyorbit_user_profile',
    'studyorbit_subjects',
    'studyorbit_tasks',
    'studyorbit_logs',
    'studyorbit_streak',
    'studyorbit_daily_goals',
    'studyorbit_skill_tree',
    'studyorbit_flashcards',
    'studyorbit_mindmaps',
    'studyorbit_rewards',
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}

export function calculateStreakUpdate(
  currentStreakState: StreakState,
  minutesStudiedToday: number,
  tasksDoneToday: number
): { streakState: StreakState; earnedNewStreak: boolean; earnedCredits: number } {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDate = currentStreakState.lastStudiedDate;

  let newStreak = currentStreakState.currentStreak;
  let earnedNewStreak = false;
  let earnedCredits = 0;

  if (lastDate !== todayStr && (minutesStudiedToday >= 15 || tasksDoneToday >= 1)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      newStreak += 1;
    } else if (!lastDate) {
      newStreak = 1;
    } else {
      if (currentStreakState.freezeCount > 0) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }
    earnedNewStreak = true;
    earnedCredits += 50;
  }

  const updatedState: StreakState = {
    ...currentStreakState,
    currentStreak: newStreak,
    bestStreak: Math.max(newStreak, currentStreakState.bestStreak),
    lastStudiedDate: todayStr,
    credits: currentStreakState.credits + earnedCredits,
  };

  return { streakState: updatedState, earnedNewStreak, earnedCredits };
}
