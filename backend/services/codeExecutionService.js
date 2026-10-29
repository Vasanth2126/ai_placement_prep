const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');

/**
 * Universal Multi-Language Code Compiler & Execution Sandbox
 * Supports: C++ (GCC/C++17), Java (OpenJDK), Python 3, JavaScript (Node.js), C (GCC).
 */

const SANDBOX_DIR = path.join(os.tmpdir(), 'interview_code_sandbox');
if (!fs.existsSync(SANDBOX_DIR)) {
  try {
    fs.mkdirSync(SANDBOX_DIR, { recursive: true });
  } catch (e) {}
}

const isCommandAvailable = (cmd) => {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows ? `where.exe ${cmd}` : `which ${cmd}`;
    exec(checkCmd, (err) => {
      resolve(!err);
    });
  });
};

/**
 * Piston Universal Execution Engine
 * Ultra-fast, reliable, and handles all standard languages
 */
const PISTON_LANG_MAP = {
  cpp: { lang: 'c++', file: 'main.cpp' },
  'c++': { lang: 'c++', file: 'main.cpp' },
  c: { lang: 'c', file: 'main.c' },
  python: { lang: 'python', file: 'main.py' },
  python3: { lang: 'python', file: 'main.py' },
  py: { lang: 'python', file: 'main.py' },
  javascript: { lang: 'javascript', file: 'main.js' },
  js: { lang: 'javascript', file: 'main.js' },
  java: { lang: 'java', file: 'Main.java' },
};

const runViaPiston = async (language, code, stdin = '', timeoutMs = 6000) => {
  const langKey = (language || 'cpp').toLowerCase();
  const config = PISTON_LANG_MAP[langKey] || { lang: 'c++', file: 'main.cpp' };

  const payload = {
    language: config.lang,
    version: '*',
    files: [
      {
        name: config.file,
        content: code,
      },
    ],
    stdin: stdin || '',
  };

  const startTime = Date.now();
  const response = await axios.post(
    'https://emkc.org/api/v2/piston/execute',
    payload,
    { timeout: timeoutMs }
  );

  const data = response.data || {};
  const run = data.run || {};
  const compile = data.compile || {};

  const runtimeMs = Date.now() - startTime;
  const compileOutput = compile.output || compile.stderr || '';

  if (compile.code !== undefined && compile.code !== 0 && compileOutput) {
    return {
      success: false,
      hasError: true,
      errorType: 'Compilation Error',
      stdout: '',
      stderr: compileOutput.trim(),
      output: `Compilation Error:\n${compileOutput.trim()}`,
      code: compile.code || 1,
      runtimeMs,
    };
  }

  const stdout = run.stdout || '';
  const stderr = run.stderr || '';
  const exitCode = run.code || 0;
  const isError = exitCode !== 0 || (stderr && stderr.trim().length > 0 && !stdout);

  return {
    success: !isError,
    hasError: isError,
    errorType: isError ? 'Runtime Error' : null,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    output: stdout.trim() || (stderr ? stderr.trim() : 'Program executed successfully with code 0.'),
    code: exitCode,
    runtimeMs,
  };
};

/**
 * Judge0 Execution Engine (Secondary Backup)
 */
const JUDGE0_LANGUAGE_IDS = {
  cpp: 54,        // C++ (GCC 9.2.0)
  'c++': 54,
  c: 50,          // C (GCC 9.2.0)
  python: 71,     // Python (3.8.1)
  python3: 71,
  py: 71,
  javascript: 63, // JavaScript (Node.js 12.14.0)
  js: 63,
  java: 62,       // Java (OpenJDK 13.0.1)
};

const runViaJudge0 = async (language, code, stdin = '', timeoutMs = 6000) => {
  const langKey = (language || 'cpp').toLowerCase();
  const languageId = JUDGE0_LANGUAGE_IDS[langKey] || 54;

  const payload = {
    source_code: Buffer.from(code || '').toString('base64'),
    language_id: languageId,
    stdin: stdin ? Buffer.from(stdin).toString('base64') : '',
  };

  const startTime = Date.now();
  const response = await axios.post(
    'https://ce.judge0.com/submissions?base64_encoded=true&wait=true',
    payload,
    { timeout: timeoutMs }
  );

  const data = response.data || {};
  const runtimeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : Date.now() - startTime;

  const decodeB64 = (val) => {
    if (!val) return '';
    try {
      return Buffer.from(val, 'base64').toString('utf8');
    } catch {
      return val;
    }
  };

  const compileOutput = decodeB64(data.compile_output);
  const stdout = decodeB64(data.stdout);
  const stderr = decodeB64(data.stderr);
  const statusId = data.status?.id;

  if (statusId === 6 || (compileOutput && compileOutput.trim().length > 0)) {
    return {
      success: false,
      hasError: true,
      errorType: 'Compilation Error',
      stdout: '',
      stderr: compileOutput.trim(),
      output: `Compilation Error:\n${compileOutput.trim()}`,
      code: 1,
      runtimeMs,
    };
  }

  const isError = (statusId && statusId !== 3) || (stderr && stderr.trim().length > 0 && !stdout);

  return {
    success: !isError,
    hasError: isError,
    errorType: isError ? 'Runtime Error' : null,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
    output: stdout.trim() || (stderr ? stderr.trim() : 'Program executed successfully.'),
    code: data.exit_code || 0,
    runtimeMs,
  };
};

/**
 * Local Node.js Execution
 */
