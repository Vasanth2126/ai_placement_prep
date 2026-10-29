/**
 * Curated Top Placement Coding Questions Bank
 * Featuring LeetCode / Top Placement technical round problems with:
 * - 5 Language Empty Starter Boilerplates (C++, Java, Python, JS, C)
 * - Complete Test Case Suites
 * - Company Tags & Difficulty Ratings
 * - Big-O Complexity Constraints, Hints, and Reference Editorial Solutions
 */

export const CODING_QUESTIONS_BANK = [
  {
    id: 1,
    number: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Array & Hash Table',
    companyTags: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Goldman Sachs'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    hints: [
      'A brute force O(N^2) checks every pair.',
      'Use a Hash Map storing {value: index} for O(N) single-pass lookup.',
    ],
    starterCode: {
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here...
        return {};
    }
};`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here...
        return new int[0];
    }
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here...
        return []`,
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Write your solution here...
    return [];
};`,
      c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your solution here...
    *returnSize = 0;
    return NULL;
}`,
    },
    editorialSolution: {
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in seen:
                return [seen[diff], i]
            seen[n] = i
        return []`,
    },
    testCases: [
      { id: 1, params: { nums: '[2,7,11,15]', target: '9' }, expectedOutput: '[0,1]' },
      { id: 2, params: { nums: '[3,2,4]', target: '6' }, expectedOutput: '[1,2]' },
      { id: 3, params: { nums: '[3,3]', target: '6' }, expectedOutput: '[0,1]' },
    ],
  },
  {
    id: 20,
    number: 20,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'String & Stack',
    companyTags: ['Amazon', 'Microsoft', 'Uber', 'Goldman Sachs'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Round brackets properly matched.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All bracket pairs ordered correctly.' },
      { input: 's = "(]"', output: 'false', explanation: 'Square bracket cannot close round bracket.' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only `()[]{}`.'],
    hints: [
      'Use a Stack to push opening brackets and pop matching closing brackets.',
    ],
    starterCode: {
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your solution here...
        return false;
    }
};`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here...
        return false;
    }
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution here...
        return False`,
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    // Write your solution here...
    return false;
};`,
      c: `bool isValid(char* s) {
    // Write your solution here...
    return false;
}`,
    },
    editorialSolution: {
      cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') st.push(c);
            else {
                if (st.empty()) return false;
                char top = st.top();
                if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,
    },
    testCases: [
      { id: 1, params: { s: '"()"' }, expectedOutput: 'true' },
      { id: 2, params: { s: '"()[]{}"' }, expectedOutput: 'true' },
      { id: 3, params: { s: '"(]"' }, expectedOutput: 'false' },
    ],
  },
  {
    id: 53,
    number: 53,
    title: 'Maximum Subarray (Kadane’s Algorithm)',
    difficulty: 'Medium',
    topic: 'Dynamic Programming & Array',
    companyTags: ['Google', 'Amazon', 'Microsoft', 'Zoho', 'TCS Digital'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return *its sum*.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'Subarray [1] has max sum 1.' },
      { input: 'nums = [5,4,-1,7,8]', output: '23', explanation: 'Subarray [5,4,-1,7,8] has largest sum 23.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: ['Kadane’s Algorithm: At each index, decide whether to add to current running sum or start fresh.'],
    starterCode: {
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Write your solution here...
        return 0;
    }
};`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here...
        return 0;
    }
}`,
      python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        # Write your solution here...
        return 0`,
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    // Write your solution here...
    return 0;
};`,
      c: `int maxSubArray(int* nums, int numsSize) {
    // Write your solution here...
    return 0;
}`,
    },
    editorialSolution: {
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int max_sum = nums[0], curr = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            curr = max(nums[i], curr + nums[i]);
            max_sum = max(max_sum, curr);
        }
        return max_sum;
    }
};`,
    },
    testCases: [
      { id: 1, params: { nums: '[-2,1,-3,4,-1,2,1,-5,4]' }, expectedOutput: '6' },
      { id: 2, params: { nums: '[1]' }, expectedOutput: '1' },
      { id: 3, params: { nums: '[5,4,-1,7,8]' }, expectedOutput: '23' },
    ],
  },
  {
    id: 121,
    number: 121,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topic: 'Sliding Window & Array',
    companyTags: ['Amazon', 'Goldman Sachs', 'Microsoft', 'Zoho'],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`-th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'In this case, no transactions are done and max profit = 0.' },
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    hints: ['Keep track of minimum buying price seen so far and calculate profit for today.'],
    starterCode: {
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        // Write your solution here...
        return 0;
    }
};`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        // Write your solution here...
        return 0;
    }
}`,
      python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        # Write your solution here...
        return 0`,
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    // Write your solution here...
    return 0;
};`,
      c: `int maxProfit(int* prices, int pricesSize) {
    // Write your solution here...
    return 0;
}`,
    },
    editorialSolution: {
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = prices[0], maxP = 0;
        for (int p : prices) {
            minPrice = min(minPrice, p);
            maxP = max(maxP, p - minPrice);
        }
        return maxP;
    }
};`,
    },
    testCases: [
      { id: 1, params: { prices: '[7,1,5,3,6,4]' }, expectedOutput: '5' },
      { id: 2, params: { prices: '[7,6,4,3,1]' }, expectedOutput: '0' },
    ],
  },
  {
    id: 3,
    number: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topic: 'Sliding Window & Hash Set',
    companyTags: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Uber'],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    hints: ['Use sliding window with two pointers (left, right) and a Set/Map of visited characters.'],
    starterCode: {
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        // Write your solution here...
        return 0;
    }
};`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your solution here...
        return 0;
    }
}`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your solution here...
        return 0`,
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function(s) {
    // Write your solution here...
    return 0;
};`,
      c: `int lengthOfLongestSubstring(char* s) {
    // Write your solution here...
    return 0;
}`,
    },
    editorialSolution: {
      cpp: `class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> seen;
        int maxLen = 0, left = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            if (seen.count(s[right]) && seen[s[right]] >= left) {
                left = seen[s[right]] + 1;
            }
            seen[s[right]] = right;
            maxLen = max(maxLen, right - left + 1);
        }
        return maxLen;
    }
};`,
    },
    testCases: [
      { id: 1, params: { s: '"abcabcbb"' }, expectedOutput: '3' },
      { id: 2, params: { s: '"bbbbb"' }, expectedOutput: '1' },
      { id: 3, params: { s: '"pwwkew"' }, expectedOutput: '3' },
    ],
  },
  {
    id: 70,
    number: 70,
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    companyTags: ['Amazon', 'Google', 'Zoho', 'TCS Digital'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps' },
      { input: 'n = 3', output: '3', explanation: '1. 1+1+1\n2. 1+2\n3. 2+1' },
    ],
    constraints: ['1 <= n <= 45'],
    hints: ['To reach step n, you come from n-1 or n-2. Fib(n) = Fib(n-1) + Fib(n-2).'],
    starterCode: {
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Write your solution here...
        return 0;
    }
};`,
      java: `class Solution {
    public int climbStairs(int n) {
        // Write your solution here...
        return 0;
    }
}`,
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Write your solution here...
        return 0`,
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    // Write your solution here...
    return 0;
};`,
      c: `int climbStairs(int n) {
    // Write your solution here...
    return 0;
}`,
    },
    editorialSolution: {
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};`,
    },
    testCases: [
      { id: 1, params: { n: '2' }, expectedOutput: '2' },
      { id: 2, params: { n: '3' }, expectedOutput: '3' },
      { id: 3, params: { n: '5' }, expectedOutput: '8' },
    ],
  },
];

/**
 * Universal driver wrapper that packages candidate code into an executable main() routine
 */
export const buildExecutableDriver = (qId, lang, userCode, activeCase) => {
  const p = activeCase.params;
  let cleanCode = userCode;

  if (lang === 'java') {
    cleanCode = cleanCode.replace(/public\s+class\s+Solution/g, 'class Solution');
  }

  if (qId === 1) { // Two Sum
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;
${cleanCode}
int main() {
    Solution sol;
    vector<int> nums = ${p.nums};
    int target = ${p.target};
    vector<int> res = sol.twoSum(nums, target);
    cout << "[";
    for(size_t i=0; i<res.size(); ++i) {
        cout << res[i] << (i+1<res.size() ? "," : "");
    }
    cout << "]" << endl;
    return 0;
}`;
    } else if (lang === 'python') {
      return `from typing import List
${cleanCode}
sol = Solution()
res = sol.twoSum(${p.nums}, ${p.target})
print(str(res).replace(" ", "") if res is not None else "[]")`;
    } else if (lang === 'javascript') {
      return `${cleanCode}
const res = twoSum(${p.nums}, ${p.target});
console.log(JSON.stringify(res || []).replace(/\\s/g, ''));`;
    } else if (lang === 'java') {
      return `import java.util.*;
${cleanCode}
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = new int[]${p.nums.replace('[', '{').replace(']', '}')};
        int[] res = sol.twoSum(nums, ${p.target});
        System.out.println(Arrays.toString(res).replace(" ", ""));
    }
}`;
    } else if (lang === 'c') {
      return `#include <stdio.h>
#include <stdlib.h>
${cleanCode}
int main() {
    int nums[] = ${p.nums.replace('[', '{').replace(']', '}')};
    int returnSize = 0;
    int* res = twoSum(nums, sizeof(nums)/sizeof(nums[0]), ${p.target}, &returnSize);
    if (res != NULL && returnSize >= 2) {
        printf("[%d,%d]\\n", res[0], res[1]);
    } else {
        printf("[]\\n");
    }
    return 0;
}`;
    }
  } else if (qId === 20) { // Valid Parentheses
    if (lang === 'cpp') {
      return `#include <iostream>
#include <string>
#include <stack>
using namespace std;
${cleanCode}
int main() {
    Solution sol;
    cout << (sol.isValid(${p.s}) ? "true" : "false") << endl;
    return 0;
}`;
    } else if (lang === 'python') {
      return `${cleanCode}
sol = Solution()
print(str(sol.isValid(${p.s})).lower())`;
    } else if (lang === 'javascript') {
      return `${cleanCode}
console.log(String(isValid(${p.s})));`;
    } else if (lang === 'java') {
      return `import java.util.*;
${cleanCode}
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isValid(${p.s}));
    }
}`;
    } else if (lang === 'c') {
      return `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
${cleanCode}
int main() {
    printf("%s\\n", isValid(${p.s}) ? "true" : "false");
    return 0;
}`;
    }
  } else if (qId === 53) { // Max Subarray
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
${cleanCode}
int main() {
    Solution sol;
    vector<int> nums = ${p.nums};
    cout << sol.maxSubArray(nums) << endl;
    return 0;
}`;
    } else if (lang === 'python') {
      return `from typing import List
${cleanCode}
sol = Solution()
print(sol.maxSubArray(${p.nums}))`;
    } else if (lang === 'javascript') {
      return `${cleanCode}
console.log(maxSubArray(${p.nums}));`;
    } else if (lang === 'java') {
      return `import java.util.*;
${cleanCode}
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = new int[]${p.nums.replace('[', '{').replace(']', '}')};
        System.out.println(sol.maxSubArray(nums));
    }
}`;
    } else if (lang === 'c') {
      return `#include <stdio.h>
