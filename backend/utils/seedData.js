const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');
const { connectDB } = require('../config/db');

dotenv.config();

const sampleQuestions = [
  // 1. Coding: Two Sum
  {
    title: 'Two Sum Problem (Optimized O(N))',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. Assume each input has exactly one solution, and you may not use the same element twice.',
    type: 'code',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Easy',
    companyTags: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test Call
console.log(JSON.stringify(twoSum([2, 7, 11, 15], 9)));`,
      python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

# Test Call
print(two_sum([2, 7, 11, 15], 9))`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }

    public static void main(String[] args) {
        int[] res = twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println(Arrays.toString(res));
    }
}`
    },
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]' }
    ],
    hints: ['Can you solve it in a single pass using a Hash Map?', 'Check if target - current_element exists in your map.'],
    modelAnswer: 'Utilize a hash table to store number-to-index mappings in a single iteration, yielding O(N) time and O(N) space complexity.'
  },

  // 2. Coding: Valid Parentheses
  {
    title: 'Valid Parentheses and Balanced Bracket Matching',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order.',
    type: 'code',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Easy',
    companyTags: ['Amazon', 'Bloomberg', 'Uber'],
    starterCode: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}

console.log(isValid("()[]{}"));`,
      python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return not stack

print(is_valid("()[]{}"))`
    },
    testCases: [
      { input: 's = "()[]{}"', expectedOutput: 'true' },
      { input: 's = "(]"', expectedOutput: 'false' }
    ],
    hints: ['Use a Stack LIFO data structure.', 'Push opening brackets and pop/match on closing brackets.'],
    modelAnswer: 'A stack accurately tracks opening brackets in LIFO order. Time complexity is O(N) and space is O(N).'
  },

  // 3. Coding: Reverse Linked List / Invert Binary Tree
  {
    title: 'Maximum Subarray (Kadane’s Algorithm)',
    description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum in O(N) time.',
    type: 'code',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    companyTags: ['Microsoft', 'Apple', 'LinkedIn'],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let currentMax = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }
  return maxSoFar;
}

console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));`,
      python: `def max_sub_array(nums):
    max_so_far = current_max = nums[0]
    for num in nums[1:]:
        current_max = max(num, current_max + num)
        max_so_far = max(max_so_far, current_max)
    return max_so_far

print(max_sub_array([-2,1,-3,4,-1,2,1,-5,4]))`
    },
    testCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: 'nums = [1]', expectedOutput: '1' },
      { input: 'nums = [5,4,-1,7,8]', expectedOutput: '23' }
    ],
    hints: ['Use Kadane Algorithm.', 'At each step decide whether to start a new subarray or extend the previous.'],
    modelAnswer: 'Kadane algorithm maintains the maximum subarray ending at the current position in O(N) time and O(1) space.'
  },

  // 3. Text: System Design
  {
    title: 'Design a Scalable URL Shortener (TinyURL)',
    description: 'How would you design a distributed URL shortening service like bit.ly? Discuss URL encoding (Base62 vs Hash), database schema (SQL vs NoSQL), caching strategy, custom aliases, and rate limiting.',
    type: 'text',
    topic: 'System Design & Architecture',
    difficulty: 'Medium',
    companyTags: ['Google', 'Meta', 'Netflix', 'Twitter'],
    hints: ['Calculate read vs write traffic ratio (typically 100:1).', 'Use Base62 encoding (a-z, A-Z, 0-9) for short keys.', 'Add Redis cache for 80% read requests.'],
    modelAnswer: '1. Scale: 100M URLs/month, 100:1 read-to-write ratio. 2. Storage: NoSQL (MongoDB/DynamoDB) with schema { id, short_key, original_url, created_at, expire_at }. 3. Encoding: Base62 on auto-increment counter or Distributed ID Generator (Snowflake). 4. Caching: Redis for top 20% hottest URLs (80/20 rule). 5. Load balancing: Nginx with round-robin and rate limiting.'
  },

  // 4. Text: React Performance
  {
    title: 'React Rendering Pipeline & Virtual DOM Reconciliation',
    description: 'Explain how React’s Virtual DOM and Fiber reconciler work. What causes component re-renders, and how do React.memo, useMemo, and useCallback mitigate performance bottlenecks in large component trees?',
    type: 'text',
    topic: 'Frontend & React',
    difficulty: 'Medium',
    companyTags: ['Meta', 'Stripe', 'Atlassian', 'Airbnb'],
    hints: ['Discuss Fiber tree and time-slicing.', 'Differentiate reference equality vs value changes in props.'],
    modelAnswer: 'React maintains a Virtual DOM tree. During state changes, Fiber computes the diff in render phase and commits DOM updates in commit phase. React.memo performs shallow prop comparison. useMemo caches expensive computation outputs, while useCallback caches function reference to prevent child re-renders.'
  },

  // 5. Text: Node.js Event Loop
  {
    title: 'Node.js Event Loop & Non-Blocking Asynchronous I/O',
    description: 'Explain the phases of the Node.js Event Loop (Timers, Pending Callbacks, Poll, Check, Close). What is the difference between process.nextTick() and setImmediate()?',
    type: 'text',
    topic: 'Backend & Node.js',
    difficulty: 'Medium',
    companyTags: ['PayPal', 'Uber', 'LinkedIn'],
    hints: ['process.nextTick() executes right after the current operation before the event loop advances.', 'setImmediate() runs in the Check phase.'],
    modelAnswer: 'The event loop operates through phases: Timers (setTimeout/setInterval) -> Pending I/O -> Idle/Prepare -> Poll (I/O events) -> Check (setImmediate) -> Close callbacks. Microtasks (process.nextTick & Promise callbacks) drain immediately after the current operation before switching phases.'
  },

  // 6. Voice: Behavioral STAR
  {
    title: 'Leadership & Conflict Resolution (STAR Method)',
    description: 'Describe a situation where you had a disagreement with a team member or stakeholder regarding a technical implementation choice or deadline. How did you handle it and what was the outcome?',
    type: 'voice',
    topic: 'Behavioral & Leadership',
    difficulty: 'Medium',
    companyTags: ['Amazon', 'Google', 'Apple', 'Microsoft'],
    hints: ['Structure clearly: Situation -> Task -> Action -> Result.', 'Highlight data-driven compromise and focus on user/system requirements.'],
    modelAnswer: 'Situation: Disagreement on whether to adopt GraphQL vs REST for a mobile client with tight latency constraints. Task: Reach consensus without delaying sprint deliverables. Action: Conducted a 1-day benchmark POC measuring payload size and network roundtrips; presented objective telemetry to the team. Result: Aligned on a hybrid REST with targeted field filtering, shipping on time with zero regressions.'
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    await Question.deleteMany();
    await Question.insertMany(sampleQuestions);
    console.log('🎉 Curated Question Bank Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = { sampleQuestions };