const runNodeLocal = (code, stdin = '') => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const uniqueId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const filename = path.join(SANDBOX_DIR, `${uniqueId}.js`);
    fs.writeFileSync(filename, code);

    const child = spawn('node', [filename], {
      cwd: SANDBOX_DIR,
      timeout: 6000,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    if (stdin && child.stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch (e) {}
    }

    child.stdout?.on('data', (d) => { stdout += d.toString(); });
    child.stderr?.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (exitCode) => {
      try { if (fs.existsSync(filename)) fs.unlinkSync(filename); } catch (e) {}
      const hasError = exitCode !== 0 || (stderr && stderr.trim().length > 0 && !stdout);
      resolve({
        success: !hasError,
        hasError,
        errorType: hasError ? 'Runtime Error' : null,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        output: stdout.trim() || (stderr ? stderr.trim() : 'Program finished with code 0.'),
        code: exitCode || 0,
        runtimeMs: Date.now() - startTime,
      });
    });
  });
};

/**
 * Local Python Execution
 */
const runPythonLocal = async (code, stdin = '') => {
  const hasPy = await isCommandAvailable('python');
  const hasPy3 = await isCommandAvailable('python3');
  const pyCmd = hasPy ? 'python' : hasPy3 ? 'python3' : null;

  if (!pyCmd) return null;

  return new Promise((resolve) => {
    const startTime = Date.now();
    const uniqueId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const filename = path.join(SANDBOX_DIR, `${uniqueId}.py`);
    fs.writeFileSync(filename, code);

    const child = spawn(pyCmd, [filename], {
      cwd: SANDBOX_DIR,
      timeout: 6000,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';

    if (stdin && child.stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch (e) {}
    }

    child.stdout?.on('data', (d) => { stdout += d.toString(); });
    child.stderr?.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (exitCode) => {
      try { if (fs.existsSync(filename)) fs.unlinkSync(filename); } catch (e) {}
      const hasError = exitCode !== 0 || (stderr && stderr.trim().length > 0 && !stdout);
      resolve({
        success: !hasError,
        hasError,
        errorType: hasError ? 'Runtime Error' : null,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        output: stdout.trim() || (stderr ? stderr.trim() : 'Program finished with code 0.'),
        code: exitCode || 0,
        runtimeMs: Date.now() - startTime,
      });
    });
  });
};

/**
 * Master Execution Function with Automatic Multi-Engine Fallback
 */
const runCode = async (language = 'cpp', code = '', stdin = '') => {
  const lang = (language || 'cpp').toLowerCase();

  // 1. Fast Path: If JavaScript, run directly with local Node.js
  if (lang === 'javascript' || lang === 'js') {
    try {
      return await runNodeLocal(code, stdin);
    } catch (e) {}
  }

  // 2. Primary Engine: Piston (Ultra-fast, supports C++, Java, Python, C)
  try {
    const pistonRes = await runViaPiston(lang, code, stdin);
    if (pistonRes) return pistonRes;
  } catch (pistonErr) {
    console.warn('Piston engine unavailable, attempting secondary Judge0 engine:', pistonErr.message);
  }

  // 3. Secondary Engine: Judge0 API
  try {
    const judgeRes = await runViaJudge0(lang, code, stdin);
    if (judgeRes) return judgeRes;
  } catch (judgeErr) {
    console.warn('Judge0 engine unavailable, attempting local run:', judgeErr.message);
  }

  // 4. Local System Compilers
  if (lang === 'python' || lang === 'python3' || lang === 'py') {
    try {
      const pyRes = await runPythonLocal(code, stdin);
      if (pyRes) return pyRes;
    } catch (e) {}
  }

  // 5. Offline Emergency Evaluator
  return {
    success: false,
    hasError: true,
    errorType: 'Compiler Service Network Error',
    stdout: '',
    stderr: 'Unable to connect to the compilation sandbox. Please check internet connection or backend server.',
    output: 'Unable to connect to the compilation sandbox. Please check internet connection or backend server.',
    code: 1,
    runtimeMs: 0,
  };
};

/**
 * Run code against a batch of test cases
 */
const runTestCases = async (language, code, testCases = []) => {
  if (!testCases || testCases.length === 0) {
    const singleRun = await runCode(language, code);
    return {
      passedAll: singleRun.success,
      passedTestsCount: singleRun.success ? 1 : 0,
      totalTestsCount: 1,
      results: [
        {
          input: 'Main Execution',
          expected: 'No Errors',
          actual: singleRun.output,
          passed: singleRun.success,
        },
      ],
      rawOutput: singleRun.output,
      runtimeMs: singleRun.runtimeMs,
    };
  }

  let passedCount = 0;
  const results = [];
  let totalRuntime = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const execResult = await runCode(language, code, tc.input || '');
    totalRuntime += execResult.runtimeMs || 0;

    const actualTrimmed = (execResult.stdout || '').trim().replace(/\s/g, '');
    const expectedTrimmed = (tc.expectedOutput || '').trim().replace(/\s/g, '');

    const passed =
      expectedTrimmed.length > 0
        ? actualTrimmed === expectedTrimmed || actualTrimmed.includes(expectedTrimmed)
        : execResult.success;

    if (passed) passedCount++;

    results.push({
      testCaseIndex: i + 1,
      input: tc.input,
      expected: tc.isHidden ? '[HIDDEN TEST CASE]' : tc.expectedOutput,
      actual: actualTrimmed || (execResult.stderr ? `Error: ${execResult.stderr}` : 'No output'),
      passed,
      isHidden: tc.isHidden || false,
    });
  }

  return {
    passedAll: passedCount === testCases.length,
    passedTestsCount: passedCount,
    totalTestsCount: testCases.length,
    results,
    rawOutput: results.map((r, i) => `Test ${i + 1}: ${r.passed ? 'PASSED ✅' : 'FAILED ❌'}`).join('\n'),
    runtimeMs: Math.round(totalRuntime / (testCases.length || 1)),
  };
};

module.exports = {
  runCode,
  runTestCases,
};