${cleanCode}
int main() {
    int nums[] = ${p.nums.replace('[', '{').replace(']', '}')};
    printf("%d\\n", maxSubArray(nums, sizeof(nums)/sizeof(nums[0])));
    return 0;
} `;
    }
  } else if (qId === 121) { // Best Time to Buy & Sell Stock
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
${cleanCode}
int main() {
    Solution sol;
    vector<int> prices = ${p.prices};
    cout << sol.maxProfit(prices) << endl;
    return 0;
}`;
    } else if (lang === 'python') {
      return `from typing import List
${cleanCode}
sol = Solution()
print(sol.maxProfit(${p.prices}))`;
    } else if (lang === 'javascript') {
      return `${cleanCode}
console.log(maxProfit(${p.prices}));`;
    } else if (lang === 'java') {
      return `import java.util.*;
${cleanCode}
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] prices = new int[]${p.prices.replace('[', '{').replace(']', '}')};
        System.out.println(sol.maxProfit(prices));
    }
}`;
    } else if (lang === 'c') {
      return `#include <stdio.h>
${cleanCode}
int main() {
    int prices[] = ${p.prices.replace('[', '{').replace(']', '}')};
    printf("%d\\n", maxProfit(prices, sizeof(prices)/sizeof(prices[0])));
    return 0;
}`;
    }
  } else if (qId === 3) { // Longest Substring Without Repeating Characters
    if (lang === 'cpp') {
      return `#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;
${cleanCode}
int main() {
    Solution sol;
    cout << sol.lengthOfLongestSubstring(${p.s}) << endl;
    return 0;
}`;
    } else if (lang === 'python') {
      return `${cleanCode}
sol = Solution()
print(sol.lengthOfLongestSubstring(${p.s}))`;
    } else if (lang === 'javascript') {
      return `${cleanCode}
console.log(lengthOfLongestSubstring(${p.s}));`;
    } else if (lang === 'java') {
      return `import java.util.*;
${cleanCode}
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.lengthOfLongestSubstring(${p.s}));
    }
}`;
    } else if (lang === 'c') {
      return `#include <stdio.h>
#include <string.h>
${cleanCode}
int main() {
    printf("%d\\n", lengthOfLongestSubstring(${p.s}));
    return 0;
}`;
    }
  } else if (qId === 70) { // Climbing Stairs
    if (lang === 'cpp') {
      return `#include <iostream>
using namespace std;
${cleanCode}
int main() {
    Solution sol;
    cout << sol.climbStairs(${p.n}) << endl;
    return 0;
}`;
    } else if (lang === 'python') {
      return `${cleanCode}
sol = Solution()
print(sol.climbStairs(${p.n}))`;
    } else if (lang === 'javascript') {
      return `${cleanCode}
console.log(climbStairs(${p.n}));`;
    } else if (lang === 'java') {
      return `${cleanCode}
public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.climbStairs(${p.n}));
    }
}`;
    } else if (lang === 'c') {
      return `#include <stdio.h>
${cleanCode}
int main() {
    printf("%d\\n", climbStairs(${p.n}));
    return 0;
}`;
    }
  }

  return cleanCode;
};
