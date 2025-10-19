import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export function runCLI(args: string[] = [], input?: string) {
  const entryPath = path.resolve(process.cwd(), 'src/index.ts');

  if (!fs.existsSync(entryPath)) {
    throw new Error(`src/index.ts not found at ${entryPath}`);
  }
  return new Promise<{ stdout: string; stderr: string; code: number }>((resolve, reject) => {
    const mockProcess = spawn('tsx', [entryPath, ...args], {
      cwd: path.resolve('.'),
      env: { ...process.env, SECRET: 'secret' },
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    mockProcess.stdout.on('data', (chunk) => (stdout += chunk.toString()));
    mockProcess.stderr.on('data', (chunk) => (stderr += chunk.toString()));
    mockProcess.on('error', reject);
    mockProcess.on('close', (code) => resolve({ stdout, stderr, code: code ?? 0 }));

    if (input) {
      mockProcess.stdin.write(input);
      mockProcess.stdin.end();
    }
  });
}

describe('CLI Full Integration Tests', () => {
  test('runs with stdin input and fetches real URL', async () => {
    const { stdout, stderr, code } = await runCLI([], 'test [ https://example.com ]');

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatch(/"url":\s*"https:\/\/example\.com"/);
    expect(stdout).toMatch(/"title":\s*"Example Domain"/);
  }, 15000);

  test('runs with a text file argument', async () => {
    const filePath = path.resolve('./files/e2e.txt');
    fs.writeFileSync(filePath, 'some text [ https://example.com ]');

    const { stdout, stderr, code } = await runCLI([filePath]);

    expect(code).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatch(/"url":\s*"https:\/\/example\.com"/);
    expect(stdout).toMatch(/"title":\s*"Example Domain"/);

    fs.unlinkSync(filePath);
  });

  test('handles invalid URLs', async () => {
    const { stdout, stderr, code } = await runCLI([], 'bad [ https://nonexistent-12345.fake ]');

    expect(code).toBe(0);
    expect(stderr).toMatch(/\[ERROR\]/);
    expect(stdout).not.toMatch(/"title":/);
  });
});
