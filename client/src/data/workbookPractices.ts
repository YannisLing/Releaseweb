// 圣多纳释放法练习数据
export type Practice = {
  id: string;
  name: string;
  description: string;
  pages: string;
  attemptsRequired: number;
  exercises: Exercise[];
  completed: boolean;
  attemptsMade: number;
};

export type Exercise = {
  id: string;
  name: string;
  description: string;
  columns: Column[];
  events: Event[];
};

export type Column = {
  id: string;
  name: string;
  type: 'text' | 'checkbox';
};

export type Event = {
  id: string;
  situation: string; // 事件描述
  feelings: Feeling[];
  completed: boolean; // 所有感受都释放并感觉好
};

export type Feeling = {
  id: string;
  name: string; // 感受名称
  released: boolean; // 释放了吗
  feelingGood: boolean; // 感觉好吗
};

export const ALL_PRACTICES: Practice[] = [
  {
    id: 'practice1',
    name: '练习1：在我的生活中我想改变什么',
    description: '想想在你生活中你想要改变的人、事、物，释放你的感受。',
    pages: 'Pages 9, 11-12',
    attemptsRequired: 1,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex1',
        name: '想改变的事',
        description: '列出生活中你想要改变的一些情况、人或问题，然后释放你的感受。',
        columns: [
          { id: 'situation', name: '我想改变的事情', type: 'text' },
          { id: 'feelings', name: '感受', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice2',
    name: '练习2：压抑或表达',
    description: '释放你压抑或表达情绪时的感受。',
    pages: 'Pages 13-16',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex2.1',
        name: '练习2.1：回忆压抑情绪',
        description: '回忆你当时压抑情绪的具体事情，释放感受。',
        columns: [
          { id: 'situation', name: '回忆压抑情绪的具体事情', type: 'text' },
          { id: 'feelings', name: '感受', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex2.2',
        name: '练习2.2：回忆表达情绪',
        description: '回忆你当时表达情绪的具体事情，释放感受。',
        columns: [
          { id: 'situation', name: '回忆表达情绪的具体事情', type: 'text' },
          { id: 'feelings', name: '感受', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice3',
    name: '练习3：成功主题',
    description: '释放你对成功和失败的感受。',
    pages: 'Pages 17-19',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex3.1',
        name: '练习3.1：对成功的感受',
        description: '释放你对在某个领域取得成功的感受。',
        columns: [
          { id: 'situation', name: '成功领域（主题）', type: 'text' },
          { id: 'feelings', name: '如果成功，我现在的感受', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex3.2',
        name: '练习3.2：对失败的感受',
        description: '释放你对在某个领域失败的感受。',
        columns: [
          { id: 'situation', name: '主题（同上）', type: 'text' },
          { id: 'feelings', name: '如果失败，我现在的感受', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice4',
    name: '练习4：喜欢与不喜欢主题释放',
    description: '交替释放你对某个主题的喜欢与不喜欢。',
    pages: 'Pages 21-27',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex4.1',
        name: '练习4.1：释放喜欢的方面',
        description: '释放你对该主题喜欢方面的感受。',
        columns: [
          { id: 'situation', name: '主题', type: 'text' },
          { id: 'feelings', name: '我喜欢该主题的方面', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex4.2',
        name: '练习4.2：释放不喜欢的方面',
        description: '释放你对该主题不喜欢方面的感受。',
        columns: [
          { id: 'situation', name: '主题', type: 'text' },
          { id: 'feelings', name: '我不喜欢该主题的方面', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice5',
    name: '练习5：我必须做的事',
    description: '释放你觉得不得不做的事的感受。',
    pages: 'Pages 29-31',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex5',
        name: '练习5：我必须做的事',
        description: '释放你觉得"必须"做的事情的感受。',
        columns: [
          { id: 'situation', name: '我觉得必须做的事', type: 'text' },
          { id: 'feelings', name: '感受', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice6',
    name: '练习6：目标陈述与目标行动清单',
    description: '设定目标并释放对达成目标的感受。',
    pages: 'Pages 33-46',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex6.1',
        name: '练习6.1：目标陈述',
        description: '写下你的目标并释放相关感受。',
        columns: [
          { id: 'situation', name: '我的目标', type: 'text' },
          { id: 'feelings', name: '我对目标的感受', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex6.2',
        name: '练习6.2：目标行动清单',
        description: '列出达成目标需要做的具体事项，释放感受。',
        columns: [
          { id: 'situation', name: '我要做的事', type: 'text' },
          { id: 'feelings', name: '我对这件事的感受', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice7',
    name: '练习7：回想练习',
    description: '回想你想要被认同和想要控制的情况。',
    pages: 'Pages 50-54, 68-71',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex7.1',
        name: '练习7.1：回想想要被认同',
        description: '回想你当时想要被认同的具体事情，释放那个想要。',
        columns: [
          { id: 'situation', name: '想要被认同的具体事情', type: 'text' },
          { id: 'feelings', name: '我现在想要什么', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex7.2',
        name: '练习7.2：回想想要控制',
        description: '回想你当时想要控制的具体事情，释放那个想要。',
        columns: [
          { id: 'situation', name: '想要控制的具体事情', type: 'text' },
          { id: 'feelings', name: '我现在想要什么', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice8',
    name: '练习8：释放想要',
    description: '释放你想要和不想要的东西。',
    pages: 'Pages 55-59',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex8.1',
        name: '练习8.1：释放想要的东西',
        description: '列出你想要的东西并释放。',
        columns: [
          { id: 'situation', name: '我想要什么', type: 'text' },
          { id: 'feelings', name: '', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex8.2',
        name: '练习8.2：释放不想要的东西',
        description: '列出你不想要的东西并释放。',
        columns: [
          { id: 'situation', name: '我不想要什么', type: 'text' },
          { id: 'feelings', name: '', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice9',
    name: '练习9：化解卡住（胶着）',
    description: '当你感到卡住时，释放好处与坏处。',
    pages: 'Pages 71-75',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex9.1',
        name: '练习9.1：释放好处',
        description: '列出卡在某个主题上对你的好处并释放。',
        columns: [
          { id: 'situation', name: '对我有什么好处（卡住主题）', type: 'text' },
          { id: 'feelings', name: '', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex9.2',
        name: '练习9.2：释放坏处',
        description: '列出卡在某个主题上对你的坏处并释放。',
        columns: [
          { id: 'situation', name: '对我有什么坏处', type: 'text' },
          { id: 'feelings', name: '', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice10',
    name: '练习10：觉察你的想要',
    description: '觉察你寻求认同、控制和安全的方式。',
    pages: 'Pages 75-79',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex10.1',
        name: '练习10.1：觉察想要被认同',
        description: '列出你寻求被认同的方式，觉察并释放。',
        columns: [
          { id: 'situation', name: '我寻求被认同的方式', type: 'text' },
          { id: 'feelings', name: '', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex10.2',
        name: '练习10.2：觉察想要控制',
        description: '列出你试图控制的方式，觉察并释放。',
        columns: [
          { id: 'situation', name: '我试图控制的方式', type: 'text' },
          { id: 'feelings', name: '', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex10.3',
        name: '练习10.3：觉察想要安全',
        description: '列出你寻求安全的方式，觉察并释放。',
        columns: [
          { id: 'situation', name: '我寻求安全的方式', type: 'text' },
          { id: 'feelings', name: '', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingGood', name: '感觉好吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  },

  {
    id: 'practice11',
    name: '练习11：快乐练习',
    description: '释放你对获得快乐条件的执着，直接感受快乐。',
    pages: 'Pages 79-81',
    attemptsRequired: 3,
    completed: false,
    attemptsMade: 0,
    exercises: [
      {
        id: 'ex11.1',
        name: '练习11.1：获得快乐所需的条件',
        description: '列出你认为需要什么才能获得快乐，释放这些条件。',
        columns: [
          { id: 'situation', name: '我需要什么才能获得快乐', type: 'text' },
          { id: 'feelings', name: '', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingHappy', name: '感到快乐吗', type: 'checkbox' }
        ],
        events: []
      },
      {
        id: 'ex11.2',
        name: '练习11.2：需要避免的事情',
        description: '列出你认为需要避免什么才能获得快乐，释放这些。',
        columns: [
          { id: 'situation', name: '我需要避免什么才能获得快乐', type: 'text' },
          { id: 'feelings', name: '', type: 'text' },
          { id: 'released', name: '释放了吗', type: 'checkbox' },
          { id: 'feelingHappy', name: '感到快乐吗', type: 'checkbox' }
        ],
        events: []
      }
    ]
  }
];