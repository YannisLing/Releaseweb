export type PracticeMode = 'basic' | 'threeWants' | 'continuous' | 'focus'

export interface PracticeModeInfo {
  id: PracticeMode
  name: string
  description: string
  emoji: string
  steps: PracticeStep[]
}

export interface PracticeStep {
  id: number
  title: string
  instruction: string
  question?: string
  options?: string[]
}

export const practiceModes: Record<PracticeMode, PracticeModeInfo> = {
  basic: {
    id: 'basic',
    name: '基础释放',
    description: '四步释放法：感受情绪、能否放下、是否愿意、何时放下',
    emoji: '🌱',
    steps: [
      {
        id: 1,
        title: '第一步：感受情绪',
        instruction: '找一个安静舒适的地方，闭上眼睛，感受你现在的情绪。',
        question: '回想一个令你不能释怀的场景，你有什么感觉？'
      },
      {
        id: 2,
        title: '第二问：能否放下',
        instruction: '闭上眼睛，深呼吸几次。真正地感受这个情绪，注意它在身体上的位置。',
        question: '"你能让这种感觉离开吗？"'
      },
      {
        id: 3,
        title: '第三问：是否愿意',
        instruction: '如果你发现自己不愿意放手，问问自己：是什么让我紧抓不放？',
        question: '"如果能，你愿意让它离开吗？"'
      },
      {
        id: 4,
        title: '第四问：何时放下',
        instruction: '给自己一点时间感受这个情绪。注意它在身体上的位置，观察它的形状和颜色。',
        question: '"你什么时候让它离开呢？"'
      }
    ]
  },

  threeWants: {
    id: 'threeWants',
    name: '三大想要',
    description: '识别并释放对认可、控制、安全感的执着',
    emoji: '🔑',
    steps: [
      {
        id: 1,
        title: '识别三大想要',
        instruction: '圣多娜释放法的核心是识别阻碍我们自由的三大想要：对认可的渴望、对控制的渴望、对安全感的渴望。',
        question: '你现在执着于哪一个？'
      },
      {
        id: 2,
        title: '感受这个想要',
        instruction: '闭上眼睛，深入感受这个想要。注意它在你身体上的位置，它的形状、颜色、温度。',
        question: '你能感受到它吗？'
      },
      {
        id: 3,
        title: '能否放下这个想要',
        instruction: '真诚地问自己：',
        question: '"你能放下这个想要吗？"',
        options: ['能', '不能', '不确定']
      },
      {
        id: 4,
        title: '是否愿意放下',
        instruction: '如果能放下，问自己：',
        question: '"你愿意放下这个想要吗？"',
        options: ['愿意', '不愿意', '考虑一下']
      },
      {
        id: 5,
        title: '何时放下',
        instruction: '给自己一点时间，然后问：',
        question: '"你什么时候放下呢？现在可以吗？"'
      },
      {
        id: 6,
        title: '持续释放',
        instruction: '感受此刻的状态。如果还有任何残留的执着，继续释放。记住，选择权永远在你手中。',
        question: '还有什么是我们紧抓不放的？'
      }
    ]
  },

  continuous: {
    id: 'continuous',
    name: '持续释放',
    description: '一层一层不断深入地释放，直到完全自由',
    emoji: '🌊',
    steps: [
      {
        id: 1,
        title: '选择一件事',
        instruction: '想一件让你困扰的事情，或者一个让你不舒服的感觉。',
        question: '有什么事或什么感觉是你想要释放的？'
      },
      {
        id: 2,
        title: '第一层释放',
        instruction: '感受这个困扰，注意它在身体上的位置。',
        question: '你能让这个困扰离开吗？'
      },
      {
        id: 3,
        title: '深入一层',
        instruction: '如果还有残留，问问自己：是什么让我仍然紧抓不放？',
        question: '还有更深的感受吗？'
      },
      {
        id: 4,
        title: '继续释放',
        instruction: '每释放一层，新的感受可能会浮出水面。继续用四步法释放。',
        question: '此刻的感受是什么？'
      },
      {
        id: 5,
        title: '回归中心',
        instruction: '当你感觉释放得差不多了，停下来，深呼吸，感受此刻的平静。',
        question: '你现在感觉如何？'
      }
    ]
  },

  focus: {
    id: 'focus',
    name: '聚焦释放',
    description: '专注于一个特定的问题或情绪，深入释放',
    emoji: '🎯',
    steps: [
      {
        id: 1,
        title: '确定焦点',
        instruction: '找一个具体的问题或情绪作为释放的焦点。越具体越好。',
        question: '你想要释放的具体是什么？'
      },
      {
        id: 2,
        title: '完全感受它',
        instruction: '闭上眼睛，用心感受这个问题或情绪。不要逃避，只是观察。',
        question: '它在身体的哪个位置？是什么样的感觉？'
      },
      {
        id: 3,
        title: '四步释放',
        instruction: '使用经典四步法来释放这个焦点：',
        question: '"你能放下吗？愿意吗？什么时候？"'
      },
      {
        id: 4,
        title: '检查结果',
        instruction: '释放后，感受一下这个问题还在吗？它还在的话，继续释放。',
        question: '感受如何？'
      },
      {
        id: 5,
        title: '深化释放',
        instruction: '如果问题仍然存在，可能有更深层的执着。再次使用四步法。',
        question: '还有什么与这个问题相关的感受？'
      }
    ]
  }
}

export const getModeById = (id: PracticeMode): PracticeModeInfo => {
  return practiceModes[id]
}

export const getAllModes = (): PracticeModeInfo[] => {
  return Object.values(practiceModes)
}